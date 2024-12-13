function getCodeMunit(app, flow) {
    return `	<munit:test name="${app.kebabCase}-prc-api-${flow.kebabCase}-flow-flowTest" doc:id="${uuid()}" description="Test">
		<munit:behavior >
			<ee:transform doc:name="shipperData" doc:id="${uuid()}">
				<ee:message>
				</ee:message>
				<ee:variables>
					<ee:set-variable variableName="shipperData"><![CDATA[%dw 2.0
output application/java
---
{
    "reportFormat": "${flow.url}",
    "reportId": uuid(),
    "shipperName": "${app.kebabCase}",
    "shipperId": "e33b94c3-b873-475b-89f9-d5b3c5bb2196",
    "reviewApp": "https://6472-ssra-bluebuff-p.staging.iso.io/",
    "environment": "sadev",
}]]></ee:set-variable>
				</ee:variables>
			</ee:transform>
			<set-variable value='${flow.camelCase}/ISO OSS data - 1st 2 weeks of April v2.csv' doc:name="csvFileName to mocking" doc:id="${uuid()}" variableName="csvfileName" />
			<flow-ref doc:name="Shared Mocks" doc:id="${uuid()}" name="shared-mocks-subflow"/>
			<munit-tools:mock-when doc:name="S3 Get CSV File for DV&amp;R" doc:id="${uuid()}" processor="s3:get-object">
				<munit-tools:with-attributes>
					<munit-tools:with-attribute whereValue="${getUuid('Get CSV File for DV&amp;R')}" attributeName="doc:id" />
				</munit-tools:with-attributes>
				<munit-tools:then-return>
					<munit-tools:payload value="#[output application/csv --- readUrl('classpath://' ++ vars.csvfileName, &quot;application/csv&quot;)]" mediaType="application/csv" encoding="UTF-8" />
					<munit-tools:attributes value='#[output application/json&#10;---&#10;{&#10;	"contentLength": 1770,&#10;}]' mediaType="application/json" encoding="UTF-8" />
				</munit-tools:then-return>
			</munit-tools:mock-when>
			<munit-tools:mock-when doc:name="S3 Get CSV File for Ingestion" doc:id="${uuid()}" processor="s3:get-object">
			<munit-tools:with-attributes>
				<munit-tools:with-attribute whereValue="${getUuid('Get CSV File for Ingestion')}" attributeName="doc:id" />
			</munit-tools:with-attributes>
			<munit-tools:then-return>
				<munit-tools:payload value="#[output application/csv --- readUrl('classpath://' ++ vars.csvfileName, &quot;application/csv&quot;)]" mediaType="application/csv" encoding="UTF-8" />
				<munit-tools:attributes value='#[output application/json&#10;---&#10;{&#10;	"contentLength": 1770,&#10;}]' mediaType="application/json" encoding="UTF-8" />
			</munit-tools:then-return>
		</munit-tools:mock-when>
		</munit:behavior>
		<munit:execution >
			<munit:set-event doc:name="Set Event ${flow.name}" doc:id="${uuid()}">
				<munit:payload value='#[output application/json&#10;---&#10;{&#10;    "business_entity_type": "Shipper",&#10;    "report_format": vars.shipperData.reportFormat,&#10;    "report_id": vars.shipperData.reportId,&#10;    "shipper_business_name": vars.shipperData.shipperName,&#10;    "shipper_id": vars.shipperData.shipperId,&#10;    "report_path": vars.shipperData.environment ++ "/" ++ vars.shipperData.shipperId ++ "/" ++ vars.shipperData.reportFormat ++ "/" ++ vars.shipperData.reportId ++ ".csv",&#10;    "business_entity_id": vars.shipperData.shipperId,&#10;    "api_base_url": vars.shipperData.reviewApp,&#10;}]' encoding="UTF-8" mediaType="application/json" />
				<munit:attributes value='#[output application/json&#10;---&#10;{&#10;    "headers": {&#10;		"X-Correlation-id" : vars.shipperData.reportId,&#10;		"Content-Type" : "application/json",&#10;		"Authorization" : "Basic YWFhYTpiYmJi", // aaaa:bbbb&#10;		"operation_type" : "shipper_ingestion_" ++ vars.shipperData.reportFormat,&#10;	}&#10;}]' />
				<munit:variables >
					<munit:variable key="formatsResponse" value="#[output application/json --- readUrl('classpath://shared/getFormatsResponse_mock.dwl')]" />
					<munit:variable key="filesResponse" value="#[output application/json --- readUrl('classpath://shared/getFilesResponse_mock.dwl')]" />
				</munit:variables>
			</munit:set-event>
			<flow-ref doc:name="Ingest ${flow.name}" doc:id="${uuid()}" name="${app.kebabCase}-prc-api-${flow.kebabCase}-flow"/>
			<munit-tools:sleep time="1000" doc:name="Sleep" doc:id="${uuid()}" />
		</munit:execution>
	</munit:test>`
}