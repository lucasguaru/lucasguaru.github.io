function compareExcelWithApi(apiName) {
    //Check if the fields on excel are on the selected api
    function getFieldOnSelectedApi(selectedApiList, field) {
        function getExcelField(selectedApiList, field) {
            return selectedApiList.find(shipItem => shipItem.fieldName == field)
        }
        // log(field, 'field')
        if (field.includes('.')) {
            let parent = field.substring(0, field.indexOf('.'))
            let shipField = getExcelField(selectedApiList, parent)
            if (!shipField) {
                // console.log('Shipment not found!: ' + parent)
                return
            }
            if (shipField.child) {
                let childField = field.substring(field.indexOf('.') + 1)
                return getFieldOnSelectedApi(shipField.child, childField)
            }
            return field
        } else {
            return getExcelField(selectedApiList, field)
        }
    }
    
    let selectedApi = allApis.find(api => api.entity == apiName).fields
    let selectedExcelApi = excelApiFields[apiName]
    selectedExcelApi.forEach(excelItem => {
        let newExcelItem = excelItem.substring(excelItem.indexOf('.') + 1)
        // log(excelItem, 'newExcelItem')
        let r = getFieldOnSelectedApi(selectedApi, newExcelItem)
        if (!r) {
            console.log('excelItem not Found: ' + excelItem)
        }
    })
    console.log(`*** End of compareExcelWithApi`)
}

function compareApiWithExcel(apiName) {
    let selectedExcelApi = excelApiFields[apiName]
    let selectedApi = allApis.find(api => api.entity == apiName).fields
    let resultNotFound = ''

    function validateApiFieldNameOnExcel(parent, childList) {
        childList.forEach(fieldItem => {
            let apiFieldName = parent + fieldItem.fieldName
            if (fieldItem.child && fieldItem.child != 'string') {
                // console.log('apiFieldName', apiFieldName)
                validateApiFieldNameOnExcel(apiFieldName + '.', fieldItem.child)
            } else {
                if (!selectedExcelApi.includes(apiFieldName)) {
                    resultNotFound += apiFieldName + '\n'
                    // console.log(apiFieldName)
                    // console.log(`Api field [${apiFieldName}] not found on Excel`)
                }
            }
        })
    }
    
    validateApiFieldNameOnExcel(apiName + ".", selectedApi)
    console.log(resultNotFound)
    copy(resultNotFound) // only works on chrome devtools
    console.log(`*** End of compareApiWithExcel`)
    
}

let apiName = 'Tender'
compareExcelWithApi(apiName)
compareApiWithExcel(apiName)