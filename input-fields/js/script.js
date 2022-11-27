function $(id) {
    return document.getElementById(id);
}
let txtInput = $("txtInput");
let inputFieldsArea = $("inputFieldsArea");
let inputFieldsAreaAddFields = $("inputFieldsAreaAddFields");
let txtOutput = $("txtOutput");
const regex = /\${(\w*)(:(.*))?}/g;
let currentFields = [];

function gerarCampos() {
    let newfields = [];
    let matches = txtInput.value.matchAll(regex);
    for (const match of matches) {
        // console.log(match);
        !newfields.includes(match[1]) && newfields.push([match[1], match[3] || ""]);
    }
    //Adicionando novos campos
    newfields.forEach(field => {
        [fieldName, defaultValue] = field;
        if (!currentFields.includes(fieldName)) {
            currentFields.push(fieldName);
            addInputField(fieldName, defaultValue);
        }
    })

    //Removendo campos não usados
    let tempCurrentFields = newfields.map(field => field[0]);
    currentFields.forEach(currfield => {
        !tempCurrentFields.includes(currfield) && removeInputField(currfield);
    })
    currentFields = tempCurrentFields;
}

function gerarResultado() {
    let result = txtInput.value;
    let matches = result.matchAll(regex);
    for (const match of matches) {
        result = result.replaceAll(match[0], $("input" + match[1]).value);
    }
    txtOutput.value = result;
}

function addInputField(fieldName, defaultValue) {
    var div = document.createElement("div");
    div.id = "divInput" + fieldName;
    div.className = "inputField"
    var label = document.createElement("label");
    label.innerHTML = fieldName + ": "
    var input = document.createElement("input");
    input.type = "text";
    input.id = "input" + fieldName;
    input.value = defaultValue;
    div.appendChild(label);
    div.appendChild(input);
    inputFieldsAreaAddFields.appendChild(div);
    inputFieldsArea.style = "display:block"
}
function removeInputField(fieldName) {
    var div = $("divInput" + fieldName);
    inputFieldsAreaAddFields.removeChild(div);
}