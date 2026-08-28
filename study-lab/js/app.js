import { activeSubject as subject } from './subjects/registry.js';
import { createSession, evaluate, sessionScore } from './engine/quiz-engine.js';
import { loadProgress, recordAnswer, recordAttempt, resetProgress, toggleReviewMark } from './storage/progress-store.js';

const app = document.querySelector('#app');
let view = 'dashboard';
let session = null;
let selected = null;
let checked = false;
let draggedOrderIndex = null;
let doubtOpen = false;
let doubtDraft = '';
let copyStatus = '';

const icon = name => `<svg aria-hidden="true" viewBox="0 0 24 24"><use href="#${name}"/></svg>`;
const symbols = `<svg class="symbols" aria-hidden="true"><symbol id="flask" viewBox="0 0 24 24"><path d="M9 2h6M10 2v6l-6 10a2 2 0 0 0 1.7 3h12.6A2 2 0 0 0 20 18L14 8V2M7 16h10M9 12h6"/></symbol><symbol id="home" viewBox="0 0 24 24"><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></symbol><symbol id="shield" viewBox="0 0 24 24"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/></symbol><symbol id="alert" viewBox="0 0 24 24"><path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0zM12 9v4m0 4h.01"/></symbol><symbol id="arrow" viewBox="0 0 24 24"><path d="M5 12h14m-5-5 5 5-5 5"/></symbol></svg>`;

function statsFor(moduleId) {
  const p = loadProgress();
  const qs = subject.questions.filter(q => q.moduleId === moduleId);
  const answers = qs.map(q => p.answers[q.id]).filter(Boolean);
  const attempts = answers.reduce((sum, a) => sum + a.attempts, 0);
  const correct = answers.reduce((sum, a) => sum + a.correct, 0);
  const errors = qs.filter(q => p.pendingErrors.includes(q.id)).length;
  const best = p.attempts.filter(a => a.moduleId === moduleId).reduce((max, a) => Math.max(max, a.percentage), 0);
  return { total: qs.length, seen: answers.length, attempts, correct, errors, accuracy: attempts ? Math.round(correct / attempts * 100) : 0, best };
}

function overall() {
  const p = loadProgress();
  const answers = Object.values(p.answers);
  const attempts = answers.reduce((n,a)=>n+a.attempts,0);
  const correct = answers.reduce((n,a)=>n+a.correct,0);
  const reviewIds = new Set([...p.pendingErrors, ...p.markedForReview]);
  return { answered: attempts, accuracy: attempts ? Math.round(correct/attempts*100):0, errors:p.pendingErrors.length, reviewCount:reviewIds.size, best:p.attempts.reduce((m,a)=>Math.max(m,a.percentage),0) };
}

function shell(content, active = 'overview') {
  const progress = loadProgress();
  const reviewCount = new Set([...progress.pendingErrors, ...progress.markedForReview]).size;
  return `${symbols}<div class="shell"><aside><a class="brand" href="#dashboard">${icon('flask')}<strong>Study Lab</strong></a><nav><a class="${active==='overview'?'active':''}" href="#dashboard">${icon('home')}Visão geral</a><a class="${active==='subject'?'active':''}" href="#dashboard">${icon('shield')}${subject.title}</a><a class="${active==='errors'?'active':''}" href="#errors">${icon('alert')}Revisar questões <b>${reviewCount}</b></a></nav><footer>Prática deliberada.<br>Conhecimento duradouro.</footer></aside><main>${content}</main></div>`;
}

function renderDashboard() {
  const o = overall();
  const rows = subject.modules.map(m => {
    const s = statsFor(m.id); const progress = Math.round(s.seen / s.total * 100);
    return `<article class="module-row"><span class="module-index">${m.index}</span><div class="module-title"><strong>${m.title}</strong><small>${s.seen ? `${s.seen} de ${s.total} questões vistas` : 'Ainda não iniciado'}</small></div><div class="progress"><i style="width:${progress}%"></i></div><span class="accuracy">${s.attempts ? `${s.accuracy}%` : '—'}</span><button class="button secondary" data-start="${m.id}">${s.seen ? 'Nova tentativa' : 'Estudar'}</button></article>`;
  }).join('');
  const content = `<header class="page-head"><div><h1>${subject.title}</h1><p>${subject.description}</p></div><button class="button primary" data-start="${loadProgress().lastActivity?.moduleId || 'keys'}">Continuar estudando ${icon('arrow')}</button></header><section class="metrics"><div><span>Questões respondidas</span><strong>${o.answered}</strong></div><div><span>Acurácia geral</span><strong>${o.accuracy}%</strong></div><div class="warning"><span>Questões para revisar</span><strong>${o.reviewCount}</strong></div><div><span>Melhor resultado</span><strong>${o.best}%</strong></div></section><section class="section-head"><div><h2>Trilha de estudo</h2><p>Sessões curtas, sorteadas do banco de cada módulo.</p></div><button class="button secondary" data-start="final">Prova final</button></section><div class="module-list"><div class="list-head"><span>Módulo</span><span>Progresso</span><span>Acurácia</span><span>Ação</span></div>${rows}</div>${o.reviewCount ? `<section class="review-callout"><div>${icon('alert')}<div><h2>Há ${o.reviewCount} ${o.reviewCount===1?'questão':'questões'} para consolidar</h2><p>Revise erros e perguntas que você marcou por insegurança.</p></div></div><a class="button amber" href="#errors">Revisar questões</a></section>`:''}<button class="reset-link" id="reset">Limpar todo o progresso</button>`;
  app.innerHTML = shell(content, 'overview'); bind();
}

function start(moduleId, mode='study') {
  let questions = subject.questions;
  if (mode === 'review') {
    const progress = loadProgress();
    const ids = [...new Set([...progress.pendingErrors, ...progress.markedForReview])];
    questions = questions.filter(q => ids.includes(q.id));
    if (!questions.length) return renderDashboard();
  }
  session = createSession({ questions, moduleId, mode, size: moduleId === 'final' ? 15 : 8 });
  selected = null; checked = false; doubtOpen = false; doubtDraft = ''; copyStatus = ''; view='quiz'; renderQuiz();
}

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));

function buildDoubtPrompt(question, module) {
  const selectedAnswer = Array.isArray(selected)
    ? selected.map((item, index) => `${index + 1}. ${item}`).join('\n')
    : selected;
  return [
    `Estou estudando ${subject.title} no Study Lab.`,
    '',
    `Módulo:\n${module.title}`,
    '',
    `Pergunta atual:\n${question.prompt}`,
    selectedAnswer ? `\nResposta ou ordem que selecionei:\n${selectedAnswer}` : '',
    `\nMinha dúvida:\n${doubtDraft.trim()}`,
    '',
    'Explique o conceito de forma didática e contextualizada.',
    'Não revele diretamente a resposta correta da questão, a menos que eu peça.'
  ].filter(Boolean).join('\n');
}

function doubtPanel(question, module) {
  if (!doubtOpen) return '';
  const prompt = buildDoubtPrompt(question, module);
  const chatUrl = doubtDraft.trim() ? `https://chatgpt.com/?q=${encodeURIComponent(prompt)}` : '';
  return `<section class="doubt-panel"><div class="doubt-head"><div><strong>Tirar uma dúvida</strong><p>A pergunta e sua resposta atual serão incluídas como contexto.</p></div><button type="button" id="close-doubt" aria-label="Fechar área de dúvida">×</button></div><label for="doubt-text">Qual é a sua dúvida?</label><textarea id="doubt-text" rows="4" placeholder="Ex.: o que significa essa opção? Dê exemplos práticos.">${escapeHtml(doubtDraft)}</textarea><div class="doubt-actions"><span id="copy-status" role="status">${copyStatus}</span><button type="button" class="button secondary" id="copy-doubt" ${doubtDraft.trim()?'':'disabled'}>Copiar pergunta</button><a class="button primary ${doubtDraft.trim()?'':'disabled'}" id="chatgpt-link" ${chatUrl ? `href="${chatUrl}" target="_blank" rel="noopener noreferrer"` : 'aria-disabled="true"'}>Abrir no ChatGPT ${icon('arrow')}</a></div></section>`;
}

function answerControl(q) {
  if (q.type === 'order') {
    const order = selected || [...q.items].sort(() => Math.random()-.5);
    selected = order;
    return `<div class="order-list" aria-label="Itens para ordenar">${order.map((item,i)=>`<div class="order-item" data-order-index="${i}" tabindex="${checked?'-1':'0'}"><span class="drag-handle" aria-label="Arraste para reposicionar" title="Arraste para reposicionar"><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="order-position">${i+1}</span><strong>${item}</strong><span class="order-hint">Arraste para mover</span><span class="order-actions"><button type="button" data-shift="up" aria-label="Mover ${item} para cima" ${checked||i===0?'disabled':''}>↑</button><button type="button" data-shift="down" aria-label="Mover ${item} para baixo" ${checked||i===order.length-1?'disabled':''}>↓</button></span></div>`).join('')}</div>`;
  }
  return `<div class="options">${q.options.map(option=>`<button ${checked?'disabled':''} class="option ${selected===option?'selected':''}" data-answer="${option.replaceAll('"','&quot;')}"><span></span>${option}</button>`).join('')}</div>`;
}

function renderQuiz() {
  const q = session.questions[session.index]; const score = sessionScore(session);
  if (!q) return finishSession();
  const module = subject.modules.find(m=>m.id===q.moduleId);
  const result = session.results.at(-1);
  const marked = loadProgress().markedForReview.includes(q.id);
  const content = `<div class="quiz-top"><a href="#dashboard" class="brand compact">${icon('flask')}Study Lab</a><span>${subject.title} / <strong>${module?.title || 'Prova final'}</strong></span><div><b>Questão ${session.index+1} de ${session.questions.length}</b><button id="exit">Sair da sessão</button></div></div><div class="quiz-layout"><section class="question-card"><span class="utility">Módulo · ${module?.title}</span><h1>${q.prompt}</h1>${answerControl(q)}${checked ? `<div class="feedback ${result.correct?'correct':'incorrect'}"><strong>${result.correct?'Correto.':'Ainda não.'}</strong><p>${q.explanation}</p></div>`:''}${doubtPanel(q,module)}<div class="question-actions"><div class="question-tools"><button type="button" id="ask-doubt" class="text-action ${doubtOpen?'active':''}">Tirar dúvida no ChatGPT</button><button type="button" id="mark-review" class="text-action ${marked?'marked':''}">${marked?'Marcada para revisar':'Marcar para revisar'}</button></div><button class="button primary" id="submit" ${selected==null?'disabled':''}>${checked?'Próxima questão':'Confirmar resposta'} ${icon('arrow')}</button></div></section><aside class="session-rail"><div><span class="utility">Progresso da sessão</span><strong>${session.index+1} de ${session.questions.length}</strong><div class="progress"><i style="width:${(session.index+1)/session.questions.length*100}%"></i></div></div><div><span class="utility">Desempenho</span><p class="good">${score.correct} corretas</p><p class="bad">${score.total-score.correct} incorretas</p></div><div><span class="utility">Objetivo</span><p>Responda antes de ver a explicação. Entenda o motivo, não apenas a alternativa.</p></div></aside></div>`;
  app.innerHTML = `<div class="quiz-page">${symbols}${content}</div>`; bindQuiz();
}

function submit() {
  if (!checked) {
    const q=session.questions[session.index]; const correct=evaluate(q,selected);
    session.results.push({questionId:q.id,correct}); recordAnswer({question:q,correct,mode:session.mode}); checked=true; renderQuiz();
  } else { session.index++; selected=null; checked=false; doubtOpen=false; doubtDraft=''; copyStatus=''; renderQuiz(); }
}

function finishSession() {
  const score=sessionScore(session); recordAttempt({moduleId:session.moduleId,mode:session.mode,...score});
  const currentIndex = subject.modules.findIndex(module => module.id === session.moduleId);
  const nextModule = session.mode === 'study' && currentIndex >= 0 ? subject.modules[currentIndex + 1] : null;
  const nextAction = nextModule ? `<button class="button primary next-module" data-start="${nextModule.id}"><span><small>Próximo módulo</small>${nextModule.title}</span>${icon('arrow')}</button>` : '';
  app.innerHTML = shell(`<section class="result"><span class="utility">Sessão concluída</span><h1>${score.percentage}%</h1><h2>${score.correct} de ${score.total} respostas corretas</h2><p>${score.percentage>=80?'Ótima consolidação. Continue espaçando suas revisões.':'Revise as explicações e tente novamente: compreensão vem antes da velocidade.'}</p>${nextAction}<div><button class="button secondary" data-start="${session.moduleId}">Nova tentativa</button><a class="button secondary" href="#dashboard">Voltar ao painel</a></div></section>`); bind();
}

function renderErrors() {
  const progress=loadProgress();
  const ids=[...new Set([...progress.pendingErrors,...progress.markedForReview])];
  const items=subject.questions.filter(q=>ids.includes(q.id));
  const content=`<header class="page-head"><div><h1>Revisar questões</h1><p>Reúna respostas erradas e perguntas que você marcou por insegurança.</p></div>${items.length?'<button class="button amber" id="review">Iniciar revisão</button>':''}</header>${items.length?`<div class="error-list">${items.map(q=>`<article><div class="review-labels"><span class="utility">${subject.modules.find(m=>m.id===q.moduleId)?.title}</span>${progress.pendingErrors.includes(q.id)?'<b>Erro</b>':''}${progress.markedForReview.includes(q.id)?'<b>Marcada</b>':''}</div><h3>${q.prompt}</h3></article>`).join('')}</div>`:`<section class="empty"><h2>Nenhuma questão pendente</h2><p>Marque perguntas durante o estudo ou continue praticando para encontrar pontos de atenção.</p><a class="button primary" href="#dashboard">Ver módulos</a></section>`}`;
  app.innerHTML=shell(content,'errors'); document.querySelector('#review')?.addEventListener('click',()=>start('review','review'));
}

function bind() {
  document.querySelectorAll('[data-start]').forEach(el=>el.addEventListener('click',()=>start(el.dataset.start)));
  document.querySelector('#reset')?.addEventListener('click',()=>{ if(confirm('Apagar todo o progresso do Study Lab?')) { resetProgress(); renderDashboard(); }});
}
function bindQuiz() {
  document.querySelectorAll('[data-answer]').forEach(el=>el.addEventListener('click',()=>{selected=el.dataset.answer;renderQuiz()}));
  const reorder = (from, to) => {
    if (from === to || from == null || to == null) return;
    const [item] = selected.splice(from, 1);
    selected.splice(to, 0, item);
    renderQuiz();
  };
  document.querySelectorAll('.order-item').forEach(item => {
    item.addEventListener('dragstart', event => {
      draggedOrderIndex = Number(item.dataset.orderIndex);
      item.classList.add('dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', item.dataset.orderIndex);
    });
    item.addEventListener('dragend', () => {
      draggedOrderIndex = null;
      document.querySelectorAll('.order-item').forEach(row => row.classList.remove('dragging', 'drop-target'));
    });
    item.addEventListener('dragover', event => {
      event.preventDefault();
      document.querySelectorAll('.order-item').forEach(row => row.classList.remove('drop-target'));
      if (Number(item.dataset.orderIndex) !== draggedOrderIndex) item.classList.add('drop-target');
    });
    item.addEventListener('drop', event => {
      event.preventDefault();
      reorder(draggedOrderIndex ?? Number(event.dataTransfer.getData('text/plain')), Number(item.dataset.orderIndex));
    });
  });
  document.querySelectorAll('[data-shift]').forEach(button => button.addEventListener('click', event => {
    const from = Number(event.currentTarget.closest('.order-item').dataset.orderIndex);
    reorder(from, from + (button.dataset.shift === 'up' ? -1 : 1));
  }));
  document.querySelectorAll('.drag-handle').forEach(handle => {
    handle.addEventListener('pointerdown', event => {
      event.preventDefault();
      draggedOrderIndex = Number(handle.closest('.order-item').dataset.orderIndex);
      handle.closest('.order-item').classList.add('dragging');
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener('pointermove', event => {
      if (draggedOrderIndex == null) return;
      event.preventDefault();
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.order-item');
      document.querySelectorAll('.order-item').forEach(row => row.classList.toggle('drop-target', row === target && Number(row.dataset.orderIndex) !== draggedOrderIndex));
    });
    handle.addEventListener('pointerup', event => {
      if (draggedOrderIndex == null) return;
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.order-item');
      const from = draggedOrderIndex;
      draggedOrderIndex = null;
      if (target) reorder(from, Number(target.dataset.orderIndex));
      else renderQuiz();
    });
  });
  document.querySelector('#ask-doubt')?.addEventListener('click', () => {
    doubtOpen = !doubtOpen;
    copyStatus = '';
    renderQuiz();
    if (doubtOpen) document.querySelector('#doubt-text')?.focus();
  });
  document.querySelector('#close-doubt')?.addEventListener('click', () => {
    doubtOpen = false;
    copyStatus = '';
    renderQuiz();
  });
  document.querySelector('#doubt-text')?.addEventListener('input', event => {
    doubtDraft = event.target.value;
    copyStatus = '';
    const q = session.questions[session.index];
    const module = subject.modules.find(m => m.id === q.moduleId);
    const prompt = buildDoubtPrompt(q, module);
    const link = document.querySelector('#chatgpt-link');
    const copy = document.querySelector('#copy-doubt');
    if (doubtDraft.trim()) {
      link.href = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.classList.remove('disabled');
      link.removeAttribute('aria-disabled');
      copy.disabled = false;
    } else {
      link.removeAttribute('href');
      link.classList.add('disabled');
      link.setAttribute('aria-disabled','true');
      copy.disabled = true;
    }
  });
  document.querySelector('#copy-doubt')?.addEventListener('click', async () => {
    const q = session.questions[session.index];
    const module = subject.modules.find(m => m.id === q.moduleId);
    try {
      await navigator.clipboard.writeText(buildDoubtPrompt(q, module));
      copyStatus = 'Texto copiado.';
    } catch {
      copyStatus = 'Não foi possível copiar automaticamente.';
    }
    document.querySelector('#copy-status').textContent = copyStatus;
  });
  document.querySelector('#mark-review')?.addEventListener('click', () => {
    const q = session.questions[session.index];
    toggleReviewMark(q.id);
    renderQuiz();
  });
  document.querySelector('#submit')?.addEventListener('click',submit);
  document.querySelector('#exit')?.addEventListener('click', () => {
    session = null;
    selected = null;
    checked = false;
    if (location.hash !== '#dashboard') location.hash = 'dashboard';
    else renderDashboard();
  });
}

function route(){ view=location.hash==='#errors'?'errors':'dashboard'; view==='errors'?renderErrors():renderDashboard(); }
window.addEventListener('hashchange',route); route();
