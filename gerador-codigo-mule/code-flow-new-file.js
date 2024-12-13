function getCodeFlowNewFile(app, flow) {
    return `<?xml version="1.0" encoding="UTF-8"?>

<mule xmlns:spring="http://www.mulesoft.org/schema/mule/spring" xmlns:http="http://www.mulesoft.org/schema/mule/http"
	xmlns:ee="http://www.mulesoft.org/schema/mule/ee/core"
	xmlns:os="http://www.mulesoft.org/schema/mule/os" xmlns:s3="http://www.mulesoft.org/schema/mule/s3" xmlns:json-logger="http://www.mulesoft.org/schema/mule/json-logger" xmlns:batch="http://www.mulesoft.org/schema/mule/batch" xmlns="http://www.mulesoft.org/schema/mule/core" xmlns:doc="http://www.mulesoft.org/schema/mule/documentation" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.mulesoft.org/schema/mule/core http://www.mulesoft.org/schema/mule/core/current/mule.xsd
http://www.mulesoft.org/schema/mule/batch http://www.mulesoft.org/schema/mule/batch/current/mule-batch.xsd
http://www.mulesoft.org/schema/mule/json-logger http://www.mulesoft.org/schema/mule/json-logger/current/mule-json-logger.xsd
http://www.mulesoft.org/schema/mule/s3 http://www.mulesoft.org/schema/mule/s3/current/mule-s3.xsd
http://www.mulesoft.org/schema/mule/os http://www.mulesoft.org/schema/mule/os/current/mule-os.xsd
http://www.mulesoft.org/schema/mule/ee/core http://www.mulesoft.org/schema/mule/ee/core/current/mule-ee.xsd
http://www.mulesoft.org/schema/mule/http http://www.mulesoft.org/schema/mule/http/current/mule-http.xsd
http://www.mulesoft.org/schema/mule/spring http://www.mulesoft.org/schema/mule/spring/current/mule-spring.xsd">
	<sub-flow name="${flow.kebabCase}-first-read-file-flow" doc:id="${uuid()}">
		<ee:transform doc:name="DW Set Variables" doc:id="${uuid()}">
			<ee:message />
			<ee:variables>
				<ee:set-variable variableName="fileName"><![CDATA[%dw 2.0
output application/json
---
payload.report_path]]></ee:set-variable>
				<ee:set-variable variableName="reportId"><![CDATA[%dw 2.0
output application/json
---
payload.report_id]]></ee:set-variable>
				<ee:set-variable variableName="operationType"><![CDATA[%dw 2.0
output application/json
---
attributes.headers.operation_type]]></ee:set-variable>
				<ee:set-variable variableName="shipperId"><![CDATA[%dw 2.0
output application/json
---
payload.shipper_id]]></ee:set-variable>
				<ee:set-variable variableName="apiBaseUrl"><![CDATA[%dw 2.0
output application/json
---
payload.api_base_url]]></ee:set-variable>
				<ee:set-variable variableName="reportFormat"><![CDATA[%dw 2.0
output application/json
---
payload.report_format]]></ee:set-variable>
			</ee:variables>
		</ee:transform>
		<choice doc:name="If OperationType is equals to Shipper Ingestion Main" doc:id="${uuid()}">
			<when expression='#[vars.operationType == ("shipper_ingestion_" ++ vars.reportFormat)]'>
				<s3:get-object doc:name="Get CSV File for DV&amp;R" doc:id="${uuid('Get CSV File for DV&amp;R')}" config-ref="Amazon_S3_Configuration" bucketName="\${amazonS3.bucketName}" key='#[vars.fileName default ""]' outputMimeType="application/csv; header=true" />
			</when>
			<otherwise>
				<ee:transform doc:name="DW Set Payload" doc:id="${uuid()}">
					<ee:message>
						<ee:set-payload resource="dwl/msgRetryPayload.dwl" />
					</ee:message>
				</ee:transform>
			</otherwise>
		</choice>
		<json-logger:logger doc:name="Log Integration Start" doc:id="${uuid()}" config-ref="JSON_Logger_Config" message='#["${app.kebabCase}_purchase_orders_integration_started : " ++ correlationId]' tracePoint="FLOW" category="com.iso.logger">
			<json-logger:content><![CDATA[#[import modules::JSONLoggerModule output application/json ---
{
	"shipper_id" : vars.shipperId default "",
	"correlation_id" : correlationId,
	"report_id" : vars.reportId,
	"report_format" : vars.reportFormat,
	"file_name" : vars.fileName,
	"content_length" : attributes.contentLength,
	"operation" : vars.operationType,
	"api_base_url" : vars.apiBaseUrl
}]]]></json-logger:content>
		</json-logger:logger>
		<set-variable value="#[Mule::p('dvr.${flow.camelCase}GetFormatsReportId')]" doc:name="reportFormatId" doc:id="${uuid()}" variableName="reportFormatId"/>
		<ee:transform doc:name="File Content" doc:id="${uuid()}">
			<ee:message>
				<ee:set-payload resource="dwl/msgDvr${flow.wordCase}SetPayload.dwl" />
			</ee:message>
			<ee:variables>
				<ee:set-variable variableName="payloadSize"><![CDATA[%dw 2.0
output application/json
---
sizeOf(payload)]]></ee:set-variable>
				<ee:set-variable variableName="varRetryPayload"><![CDATA[%dw 2.0
output application/csv
---
if(vars.operationType == ("shipper_ingestion_retry_" ++ vars.reportFormat))
(
	payload
)
else
(
	[]
)]]></ee:set-variable>
			</ee:variables>
		</ee:transform>
		<flow-ref doc:name="Start DV&amp;R ${flow.name} Processing" doc:id="${uuid()}" name="dvr-${flow.kebabCase}-processing-sub-flow" />
	</sub-flow>
	<sub-flow name="dvr-${flow.kebabCase}-processing-sub-flow" doc:id="${uuid()}" >
		<try doc:name="Try DVR Get" doc:id="${uuid()}" >
			<flow-ref doc:name="Get DV&amp;R Formats and Files" doc:id="${uuid()}" name="dvr-get-formats-and-files-calls-sub-flow" />
			<error-handler >
				<on-error-continue enableNotifications="true" logException="true" doc:name="On Error Continue DVR Get" doc:id="${uuid()}" >
					<flow-ref doc:name="Log Errors Get DV&amp;R Formats and Files" doc:id="${uuid()}" name="log-dvr-get-formats-and-files-error-sub-flow" />
				</on-error-continue>
			</error-handler>
		</try>
		<batch:job jobName="${flow.kebabCase}-dvr-prc-apiBatch_Job" doc:id="${uuid()}" maxFailedRecords="\${batchJob.dvr${flow.wordCase}.maxFailedRecords}" jobInstanceId='#[correlationId ++ "_" ++ uuid()]' blockSize="\${batchJob.dvr${flow.wordCase}.batchBlockSize}" maxConcurrency="\${batchJob.dvr${flow.wordCase}.maxConcurrency}" >
			<batch:history >
				<batch:expiration maxAge="1" ageUnit="DAYS" />
			</batch:history>
			<batch:process-records >
				<batch:step name="Batch_Dvr_Step" doc:id="${uuid()}" acceptExpression="#[not isEmpty(vars.filesResponse)]" >
					<batch:aggregator doc:name="${flow.name} DVR Batch Aggregator" doc:id="${uuid()}" size="\${batchJob.dvr${flow.wordCase}.batchAggregatorSize}" preserveMimeTypes="true" >
						<try doc:name="Try DVR Batch" doc:id="${uuid()}" >
							<flow-ref doc:name="Create DV&amp;R Records (Patch)" doc:id="${uuid()}" name="dvr-patch-rows-sub-flow" />
							<remove-variable doc:name="Remove patchRowsResponse" doc:id="${uuid()}" variableName="patchRowsResponse" />
							<error-handler >
								<on-error-continue enableNotifications="true" logException="true" doc:name="On Error Continue DVR Batch" doc:id="${uuid()}" >
									<flow-ref doc:name="Log Errors Create DV&amp;R Records (Patch)" doc:id="${uuid()}" name="log-dvr-patch-row-error-sub-flow" />
								</on-error-continue>
							</error-handler>
						</try>
					</batch:aggregator>
				</batch:step>
			</batch:process-records>
			<batch:on-complete >
				<flow-ref doc:name="${flow.name} DV&amp;R On Complete" doc:id="${uuid()}" name="${flow.kebabCase}-dvr-batch-on-complete-sub-flow" />
			</batch:on-complete>
		</batch:job>
	</sub-flow>
	<sub-flow name="${flow.kebabCase}-dvr-batch-on-complete-sub-flow" doc:id="${uuid()}" >
		<json-logger:logger doc:name="Log Exit DVR" doc:id="${uuid()}" config-ref="JSON_Logger_Config" message='#[output text/plain&#10;---&#10;"dvr_processing_ended_for_flow : " ++ (vars.reportFormat default "") ++ " : " ++ correlationId]' tracePoint="END" category="com.iso.logger" >
			<json-logger:content ><![CDATA[#[import modules::JSONLoggerModule output application/json ---
{
    "shipper_id" : vars.shipperId default "",
	"correlation_id" : correlationId,
	"report_id" : vars.reportId,
	"report_format" : vars.reportFormat,
	"operation" : vars.operationType,
	"file_name" : vars.fileName,
	"total_records" : vars.payloadSize,
	"ended_date_time" : now(),
	"time_taken_to_process" :  now() - vars.dvrStartedDateTime
}]]]></json-logger:content>
		</json-logger:logger>
		<flow-ref doc:name="Remove DV&amp;R vars" doc:id="${uuid()}" name="dvr-remove-vars-sub-flow" />
		<choice doc:name="If OperationType is equals to Shipper Ingestion Main" doc:id="${uuid()}" >
			<when expression='#[vars.operationType == ("shipper_ingestion_" ++ vars.reportFormat)]' >
				<s3:get-object doc:name="Get CSV File for Ingestion" doc:id="${uuid('Get CSV File for Ingestion')}" bucketName="\${amazonS3.bucketName}" key='#[vars.fileName default ""]' outputMimeType="application/csv; header=true" config-ref="Amazon_S3_Configuration"/>
			</when>
		</choice>
		<os:store doc:name="Store Batch Data" doc:id="${uuid('Store Batch Data')}" key='#["batchData_" ++ (vars.reportId default "")]' objectStore="Batch_status_object_store" >
			<os:value ><![CDATA[#[output application/json
---
{
	"shipper_id" : vars.shipperId default "",
	"report_id" : vars.reportId default "",
	"api_base_url" : vars.apiBaseUrl default "",
	"total_records" : vars.payloadSize,
	"correlation_id": correlationId,
	"report_format" : vars.reportFormat,
	"operationType": vars.operationType
}]]]></os:value>
		</os:store>
		<ee:transform doc:name="DW Filter Payload" doc:id="${uuid()}" >
			<ee:message >
				<ee:set-payload resource="dwl/msgFilter${flow.wordCase}.dwl" />
			</ee:message>
			<ee:variables />
		</ee:transform>
		<os:store doc:name="Store Eligible Records Count" doc:id="${uuid('Store Eligible Records Count')}" key='#["eligibleRecords_" ++ (vars.reportId default "")]' objectStore="Batch_status_object_store" >
			<os:value ><![CDATA[#[%dw 2.0
output application/json
---
sizeOf(payload)]]]></os:value>
		</os:store>
		<remove-variable doc:name="Remove Variable varRetryPayload" doc:id="${uuid()}" variableName="varRetryPayload" />
		<flow-ref doc:name="Start ${flow.name} Batch Processing" doc:id="${uuid()}" name="${flow.kebabCase}-batch-processing-sub-flow" />
	</sub-flow>
	<sub-flow name="${flow.kebabCase}-batch-processing-sub-flow" doc:id="${uuid()}" >
		<set-variable value="#[now()]" doc:name="batchStartedDateTime" doc:id="${uuid()}" variableName="batchStartedDateTime" />
		<json-logger:logger doc:name="Log Batch Start" doc:id="${uuid()}" config-ref="JSON_Logger_Config" message='#["started_the_batch_processing_of_the_records : " ++ correlationId]' category="com.iso.logger" >
			<json-logger:content ><![CDATA[#[import modules::JSONLoggerModule output application/json ---
{
	"shipper_id" : vars.shipperId default "",
	"correlation_id" : correlationId,
	"report_id" : vars.reportId,
	"report_format" : vars.reportFormat,
	"operation" : vars.operationType,
	"total_records" : sizeOf(payload),
	"started_date_time" : vars.batchStartedDateTime,
}]]]></json-logger:content>
		</json-logger:logger>
		<batch:job jobName="${flow.kebabCase}Batch_Job" doc:id="${uuid()}" maxFailedRecords="\${batchJob.${flow.kebabCase}.maxFailedRecords}" jobInstanceId='#[correlationId ++ "_" ++ uuid()]' blockSize="\${batchJob.${flow.kebabCase}.batchBlockSize}" maxConcurrency="\${batchJob.${flow.kebabCase}.maxConcurrency}" >
			<batch:process-records >
				<batch:step name="Batch_Step" doc:id="${uuid()}" >
					<try doc:name="Try ${flow.name} Batch" doc:id="${uuid()}" >
						<flow-ref doc:name="${flow.name} Batch Step Processing" doc:id="${uuid()}" name="${flow.kebabCase}-batch-step-processing-sub-flow"/>
						<error-handler >
							<on-error-propagate enableNotifications="true" logException="true" doc:name="On Error Propagate ${flow.name} Batch" doc:id="${uuid()}" >
								<flow-ref doc:name="Publish Error to Queue" doc:id="${uuid()}" name="publish-error-sub-flow" />
							</on-error-propagate>
						</error-handler>
					</try>
					<batch:aggregator doc:name="${flow.name} Batch Aggregator" doc:id="${uuid()}" size="\${batchJob.${flow.kebabCase}.batchBlockSize}" >
						<flow-ref doc:name="Update Processed Records Count" doc:id="${uuid()}" name="batch-aggregator-sub-flow" />
					</batch:aggregator>
				</batch:step>
			</batch:process-records>
			<batch:on-complete >
				<flow-ref doc:name="Update Record Count and Delete Files" doc:id="${uuid()}" name="batch-complete-sub-flow" />
			</batch:on-complete>
		</batch:job>
	</sub-flow>
	<sub-flow name="${flow.kebabCase}-batch-step-processing-sub-flow" doc:id="${uuid()}" >
		<json-logger:logger doc:name="Log Backend Request In Debug Mode" doc:id="${uuid()}" config-ref="JSON_Logger_Config" message='#["patch_shipment_request_for_row_no : " ++ correlationId]' tracePoint="BEFORE_REQUEST" priority="DEBUG" category="com.iso.logger">
			<json-logger:content><![CDATA[#[import modules::JSONLoggerModule output application/json ---
{
	"shipper_id" : vars.shipperId default "",
	"correlation_id" : correlationId,
	"report_id" : vars.reportId,
	"report_format" : vars.reportFormat,
	"operation" : vars.operationType,
	"backend_request" : payload default "",
}]]]></json-logger:content>
		</json-logger:logger>
		<logger level="INFO" doc:name="Replace with your code" doc:id="${uuid()}" message="#[payload]"/>
		<json-logger:logger doc:name="Log Backend Response In Debug Mode" doc:id="${uuid()}" config-ref="JSON_Logger_Config" message='#["patch_shipment_response_for_row_no : " ++ correlationId]' tracePoint="AFTER_REQUEST" priority="DEBUG" category="com.iso.logger" >
			<json-logger:content ><![CDATA[#[import modules::JSONLoggerModule output application/json ---
{
	"shipper_id" : vars.shipperId default "",
	"correlation_id" : correlationId,
	"report_id" : vars.reportId,
	"report_format" : vars.reportFormat,
	"operation" : vars.operationType,
	"backend_response_code" : attributes.statusCode default "",
	"shipment_external_id" : vars.shipmentId,
}]]]></json-logger:content>
		</json-logger:logger>
	</sub-flow>
</mule>
`
}