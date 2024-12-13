const apiFromToFile = {
    "PurchaseOrder": "purchase_orders",
    "Week": "week",
    "PurchaseOrderShipperOrder": "purchase_order_shipper_order",
    "Lane": "lane",
    "FacilitySource": "facilities_start",
    "FacilityDestination": "facilities_end",
    "Consignee": "consignees",
    "Shipment": "shipments",
    "Tender": "tenders",
    "Carrier": "carrier",
}

const FILE_NAME = 'FileName'
const FILE_FIELD = 'Customer System Field Name'
const API_NAME = 'ISO API Object Name'
const API_FIELD = 'ISO API Field Name'

function Mapping(mapFile) {
    if (!mapFile) {
        this.mapFields = []
    } else {
        this.rawMapFile = mapFile
        this.mapFields = mapFile.fileContent
        .map(line => {
            return {
                "_id": line["_id"],
                [FILE_NAME]: line[FILE_NAME] ? line[FILE_NAME].toLowerCase() : '',
                [FILE_FIELD]: line[FILE_FIELD],
                [API_NAME]: line[API_NAME],
                [API_FIELD]: line[API_FIELD],
                sourceConnectionFields: [],
                destinationConnectionFields: []
            }
        })
        //remove empty data
        this.mapFields = this.mapFields.filter(line => !!line[FILE_NAME] && !!line[FILE_FIELD])
    }
    this.fileFieldMapped = []
    this.apiFieldMapped = []

    this.addFieldMap = function(map) {
        let newMap = {
            [FILE_NAME]: map.sourceName,
            [FILE_FIELD]: map.sourceField,
            [API_NAME]: map.destName,
            [API_FIELD]: map.destField,
            sourceConnectionFields: [],
            destinationConnectionFields: []
        }
        this.mapFields.push(newMap)
    }

    this.sourceHasThisField = (fileName, fieldName, mappingFieldId, isAddField) => {
        let fileItem = this.mapFields.find(line => fileName.startsWith(line[FILE_NAME]) && line[FILE_FIELD] == fieldName)
        if (fileItem && isAddField) {
            if (!fileItem.sourceConnectionFields.some(item => item.mappingFieldId == mappingFieldId)) {
                fileItem.sourceConnectionFields.push({ fileName, fieldName, mappingFieldId })
            }
        }
        return fileItem;
    }

    this.addSourceMappingField = (fileName, fieldName, mappingFieldId) => {
        let fileItem = this.mapFields.find(line => fileName.startsWith(line[FILE_NAME]) && line[FILE_FIELD] == fieldName)
        if (!fileItem) return
        fileItem.sourceConnectionFields.push({ fileName, fieldName, mappingFieldId })
        fileItem.hasConnection = true
    }

    this.addSourceFromDestinationMappingField = (fileName, fieldName, mappingFieldId) => {
        let fileItem = this.mapFields.find(line => fileName.startsWith(line[FILE_NAME]) && line[FILE_FIELD] == fieldName)
        if (!fileItem) return
        fileItem.sourceConnectionFields.push({ fileName, fieldName, mappingFieldId })
        fileItem.hasConnection = true
    }

    this.destinationHasThisField = (apiName, parentName, apiField, mappingFieldId, isAddField) => {
        let fieldName = parentName ? (parentName + '.' + apiField.fieldName) : apiField.fieldName
        let apiItem = this.mapFields.find(line => line[API_NAME] == apiFromToFile[apiName] && line[API_FIELD] == fieldName)
        if (apiItem && isAddField) {
            if (!apiItem.destinationConnectionFields.some(item => item.mappingFieldId == mappingFieldId)) {
                apiItem.destinationConnectionFields.push({ apiName, apiField, mappingFieldId })
            }
        }
        return apiItem
    }

    this.addDestinationMappingField = (apiName, parentName, apiField, mappingFieldId) => {
        let fieldName = parentName ? (parentName + '.' + fieldName) : apiField.fieldName
        let apiItem = this.mapFields.find(line => line[API_NAME] == apiFromToFile[apiName] && line[API_FIELD] == fieldName)
        if (!apiItem) return
        apiItem.destinationConnectionFields.push({ apiName, apiField, mappingFieldId })
        apiItem.hasConnection = true
    }

    this.getItemsWithConnection = (apiName) => {
        return this.mapFields.filter(line => line[API_NAME] == apiFromToFile[apiName] && line.hasConnection)
    }

}