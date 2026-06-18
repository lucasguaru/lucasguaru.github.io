# Exemplos — `on-error-propagate` / `on-error-continue`

## 1. Erro esperado — sem notificação, sem stack Mule (log no handler)

Respostas: esperado **sim**, notificar **não**, log da app **sim**.

```xml
<error-handler>
	<on-error-propagate
		enableNotifications="false"
		logException="false"
		doc:name="On Error Propagate"
		doc:id="03d1a33c-217e-4550-88d7-ef2d56463b19"
		type="HTTP:TIMEOUT">
		<logger
			level="INFO"
			doc:name="Log timeout wallet"
			doc:id="9a6c0131-bd79-41ad-84ef-99622142c938"
			message='#[output text/plain
---
"HTTP:TIMEOUT - " ++ (error.description default "")]' />
	</on-error-propagate>
</error-handler>
```

## 2. Erro inesperado — notificação e stack Mule (defaults explícitos)

Respostas: esperado **não**, notificar **sim**, log da app **não**.

Equivalente ao default Mule; atributos explícitos para revisão em PR:

```xml
<error-handler>
	<on-error-propagate
		enableNotifications="true"
		logException="true"
		doc:name="On Error Propagate"
		doc:id="03d1a33c-217e-4550-88d7-ef2d56463b19"
		type="HTTP:TIMEOUT">
		<logger
			level="ERROR"
			doc:name="Logger"
			doc:id="9a6c0131-bd79-41ad-84ef-99622142c938"
			message="#[error.errorType.identifier]" />
	</on-error-propagate>
</error-handler>
```

Mesmo comportamento com atributos omitidos (Studio costuma serializar assim):

```xml
<on-error-propagate
	type="HTTP:TIMEOUT"
	doc:name="On Error Propagate"
	doc:id="03d1a33c-217e-4550-88d7-ef2d56463b19">
	...
</on-error-propagate>
```

## 3. Notificar monitoramento, log só da app (sem stack Mule)

Respostas: esperado **não**, notificar **sim**, log da app **sim**.

```xml
<on-error-propagate
	enableNotifications="true"
	logException="false"
	type="MULE:RETRY_EXHAUSTED"
	doc:name="On Error Propagate"
	doc:id="a1b2c3d4-e5f6-7890-abcd-ef1234567890">
	<logger level="WARN" doc:name="Retry exhausted"
		doc:id="b2c3d4e5-f6a7-8901-bcde-f12345678901"
		message='#[write({
			errorType: error.errorType.identifier,
			description: error.description
		}, "application/json")]' />
</on-error-propagate>
```

## 4. `on-error-continue` — tratar e seguir

```xml
<on-error-continue
	enableNotifications="false"
	logException="false"
	type="HTTP:NOT_FOUND"
	doc:name="On Error Continue"
	doc:id="c3d4e5f6-a7b8-9012-cdef-123456789012">
	<set-variable variableName="found" value="#[false]" doc:name="found=false"
		doc:id="d4e5f6a7-b8c9-0123-def0-234567890123" />
</on-error-continue>
```

## 5. Anti-padrões

| Evitar | Por quê |
|--------|---------|
| `logException="true"` + logger com `error.cause` / stack completo | Stack duplicado |
| `enableNotifications="true"` em erro 100% esperado e frequente | Alert fatigue |
| `logException="false"` sem nenhum logger | Perda de diagnóstico |
| Handler local `HTTP:*` igual ao de `erros-http_commons` | Duplicação e drift |
