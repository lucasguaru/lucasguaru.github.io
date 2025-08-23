// scroll.js
export function setupAutoScroll(prefs, savePrefs) {
  let autoScrollActive = false, autoScrollRAF = null, autoScrollSpeed = prefs.scrollSpeed || 30;
  const scrollFab = document.getElementById('scroll-fab');
  const scrollPanel = document.getElementById('scroll-panel');
  const scrollSpeed = document.getElementById('scrollSpeed');
  const scrollSpeedValue = document.getElementById('scrollSpeedValue');
  const scrollStart = document.getElementById('scrollStart');
  const scrollStop = document.getElementById('scrollStop');

  // Ajusta o range do input
  scrollSpeed.min = 10;
  scrollSpeed.max = 80;
  scrollSpeed.value = autoScrollSpeed;
  scrollSpeedValue.textContent = autoScrollSpeed;

  function showPanel(panel, show) {
    panel.style.display = show ? 'flex' : 'none';
  }
  scrollFab.onclick = () => showPanel(scrollPanel, scrollPanel.style.display !== 'flex');
  scrollSpeed.oninput = e => {
    autoScrollSpeed = +e.target.value;
    scrollSpeedValue.textContent = autoScrollSpeed;
    prefs.scrollSpeed = autoScrollSpeed;
    savePrefs(prefs);
    // Se estiver scrollando, reinicia o loop para pegar a nova velocidade imediatamente
    if (autoScrollActive) {
      if (autoScrollRAF) cancelAnimationFrame(autoScrollRAF);
      doAutoScroll();
    }
  };
  let scrollRemainder = 0;
  function doAutoScroll() {
    if (!autoScrollActive) return;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    if (window.scrollY >= maxScroll) { stopAutoScroll(); return; }
    let pixels = autoScrollSpeed / 60 + scrollRemainder;
    const intPixels = Math.floor(pixels);
    scrollRemainder = pixels - intPixels;
    if (intPixels > 0) {
      window.scrollBy(0, intPixels);
    }
    autoScrollRAF = requestAnimationFrame(doAutoScroll);
  }
  // Reset remainder when starting
  function startAutoScroll() {
    if (autoScrollActive) return;
    autoScrollActive = true;
    scrollRemainder = 0;
    showPanel(scrollPanel, false); // Fecha o painel ao iniciar
    doAutoScroll();
  }
  function startAutoScroll() {
    if (autoScrollActive) return;
    autoScrollActive = true;
    doAutoScroll();
  }
  function stopAutoScroll(event) {
    if (scrollPanel.style.display !== 'flex' || event.target.id !== 'scrollStop') return
    autoScrollActive = false;
    if (autoScrollRAF) cancelAnimationFrame(autoScrollRAF);
    showPanel(scrollPanel, false)   
  }
  scrollStart.onclick = () => {
    startAutoScroll();
    showPanel(scrollPanel, false)
  }
  scrollStop.onclick = stopAutoScroll;
  ['wheel','touchstart','keydown','mousedown'].forEach(ev => {
    window.addEventListener(ev, stopAutoScroll, { passive: true });
  });
  // Inicialização
  if (prefs.scrollSpeed) scrollSpeed.value = prefs.scrollSpeed;
  return { startAutoScroll, stopAutoScroll };
}
