function getCodeMainPrcApi(app, flow) {
    return `	<flow name="${app.kebabCase}-prc-api-${flow.kebabCase}-flow" doc:id="54d42e49-b920-47d6-a980-bf32f683ee3f" initialState="started">
		<http:listener doc:name="/${flow.url}" doc:id="${uuid()}" config-ref="HTTP_Listener_config" path="\${listener.listenerPaths.${flow.camelCase}}" allowedMethods="POST">
			<http:response statusCode="200" />
			<http:error-response statusCode="500">
				<http:body><![CDATA[#[output application/json --- payload]]]></http:body>
			</http:error-response>
		</http:listener>
		<http:basic-security-filter doc:name="Spring Basic Security Filter" doc:id="${uuid('spring-basic-security-filter')}" realm="\${springAutorization.realm}" />
		<spring:authorization-filter doc:name="Spring Authorization filter" doc:id="${uuid('spring-authorization-filter')}" requiredAuthorities="ROLE_ADMIN" />
		<flow-ref doc:name="${flow.name} Read File" doc:id="${uuid()}" name="${flow.kebabCase}-first-read-file-flow" />
		<ee:transform doc:name="DW Response Payload" doc:id="${uuid()}" >
			<ee:message >
				<ee:set-payload resource="dwl/msgAsyncResponse.dwl" />
			</ee:message>
		</ee:transform>
		<error-handler ref="global-error-handlerError_Handler" />
	</flow>`
}