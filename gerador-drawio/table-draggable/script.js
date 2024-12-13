document.addEventListener('DOMContentLoaded', () => {
    const fields = document.querySelectorAll('.field');
    let draggingField = null;
    let draggingLine = null;
    let startField = null;
  
    fields.forEach(field => {
      field.addEventListener('dragstart', (e) => {
        startDrag(e.target);
        e.dataTransfer.effectAllowed = 'move';
      });
  
      field.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        highlightField(e.target);
      });
  
      field.addEventListener('dragleave', (e) => {
        unhighlightField(e.target);
      });
  
      field.addEventListener('drop', (e) => {
        e.preventDefault();
        endDrag(e.target);
      });
    });
  
    document.addEventListener('mousemove', (e) => {
      if (draggingLine) {
        updateLinePosition(e);
      }
    });
  
    document.addEventListener('mouseup', () => {
      if (draggingLine) {
        document.body.removeChild(draggingLine);
        draggingLine = null;
        startField = null;
      }
    });
  
    function startDrag(field) {
      startField = field;
      draggingLine = document.createElement('div');
      draggingLine.className = 'line';
      document.body.appendChild(draggingLine);
      updateLinePosition({ clientX: field.getBoundingClientRect().left, clientY: field.getBoundingClientRect().top });
    }
  
    function updateLinePosition(event) {
      const rect = startField.getBoundingClientRect();
      const x1 = rect.left + rect.width / 2;
      const y1 = rect.top + rect.height / 2;
      const x2 = event.clientX;
      const y2 = event.clientY;
  
      const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  
      draggingLine.style.width = `${length}px`;
      draggingLine.style.transform = `translate(${x1}px, ${y1}px) rotate(${angle}deg)`;
    }
  
    function highlightField(field) {
      if (field !== startField) {
        field.classList.add('highlight');
      }
    }
  
    function unhighlightField(field) {
      field.classList.remove('highlight');
    }
  
    function endDrag(target) {
      if (target.classList.contains('field') && target !== startField) {
        createFixedLine(startField, target);
      }
      document.body.removeChild(draggingLine);
      draggingLine = null;
      startField = null;
    }
  
    function createFixedLine(startField, endField) {
      const line = document.createElement('div');
      line.className = 'line';
      document.body.appendChild(line);
  
      const rect1 = startField.getBoundingClientRect();
      const rect2 = endField.getBoundingClientRect();
      const x1 = rect1.left + rect1.width / 2;
      const y1 = rect1.top + rect1.height / 2;
      const x2 = rect2.left + rect2.width / 2;
      const y2 = rect2.top + rect2.height / 2;
  
      const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  
      line.style.width = `${length}px`;
      line.style.transform = `translate(${x1}px, ${y1}px) rotate(${angle}deg)`;
      line.classList.add('fixed');
    }
  });