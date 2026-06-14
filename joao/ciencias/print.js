import { BASE_QUESTIONS, STUDENT_NAME } from "./questions.js";

const SESSION_PREFIX = "cienciasPrintExam_";

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
  const prefix = modelNumber === 1 ? "m1-" : "m2-";
  return BASE_QUESTIONS.filter((q) => q.id.startsWith(prefix));
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
  const map = new Map(BASE_QUESTIONS.map((q) => [q.id, q]));
  return session.questionIds.map((id) => map.get(id)).filter(Boolean);
}

function renderMatchingQuestionHtml() {
  return `
    <div class="matching-block">
      <p><strong>Biomas:</strong> Pantanal · Amazônia · Manguezal · Cerrado</p>
      <p>( ) Grande biodiversidade e floresta tropical.</p>
      <p>( ) Inundações periódicas.</p>
      <p>( ) Encontro entre água doce e salgada.</p>
      <p>( ) Árvores de troncos tortuosos.</p>
    </div>
  `;
}

function renderQuestionHtml(question, index) {
  const isMatching = question.id === "m2-q8";
  const optionsHtml = question.options
    .map(
      (text, i) =>
        `<li><span class="checkbox"></span> ${optionLetter(i)}) ${escapeHtml(text)}</li>`
    )
    .join("");

  const bodyHtml = isMatching
    ? `<p class="exam-question-text">Relacione corretamente:</p>${renderMatchingQuestionHtml()}`
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
        <h2>Ciências – 4º Ano do Ensino Fundamental</h2>
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
      const letter = optionLetter(question.correctOptionIndex);
      const answerText = question.options[question.correctOptionIndex];
      return `
        <article class="gabarito-item">
          <h3>${index + 1}) ${escapeHtml(question.tema)}</h3>
          <p class="gabarito-answer">Resposta: ${letter}) ${escapeHtml(answerText)}</p>
          <p class="gabarito-explanation">${escapeHtml(question.explicacao)}</p>
        </article>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="gabarito-document">
      <header class="gabarito-title">
        <h1>Gabarito — ${escapeHtml(title)}</h1>
        ${examCode ? `<div class="gabarito-code-banner">Código da prova: <strong>${examCode}</strong></div>` : ""}
        <p><em>Somente para correção (papai/mamãe)</em></p>
      </header>
      <section>${itemsHtml}</section>
    </div>
  `;
}

export function buildAndShowExam(container, { mode, modelNumber, count, title, subtitle }) {
  let questions;
  let examTitle = title;
  let examSubtitle = subtitle || "";

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
    examSubtitle = examSubtitle || "16 questões — pode ocupar 2 páginas";
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
