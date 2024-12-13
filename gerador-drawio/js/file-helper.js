const MAPPING_FILE_FIELDS = [FILE_NAME, FILE_FIELD, API_NAME, API_FIELD, ]
function isMappingFile(jsonFile) {
    if (!jsonFile.length) {
        return false
    }

    let line = jsonFile[0]
    for (let i = 0; i < MAPPING_FILE_FIELDS.length; i++) {
        if (!line.hasOwnProperty(MAPPING_FILE_FIELDS[i])) return false
    }
    return true
}
function isMappingHeaderStr(headerStr) {
    if (!headerStr.length) {
        return false
    }
    for (let i = 0; i < MAPPING_FILE_FIELDS.length; i++) {
        if (!headerStr.includes(MAPPING_FILE_FIELDS[i])) return false
    }
    return true
}

function addDataFilesListener(event) {
    const files = event.target.files;
    const linesToRead = 350;
    const linesToReturn = 20;

    if (files.length) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            let fileName = file.name
        
            const reader = new FileReader();
            let fileNames = ""
            reader.onload = function(e) {
                const buffer = e.target.result;
                let jsonFile = readCsvFileAsJson(buffer, linesToRead);
                if (isMappingFile(jsonFile)) {
                    mapFile = {
                        fileName: fileName,
                        fileContent: jsonFile,
                    }
                } else {
                    csvFiles.push({
                        fileName: fileName,
                        fileContent: jsonFile.slice(0, linesToReturn),
                    })
                }
                if (mapFile) {
                    fileNames = `<strong>(Mapping)</strong>: ${mapFile.fileName}<br>`
                }
                fileNames += csvFiles.map(f => `<strong>(Data)</strong>: ${f.fileName}`).join('<br>')

                document.getElementById('fileName').innerHTML = fileNames;
            };
            reader.readAsArrayBuffer(file);
        }
    } else {
        alert('Please select a file and specify the number of lines to read.');
    }
}

function addMapFileListener(event) {
    const file = event.target.files[0];

    if (file) {
        let fileName = file.name
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const buffer = e.target.result;
            let jsonFile = readCsvFileAsJson(buffer, -1);
            mapFile = {
                fileName: fileName,
                fileContent: jsonFile,
            }
            let fileNames = `File name: ${fileName}`

            document.getElementById('mappingFileName').innerHTML = fileNames;
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert('Please select a file and specify the number of lines to read.');
    }
}

function extractFieldSeparator(headerLine) {
    // log(headerLine, 'headerLine')
    if (headerLine.includes(',')) return ','
    if (headerLine.includes(';')) return ';'
    if (headerLine.includes('|')) return '|'
    return ','
}

function readCsvFileAsJson(buffer, linesToRead) {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(buffer);

    // If is map file, read all the file
    // If is data file, read only a few records (linesToRead) because the files can be too long
    let headerLine = text.substringBefore('\n');
    let separator = extractFieldSeparator(headerLine)
    let isMapFile = isMappingHeaderStr(headerLine)
    linesToRead = isMapFile ? -1 : linesToRead + 1; // Including header line
    let lines = readCSVValues(text, separator, linesToRead)
    // lines = lines.filter(line => line.replaceAll(separator, '') != '\r')

    const json = csvArrayToJson(lines);
    // document.getElementById('output').textContent = JSON.stringify(json, null, 2);
    console.log(`Number of rows read: ${json.length}`);
    return json;
}

function getLineBreaker(allText) {
    let pos = allText.indexOf('\n')
    if (pos > -1 && allText.charAt(pos - 1) == '\r') {
        return '\r\n'
    } else {
        return '\n'
    }
}

function getFirstFieldSeparator(allText, separator, startPos) {
    // Get first field separator
    let commaSeparator = '"' + separator
    let lineSeparator =  '"' + getLineBreaker(allText)
    let posSeparatorComma = allText.indexOf(commaSeparator, startPos)
    let posSeparatorLineBreak = allText.indexOf(lineSeparator, startPos)
    if (posSeparatorComma > -1 && posSeparatorLineBreak > -1) {
        let isFieldSeparatorComma = posSeparatorComma < posSeparatorLineBreak
        let fieldSeparator = isFieldSeparatorComma ? commaSeparator : lineSeparator
        return fieldSeparator
        // return allText.substringBefore(fieldSeparator, startPos) // ,THOMASVILLE,"Old Dominion Freight Line, Inc.",NC,27360
    }
    log('MISSING IMPLEMENTATION - getFieldSeparator')
    alert('MISSING IMPLEMENTATION - getFieldSeparator')
}

function readCSVValues(allText, separator, linesToRead) {
    let pos = 0
    let linePos = 0
    let result = []
    let currentLine = []
    result[linePos] = currentLine
    while (pos < allText.length) {
        let subtext = allText.substringBefore(separator, pos)
        if (isAllValue(subtext)) {
            let additionalSize = 0
            if (subtext.startsWith('"') && subtext.endsWith('"')) {
                additionalSize = 2
                subtext = subtext.substring(1, subtext.length - 1)
            }
            currentLine.push(subtext)
            pos += subtext.length + 1 + additionalSize
        } else {
            if (subtext && subtext[0] == '"') {
                // check when it finishes the value
                // debugger
                let posComma = allText.indexOf(separator, pos + 1)

                // reached end of file
                if (posComma == -1) {
                    subtext = allText.substring(pos + 1, allText.length) // ,THOMASVILLE,"Old Dominion Freight Line, Inc.",NC,27360
                    let posBreak = subtext.indexOf('\n')
                    if (posBreak > -1) {
                        subtext = subtext.substringBefore('"')
                        if (subtext.endsWith('\r')) subtext = subtext.substring(0, subtext.length -1)
                        currentLine.push(subtext)
                        
                        if (linesToRead > 0 && linePos == linesToRead) return result

                        currentLine = []
                        result[++linePos] = currentLine
                        pos += subtext.length + 3 // + 3 bc ("",). The subtext will have the clean value 'Old Dominion Freight Line, Inc.'
                    } else {
                        currentLine.push(subtext)
                        pos += subtext.length
                    }
                    continue
                } else {
                    let fieldSeparator = getFirstFieldSeparator(allText, separator, pos + 1)
                    subtext = allText.substringBefore(fieldSeparator, pos + 1) // ,THOMASVILLE,"Old Dominion Freight Line, Inc.",NC,27360
                    currentLine.push(subtext)
                    pos += subtext.length + fieldSeparator.length + 1 // + 3 bc ("",). The subtext will have the clean value 'Old Dominion Freight Line, Inc.'
                    
                    if (linesToRead > 0 && linePos == linesToRead) return result
                    currentLine = []
                    result[++linePos] = currentLine
                }
                continue
            }
            // Checking if it is end of line
            let posBreak = subtext.indexOf('\n')
            if (posBreak > -1) {
                subtext = subtext.substringBefore('\n')
                if (subtext.endsWith('\r')) subtext = subtext.substring(0, subtext.length -1)
                currentLine.push(subtext)

                if (linesToRead > 0 && linePos == linesToRead) return result

                currentLine = []
                result[++linePos] = currentLine
                pos += posBreak + 1
                continue
            }
        }
    }
    return result
}

function isAllValue(subtext) {
    if (subtext.includes(',')) return false
    if (subtext.includes('"') && subtext.includes('\n')) return false
    if (subtext.includes('\n')) return false
    return true
}

function csvArrayToJson(lines) {
    const headers = lines[0]
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentline = lines[i]
        obj["_id"] = i

        for (let j = 0; j < headers.length; j++) {
            if (j < currentline.length) {
                let value = currentline[j].trim()
                if (value.includes('\n')) {
                    value = value.split('\n')
                }
                obj[headers[j].trim()] = value;
            }
        }
        result.push(obj);
    }
    return result;
}

function csvToJson(lines, separator) {
    const headers = lines[0].split(separator);
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentline = lines[i].split(separator);
        obj["_id"] = i

        for (let j = 0; j < headers.length; j++) {
            if (j < currentline.length) {
                obj[headers[j].trim()] = currentline[j].trim();
            }
        }
        result.push(obj);
    }
    return result;
}