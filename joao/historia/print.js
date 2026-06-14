import {
  BASE_QUESTIONS,
  VF_QUESTIONS,
  ESSAY_QUESTIONS,
  QUIZ_QUESTIONS,
  STUDENT_NAME,
} from "./questions.js";

const SESSION_PREFIX = "historiaPrintExam_";

export function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function optionLetter(index) {
  return String.fromCharCode(97 + index);
}

export function getQuestionsByModel(modelNumber) {
  if (modelNumber === 3) return null;
  const prefix = modelNumber === 1 ? "m1-" : "m2-";
  return BASE_QUESTIONS.filter((q) => q.id.startsWith(prefix));
}

export function getModel3Content() {
  return { vfQuestions: VF_QUESTIONS.slice(), essayQuestions: ESSAY_QUESTIONS.slice() };
}

export function getRandomQuestions(count) {
  return shuffleArray(BASE_QUESTIONS).slice(0, count);
}

export function getAllQuestions() {
  return BASE_QUESTIONS.slice();
}

export function generateExamCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function saveExamSession(code, data) {
  sessionStorage.setItem(
    SESSION_PREFIX + code,
    JSON.stringify({ ...data, savedAt: Date.now() })
  );
}

export function loadExamSession(code) {
  try {
    const raw = sessionStorage.getItem(SESSION_PREFIX + code);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function resolveQuestionsFromSession(session) {
  if (!session?.questionIds?.length) return [];
  const map = new Map(QUIZ_QUESTIONS.map((q) => [q.id, q]));
  return session.questionIds.map((id) => map.get(id)).filter(Boolean);
}

function renderMatchingQuestionHtml(question) {
  if (question.id === "extra-q10") {
    return `
      <div class="matching-block">
        <p><strong>Locais:</strong> Engenho · Mina · Cidade</p>
        <p>( ) Extrair ouro com bateia ou picareta.</p>
        <p>( ) Trabalhar na lavoura da cana e na casa-grande.</p>
        <p>( ) Vender doces ou trabalhar como barbeiro.</p>
      </div>
    `;
  }
  return "";
}

function renderVfQuestionHtml(question, displayNumber) {
  return `
    <article class="exam-question exam-question-vf">
      <p class="exam-question-text">
        <span class="exam-question-number">${displayNumber}.</span>
        ( ) ${escapeHtml(question.questionText)}
      </p>
    </article>
  `;
}

function renderEssayQuestionHtml(question) {
  const lines = Array(6)
    .fill("<div class=\"essay-line\"></div>")
    .join("");
  return `
    <article class="exam-question exam-question-essay">
      <p class="exam-question-text">
        <span class="exam-question-number">${question.number}.</span>
        ${escapeHtml(question.questionText)}
      </p>
      <div class="essay-lines">${lines}</div>
    </article>
  `;
}

export function renderModel3ExamDocument(container, { title, subtitle }) {
  const { vfQuestions, essayQuestions } = getModel3Content();
  const vfHtml = vfQuestions
    .map((q, i) => renderVfQuestionHtml(q, 1 + i))
    .join("");
  const essayHtml = essayQuestions.map((q) => renderEssayQuestionHtml(q)).join("");

  container.innerHTML = `
    <div class="exam-document">
      <header class="exam-header">
        <h1>${escapeHtml(title)}</h1>
        <h2>História – 4º Ano do Ensino Fundamental</h2>
        <p class="exam-subject">Livro: Aprender Juntos – História</p>
        <div class="exam-meta">
          <span>Nome: ${escapeHtml(STUDENT_NAME)}</span>
          <span>Data: ____ / ____ / ______</span>
        </div>
      </header>
      <p class="exam-value">
        Valor: 10 pontos — Questões 1 a 8: 0,5 ponto cada (4 pts) · Questões 9 e 10: 3 pontos cada (6 pts)
      </p>
      ${subtitle ? `<p class="exam-value" style="margin-top:-12px;font-style:italic;">${escapeHtml(subtitle)}</p>` : ""}
      <section class="exam-body">
        <h3 class="exam-part-title">Parte II – Verdadeiro (V) ou Falso (F)</h3>
        ${vfHtml}
        <h3 class="exam-part-title exam-part-break">Parte III – Questões Dissertativas</h3>
        ${essayHtml}
      </section>
    </div>
  `;
}

function renderGabaritoMcItemHtml(question, index) {
  const letter = optionLetter(question.correctOptionIndex);
  const answerText = question.options[question.correctOptionIndex];
  return `
    <article class="gabarito-item">
      <h3>${index}) ${escapeHtml(question.tema)}</h3>
      <p class="gabarito-answer">Resposta: ${letter}) ${escapeHtml(answerText)}</p>
      <p class="gabarito-explanation">${escapeHtml(question.explicacao)}</p>
    </article>
  `;
}

function renderGabaritoMcSectionHtml(questions) {
  return questions.map((q, i) => renderGabaritoMcItemHtml(q, i + 1)).join("");
}

function renderGabaritoVfSectionHtml(vfQuestions) {
  return vfQuestions
    .map((question, index) => {
      const letter = question.correctOptionIndex === 0 ? "V" : "F";
      return `
        <article class="gabarito-item">
          <h3>${1 + index}) ${escapeHtml(question.tema.replace("V ou F · ", ""))}</h3>
          <p class="gabarito-answer">Resposta: ${letter}</p>
          <p class="gabarito-explanation">${escapeHtml(question.explicacao)}</p>
        </article>
      `;
    })
    .join("");
}

function renderGabaritoEssaySectionHtml(essayQuestions) {
  return essayQuestions
    .map(
      (question) => `
        <article class="gabarito-item gabarito-item-essay">
          <h3>${question.number}) ${escapeHtml(question.tema)}</h3>
          <p class="gabarito-answer">Sugestão de resposta:</p>
          <p class="gabarito-explanation">${escapeHtml(question.suggestedAnswer)}</p>
        </article>
      `
    )
    .join("");
}

function renderGabaritoPageHeader({ title, examCode }) {
  return `
    <header class="gabarito-header">
      <h1>Gabarito</h1>
      <h2>História – 4º Ano do Ensino Fundamental</h2>
      <p class="exam-subject">Livro: Aprender Juntos – História</p>
      <p class="gabarito-exam-title">${escapeHtml(title)}</p>
      ${examCode ? `<p class="gabarito-code-line">Código da prova: <strong>${examCode}</strong></p>` : ""}
      <p class="gabarito-note"><em>Somente para correção (papai/mamãe)</em></p>
    </header>
  `;
}

export function renderAllModelsGabaritoDocument(container) {
  const model1 = getQuestionsByModel(1);
  const model2 = getQuestionsByModel(2);
  const { vfQuestions, essayQuestions } = getModel3Content();

  container.innerHTML = `
    <div class="gabarito-document">
      ${renderGabaritoPageHeader({ title: "Gabarito Completo — Modelos 1, 2 e 3" })}
      <section class="gabarito-body">
        <section class="gabarito-model-section">
          <h2 class="gabarito-model-title">Modelo 1 — Múltipla escolha</h2>
          <p class="gabarito-model-desc">8 questões · 1 ponto cada</p>
          ${renderGabaritoMcSectionHtml(model1)}
        </section>

        <section class="gabarito-model-section gabarito-model-break">
          <h2 class="gabarito-model-title">Modelo 2 — Múltipla escolha</h2>
          <p class="gabarito-model-desc">8 questões · 1 ponto cada</p>
          ${renderGabaritoMcSectionHtml(model2)}
        </section>

        <section class="gabarito-model-section gabarito-model-break">
          <h2 class="gabarito-model-title">Modelo 3 — V/F e dissertativa</h2>
          <p class="gabarito-model-desc">10 questões · V/F (0,5 pt) + dissertativas (3 pts)</p>
          <h3 class="exam-part-title">Parte II – Verdadeiro ou Falso</h3>
          ${renderGabaritoVfSectionHtml(vfQuestions)}
          <h3 class="exam-part-title">Parte III – Sugestão de resposta – Dissertativas</h3>
          ${renderGabaritoEssaySectionHtml(essayQuestions)}
        </section>
      </section>
    </div>
  `;
}

export function renderModel3GabaritoDocument(container, { title }) {
  const { vfQuestions, essayQuestions } = getModel3Content();

  container.innerHTML = `
    <div class="gabarito-document">
      ${renderGabaritoPageHeader({ title })}
      <section class="gabarito-body">
        <h3 class="exam-part-title">Parte II – Verdadeiro ou Falso</h3>
        ${renderGabaritoVfSectionHtml(vfQuestions)}
        <h3 class="exam-part-title">Parte III – Sugestão de resposta – Dissertativas</h3>
        ${renderGabaritoEssaySectionHtml(essayQuestions)}
      </section>
    </div>
  `;
}

function renderQuestionHtml(question, index) {
  if (question.questionType === "vf") {
    return renderVfQuestionHtml(question, index + 1);
  }

  const isMatching = question.id === "extra-q10";
  const optionsHtml = question.options
    .map(
      (text, i) =>
        `<li><span class="checkbox"></span> ${optionLetter(i)}) ${escapeHtml(text)}</li>`
    )
    .join("");

  const bodyHtml = isMatching
    ? `<p class="exam-question-text">Relacione corretamente:</p>${renderMatchingQuestionHtml(question)}`
    : `<p class="exam-question-text">${escapeHtml(question.questionText)}</p>`;

  return `
    <article class="exam-question">
      <div class="exam-question-number">${index + 1})</div>
      ${bodyHtml}
      <ul class="exam-options">${optionsHtml}</ul>
    </article>
  `;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderExamDocument(container, { title, subtitle, questions, examCode }) {
  const totalPoints = questions.length;
  const questionsHtml = questions.map((q, i) => renderQuestionHtml(q, i)).join("");

  container.innerHTML = `
    <div class="exam-document">
      <header class="exam-header">
        <h1>${escapeHtml(title)}</h1>
        <h2>História – 4º Ano do Ensino Fundamental</h2>
        <p class="exam-subject">Livro: Aprender Juntos – História</p>
        <div class="exam-meta">
          <span>Nome: ${escapeHtml(STUDENT_NAME)}</span>
          <span>Data: ____ / ____ / ______</span>
        </div>
      </header>
      <p class="exam-value">Valor: ${totalPoints} pontos (1 ponto cada questão)</p>
      ${subtitle ? `<p class="exam-value" style="margin-top:-12px;font-style:italic;">${escapeHtml(subtitle)}</p>` : ""}
      <section class="exam-body">
        ${questionsHtml}
      </section>
      <footer class="exam-footer">
        ${examCode ? `Código da prova: <strong>${examCode}</strong> — use este código para abrir o gabarito correspondente.` : ""}
      </footer>
    </div>
  `;
}

export function renderGabaritoDocument(container, { title, questions, examCode }) {
  const itemsHtml = questions
    .map((question, index) => {
      if (question.questionType === "vf") {
        const letter = question.correctOptionIndex === 0 ? "V" : "F";
        return `
          <article class="gabarito-item">
            <h3>${index + 1}) ${escapeHtml(question.tema)}</h3>
            <p class="gabarito-answer">Resposta: ${letter}</p>
            <p class="gabarito-explanation">${escapeHtml(question.explicacao)}</p>
          </article>
        `;
      }
      return renderGabaritoMcItemHtml(question, index + 1);
    })
    .join("");

  container.innerHTML = `
    <div class="gabarito-document">
      ${renderGabaritoPageHeader({ title, examCode })}
      <section class="gabarito-body">${itemsHtml}</section>
    </div>
  `;
}

export function buildAndShowExam(container, { mode, modelNumber, count, title, subtitle }) {
  let questions;
  let examTitle = title;
  let examSubtitle = subtitle || "";

  if (mode === "model" && modelNumber === 3) {
    examTitle = examTitle || "Prova – Modelo 3";
    examSubtitle =
      examSubtitle || "Parte II (V/F) + Parte III (dissertativas) — 10 questões";
    renderModel3ExamDocument(container, { title: examTitle, subtitle: examSubtitle });
    return { questions: [], examCode: null, title: examTitle, isModel3: true };
  }

  if (mode === "model") {
    questions = getQuestionsByModel(modelNumber);
    examTitle = examTitle || `Prova – Modelo ${modelNumber}`;
  } else if (mode === "random") {
    questions = getRandomQuestions(count || 8);
    examTitle = examTitle || "Prova – Simulado Aleatório";
    examSubtitle = examSubtitle || `${questions.length} questões sorteadas do banco completo`;
  } else if (mode === "full") {
    questions = getAllQuestions();
    examTitle = examTitle || "Prova – Simulado Completo";
    examSubtitle = examSubtitle || `${questions.length} questões — pode ocupar várias páginas`;
  } else {
    questions = [];
  }

  const examCode = mode === "model" ? null : generateExamCode();

  if (examCode) {
    saveExamSession(examCode, {
      title: examTitle,
      questionIds: questions.map((q) => q.id),
    });
  }

  renderExamDocument(container, {
    title: examTitle,
    subtitle: examSubtitle,
    questions,
    examCode,
  });

  return { questions, examCode, title: examTitle };
}
