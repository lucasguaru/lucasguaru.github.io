import { BASE_QUESTIONS, CONFIG, STUDENT_NAME } from "./questions.js";

(function () {
  "use strict";

  const STORAGE_KEY = "geografiaJoaoLucasQuiz";

  const homeScreen = document.getElementById("home-screen");
  const quizScreen = document.getElementById("quiz-screen");
  const resultScreen = document.getElementById("result-screen");

  const studentNameLabel = document.getElementById("student-name-label");
  const streakRequiredLabel = document.getElementById("streak-required-label");
  const passScoreLabel = document.getElementById("pass-score-label");
  const streakCountEl = document.getElementById("streak-count");
  const streakTotalEl = document.getElementById("streak-total");
  const streakDotsEl = document.getElementById("streak-dots");
  const heartsDisplayEl = document.getElementById("hearts-display");
  const heartsRuleEl = document.getElementById("hearts-rule");
  const tvUnlockedBanner = document.getElementById("tv-unlocked-banner");
  const noHeartsMessage = document.getElementById("no-hearts-message");
  const startBtn = document.getElementById("start-btn");
  const recoverHeartBtn = document.getElementById("recover-heart-btn");

  const questionCounterEl = document.getElementById("question-counter");
  const progressBarFillEl = document.getElementById("progress-bar-fill");
  const timerLabelEl = document.getElementById("timer-label");
  const questionCategoryEl = document.getElementById("question-category");
  const questionTypeBadgeEl = document.getElementById("question-type-badge");
  const questionTextEl = document.getElementById("question-text");
  const optionsContainerEl = document.getElementById("options-container");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const finishBtn = document.getElementById("finish-btn");

  const resultBanner = document.getElementById("result-banner");
  const resultTitle = document.getElementById("result-title");
  const resultMessage = document.getElementById("result-message");
  const resultScoreEl = document.getElementById("result-score");
  const resultPercentageEl = document.getElementById("result-percentage");
  const resultTimeEl = document.getElementById("result-time");
  const incorrectEmptyMessage = document.getElementById("incorrect-empty-message");
  const reviewListEl = document.getElementById("review-list");
  const homeBtn = document.getElementById("home-btn");
  const retryBtn = document.getElementById("retry-btn");

  const historyEmptyMessage = document.getElementById("history-empty-message");
  const historyTableBody = document.getElementById("history-table-body");
  const clearHistoryBtn = document.getElementById("clear-history-btn");

  let quizState = null;
  let persistState = loadPersistState();

  function defaultPersistState() {
    return {
      streak: 0,
      hearts: CONFIG.maxHearts,
      tvUnlocked: false,
      history: [],
      lastUpdated: todayKey(),
    };
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function loadPersistState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultPersistState();
      const parsed = JSON.parse(raw);
      if (parsed.lastUpdated !== todayKey()) {
        return defaultPersistState();
      }
      return {
        streak: parsed.streak ?? 0,
        hearts: parsed.hearts ?? CONFIG.maxHearts,
        tvUnlocked: parsed.tvUnlocked ?? false,
        history: Array.isArray(parsed.history) ? parsed.history : [],
        lastUpdated: todayKey(),
      };
    } catch {
      return defaultPersistState();
    }
  }

  function savePersistState() {
    persistState.lastUpdated = todayKey();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistState));
  }

  function shuffleArray(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function optionLetter(index) {
    return String.fromCharCode(97 + index);
  }

  function prepareQuestion(question) {
    const indexed = question.options.map((text, index) => ({ text, index }));
    const shuffled = shuffleArray(indexed);
    const correctOptionIndex = shuffled.findIndex(
      (item) => item.index === question.correctOptionIndex
    );
    return {
      ...question,
      options: shuffled.map((item) => item.text),
      correctOptionIndex,
    };
  }

  function buildRoundQuestions() {
    const picked = shuffleArray(BASE_QUESTIONS).slice(0, CONFIG.questionsPerRound);
    return picked.map(prepareQuestion);
  }

  function showView(view) {
    homeScreen.classList.add("hidden");
    quizScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    view.classList.remove("hidden");
  }

  function renderGamificationPanel() {
    studentNameLabel.textContent = STUDENT_NAME;
    streakRequiredLabel.textContent = `${CONFIG.streakRequired} vitórias seguidas`;
    passScoreLabel.textContent = `${CONFIG.passScore} acertos (90%)`;
    streakCountEl.textContent = String(persistState.streak);
    streakTotalEl.textContent = String(CONFIG.streakRequired);
    heartsRuleEl.textContent = `${CONFIG.maxHearts} corações`;

    streakDotsEl.innerHTML = "";
    for (let i = 0; i < CONFIG.streakRequired; i += 1) {
      const dot = document.createElement("span");
      dot.className = "streak-dot" + (i < persistState.streak ? " active" : "");
      streakDotsEl.appendChild(dot);
    }

    heartsDisplayEl.innerHTML = "";
    for (let i = 0; i < CONFIG.maxHearts; i += 1) {
      const heart = document.createElement("span");
      heart.className = "heart" + (i < persistState.hearts ? " active" : "");
      heart.textContent = "❤️";
      heart.setAttribute("aria-hidden", "true");
      heartsDisplayEl.appendChild(heart);
    }

    tvUnlockedBanner.classList.toggle("hidden", !persistState.tvUnlocked);

    const noHearts = persistState.hearts <= 0;
    noHeartsMessage.classList.toggle("hidden", !noHearts);
    recoverHeartBtn.classList.toggle("hidden", !noHearts);
    startBtn.disabled = noHearts;
  }

  function renderHistory() {
    const history = persistState.history.slice().reverse();
    historyTableBody.innerHTML = "";
    historyEmptyMessage.classList.toggle("hidden", history.length > 0);

    history.forEach((entry) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.time}</td>
        <td>${entry.score}/${CONFIG.questionsPerRound}</td>
        <td><span class="${entry.passed ? "pass-chip" : "fail-chip"}">${entry.passed ? "Aprovado" : "Reprovado"}</span></td>
        <td>${entry.streakAfter}</td>
      `;
      historyTableBody.appendChild(row);
    });
  }

  function startTimer() {
    if (quizState.timerIntervalId) {
      clearInterval(quizState.timerIntervalId);
    }
    quizState.timerIntervalId = setInterval(() => {
      timerLabelEl.textContent = formatTime(Date.now() - quizState.startTime);
    }, 1000);
  }

  function stopTimer() {
    if (quizState?.timerIntervalId) {
      clearInterval(quizState.timerIntervalId);
      quizState.timerIntervalId = null;
    }
  }

  function renderQuestion() {
    const { questions, currentIndex, selectedAnswers } = quizState;
    const question = questions[currentIndex];
    const total = questions.length;

    questionCounterEl.textContent = `Questão ${currentIndex + 1} de ${total}`;
    progressBarFillEl.style.width = `${((currentIndex + 1) / total) * 100}%`;
    questionCategoryEl.textContent = question.tema;
    questionTypeBadgeEl.classList.toggle("hidden", question.tipo !== "vf");
    questionTextEl.textContent = question.questionText;

    optionsContainerEl.innerHTML = "";
    question.options.forEach((optionText, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option-btn";
      if (selectedAnswers[currentIndex] === index) {
        btn.classList.add("selected");
      }
      btn.innerHTML = `<span class="option-label">${optionLetter(index)})</span> ${optionText}`;
      btn.addEventListener("click", () => selectOption(index));
      optionsContainerEl.appendChild(btn);
    });

    prevBtn.disabled = currentIndex === 0;
    const hasSelection = selectedAnswers[currentIndex] !== null;
    const isLast = currentIndex === total - 1;

    nextBtn.classList.toggle("hidden", isLast);
    finishBtn.classList.toggle("hidden", !isLast);
    nextBtn.disabled = !hasSelection;
    finishBtn.disabled = !hasSelection;
  }

  function selectOption(optionIndex) {
    quizState.selectedAnswers[quizState.currentIndex] = optionIndex;
    renderQuestion();
  }

  function startRound() {
    if (persistState.hearts <= 0) return;

    quizState = {
      questions: buildRoundQuestions(),
      currentIndex: 0,
      selectedAnswers: Array(CONFIG.questionsPerRound).fill(null),
      startTime: Date.now(),
      timerIntervalId: null,
    };

    showView(quizScreen);
    timerLabelEl.textContent = "00:00";
    startTimer();
    renderQuestion();
  }

  function computeResults() {
    const { questions, selectedAnswers, startTime } = quizState;
    let correctCount = 0;
    const details = questions.map((question, index) => {
      const selected = selectedAnswers[index];
      const isCorrect = selected === question.correctOptionIndex;
      if (isCorrect) correctCount += 1;
      return {
        question,
        selected,
        isCorrect,
      };
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    const passed = correctCount >= CONFIG.passScore;
    const elapsedMs = Date.now() - startTime;

    return { correctCount, percentage, passed, elapsedMs, details };
  }

  function finishRound() {
    stopTimer();
    const results = computeResults();

    const streakBefore = persistState.streak;
    if (results.passed) {
      persistState.streak += 1;
      if (persistState.streak >= CONFIG.streakRequired) {
        persistState.tvUnlocked = true;
      }
    } else {
      persistState.streak = 0;
      persistState.hearts = Math.max(0, persistState.hearts - 1);
    }

    const now = new Date();
    persistState.history.push({
      time: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      score: results.correctCount,
      passed: results.passed,
      streakAfter: persistState.streak,
      timestamp: now.toISOString(),
    });

    savePersistState();
    renderResults(results, streakBefore);
    renderGamificationPanel();
    renderHistory();
    showView(resultScreen);
    quizState = null;
  }

  function renderResults(results, streakBefore) {
    const { correctCount, percentage, passed, elapsedMs, details } = results;

    resultBanner.className = "result-banner";
    if (persistState.tvUnlocked && passed && persistState.streak >= CONFIG.streakRequired) {
      resultBanner.classList.add("tv-unlocked");
      resultTitle.textContent = "Desafio completo!";
      resultMessage.textContent =
        "Três vitórias seguidas com 90%! TV liberada — papai/mamãe confirma!";
    } else if (passed) {
      resultBanner.classList.add("pass");
      resultTitle.textContent = "Aprovado!";
      resultMessage.textContent = `Você bateu a meta de 90% (${correctCount}/${CONFIG.questionsPerRound}). Sequência: ${persistState.streak}/${CONFIG.streakRequired}.`;
    } else {
      resultBanner.classList.add("fail");
      resultTitle.textContent = "Quase lá!";
      resultMessage.textContent = `Faltou${CONFIG.passScore - correctCount === 1 ? "" : "m"} ${Math.max(0, CONFIG.passScore - correctCount)} acerto(s) para 90%. Sequência voltou a zero.`;
    }

    if (passed && streakBefore < persistState.streak && !persistState.tvUnlocked) {
      resultMessage.textContent += " Continue assim!";
    }

    resultScoreEl.textContent = `${correctCount}/${CONFIG.questionsPerRound}`;
    resultPercentageEl.textContent = `${percentage}%`;
    resultTimeEl.textContent = formatTime(elapsedMs);

    reviewListEl.innerHTML = "";
    const wrongItems = details.filter((item) => !item.isCorrect);
    incorrectEmptyMessage.classList.toggle("hidden", wrongItems.length > 0);

    details.forEach((item) => {
      const li = document.createElement("li");
      li.className = "review-item" + (item.isCorrect ? " correct" : "");

      const selectedText =
        item.selected !== null
          ? item.question.options[item.selected]
          : "Não respondida";
      const correctText = item.question.options[item.question.correctOptionIndex];

      li.innerHTML = `
        <h4>${item.isCorrect ? "✅" : "❌"} ${item.question.tema}${item.question.tipo === "vf" ? " (V ou F)" : ""}</h4>
        <p>${item.question.questionText.replace(/\n/g, "<br>")}</p>
        ${
          item.isCorrect
            ? `<p class="answer-right">Resposta correta: ${correctText}</p>`
            : `<p class="answer-wrong">Sua resposta: ${selectedText}</p>
               <p class="answer-right">Correta: ${correctText}</p>`
        }
        <p><em>${item.question.explicacao}</em></p>
      `;
      reviewListEl.appendChild(li);
    });
  }

  function goHome() {
    renderGamificationPanel();
    showView(homeScreen);
  }

  function recoverHeart() {
    if (persistState.hearts <= 0) {
      persistState.hearts = 1;
      savePersistState();
      renderGamificationPanel();
    }
  }

  function clearHistory() {
    persistState = defaultPersistState();
    savePersistState();
    renderGamificationPanel();
    renderHistory();
  }

  startBtn.addEventListener("click", startRound);
  retryBtn.addEventListener("click", () => {
    if (persistState.hearts <= 0) {
      goHome();
      return;
    }
    startRound();
  });
  homeBtn.addEventListener("click", goHome);
  recoverHeartBtn.addEventListener("click", recoverHeart);
  clearHistoryBtn.addEventListener("click", clearHistory);

  prevBtn.addEventListener("click", () => {
    if (quizState.currentIndex > 0) {
      quizState.currentIndex -= 1;
      renderQuestion();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (quizState.currentIndex < quizState.questions.length - 1) {
      quizState.currentIndex += 1;
      renderQuestion();
    }
  });

  finishBtn.addEventListener("click", finishRound);

  renderGamificationPanel();
  renderHistory();
  showView(homeScreen);
})();
