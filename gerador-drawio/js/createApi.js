let yStart = 180;
let xStart = 670;
let yIncrement = 20;
let yApiIncrement = 40;
let xIncrement = 10;

const styleIsMapped = 'style="rounded=0;whiteSpace=wrap;html=1;fontSize=10;fillColor=#cce5ff;strokeColor=#36393d;opacity=50;"'
const styleRequired = 'style="rounded=0;whiteSpace=wrap;html=1;fontSize=10;fillColor=#f8cecc;strokeColor=#b85450;"'
const styleHasChild = 'style="rounded=0;whiteSpace=wrap;html=1;fontSize=10;fillColor=#e1d5e7;strokeColor=#9673a6;"'
const styleId = 'style="rounded=0;whiteSpace=wrap;html=1;fontSize=10;fillColor=#f5f5f5;fontColor=#333333;strokeColor=#666666;"'

function createField(apiName, items, x, parentName = "", connectionMap, ignoreUnrelatedFields) {
    
    const createMxCell = (id, field) => {
        const fieldScaped = scapeValue(parentName + field.fieldName)
        const descScaped = scapeValue(field.description)
        let style = 'style="rounded=0;whiteSpace=wrap;html=1;fontSize=10;"'

        if (field.child) {
            style = styleHasChild
        } else if (field.required) {
            if (connectionMap.destinationHasThisField(apiName, parentName, field, id, true)) {
                // connectionMap.addApiMappingField(apiName, parentName, field, id)
                style = styleIsMapped
            } else {
                style = styleRequired
            }
            connectionMap.addSourceFromDestinationMappingField(apiFromToFile[apiName], field.fieldName, id)
        } else if (field.fieldName == 'id') {
            connectionMap.addSourceMappingField(apiFromToFile[apiName], field.fieldName, id)
            // connectionMap.addDestinationMappingField(apiFromToFile[apiName], parentName, field, id)
            style = styleId
        } else if (ignoreUnrelatedFields) {
            if (connectionMap.destinationHasThisField(apiName, parentName, field, id, true)) {
                // connectionMap.addApiMappingField(apiName, parentName, field, id)
                style = styleIsMapped
            } else {
                return ""
            }
        } else {
            if (connectionMap.destinationHasThisField(apiName, parentName, field, id, true)) {
                // connectionMap.addApiMappingField(apiName, parentName, field, id)
                style = styleIsMapped
            }
        }

        // if (connectionsData.find(conn => conn.to.id == id)) {
        //     style = 'style="rounded=0;whiteSpace=wrap;html=1;fontSize=10;fillColor=#e1d5e7;strokeColor=#9673a6;opacity=70;"'
        // }
        let result = `
        <UserObject label="${fieldScaped}" tooltip="${descScaped}" tags="Api${apiName}" id="${id}">
            <mxCell ${style} vertex="1" parent="1">
                <mxGeometry x="${x}" y="${yStart}" width="180" height="20" as="geometry"/>
            </mxCell>
        </UserObject>`
        yStart += (yIncrement)
        return result
    };
    
    let result = ""
    items.forEach((field) => {
        const id = field.id;
        result += createMxCell(id, field);
        if (field.child && Array.isArray(field.child)) {
            result += createField(apiName, field.child, x + xIncrement, field.fieldName + ".", connectionMap, ignoreUnrelatedFields);
        }
    });
    return result
}

const entityCoord = {
    "PurchaseOrder": {"x": "1130", "y": "730"},
    "Week": {"x": "490", "y": "290"},
    "PurchaseOrderShipperOrder": {"x": "1170", "y": "90"},
    "Carrier": {"x": "490", "y": "190"},
    "Lane": {"x": "490", "y": "90"},
    "FacilitySource": {"x": "770", "y": "450"},
    "FacilityDestination": {"x": "770", "y": "650"},
    "Consignee": {"x": "770", "y": "210"},
    "Shipment": {"x": "1450", "y": "1130"},
    "Tender": {"x": "930", "y": "2210" }
  }

const apiOrder = {
    "PurchaseOrder": 1,
    "Week": 2,
    "PurchaseOrderShipperOrder": 3,
    "Carrier": 3,
    "Lane": 4,
    "FacilitySource": 5,
    "FacilityDestination": 5,
    "Consignee": 6,
    "Shipment": 7,
    "Tender": 8,
}

// Create Api
function createAllApis(items, connectionMap, ignoreUnrelatedFields) {
    yStart = 180;
    yIncrement = 20;
    yApiIncrement = 40;
    xIncrement = 10;
    let tags = ""

    // Function that creates Header concatenated with fields
    const createMxGraphModel = (id, apiName, fieldResult, x, y) => {
        apiName = scapeValue(apiName).replace("PostRequestBody", "")
        tags += `Api${apiName} \n`

        return `
        <UserObject label="${apiName}" link="data:action/json,{&quot;actions&quot;:[{&quot;toggle&quot;:{&quot;tags&quot;:[&quot;Api${apiName}&quot;]}}]}" id="${id}">
            <mxCell style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
                <mxGeometry x="${x}" y="${y}" width="200" height="40" as="geometry"/>
            </mxCell>
        </UserObject>${fieldResult}`
    };

    // Adding sort order to have the connection lines behind the other objects
    let sortedItems = items.map(item => {
        return {...item, order: apiOrder[item.entity]}
    }).sort( (a, b) => a.order - b.order)

    // Adding map for internal api ids like consignee id, week id
    // to purchase_orders
    connectionMap.addFieldMap({sourceName: 'consignee', sourceField: 'id', destName: 'purchase_orders', destField: 'consignee_id'})
    // connectionMap.addFieldMap({[FILE_NAME]: 'consignee', [FILE_FIELD]: 'id', [API_NAME]: 'purchase_orders', [API_FIELD]: 'consignee_id'})
    connectionMap.addFieldMap({sourceName: 'week', sourceField: 'id', destName: 'purchase_orders', destField: 'week_id'})
    // to shipments
    connectionMap.addFieldMap({sourceName: 'week', sourceField: 'id', destName: 'shipments', destField: 'week_id'})
    connectionMap.addFieldMap({sourceName: 'carrier', sourceField: 'id', destName: 'shipments', destField: 'carrier_id'})
    connectionMap.addFieldMap({sourceName: 'facilities_start', sourceField: 'id', destName: 'shipments', destField: 'legs.start.facility_id'})
    connectionMap.addFieldMap({sourceName: 'purchase_orders', sourceField: 'id', destName: 'shipments', destField: 'legs.start.tasks.purchase_order_id'})
    connectionMap.addFieldMap({sourceName: 'facilities_end', sourceField: 'id', destName: 'shipments', destField: 'legs.end.facility_id'})
    connectionMap.addFieldMap({sourceName: 'consignee', sourceField: 'id', destName: 'shipments', destField: 'legs.end.business_entity_id'})
    connectionMap.addFieldMap({sourceName: 'purchase_orders', sourceField: 'id', destName: 'shipments', destField: 'legs.end.tasks.purchase_order_id'})
    // to tenders
    connectionMap.addFieldMap({sourceName: 'carrier', sourceField: 'id', destName: 'tenders', destField: 'carrier_id'})
    connectionMap.addFieldMap({sourceName: 'week', sourceField: 'id', destName: 'tenders', destField: 'week_id'})
    connectionMap.addFieldMap({sourceName: 'lane', sourceField: 'id', destName: 'tenders', destField: 'lane_id'})

    // For each api in the list
    let apiResult = ""
    sortedItems.forEach(item => {
        let apiName = item.entity
        let apiCoord = entityCoord[apiName]

        // Create the fields first
        yStart = parseInt(apiCoord.y) + yApiIncrement
        let fieldResult = createField(apiName, item.fields, parseInt(apiCoord.x) + 10, "", connectionMap, ignoreUnrelatedFields)

        // Create the Header sending the fields string assembled
        apiResult += createMxGraphModel(item.id, apiName, fieldResult, apiCoord.x, apiCoord.y)

        // Create the connections
        // let filteredConnections = connectionsData.filter(connection => connection.to.parent.startsWith(apiName))
        // apiResult += createConnections(filteredConnections)

        connectionMap.getItemsWithConnection(apiName).forEach(line => {
            line.sourceConnectionFields.forEach(fileItem => {
                if (line.destinationConnectionFields[0]) {
                    let connectionResult = createConnections({from: fileItem.mappingFieldId, to: line.destinationConnectionFields[0].mappingFieldId})
                    apiResult += connectionResult
                }
            })
        })


    })
    return apiResult;
}

