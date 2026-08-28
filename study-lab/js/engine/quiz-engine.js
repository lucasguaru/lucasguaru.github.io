const shuffle = items => [...items].sort(() => Math.random() - 0.5);

export function createSession({ questions, moduleId, mode = 'study', size = 8 }) {
  const pool = moduleId === 'final' ? questions : questions.filter(q => q.moduleId === moduleId);
  const selected = shuffle(pool).slice(0, Math.min(size, pool.length));
  return { id: crypto.randomUUID(), moduleId, mode, questions: selected, index: 0, results: [], startedAt: new Date().toISOString() };
}

export function evaluate(question, answer) {
  if (question.type === 'order') return JSON.stringify(answer) === JSON.stringify(question.correct);
  if (question.type === 'match') return Object.keys(question.correct).every(key => answer?.[key] === question.correct[key]);
  return answer === question.correct;
}

export function sessionScore(session) {
  const correct = session.results.filter(result => result.correct).length;
  return { correct, total: session.results.length, percentage: session.results.length ? Math.round(correct / session.results.length * 100) : 0 };
}
