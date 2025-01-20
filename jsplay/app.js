require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
    var editor1 = monaco.editor.create(document.getElementById('editor1'), {
        value: '',
        language: 'json',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: {
            enabled: false
        }
    });
    var editor2 = monaco.editor.create(document.getElementById('editor2'), {
        value: '',
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: {
            enabled: false
        }
    });
    var editor3 = monaco.editor.create(document.getElementById('editor3'), {
        value: '',
        language: 'json',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: {
            enabled: false
        },
        readOnly: true
    });

    editor1.setValue('{\n\t"message": "Hello World!"\n}');
    editor2.setValue('payload');

    editor1Element.addEventListener('dragover', (event) => {
        event.preventDefault();
        editor1Element.classList.add('drag-over');
    });

    editor1Element.addEventListener('dragleave', () => {
        editor1Element.classList.remove('drag-over');
    });

    editor1Element.addEventListener('drop', (event) => {
        return handleFileDrop(event, (content) => {
            editor1.setValue(content);
        })
    });

    // Resizing logic
    const resizers = document.querySelectorAll('.resizer');
    let isResizing = false;
    let currentResizer;

    resizers.forEach(resizer => {
        resizer.addEventListener('mousedown', (event) => {
            isResizing = true;
            currentResizer = event.target;
        });
    });

    document.addEventListener('mousemove', (event) => {
        if (!isResizing) return;

        const previous = currentResizer.previousElementSibling;
        const next = currentResizer.nextElementSibling;

        const dx = event.movementX;

        const previousWidth = previous.getBoundingClientRect().width;
        const nextWidth = next.getBoundingClientRect().width;

        previous.style.flex = `0 0 ${previousWidth + dx}px`;
        next.style.flex = `0 0 ${nextWidth - dx}px`;
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        currentResizer = null;

        var timeout;
        function debounce(func, delay) {
            return function () {
                var context = this, args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    func.apply(context, args);
                }, delay);
            };
        }

        function processContent() {
            var payload;
            try {
                payload = JSON.parse(editor1.getValue());
            } catch (e) {
                editor3.updateOptions({ readOnly: false });
                editor3.setValue("Error parsing JSON: " + e.message);
                editor3.updateOptions({ readOnly: true });
                return;
            }

            var code = editor2.getValue();
            var output = editor3.getValue();

            try {
                var result = eval(code);
                if (typeof result === 'object') {
                    output = JSON.stringify(result, null, 4);
                } else {
                    output = String(result);
                }
                editor3.updateOptions({ readOnly: false });
                editor3.setValue(output);
                editor3.updateOptions({ readOnly: true });
                editor3.getDomNode().classList.remove('error');
            } catch (e) {
                console.error("Error executing code: ", e);
                editor3.getDomNode().classList.add('error');
            }
        }

        var debouncedProcessContent = debounce(processContent, 150);

        editor1.onDidChangeModelContent(debouncedProcessContent);
        editor2.onDidChangeModelContent(debouncedProcessContent);
    });
});