import { BASE_QUESTIONS, DISSERTATIVE_QUESTIONS, STUDENT_NAME } from "./questions.js";

const SESSION_PREFIX = "geografiaPrintExam_";

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
  return BASE_QUESTIONS.filter((q) => q.id.startsWith("m1-") || q.id.startsWith("m2-"));
}

export function getDissertativeQuestions() {
  return DISSERTATIVE_QUESTIONS.slice();
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

export function resolveDissertativesFromSession(session) {
  if (session?.includeDissertative === false) return [];
  if (!session?.dissertativeIds?.length) return getDissertativeQuestions();
  const map = new Map(DISSERTATIVE_QUESTIONS.map((q) => [q.id, q]));
  return session.dissertativeIds.map((id) => map.get(id)).filter(Boolean);
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderQuestionHtml(question, index) {
  const isVf = question.tipo === "vf";

  if (isVf) {
    return `
      <article class="exam-question exam-question-vf">
        <div class="exam-question-number">${index + 1}) ( )</div>
        <p class="exam-question-text vf-statement">${escapeHtml(question.questionText)}</p>
        <p class="vf-hint"><em>Marque V (verdadeiro) ou F (falso).</em></p>
      </article>
    `;
  }

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

function renderDissertativeHtml(question, index) {
  const answerLines = Array.from({ length: 5 }, () => '<div class="answer-line"></div>').join("");

  return `
    <article class="exam-question exam-question-dissertative">
      <div class="exam-question-number">${index})</div>
      <p class="exam-question-text">${escapeHtml(question.questionText)}</p>
      <div class="answer-lines">${answerLines}</div>
    </article>
  `;
}

function buildValueLine(questions, dissertatives) {
  const objectivePoints = questions.length;
  const dissertativePoints = dissertatives.reduce((sum, q) => sum + (q.points || 1), 0);
  const total = objectivePoints + dissertativePoints;

  if (!dissertatives.length) {
    return `Valor: ${objectivePoints} pontos (1 ponto cada questão)`;
  }

  return `Valor: ${total} pontos (${objectivePoints} objetivas + ${dissertativePoints} dissertativas)`;
}

export function renderExamDocument(
  container,
  { title, subtitle, questions, dissertatives = [], examCode }
) {
  const questionsHtml = questions.map((q, i) => renderQuestionHtml(q, i)).join("");
  const dissertativeStart = questions.length + 1;
  const dissertativesHtml = dissertatives.length
    ? `
      <h3 class="exam-section-title">Questões Dissertativas</h3>
      ${dissertatives
        .map((q, i) => renderDissertativeHtml(q, dissertativeStart + i))
        .join("")}
    `
    : "";

  container.innerHTML = `
    <div class="exam-document">
      <header class="exam-header">
        <h1>${escapeHtml(title)}</h1>
        <h2>Geografia – 4º Ano do Ensino Fundamental</h2>
        <div class="exam-meta">
          <span>Nome: ${escapeHtml(STUDENT_NAME)}</span>
          <span>Data: ____ / ____ / ______</span>
        </div>
      </header>
      <p class="exam-value">${buildValueLine(questions, dissertatives)}</p>
      ${subtitle ? `<p class="exam-value exam-subtitle">${escapeHtml(subtitle)}</p>` : ""}
      <section class="exam-body">
        ${questions.length ? '<h3 class="exam-section-title">Questões Objetivas</h3>' : ""}
        ${questionsHtml}
        ${dissertativesHtml}
      </section>
      <footer class="exam-footer">
        ${examCode ? `Código da prova: <strong>${examCode}</strong> — use este código para abrir o gabarito correspondente.` : ""}
      </footer>
    </div>
  `;
}

export function renderGabaritoDocument(
  container,
  { title, questions, dissertatives = [], examCode }
) {
  const itemsHtml = questions
    .map((question, index) => {
      const letter = optionLetter(question.correctOptionIndex);
      const answerText = question.options[question.correctOptionIndex];
      const vfLabel = question.tipo === "vf" ? " (V ou F)" : "";
      return `
        <article class="gabarito-item">
          <h3>${index + 1}) ${escapeHtml(question.tema)}${vfLabel}</h3>
          <p class="gabarito-answer">Resposta: ${question.tipo === "vf" ? escapeHtml(answerText) : `${letter}) ${escapeHtml(answerText)}`}</p>
          <p class="gabarito-explanation">${escapeHtml(question.explicacao)}</p>
        </article>
      `;
    })
    .join("");

  const dissertativeStart = questions.length + 1;
  const dissertativesHtml = dissertatives.length
    ? `
      <h2 class="gabarito-section-title">Sugestão de Resposta — Dissertativas</h2>
      ${dissertatives
        .map(
          (question, index) => `
        <article class="gabarito-item gabarito-item-dissertative">
          <h3>${dissertativeStart + index}) ${escapeHtml(question.tema)}</h3>
          <p class="gabarito-explanation">${escapeHtml(question.explicacao)}</p>
        </article>
      `
        )
        .join("")}
    `
    : "";

  container.innerHTML = `
    <div class="gabarito-document">
      <header class="gabarito-title">
        <h1>Gabarito — ${escapeHtml(title)}</h1>
        ${examCode ? `<div class="gabarito-code-banner">Código da prova: <strong>${examCode}</strong></div>` : ""}
        <p><em>Somente para correção (papai/mamãe)</em></p>
      </header>
      <section>
        ${questions.length ? '<h2 class="gabarito-section-title">Questões Objetivas</h2>' : ""}
        ${itemsHtml}
        ${dissertativesHtml}
      </section>
    </div>
  `;
}

export function buildAndShowExam(container, { mode, modelNumber, count, title, subtitle }) {
  let questions;
  let examTitle = title;
  let examSubtitle = subtitle || "";
  const dissertatives = getDissertativeQuestions();

  if (mode === "model") {
    questions = getQuestionsByModel(modelNumber);
    examTitle = examTitle || `Prova – Modelo ${modelNumber}`;
    examSubtitle = examSubtitle || "8 questões objetivas + 2 dissertativas";
  } else if (mode === "random") {
    questions = getRandomQuestions(count || 8);
    examTitle = examTitle || "Prova – Simulado Aleatório";
    examSubtitle =
      examSubtitle ||
      `${questions.length} questões objetivas sorteadas + 2 dissertativas`;
  } else if (mode === "full") {
    questions = getAllQuestions();
    examTitle = examTitle || "Prova – Simulado Completo";
    examSubtitle = examSubtitle || "16 questões objetivas + 2 dissertativas";
  } else {
    questions = [];
  }

  const examCode = mode === "model" ? null : generateExamCode();

  if (examCode) {
    saveExamSession(examCode, {
      title: examTitle,
      questionIds: questions.map((q) => q.id),
      dissertativeIds: dissertatives.map((q) => q.id),
      includeDissertative: true,
    });
  }

  renderExamDocument(container, {
    title: examTitle,
    subtitle: examSubtitle,
    questions,
    dissertatives,
    examCode,
  });

  return { questions, dissertatives, examCode, title: examTitle };
}
