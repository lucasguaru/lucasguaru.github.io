import {
  BASE_QUESTIONS,
  PRINT_EXAM_QUESTIONS,
  STUDENT_NAME,
  getPrintQuestionsByModel,
} from "./questions.js";

const SESSION_PREFIX = "matematicaPrintExam_";
const SUBJECT_LABEL = "Matemática – 4º Ano do Ensino Fundamental";
const EXAM_HEADER = "Capítulo 4 – Multiplicação e as Quatro Operações";

export function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function optionLetter(index) {
  return String.fromCharCode(97 + index);
}

function renderAnswerLines(count = 1) {
  return Array.from({ length: count }, () => '<div class="answer-line"></div>').join("");
}

function renderPrintQuestionHtml(question) {
  const num = question.number;

  if (question.type === "subitems") {
    const titleHtml = question.title
      ? `<p class="exam-question-text"><strong>${num}) ${escapeHtml(question.title)}</strong></p>`
      : `<div class="exam-question-number">${num})</div>`;
    const itemsHtml = question.subitems
      .map((item) => {
        const prefix = item.label ? `${item.label}) ` : "";
        return `<p class="exam-subitem">${prefix}${escapeHtml(item.text)}</p>`;
      })
      .join("");
    return `
      <article class="exam-question">
        ${titleHtml}
        ${itemsHtml}
      </article>
    `;
  }

  if (question.type === "open") {
    const titlePart = question.title ? `${escapeHtml(question.title)} — ` : "";
    return `
      <article class="exam-question exam-question-dissertative">
        <div class="exam-question-number">${num}) ${titlePart}</div>
        <p class="exam-question-text">${escapeHtml(question.text)}</p>
        <div class="answer-lines">${renderAnswerLines(question.lines || 4)}</div>
      </article>
    `;
  }

  const titlePart = question.title ? `${escapeHtml(question.title)} — ` : "";
  return `
    <article class="exam-question exam-question-dissertative">
      <div class="exam-question-number">${num}) ${titlePart}</div>
      <p class="exam-question-text">${escapeHtml(question.text)}</p>
      <p class="exam-answer-label">Resposta: ___________________________</p>
    </article>
  `;
}

function renderGabaritoItemHtml(question) {
  if (question.type === "subitems") {
    const items = question.subitems
      .map((item) => {
        const prefix = item.label ? `${item.label}) ` : "";
        return `<p class="gabarito-subitem">${prefix}${escapeHtml(item.text.replace("____", item.answer))}</p>`;
      })
      .join("");
    const title = question.title ? `${question.number}) ${question.title}` : `${question.number})`;
    return `
      <article class="gabarito-item">
        <h3>${escapeHtml(title)}</h3>
        ${items}
      </article>
    `;
  }

  const titlePart = question.title ? `${question.title} — ` : "";
  return `
    <article class="gabarito-item">
      <h3>${question.number}) ${escapeHtml(titlePart)}${escapeHtml(question.text.split("\n")[0])}</h3>
      <p class="gabarito-answer">Resposta: ${escapeHtml(question.answer)}</p>
    </article>
  `;
}

function renderMcQuestionHtml(question, index) {
  const optionsHtml = question.options
    .map(
      (text, i) =>
        `<li><span class="checkbox"></span> ${optionLetter(i)}) ${escapeHtml(text)}</li>`
    )
    .join("");

  return `
    <article class="exam-question">
      <div class="exam-question-number">${index + 1})</div>
      <p class="exam-question-text">${escapeHtml(question.questionText)}</p>
      <ul class="exam-options">${optionsHtml}</ul>
    </article>
  `;
}

function renderMcGabaritoHtml(question, index) {
  const letter = optionLetter(question.correctOptionIndex);
  const answerText = question.options[question.correctOptionIndex];
  return `
    <article class="gabarito-item">
      <h3>${index + 1}) ${escapeHtml(question.tema)}</h3>
      <p class="gabarito-answer">Resposta: ${letter}) ${escapeHtml(answerText)}</p>
      <p class="gabarito-explanation">${escapeHtml(question.explicacao)}</p>
    </article>
  `;
}

export function renderExamDocument(
  container,
  { title, subtitle, questions, examCode, layout = "print" }
) {
  const isMc = layout === "mc";
  const questionsHtml = isMc
    ? questions.map((q, i) => renderMcQuestionHtml(q, i)).join("")
    : questions.map((q) => renderPrintQuestionHtml(q)).join("");

  const valueLine = isMc
    ? `Valor: ${questions.length} pontos (1 ponto cada questão)`
    : `Valor: ${questions.length} questões`;

  container.innerHTML = `
    <div class="exam-document">
      <header class="exam-header">
        <h1>${escapeHtml(title)}</h1>
        <h2>${EXAM_HEADER}</h2>
        <div class="exam-meta">
          <span>Nome: ${escapeHtml(STUDENT_NAME)}</span>
          <span>Data: ____ / ____ / ______</span>
        </div>
      </header>
      <p class="exam-value">${valueLine}</p>
      ${subtitle ? `<p class="exam-value exam-subtitle">${escapeHtml(subtitle)}</p>` : ""}
      <section class="exam-body">
        ${questionsHtml}
      </section>
      <footer class="exam-footer">
        ${examCode ? `Código da prova: <strong>${examCode}</strong> — use este código para abrir o gabarito correspondente.` : ""}
      </footer>
    </div>
  `;
}

export function renderGabaritoDocument(
  container,
  { title, questions, examCode, layout = "print" }
) {
  const isMc = layout === "mc";
  const itemsHtml = isMc
    ? questions.map((q, i) => renderMcGabaritoHtml(q, i)).join("")
    : questions.map((q) => renderGabaritoItemHtml(q)).join("");

  container.innerHTML = `
    <div class="gabarito-document">
      <header class="gabarito-title exam-header">
        <h1>Gabarito — Matemática</h1>
        <h2>${SUBJECT_LABEL}</h2>
        <p class="gabarito-exam-name">${escapeHtml(title)}</p>
        ${examCode ? `<div class="gabarito-code-banner">Código da prova: <strong>${examCode}</strong></div>` : ""}
        <p class="gabarito-note"><em>Somente para correção (papai/mamãe)</em></p>
      </header>
      ${itemsHtml}
    </div>
  `;
}

export function renderCompleteGabaritoDocument(container) {
  const model1 = getPrintQuestionsByModel(1);
  const model2 = getPrintQuestionsByModel(2);

  container.innerHTML = `
    <div class="gabarito-document">
      <header class="gabarito-title exam-header">
        <h1>Gabarito — Matemática</h1>
        <h2>${SUBJECT_LABEL}</h2>
        <p class="gabarito-exam-name">Gabarito Completo — Todos os Modelos</p>
        <p class="gabarito-note"><em>Somente para correção (papai/mamãe)</em></p>
      </header>
      <section class="gabarito-model-block">
        <h2 class="gabarito-model-title">Modelo 1 — Questões 1 a 10</h2>
        ${model1.map((q) => renderGabaritoItemHtml(q)).join("")}
      </section>
      <section class="gabarito-model-block">
        <h2 class="gabarito-model-title">Modelo 2 — Questões 11 a 20</h2>
        ${model2.map((q) => renderGabaritoItemHtml(q)).join("")}
      </section>
    </div>
  `;
}

export function buildAndShowExam(container, { mode, modelNumber, count, title, subtitle }) {
  let questions;
  let examTitle = title;
  let examSubtitle = subtitle || "";
  let layout = "print";

  if (mode === "model") {
    questions = getPrintQuestionsByModel(modelNumber);
    examTitle = examTitle || `Prova – Modelo ${modelNumber}`;
    examSubtitle =
      examSubtitle ||
      (modelNumber === 1
        ? "Questões 1 a 10 — Multiplicação"
        : "Questões 11 a 20 — Quatro operações");
    layout = "print";
  } else if (mode === "random") {
    questions = getRandomQuestions(count || 8);
    examTitle = examTitle || "Prova – Simulado Aleatório";
    examSubtitle = examSubtitle || `${questions.length} questões objetivas sorteadas`;
    layout = "mc";
  } else if (mode === "full") {
    questions = PRINT_EXAM_QUESTIONS;
    examTitle = examTitle || "Prova – Avaliação Completa";
    examSubtitle = examSubtitle || "20 questões — Capítulo 4";
    layout = "print";
  } else {
    questions = [];
  }

  const examCode = mode === "model" || mode === "full" ? null : generateExamCode();

  if (examCode) {
    saveExamSession(examCode, {
      title: examTitle,
      questionIds: questions.map((q) => q.id),
      layout,
    });
  }

  renderExamDocument(container, {
    title: examTitle,
    subtitle: examSubtitle,
    questions,
    examCode,
    layout,
  });

  return { questions, examCode, title: examTitle, layout };
}
