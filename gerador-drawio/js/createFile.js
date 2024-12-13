let drawIOIdStart = 5;
let fileYStart = 680;
let fileFieldYIncrement = 20;
let fileHeaderYIncrement = 40;
function restartFileVariables() {
    drawIOIdStart = 5;
    fileYStart = 680;
}
function createFile(fileName, fields, connectionMap, ignoreUnrelatedFields) {
    let tagName = fileName.replaceAll(" ", "")
    
    const createMxCell = (item, examples) => {
        let isObject = typeof item == 'object'
        const fieldScaped = scapeValue(isObject ? item.name : item)
        let id = isObject ? item.id : drawIOIdStart++
        let fieldNameLower = fileName.toLowerCase()

        let style = 'style="rounded=0;whiteSpace=wrap;html=1;fontSize=10;"'
        if (connectionMap.sourceHasThisField(fieldNameLower, item)) {
        // if (isObject && connectionsData.find(conn => conn.from.id == item.id)) {
            style = 'style="rounded=0;whiteSpace=wrap;html=1;fontSize=10;fillColor=#cce5ff;strokeColor=#36393d;opacity=50;"'
            connectionMap.addSourceMappingField(fieldNameLower, item, id)
        } else if (ignoreUnrelatedFields) {
            // skip
            return ""
        }

        let y = fileYStart
        fileYStart += fileFieldYIncrement
        return `
        <UserObject label="${fieldScaped}" tags="${tagName}" tooltip="${examples}" id="${id}">
            <mxCell ${style} vertex="1" parent="1">
                <mxGeometry x="100" y="${y}" width="200" height="20" as="geometry"/>
            </mxCell>
        </UserObject>`;
    };

    let id = drawIOIdStart++

    let headerResult = `
        <UserObject label="${fileName}" link="data:action/json,{&quot;actions&quot;:[{&quot;toggle&quot;:{&quot;tags&quot;:[&quot;${tagName}&quot;]}}]}" id="${id}">
            <mxCell style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1" >
                <mxGeometry x="90" y="${fileYStart}" width="220" height="40" as="geometry"/>
            </mxCell>
        </UserObject>`
    
    fileYStart += fileHeaderYIncrement
    
    let fieldsResult = "";
    const avoidFields = ["_id"]

    // Sort to have the fields that are mapped as first items
    fields.fieldNames = fields.fieldNames.sort((fieldA, fieldB) => {
        if (connectionMap.sourceHasThisField(fileName.toLowerCase(), fieldA)) {
            return -1
        }
        if (connectionMap.sourceHasThisField(fileName.toLowerCase(), fieldB)) {
            return 1
        }
        return 0
    })
    fields.fieldNames.forEach((fieldName) => {
        if (!avoidFields.includes(fieldName)) {
            fieldsResult += createMxCell(fieldName, fields.examples[fieldName]);
        }
    });

    let fullResult = headerResult + fieldsResult

    // Give some space to the next header
    fileYStart += fileHeaderYIncrement
    
    // console.log(`Create File ${fileName}`, fullResult)
    return fullResult
}

