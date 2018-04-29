function addScript(attribute, text, callback) {
    var s = document.createElement('script');
    for (var attr in attribute) {
        s.setAttribute(attr, attribute[attr] ? attribute[attr] : null)
    }
    s.innerHTML = text;
    s.onload = callback;
    document.body.appendChild(s);
}

addScript({
    src: 'https://code.jquery.com/jquery-3.3.1.min.js',
    type: 'text/javascript',
    async: null
});

addScript({
    src: 'https://lucasguaru.github.io/remedy-options.js',
    type: 'text/javascript',
    async: null
});

window.addEventListener('load', function() {
	window.setTimeout(function() {
		if (window.location.href.startsWith("http://gscbrasilpr01.bs.br.bsch:8082/arsys/forms/")) {
			$('img[alt="Menú para Mis últimas peticiones"').click(function() {
				window.setTimeout(function() {
					$("div.MenuOuter").height(102);
					console.log(remedyoptions);
					var menuStrConst = '<tr class="MenuTableRow"><td class="MenuEntryName" nowrap="">{nome}</td><td class="MenuEntryNoSub" arvalue="{valor}"></td></tr>';
					var menuStr = "";
					for (var i = 0; i < remedyoptions.length; i++) {
						menuStr = menuStr + menuStrConst.replace("{nome}", remedyoptions[i].nome).replace("{valor}", remedyoptions[i].valor);
					}
					$("tbody.MenuTableBody").html(menuStr);
					//$("tbody.MenuTableBody").html('<tr class="MenuTableRow"><td class="MenuEntryName" nowrap="">Operação | Release em Produção</td><td class="MenuEntryNoSub" arvalue="Santander Brasil | Development Products | APL - Release of Midrange Components"></td></tr><tr class="MenuTableRow"><td class="MenuEntryNameHover" nowrap="">PaaS | Configuração de Variáveis</td><td class="MenuEntryNoSubHover" arvalue="Santander Brasil | Cloud Services | PaaS Support - Setting up Rundeck PaaS JOBs"></td></tr><tr class="MenuTableRow"><td class="MenuEntryName" nowrap="">PaaS | Criação de Senha de Banco de Dados</td><td class="MenuEntryNoSub" arvalue="Santander Brasil | Cloud Services | PaaS Support - Project - Secrets Creation"></td></tr><tr class="MenuTableRow"><td class="MenuEntryName" nowrap="">Banco de Dados | Oracle | Validação de Script</td><td class="MenuEntryNoSub" arvalue="Santander Brasil | Database | APL - Oracle - Certification of Data Base"></td></tr><tr class="MenuTableRow"><td class="MenuEntryName" nowrap="">Segurança | Cerimônia de Senhas</td><td class="MenuEntryNoSub" arvalue="Santander Brasil | Systems (Access Management) | APL - Connect User - Maintenance"></td></tr>');
					//alert('clicou');
				}, 50);
				
			});
		}
	}, 500);
});
