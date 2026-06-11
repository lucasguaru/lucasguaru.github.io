export const FONT_STORAGE_KEY = "cienciasPrintFont";

export const PRINT_FONTS = [
  {
    id: "times",
    label: "Times New Roman",
    shortLabel: "Times",
    family: '"Times New Roman", Times, serif',
    google: null,
  },
  {
    id: "arial",
    label: "Arial",
    shortLabel: "Arial",
    family: "Arial, Helvetica, sans-serif",
    google: null,
  },
  {
    id: "lexend",
    label: "Lexend",
    shortLabel: "Lexend",
    family: '"Lexend", sans-serif',
    google: "Lexend:wght@400;600;700",
  },
  {
    id: "atkinson",
    label: "Atkinson Hyperlegible",
    shortLabel: "Atkinson",
    family: '"Atkinson Hyperlegible", sans-serif',
    google: "Atkinson+Hyperlegible:wght@400;700",
  },
  {
    id: "merriweather",
    label: "Merriweather",
    shortLabel: "Merriweather",
    family: '"Merriweather", serif',
    google: "Merriweather:wght@400;700",
  },
  {
    id: "nunito",
    label: "Nunito",
    shortLabel: "Nunito",
    family: '"Nunito", sans-serif',
    google: "Nunito:wght@400;600;700",
  },
];

const loadedGoogleFonts = new Set();

function loadGoogleFont(googleSpec) {
  if (!googleSpec || loadedGoogleFonts.has(googleSpec)) return;
  loadedGoogleFonts.add(googleSpec);

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${googleSpec}&display=swap`;
  document.head.appendChild(link);
}

export function getFontById(fontId) {
  return PRINT_FONTS.find((font) => font.id === fontId) || PRINT_FONTS[0];
}

export function getSavedFontId() {
  const saved = localStorage.getItem(FONT_STORAGE_KEY);
  return getFontById(saved).id;
}

export function applyPrintFont(fontId) {
  const font = getFontById(fontId);
  document.documentElement.style.setProperty("--print-font-family", font.family);
  document.documentElement.dataset.printFont = font.id;
  if (font.google) loadGoogleFont(font.google);
  localStorage.setItem(FONT_STORAGE_KEY, font.id);
  return font;
}

export function initPrintFontPicker(containerEl, { onChange, initialFontId } = {}) {
  const savedId = initialFontId || getSavedFontId();
  applyPrintFont(savedId);

  containerEl.innerHTML = `
    <div class="font-picker">
      <span class="font-picker-label">Fonte da impressão</span>
      <div class="font-picker-options" role="group" aria-label="Escolher fonte da impressão"></div>
    </div>
  `;

  const optionsEl = containerEl.querySelector(".font-picker-options");

  PRINT_FONTS.forEach((font) => {
    if (font.google) loadGoogleFont(font.google);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "font-option";
    btn.dataset.fontId = font.id;
    btn.title = font.label;
    btn.style.fontFamily = font.family;
    btn.textContent = font.shortLabel;
    btn.setAttribute("aria-pressed", font.id === savedId ? "true" : "false");

    btn.addEventListener("click", () => {
      applyPrintFont(font.id);
      optionsEl.querySelectorAll(".font-option").forEach((option) => {
        option.setAttribute(
          "aria-pressed",
          option.dataset.fontId === font.id ? "true" : "false"
        );
      });
      if (onChange) onChange(font.id);
    });

    optionsEl.appendChild(btn);
  });

  optionsEl.querySelector(`[data-font-id="${savedId}"]`)?.setAttribute("aria-pressed", "true");
}

export function appendFontToUrl(url) {
  const fontId = getSavedFontId();
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}font=${fontId}`;
}
