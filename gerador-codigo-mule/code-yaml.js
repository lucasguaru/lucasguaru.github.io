function getCodeYaml(app, flow) {
    return `batchStatusFlow:
  allowedOperationToUpdateStatus:
    - "${flow.url}"

#http listener properties
listener:
  listenerPaths:
    ${flow.camelCase}: "${flow.url}"

#dvr
dvr:
  ${flow.camelCase}GetFormatsReportId: "<get the id from url>"
`
}