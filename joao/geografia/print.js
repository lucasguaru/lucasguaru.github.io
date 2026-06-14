import { BASE_QUESTIONS, STUDENT_NAME } from "./questions.js?v=4";

const SESSION_PREFIX = "geografiaPrintExam_";
const SUBJECT_LABEL = "Geografia – 4º Ano do Ensino Fundamental";

const DISSERTATIVE_QUESTIONS = [
  {
    id: "diss-q1",
    examNumber: 29,
    tema: "Participação cidadã",
    questionText:
      "Explique com suas palavras por que é importante que os cidadãos participem da vida do município e acompanhem as ações do governo.",
    explicacao:
      "Espera-se que o aluno explique que a participação dos cidadãos ajuda a melhorar o município, fiscalizar os governantes, apresentar sugestões, acompanhar os gastos públicos e garantir que os direitos da população sejam respeitados.",
    points: 1,
  },
  {
    id: "diss-q2",
    examNumber: 30,
    tema: "Cidadania no dia a dia",
    questionText:
      "Cite duas atitudes que demonstram cidadania e explique por que elas são importantes para a convivência em comunidade.",
    explicacao:
      "Exemplos: respeitar espaços públicos, separar lixo para reciclagem, cuidar dos animais, participar do grêmio estudantil, respeitar regras da escola ou acompanhar ações do governo. O aluno deve explicar que essas atitudes ajudam na convivência, no respeito ao próximo e na construção de uma sociedade melhor.",
    points: 1,
  },
];

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
  if (modelNumber === 3) {
    return BASE_QUESTIONS.filter((q) => q.id.startsWith("m3-"));
  }
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

function questionDisplayNumber(question, index, layout) {
  if (layout === "model3") {
    return index + 1;
  }
  return question.examNumber ?? index + 1;
}

function renderQuestionHtml(question, index, layout = "default") {
  const isVf = question.tipo === "vf";
  const displayNum = questionDisplayNumber(question, index, layout);

  if (isVf) {
    return `
      <article class="exam-question exam-question-vf">
        <div class="exam-question-number">${displayNum}. ( )</div>
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
      <div class="exam-question-number">${displayNum})</div>
      <p class="exam-question-text">${escapeHtml(question.questionText)}</p>
      <ul class="exam-options">${optionsHtml}</ul>
    </article>
  `;
}

function renderDissertativeHtml(question, index, fallbackStart, layout = "default") {
  const displayNum = layout === "model3" ? fallbackStart : (question.examNumber ?? fallbackStart);
  const answerLines = Array.from({ length: 5 }, () => '<div class="answer-line"></div>').join("");

  return `
    <article class="exam-question exam-question-dissertative">
      <div class="exam-question-number">${displayNum}.</div>
      <p class="exam-question-text">${escapeHtml(question.questionText)}</p>
      <div class="answer-lines">${answerLines}</div>
    </article>
  `;
}

function buildValueLine(questions, dissertatives, layout) {
  if (layout === "model3") {
    const dissertativePoints = dissertatives.reduce((sum, q) => sum + (q.points || 1), 0);
    return `Valor: ${(questions.length * 0.25 + dissertativePoints).toFixed(1).replace(".0", "")} pontos (8 V/F × 0,25 + 2 dissertativas × 1,0)`;
  }

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
  { title, subtitle, questions, dissertatives = [], examCode, layout = "default" }
) {
  const isModel3 = layout === "model3";
  const questionsHtml = questions.map((q, i) => renderQuestionHtml(q, i, layout)).join("");
  const dissertativeStart = questions.length + 1;
  const objectiveSectionTitle = isModel3
    ? "Parte 2 – Verdadeiro (V) ou Falso (F)"
    : "Questões Objetivas";
  const dissertativeSectionTitle = isModel3
    ? "Parte 3 – Questões Dissertativas"
    : "Questões Dissertativas";
  const dissertativesHtml = dissertatives.length
    ? `
      <h3 class="exam-section-title">${dissertativeSectionTitle}</h3>
      ${dissertatives
        .map((q, i) => renderDissertativeHtml(q, i, dissertativeStart + i, layout))
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
      <p class="exam-value">${buildValueLine(questions, dissertatives, layout)}</p>
      ${subtitle ? `<p class="exam-value exam-subtitle">${escapeHtml(subtitle)}</p>` : ""}
      <section class="exam-body">
        ${questions.length ? `<h3 class="exam-section-title">${objectiveSectionTitle}</h3>` : ""}
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
  { title, questions, dissertatives = [], examCode, layout = "default" }
) {
  container.innerHTML = buildGabaritoDocumentHtml({
    title,
    examCode,
    sections: [
      {
        modelTitle: null,
        questions,
        dissertatives,
        layout,
      },
    ],
  });
}

function renderGabaritoItemsHtml(questions, layout) {
  return questions
    .map((question, index) => {
      const displayNum = questionDisplayNumber(question, index, layout);
      const letter = optionLetter(question.correctOptionIndex);
      const answerText = question.options[question.correctOptionIndex];
      const vfLabel = question.tipo === "vf" ? " (V ou F)" : "";
      return `
        <article class="gabarito-item">
          <h3>${displayNum}) ${escapeHtml(question.tema)}${vfLabel}</h3>
          <p class="gabarito-answer">Resposta: ${question.tipo === "vf" ? escapeHtml(answerText) : `${letter}) ${escapeHtml(answerText)}`}</p>
          <p class="gabarito-explanation">${escapeHtml(question.explicacao)}</p>
        </article>
      `;
    })
    .join("");
}

function renderGabaritoDissertativesHtml(dissertatives, questionsCount, layout, sectionTitle) {
  if (!dissertatives.length) return "";

  const dissertativeStart = questionsCount + 1;
  const itemsHtml = dissertatives
    .map(
      (question, index) => `
        <article class="gabarito-item gabarito-item-dissertative">
          <h3>${layout === "model3" ? dissertativeStart + index : dissertativeStart + index}) ${escapeHtml(question.tema)}</h3>
          <p class="gabarito-explanation">${escapeHtml(question.explicacao)}</p>
        </article>
      `
    )
    .join("");

  return `
    <h2 class="gabarito-section-title">${sectionTitle}</h2>
    ${itemsHtml}
  `;
}

function renderGabaritoModelSection({ modelTitle, questions, dissertatives, layout }) {
  const isModel3 = layout === "model3";
  const objectiveSectionTitle = isModel3
    ? "Parte 2 – Verdadeiro ou Falso"
    : "Questões Objetivas";
  const dissertativeSectionTitle = isModel3
    ? "Parte 3 – Sugestão de Resposta (Dissertativas)"
    : "Sugestão de Resposta — Dissertativas";

  const modelHeader = modelTitle
    ? `<h2 class="gabarito-model-title">${escapeHtml(modelTitle)}</h2>`
    : "";

  return `
    <section class="gabarito-model-block">
      ${modelHeader}
      ${questions.length ? `<h3 class="gabarito-section-title">${objectiveSectionTitle}</h3>` : ""}
      ${renderGabaritoItemsHtml(questions, layout)}
      ${renderGabaritoDissertativesHtml(
        dissertatives,
        questions.length,
        layout,
        dissertativeSectionTitle
      )}
    </section>
  `;
}

function buildGabaritoDocumentHtml({ title, examCode, sections }) {
  const sectionsHtml = sections
    .map((section) => renderGabaritoModelSection(section))
    .join("");

  return `
    <div class="gabarito-document">
      <header class="gabarito-title exam-header">
        <h1>Gabarito — Geografia</h1>
        <h2>${SUBJECT_LABEL}</h2>
        <p class="gabarito-exam-name">${escapeHtml(title)}</p>
        ${examCode ? `<div class="gabarito-code-banner">Código da prova: <strong>${examCode}</strong></div>` : ""}
        <p class="gabarito-note"><em>Somente para correção (papai/mamãe)</em></p>
      </header>
      ${sectionsHtml}
    </div>
  `;
}

export function renderCompleteGabaritoDocument(container) {
  const dissertatives = getDissertativeQuestions();

  container.innerHTML = buildGabaritoDocumentHtml({
    title: "Gabarito Completo — Todos os Modelos",
    examCode: null,
    sections: [
      {
        modelTitle: "Modelo 1",
        questions: getQuestionsByModel(1),
        dissertatives,
        layout: "default",
      },
      {
        modelTitle: "Modelo 2",
        questions: getQuestionsByModel(2),
        dissertatives,
        layout: "default",
      },
      {
        modelTitle: "Modelo 3",
        questions: getQuestionsByModel(3),
        dissertatives,
        layout: "model3",
      },
    ],
  });
}

export function buildAndShowExam(container, { mode, modelNumber, count, title, subtitle }) {
  let questions;
  let examTitle = title;
  let examSubtitle = subtitle || "";
  let layout = "default";
  let dissertatives = getDissertativeQuestions();

  if (mode === "model") {
    questions = getQuestionsByModel(modelNumber);
    examTitle = examTitle || `Prova – Modelo ${modelNumber}`;
    if (modelNumber === 3) {
      layout = "model3";
      examSubtitle = examSubtitle || "Parte 2: 8 questões V ou F · Parte 3: 2 dissertativas";
    } else {
      examSubtitle = examSubtitle || "8 questões objetivas + 2 dissertativas";
    }
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
      layout,
    });
  }

  renderExamDocument(container, {
    title: examTitle,
    subtitle: examSubtitle,
    questions,
    dissertatives,
    examCode,
    layout,
  });

  return { questions, dissertatives, examCode, title: examTitle, layout };
}
