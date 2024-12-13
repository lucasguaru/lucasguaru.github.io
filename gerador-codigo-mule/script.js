function toWordCase(word) {
    return word.substring(0, 1).toUpperCase() + word.substr(1).toLowerCase()
}
function toCamelCase(word) {
    return word.substring(0, 1).toLowerCase() + word.substr(1)
}
function prepareNames(flowName) {
    const flowLower = flowName.toLowerCase()
    const flowNoSpaces =  flowLower.split(" ").map(toWordCase).join("")
    return {
        name: flowName, // Purchase Order
        kebabCase: flowLower.replaceAll(" ", "-"), // purchase-order
        camelCase: toCamelCase(flowNoSpaces), // purchaseOrder
        wordCase: flowNoSpaces, // PurchaseOrder
        url: flowLower.replaceAll(" ", "_"), // purchase_order
    }
}

window.addEventListener('load', () => {
    const values = localStorage.getItem('generatorValues');
    
    // Set the values back into the fields, if they exist
    if (values) {
        const jsonValues = JSON.parse(values)
        document.getElementById("appName").value = jsonValues.appName;
        document.getElementById("flowName").value = jsonValues.flowName;
    }

    generateCode()
})

function saveToLocalStorage(values) {
    localStorage.setItem('generatorValues', JSON.stringify(values));
}

document.getElementById("generateBtn").addEventListener("click", generateCode);

function generateCode() {
    const appName = document.getElementById("appName").value.trim();
    const flowName = document.getElementById("flowName").value.trim();
    if (!appName || !flowName) {
        alert("Please enter both application name and flow name.");
        return
    }
    saveToLocalStorage({ appName, flowName })

    const app = prepareNames(appName);
    const flow = prepareNames(flowName);

    document.getElementById("file1Name").innerText = `${app.kebabCase}-prc-api`;
    document.getElementById("file2Name").innerText = `${app.kebabCase}-${flow.kebabCase}`;
    document.getElementById("file3Name").innerText = `${app.kebabCase}-prc-api`;
    document.getElementById("file4Name").innerText = `${app.kebabCase}-prc-api`;

    document.getElementById("file2DWLFilterName").innerText = `dwl/msgFilter${flow.wordCase}.dwl`;
    document.getElementById("file2DWLFileContentName").innerText = `dwl/msgDvr${flow.wordCase}SetPayload.dwl`;

    // Example of generated code using template literals
    document.getElementById("code1").value = getCodeMainPrcApi(app, flow);
    document.getElementById("code2").value = getCodeFlowNewFile(app, flow);
    document.getElementById("code3").value = getCodeMunit(app, flow);
    document.getElementById("code4").value = getCodeYaml(app, flow);
    document.getElementById("code2DWLFileContent").value = getCodeDwlFileContent(app, flow);
    document.getElementById("code2DWLFilter").value = getCodeDwlFilter(app, flow);
    document.getElementById("codeSection").style.display = "block";
}

function copyToClipboardGen(codeId, copiedId) {
    const codeElement = document.getElementById(codeId);
    codeElement.select();
    codeElement.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(codeElement.value).then(() => {
        document.getElementById(copiedId).innerText = "copied...";
    });
}

const uuidCache = {}
function uuid(cacheName) {
    // if (cacheName && uuidCache[cacheName]) return uuidCache[cacheName]
    const genUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });

    if (cacheName) uuidCache[cacheName] = genUuid
    return genUuid
}

function getUuid(cacheName) {
    if (cacheName && uuidCache[cacheName]) return uuidCache[cacheName]
    throw new Error("UUID not found for name " + cacheName)
}