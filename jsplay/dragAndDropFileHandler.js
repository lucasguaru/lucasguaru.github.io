const editor1Element = document.getElementById('editor1');
    
function handleFileDrop(event, fnUpdateContent) {
    event.preventDefault();
    editor1Element.classList.remove('drag-over');

    const file = event.dataTransfer.files[0];
    if (!file || !(file.name.endsWith('.xlsx') || file.name.endsWith('.csv'))) {
        alert('Only Excel (.xlsx) or CSV files are allowed.');
        return;
    }

    function formatFileSize(bytes) {
        const units = ["Bytes", "KB", "MB", "GB", "TB"];
        let index = 0;

        // Divide the size by 1024 until it's small enough for the current unit
        while (bytes >= 1024 && index < units.length - 1) {
            bytes /= 1024;
            index++;
        }

        // Return the formatted size with two decimal places
        return `${bytes.toFixed(2)} ${units[index]}`;
    }
    // debugger
    fnUpdateContent(`Loading file: ${file.name}\nSize: ${formatFileSize(file.size)}`);
    // editor1.setValue(`Loading file: ${file.name}\nSize: ${formatFileSize(file.size)}`);

    const handleXLSX = async (file) => {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });

        let selectedSheetName;
        if (workbook.SheetNames.length > 1) {
            selectedSheetName = await new Promise((resolve) => {
                const sheetList = workbook.SheetNames.map(name => 
                    `<option value="${name}">${name}</option>`
                ).join('');
                
                const dialog = document.createElement('div');
                dialog.innerHTML = `
                    <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
                                background:white;padding:20px;border-radius:5px;z-index:1000">
                        <h3>Select Sheet</h3>
                        <select id="sheetSelector" style="margin:10px 0">
                            ${sheetList}
                        </select>
                        <br>
                        <button onclick="this.parentElement.remove();return false;">Select</button>
                    </div>
                `;
                
                document.body.appendChild(dialog);
                const select = dialog.querySelector('#sheetSelector');
                const button = dialog.querySelector('button');
                
                button.onclick = () => {
                    const selected = select.value;
                    dialog.remove();
                    resolve(selected);
                };
            });
        } else {
            selectedSheetName = workbook.SheetNames[0];
        }
        
        const worksheet = workbook.Sheets[selectedSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        displayJSON(jsonData);
    };

    const handleCSV = async (file) => {
        const text = await file.text();
        const rows = text.split("\n").map((row) => row.split(","));
        const headers = rows.shift();
        const jsonData = rows.map((row) =>
            row.reduce((acc, value, index) => {
                if (headers[index]) {
                    acc[headers[index].trim()] = value.trim();
                }
                return acc;
            }, {})
        );
        displayJSON(jsonData);
    };

    const displayJSON = (data) => {
        const formattedJSON = JSON.stringify(data, null, 4);
        fnUpdateContent(formattedJSON);

        const propertiesCount = Object.keys(data[0]).length;
        const dialog = document.createElement('div');
        dialog.innerHTML = `
            <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:20px;border-radius:5px;z-index:1000">
                <h3>File Information</h3>
                <p>Rows: ${data.length}</p>
                <p>Columns: ${propertiesCount}</p>
                <button onclick="this.parentElement.remove();return false;">Close</button>
            </div>
        `;
        document.body.appendChild(dialog);

        let timeoutId = setTimeout(() => {
            dialog.remove();
        }, 3000);

        dialog.addEventListener('mouseenter', () => {
            clearTimeout(timeoutId);
        });

        dialog.addEventListener('mouseleave', () => {
            timeoutId = setTimeout(() => {
                dialog.remove();
            }, 3000);
        });
    };

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".xlsx")) {
        handleXLSX(file);
    } else if (fileName.endsWith(".csv")) {
        handleCSV(file);
    } else {
        alert("Unsupported file format. Please upload an XLSX or CSV file.");
    }

    // Placeholder for your file reading logic
    console.log('File dropped:', file.name);
    // Implement file reading logic here (e.g., reading file and parsing to JSON)
}