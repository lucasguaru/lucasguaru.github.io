(() => {
  const STORAGE_KEY = "excel_tsv_rows_v1";

  // Elementos
  const searchEl = document.getElementById("search");
  const pasteBox = document.getElementById("pasteBox");
  const pasteMeta = document.getElementById("pasteMeta");
  const clearBtn = document.getElementById("clearBtn");
  const loadSampleBtn = document.getElementById("loadSampleBtn");
  const gridHead = document.getElementById("gridHead");
  const gridBody = document.getElementById("gridBody");
  const rowsInfo = document.getElementById("rowsInfo");
  const toast = document.getElementById("toast");

  // Estado
  let allRows = []; // [{...}]
  let columns = []; // ["Seq. Funcionalidade", ...]
  let filteredRows = []; // view

  // Helpers
  const showToast = (msg) => {
    toast.textContent = msg;
    if (!msg) return;
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => (toast.textContent = ""), 2200);
  };

  const normalize = (s) =>
    (s ?? "")
      .toString()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();

  const escapeXml = (s) =>
    (s ?? "")
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const copyToClipboard = async (text) => {
    // Tenta Clipboard API
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      // Fallback
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch (e) {
        return false;
      }
    }
  };

  // Parser TSV (Excel copy)
  function parseTSV(tsvText) {
    const raw = (tsvText || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();
    if (!raw) return { columns: [], rows: [] };

    const lines = raw.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length === 0) return { columns: [], rows: [] };

    const header = lines[0].split("\t").map((h) => h.trim());
    const dataLines = lines.slice(1);

    const rows = dataLines.map((line) => {
      const parts = line.split("\t");
      const obj = {};
      header.forEach((col, i) => {
        obj[col] = (parts[i] ?? "").trim();
      });
      return obj;
    });

    return { columns: header, rows };
  }

  function saveToStorage(tsvText) {
    localStorage.setItem(STORAGE_KEY, tsvText);
  }

  function loadFromStorage() {
    return localStorage.getItem(STORAGE_KEY) || "";
  }

  function setPasteMetaFromState(tsvText) {
    const { columns: cols, rows } = parseTSV(tsvText);
    if (!tsvText.trim()) {
      pasteMeta.textContent = "Nenhum dado salvo.";
      return;
    }
    pasteMeta.textContent = `${rows.length} linhas • ${cols.length} colunas (salvo no localStorage)`;
  }

  // Geração do XML (completo)
  function generateDrawioXml({ label, tips, objectId }) {
    // Mantive style/geometry exatamente como você vinha usando
    // Ajuste x/y/width/height aqui se precisar.
    const safeLabel = escapeXml(label);
    const safeTips = escapeXml(tips);

    return `<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <object label="${safeLabel}" tips="${safeTips}" id="${escapeXml(objectId)}">
      <mxCell parent="1" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1">
        <mxGeometry height="20" width="50" x="-340" y="1460" as="geometry"/>
      </mxCell>
    </object>
  </root>
</mxGraphModel>`;
  }

  // A lógica do label e tips conforme seu Excel:
  // - label = "Seq. Funcionalidade" + "." + "Seq. História"
  // - tips = "Nome da História de Usuário/ Link para HU"
  function rowToXml(row, idx) {
    const seqFunc = row["Seq. Funcionalidade"] ?? "";
    const seqHu = row["Seq. História"] ?? "";
    const tips = row["Nome da História de Usuário/ Link para HU"] ?? "";

    const label = `${seqFunc}.${seqHu}`;
    const objectId = `obj-${idx + 2}`; // evita repetir id="2" quando tiver várias linhas

    return generateDrawioXml({ label, tips, objectId });
  }

  function applyFilter() {
    const q = normalize(searchEl.value);
    if (!q) {
      filteredRows = [...allRows];
    } else {
      filteredRows = allRows.filter((r) => {
        const hay = columns.map((c) => r[c] ?? "").join(" | ");
        return normalize(hay).includes(q);
      });
    }
    renderTable();
  }

  function renderTable() {
    // Head
    const headCols = [...columns, "Ações"];
    gridHead.innerHTML = `
      <tr>
        ${headCols.map((c) => `<th>${c}</th>`).join("")}
      </tr>
    `;

    // Body
    gridBody.innerHTML = filteredRows
      .map((row, idx) => {
        const globalIdx = allRows.indexOf(row);
        const status = row["Status"] ?? "";
        const statusBadge = status
          ? `<span class="badge">${status}</span>`
          : `<span class="small">—</span>`;

        // Linhas normais
        const tds = columns
          .map((c) => {
            if (c === "Status") return `<td>${statusBadge}</td>`;
            const v = row[c] ?? "";
            return `<td>${v ? escapeHtml(v) : `<span class="small">—</span>`}</td>`;
          })
          .join("");

        return `
        <tr data-idx="${globalIdx}">
          ${tds}
          <td>
            <div class="actions">
              <button class="btn" type="button" data-action="xml" data-idx="${globalIdx}">
                Gerar XML
              </button>
              <span class="small code">${escapeHtml((row["Seq. Funcionalidade"] ?? "") + "." + (row["Seq. História"] ?? ""))}</span>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");

    rowsInfo.textContent = `${filteredRows.length} linhas (de ${allRows.length})`;
  }

  function escapeHtml(s) {
    return (s ?? "")
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Eventos: paste box
  pasteBox.addEventListener("click", () => pasteBox.focus());

  pasteBox.addEventListener("keydown", (e) => {
    // bloquear digitação "normal"
    const allowed = [
      "Control",
      "Meta",
      "Shift",
      "Alt",
      "Tab",
      "Escape",
      "Enter",
    ];
    if (allowed.includes(e.key)) return;

    // Permitir Ctrl+V / Cmd+V
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") return;

    // Bloqueia o resto (não digitável)
    e.preventDefault();
  });

  pasteBox.addEventListener("paste", (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData("text/plain") ?? "";
    if (!text.trim()) {
      showToast("Nada para colar.");
      return;
    }

    // Substitui + salva
    saveToStorage(text);
    setPasteMetaFromState(text);

    // Atualiza grid
    const parsed = parseTSV(text);
    columns = parsed.columns;
    allRows = parsed.rows;

    // fallback: se vier vazio por colagem ruim
    if (columns.length === 0 || allRows.length === 0) {
      showToast("Colagem inválida (precisa de TSV com cabeçalho).");
    } else {
      showToast("Dados colados e salvos.");
    }

    applyFilter();
  });

  // Botões
  clearBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    allRows = [];
    columns = [];
    filteredRows = [];
    setPasteMetaFromState("");
    renderTable();
    showToast("Limpo.");
  });

  loadSampleBtn.addEventListener("click", () => {
    const sample = [
      "Seq. Funcionalidade\tNome da Funcionalidade\tSeq. História\tNome da História de Usuário/ Link para HU\tStatus",
      "1\tValidação de Login\t1\tHU 1 – Ativação de Usuário Parceiro de Cooperativa (Convite - 1º Acesso)\tConcluído",
      "1\tValidação de Login\t2\tHU 2 – Ativação de Usuário Parceiro de Cooperativa ( Senha - 1º Acesso)\tConcluído",
      "1\tValidação de Login\t3\tHU 3 – Login Parceiro (2º Acesso)\tConcluído",
    ].join("\n");

    saveToStorage(sample);
    setPasteMetaFromState(sample);

    const parsed = parseTSV(sample);
    columns = parsed.columns;
    allRows = parsed.rows;

    showToast("Exemplo carregado e salvo.");
    applyFilter();
  });

  // Pesquisa
  searchEl.addEventListener("input", () => applyFilter());

  // Ações da tabela (delegation)
  gridBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const idxStr = btn.getAttribute("data-idx");
    const idx = Number(idxStr);

    if (!Number.isFinite(idx) || idx < 0 || idx >= allRows.length) {
      showToast("Linha inválida.");
      return;
    }

    if (action === "xml") {
      const xml = rowToXml(allRows[idx], idx);
      const ok = await copyToClipboard(xml);
      showToast(
        ok
          ? "XML copiado para a área de transferência."
          : "Não foi possível copiar (permissão do navegador).",
      );
    }
  });

  // Inicialização
  function init() {
    const saved = loadFromStorage();
    setPasteMetaFromState(saved);

    if (saved.trim()) {
      const parsed = parseTSV(saved);
      columns = parsed.columns;
      allRows = parsed.rows;
    } else {
      columns = [];
      allRows = [];
    }

    filteredRows = [...allRows];
    renderTable();
  }

  init();
})();
