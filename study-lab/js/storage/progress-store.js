const KEY = 'study-lab:v1';

const emptyState = () => ({ attempts: [], answers: {}, pendingErrors: [], markedForReview: [], lastActivity: null });

export function loadProgress() {
  try {
    return { ...emptyState(), ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return emptyState();
  }
}

function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
  return state;
}

export function recordAnswer({ question, correct, mode }) {
  const state = loadProgress();
  const previous = state.answers[question.id] || { attempts: 0, correct: 0 };
  state.answers[question.id] = {
    attempts: previous.attempts + 1,
    correct: previous.correct + (correct ? 1 : 0),
    lastCorrect: correct,
    lastAttempt: new Date().toISOString(),
    moduleId: question.moduleId
  };
  state.pendingErrors = state.pendingErrors.filter(id => id !== question.id);
  if (!correct) state.pendingErrors.push(question.id);
  state.lastActivity = { moduleId: question.moduleId, mode, at: new Date().toISOString() };
  return save(state);
}

export function recordAttempt(attempt) {
  const state = loadProgress();
  state.attempts.push({ ...attempt, completedAt: new Date().toISOString() });
  return save(state);
}

export function toggleReviewMark(questionId) {
  const state = loadProgress();
  const marked = state.markedForReview.includes(questionId);
  state.markedForReview = marked
    ? state.markedForReview.filter(id => id !== questionId)
    : [...state.markedForReview, questionId];
  save(state);
  return !marked;
}

export function resetProgress() {
  localStorage.removeItem(KEY);
}
