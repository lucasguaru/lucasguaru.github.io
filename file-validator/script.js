document.addEventListener('DOMContentLoaded', () => {
    const fileUploadContainer = document.getElementById('file-upload-container');
    const dynamicUploads = document.getElementById('dynamic-uploads');
    const errorList = document.getElementById('error-list');
    const errorsContainer = document.getElementById('errors');
    const addUploadBtn = document.getElementById('add-upload-btn');

    let uploadCount = 0;

    // Function to handle file uploads and read .xlsx or .csv
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const data = e.target.result;

            if (file.name.endsWith('.xlsx')) {
                // Convert Excel to JSON
                readXlsxToJson(data, file.name);
            } else if (file.name.endsWith('.csv')) {
                // Convert CSV to JSON
                console.log(csvToJson(data));
            }
        };

        if (file.name.endsWith('.xlsx')) {
            reader.readAsBinaryString(file);
        } else if (file.name.endsWith('.csv')) {
            reader.readAsText(file);
        }
    }

    // Convert Excel (.xlsx) file to JSON
    function readXlsxToJson(data, filename) {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets['ISO File Data Requirements'];
        const json = XLSX.utils.sheet_to_json(sheet);
        let uniqueCustomerFileNames = validateMappingFile(json)

        // for each unique customer file name, call addFileUpload
        uniqueCustomerFileNames.forEach(addFileUpload)
    }

    function validateMappingFile(json) {
        json.map((row, index) => {
            return { ...row, rownum: (index + 1) }
        })
        let missingRequired = json.filter(row => row["Required?"] == "Yes" && !(row["Customer Column Header"]))

        if (missingRequired.length > 0) {
            console.log(`Content of Missing Required:`, missingRequired);
        }

        // get the unique values of the Customer File Name Column Header
        let uniqueCustomerFileNames = [...new Set(json.map(row => row["Customer File Name"]))].filter(filename => filename && filename.trim() != "" && filename != "-")

        return uniqueCustomerFileNames

    }

    // Convert CSV to JSON
    function csvToJson(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const json = lines.slice(1).map((line) => {
            const values = line.split(',');
            return headers.reduce((acc, header, idx) => {
                acc[header.trim()] = values[idx].trim();
                return acc;
            }, {});
        });
        return json;
    }

    let fileList = []

    // Function to dynamically add a file upload
    function addFileUpload(fileName) {
        const fileId = `upload-${uploadCount++}`;
        const fileUpload = document.createElement('div');
        fileUpload.className = 'file-upload';
        fileUpload.innerHTML = `
        <label for="${fileId}">${fileName} - Drag & drop or click to upload</label>
        <input type="file" id="${fileId}" accept=".xlsx, .csv">
      `;
        fileUpload.querySelector('input').addEventListener('change', handleFileUpload);
        dynamicUploads.appendChild(fileUpload);
        fileList.push({
            fileId, fileName
        })
    }

    // Function to display the error list
    function showErrorList(errors) {
        errorsContainer.innerHTML = errors.map((err) => `<li>${err}</li>`).join('');
        errorList.classList.remove('hidden');
    }

    // Attach event listeners
    document.getElementById('mapping-input').addEventListener('change', handleFileUpload);
    // addUploadBtn.addEventListener('click', addFileUpload);

    // Expose functions for external calls
    window.addError = function (error) {
        const li = document.createElement('li');
        li.textContent = error;
        errorsContainer.appendChild(li);
    };

    window.showErrors = function () {
        errorList.classList.remove('hidden');
    };

    window.hideErrors = function () {
        errorList.classList.add('hidden');
    };
});