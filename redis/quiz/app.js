// app.js
// Redis Technical Interview Exam
// Vanilla JS, no frameworks

import { BASE_QUESTIONS } from "./questions.js";

(function () {
  "use strict";

  /**
   * ============================
   * Question Data Definition
   * ============================
   *
   * - Each question is an object with:
   *   - id: unique identifier
   *   - questionText: the question string
   *   - options: array of exactly 4 strings
   *   - correctOptionIndex: index (0-3) of the correct option in `options`
   *   - difficulty: "easy" | "medium" | "hard"
   *   - category: topic grouping (e.g., "Basics", "Persistence")
   *
   * - To ADD a question:
   *   1. Create a new object matching the structure below.
   *   2. Push it into the `BASE_QUESTIONS` array.
   *
   * - To MODIFY a question:
   *   1. Find it by `id` (or index).
   *   2. Update text / options / correctOptionIndex / difficulty / category.
   *
   * - To REMOVE a question:
   *   1. Remove the corresponding object from the `BASE_QUESTIONS` array.
   */

  // ====== DOM References ======
  const startScreenEl = document.getElementById("start-screen");
  const examScreenEl = document.getElementById("exam-screen");
  const resultScreenEl = document.getElementById("result-screen");

  const totalQuestionsLabelEl = document.getElementById(
    "total-questions-label"
  );
  const estimatedDurationLabelEl = document.getElementById(
    "estimated-duration-label"
  );

  const startExamBtnEl = document.getElementById("start-exam-btn");
  const prevBtnEl = document.getElementById("prev-btn");

  const questionCounterEl = document.getElementById("question-counter");
  const progressBarFillEl = document.getElementById("progress-bar-fill");
  const timerLabelEl = document.getElementById("timer-label");

  const questionCategoryEl = document.getElementById("question-category");
  const questionDifficultyEl = document.getElementById("question-difficulty");
  const questionTextEl = document.getElementById("question-text");
  const optionsContainerEl = document.getElementById("options-container");

  const resultTimeEl = document.getElementById("result-time");
  const resultScoreEl = document.getElementById("result-score");
  const resultPercentageEl = document.getElementById("result-percentage");
  const categorySummaryListEl = document.getElementById(
    "category-summary-list"
  );
  const incorrectEmptyMessageEl = document.getElementById(
    "incorrect-empty-message"
  );
  const incorrectListEl = document.getElementById("incorrect-list");
  const restartExamBtnEl = document.getElementById("restart-exam-btn");

  const historyTableBodyEl = document.getElementById("history-table-body");
  const historyEmptyMessageEl = document.getElementById(
    "history-empty-message"
  );
  const clearHistoryBtnEl = document.getElementById("clear-history-btn");
  const analyticsAttemptsEl = document.getElementById("analytics-attempts");
  const analyticsBestEl = document.getElementById("analytics-best");
  const analyticsAverageEl = document.getElementById("analytics-average");

  // ====== Exam State ======
  /**
   * examState:
   * {
   *   questions: [ { ...question, options, correctOptionIndex } ] // shuffled per attempt
   *   currentIndex: number
   *   selectedAnswers: number[] (option index per question, or null)
   *   startTime: number (ms since epoch)
   *   timerIntervalId: number | null
   * }
   */
  let examState = null;

  // ====== Constants for localStorage ======
  const HISTORY_KEY = "redisExamHistory";

  /**
   * ============================
   * Utility Functions
   * ============================
   */

  function shuffleArray(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  /**
   * Format a duration in milliseconds as mm:ss (or hh:mm:ss if >= 1 hour).
   */
  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);

    const pad = (num) => String(num).padStart(2, "0");

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  }

  /**
   * Serialize attempts history to localStorage.
   */
  function saveHistory(historyArray) {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(historyArray));
  }

  /**
   * Read attempts history from localStorage.
   * Returns an array (possibly empty).
   */
  function loadHistoryFromStorage() {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Add a new exam attempt to history.
   * Each attempt is an object:
   * {
   *   completedAt: ISO string,
   *   timeMs: number,
   *   totalQuestions: number,
   *   correctAnswers: number,
   *   percentage: number (0-100)
   * }
   */
  function addAttemptToHistory(attempt) {
    const history = loadHistoryFromStorage();
    // Most recent first
    history.unshift(attempt);
    saveHistory(history);
  }

  /**
   * Render history table and analytics summary.
   * Also used on page load.
   */
  function renderHistory() {
    const history = loadHistoryFromStorage();

    // Table body
    historyTableBodyEl.innerHTML = "";

    if (history.length === 0) {
      historyEmptyMessageEl.style.display = "block";
    } else {
      historyEmptyMessageEl.style.display = "none";

      history.forEach((attempt) => {
        const tr = document.createElement("tr");

        const date = new Date(attempt.completedAt);
        const dateCell = document.createElement("td");
        dateCell.textContent = date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        tr.appendChild(dateCell);

        const timeCell = document.createElement("td");
        timeCell.textContent = formatTime(attempt.timeMs);
        tr.appendChild(timeCell);

        const scoreCell = document.createElement("td");
        scoreCell.textContent = `${attempt.correctAnswers}/${attempt.totalQuestions}`;
        tr.appendChild(scoreCell);

        const percentageCell = document.createElement("td");
        percentageCell.textContent = `${attempt.percentage.toFixed(0)}%`;
        tr.appendChild(percentageCell);

        historyTableBodyEl.appendChild(tr);
      });
    }

    // Analytics: attempts count, best score, average score
    const attemptsCount = history.length;
    analyticsAttemptsEl.textContent = attemptsCount.toString();

    if (attemptsCount === 0) {
      analyticsBestEl.textContent = "-";
      analyticsAverageEl.textContent = "-";
      return;
    }

    let best = 0;
    let sum = 0;
    history.forEach((attempt) => {
      best = Math.max(best, attempt.percentage);
      sum += attempt.percentage;
    });
    const average = sum / attemptsCount;

    analyticsBestEl.textContent = `${best.toFixed(0)}%`;
    analyticsAverageEl.textContent = `${average.toFixed(0)}%`;
  }

  /**
   * Clear all history from localStorage (with confirmation).
   */
  function clearHistory() {
    const confirmed = window.confirm(
      "This will permanently delete all stored exam attempts for this browser. Continue?"
    );
    if (!confirmed) return;
    window.localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  }

  /**
   * ============================
   * Exam Initialization & Flow
   * ============================
   */

  /**
   * Prepare a randomized set of questions for the current attempt.
   * - Randomizes the order of questions.
   * - Randomizes the order of options per question while keeping
   *   `correctOptionIndex` accurate.
   */
  function buildRandomizedQuestions() {
    const shuffledQuestions = shuffleArray(BASE_QUESTIONS);

    return shuffledQuestions.map((q) => {
      const indices = [0, 1, 2, 3];
      const shuffledIndices = shuffleArray(indices);
      const newOptions = shuffledIndices.map((i) => q.options[i]);
      const newCorrectIndex = shuffledIndices.indexOf(q.correctOptionIndex);

      return {
        id: q.id,
        questionText: q.questionText,
        options: newOptions,
        correctOptionIndex: newCorrectIndex,
        difficulty: q.difficulty,
        category: q.category,
      };
    });
  }

  /**
   * Reset and start a new exam attempt.
   * - Resets state
   * - Randomizes questions
   * - Starts timer
   * - Shows the exam screen
   */
  function startExam() {
    // Build randomized question set
    const questions = buildRandomizedQuestions();
    const totalQuestions = questions.length;

    examState = {
      questions,
      currentIndex: 0,
      selectedAnswers: new Array(totalQuestions).fill(null),
      startTime: Date.now(),
      timerIntervalId: null,
    };

    // Start timer
    timerLabelEl.textContent = "00:00";
    if (examState.timerIntervalId !== null) {
      window.clearInterval(examState.timerIntervalId);
    }
    examState.timerIntervalId = window.setInterval(updateTimerDisplay, 1000);

    // Show exam screen
    showView("exam");
    renderCurrentQuestion();
  }

  /**
   * Show a given main view within the exam card:
   * - "start"
   * - "exam"
   * - "result"
   */
  function showView(viewName) {
    startScreenEl.classList.add("hidden");
    examScreenEl.classList.add("hidden");
    resultScreenEl.classList.add("hidden");

    if (viewName === "start") {
      startScreenEl.classList.remove("hidden");
    } else if (viewName === "exam") {
      examScreenEl.classList.remove("hidden");
    } else if (viewName === "result") {
      resultScreenEl.classList.remove("hidden");
    }
  }

  /**
   * Update the timer label based on exam start time.
   */
  function updateTimerDisplay() {
    if (!examState) return;
    const now = Date.now();
    const elapsed = now - examState.startTime;
    timerLabelEl.textContent = formatTime(elapsed);
  }

  /**
   * Render the current question and options based on examState.currentIndex.
   */
  function renderCurrentQuestion() {
    if (!examState) return;
    const { questions, currentIndex, selectedAnswers } = examState;
    const total = questions.length;

    const currentQuestion = questions[currentIndex];

    // Update progress
    questionCounterEl.textContent = `Question ${currentIndex + 1} of ${total}`;
    const progressPercent = ((currentIndex + 1) / total) * 100;
    progressBarFillEl.style.width = `${progressPercent}%`;

    // Question meta
    questionCategoryEl.textContent = currentQuestion.category;
    questionDifficultyEl.textContent = currentQuestion.difficulty;
    questionTextEl.textContent = currentQuestion.questionText;

    // Options
    optionsContainerEl.innerHTML = "";
    const savedAnswerIndex = selectedAnswers[currentIndex];

    currentQuestion.options.forEach((optionText, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option-btn";
      btn.dataset.optionIndex = String(index);

      // A, B, C, D labels
      const indexLabel = String.fromCharCode("A".charCodeAt(0) + index);

      const circle = document.createElement("span");
      circle.className = "option-index";
      circle.textContent = indexLabel;

      const label = document.createElement("span");
      label.className = "option-label";
      label.textContent = optionText;

      btn.appendChild(circle);
      btn.appendChild(label);

      if (savedAnswerIndex === index) {
        btn.classList.add("selected");
      }

      btn.addEventListener("click", onOptionClick);

      optionsContainerEl.appendChild(btn);
    });

    // Previous button state
    if (currentIndex === 0) {
      prevBtnEl.disabled = true;
    } else {
      prevBtnEl.disabled = false;
    }
  }

  /**
   * Handle click on an answer option.
   * - Save chosen answer
   * - Immediately move to next question or finish exam
   */
  function onOptionClick(event) {
    if (!examState) return;
    const btn = event.currentTarget;
    const optionIndex = parseInt(btn.dataset.optionIndex, 10);
    if (Number.isNaN(optionIndex)) return;

    const { questions } = examState;
    const total = questions.length;

    // Save selected answer
    examState.selectedAnswers[examState.currentIndex] = optionIndex;

    // If not last question, go to next
    if (examState.currentIndex < total - 1) {
      examState.currentIndex += 1;
      renderCurrentQuestion();
    } else {
      // Last question: finish exam
      finishExam();
    }
  }

  /**
   * Navigate to previous question, if possible.
   */
  function goToPreviousQuestion() {
    if (!examState) return;
    if (examState.currentIndex === 0) {
      return;
    }
    examState.currentIndex -= 1;
    renderCurrentQuestion();
  }

  /**
   * Compute result, store history, and show the result screen.
   * - Calculates number of correct answers and percentage
   * - Builds list of incorrect questions
   * - Computes category summary
   * - Stops timer
   * - Stores attempt in localStorage
   */
  function finishExam() {
    if (!examState) return;

    // Stop timer
    if (examState.timerIntervalId !== null) {
      window.clearInterval(examState.timerIntervalId);
      examState.timerIntervalId = null;
    }

    const endTime = Date.now();
    const timeMs = endTime - examState.startTime;

    const { questions, selectedAnswers } = examState;
    const total = questions.length;

    let correctCount = 0;
    const incorrectItems = [];
    const categoryStats = {};

    questions.forEach((q, index) => {
      const userAnswerIndex = selectedAnswers[index];
      const isCorrect = userAnswerIndex === q.correctOptionIndex;
      if (isCorrect) {
        correctCount += 1;
      } else {
        const userAnswerText =
          typeof userAnswerIndex === "number"
            ? q.options[userAnswerIndex]
            : "(no answer)";

        incorrectItems.push({
          questionText: q.questionText,
          userAnswerText,
          correctAnswerText: q.options[q.correctOptionIndex],
          category: q.category,
          difficulty: q.difficulty,
        });
      }

      if (!categoryStats[q.category]) {
        categoryStats[q.category] = {
          total: 0,
          correct: 0,
        };
      }
      categoryStats[q.category].total += 1;
      if (isCorrect) {
        categoryStats[q.category].correct += 1;
      }
    });

    const percentage = total > 0 ? (correctCount / total) * 100 : 0;

    // Render result summary
    resultTimeEl.textContent = formatTime(timeMs);
    resultScoreEl.textContent = `${correctCount} / ${total}`;
    resultPercentageEl.textContent = `${percentage.toFixed(1)}%`;

    // Render category summary
    categorySummaryListEl.innerHTML = "";
    Object.keys(categoryStats).forEach((category) => {
      const { total: catTotal, correct: catCorrect } = categoryStats[category];
      const li = document.createElement("li");
      const catPercentage =
        catTotal > 0 ? ((catCorrect / catTotal) * 100).toFixed(0) : "0";
      li.textContent = `${category}: ${catCorrect}/${catTotal} (${catPercentage}%)`;
      categorySummaryListEl.appendChild(li);
    });

    // Render incorrect answers list
    incorrectListEl.innerHTML = "";
    if (incorrectItems.length === 0) {
      incorrectEmptyMessageEl.style.display = "block";
    } else {
      incorrectEmptyMessageEl.style.display = "none";
      incorrectItems.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "incorrect-item";

        const title = document.createElement("h4");
        title.textContent = `Question ${index + 1}`;
        div.appendChild(title);

        const meta = document.createElement("div");
        meta.className = "meta";
        meta.textContent = `Category: ${item.category} • Difficulty: ${item.difficulty}`;
        div.appendChild(meta);

        const qText = document.createElement("div");
        qText.innerHTML = `<span class="label">Question:</span> ${item.questionText}`;
        div.appendChild(qText);

        const userAnswer = document.createElement("div");
        userAnswer.innerHTML = `<span class="label">Your answer:</span> ${item.userAnswerText}`;
        div.appendChild(userAnswer);

        const correctAnswer = document.createElement("div");
        correctAnswer.innerHTML = `<span class="label">Correct answer:</span> ${item.correctAnswerText}`;
        div.appendChild(correctAnswer);

        incorrectListEl.appendChild(div);
      });
    }

    // Store attempt in history
    const attempt = {
      completedAt: new Date().toISOString(),
      timeMs,
      totalQuestions: total,
      correctAnswers: correctCount,
      percentage,
    };
    addAttemptToHistory(attempt);

    // Re-render history panel
    renderHistory();

    // Show results screen
    showView("result");

    // Clear exam state; exam is finished
    examState = null;
  }

  /**
   * Reset and restart the exam after finishing.
   * - Keeps history in localStorage
   * - Starts a brand new randomized attempt
   */
  function restartExam() {
    startExam();
  }

  /**
   * ============================
   * Initialization
   * ============================
   */

  function initStartScreenStats() {
    const totalQuestions = BASE_QUESTIONS.length;
    totalQuestionsLabelEl.textContent = String(totalQuestions);

    // Approximate duration: assume ~30 seconds per question, rounded up to minutes
    const approxMinutes = Math.max(1, Math.ceil((totalQuestions * 30) / 60));
    estimatedDurationLabelEl.textContent = String(approxMinutes);
  }

  function attachEventListeners() {
    startExamBtnEl.addEventListener("click", startExam);
    prevBtnEl.addEventListener("click", goToPreviousQuestion);
    restartExamBtnEl.addEventListener("click", restartExam);
    clearHistoryBtnEl.addEventListener("click", clearHistory);
  }

  function init() {
    initStartScreenStats();
    attachEventListeners();
    renderHistory();
    showView("start");
  }

  // Run initialization when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
