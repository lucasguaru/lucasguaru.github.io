// metronome.js
export function setupMetronome(prefs, savePrefs) {
  let metronomeActive = false, metronomeInterval = null, bpm = prefs.bpm || 100;
  const metronomeFab = document.getElementById('metronome-fab');
  const metronomePanel = document.getElementById('metronome-panel');
  const bpmRange = document.getElementById('bpmRange');
  const bpmValue = document.getElementById('bpmValue');
  const metronomeDot = document.getElementById('metronomeDot');
  const metronomeStart = document.getElementById('metronomeStart');
  const metronomeStop = document.getElementById('metronomeStop');

  function showPanel(panel, show) {
    panel.style.display = show ? 'flex' : 'none';
  }
  metronomeFab.onclick = () => showPanel(metronomePanel, metronomePanel.style.display !== 'flex');
  bpmRange.value = bpm;
  bpmValue.textContent = bpm;
  bpmRange.oninput = e => {
    bpm = +e.target.value;
    bpmValue.textContent = bpm;
    prefs.bpm = bpm;
    savePrefs(prefs);
  };
  function doMetronome() {
    metronomeDot.classList.add('active');
    setTimeout(() => metronomeDot.classList.remove('active'), 100);
  }
  function startMetronome() {
    if (metronomeActive) return;
    metronomeActive = true;
    doMetronome();
    metronomeInterval = setInterval(doMetronome, 60000 / bpm);
  }
  function stopMetronome() {
    metronomeActive = false;
    if (metronomeInterval) clearInterval(metronomeInterval);
    metronomeDot.classList.remove('active');
  }
  metronomeStart.onclick = startMetronome;
  metronomeStop.onclick = stopMetronome;
  ['wheel','touchstart','keydown','mousedown'].forEach(ev => {
    window.addEventListener(ev, stopMetronome, { passive: true });
  });
  // Inicialização
  if (prefs.bpm) bpmRange.value = prefs.bpm;
  return { startMetronome, stopMetronome };
}
