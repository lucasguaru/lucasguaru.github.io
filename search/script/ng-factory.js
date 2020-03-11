app.factory('dados', ['memorizador', function dadosFactory(memorizador)  {
    var vm = this;

    return {
        adicionar: adicionar,
        atualizar: atualizar,
        pegar: pegar
    }

    function adicionar(jsonItem) {
        if (!vm.dados) {
            vm.dados = [];
        }
        if (!pegarItemPorUrl(jsonItem.url)) {
            vm.dados.push(jsonItem);
            memorizador.definir('Dados', vm.dados);
        }
        return vm.dados;
    }

    /**
     * AINDA NÃO IMPLEMENTADO.
     * 
     *  IMPLEMENTAR!
     * 
     * @param {} jsonItem 
     */
    function atualizar(jsonItem) {
        if (!vm.dados) {
            vm.dados = [];
        }
        if (!pegarItemPorUrl(jsonItem.url)) {
            vm.dados.push(jsonItem);
            memorizador.definir('Dados', vm.dados);
        }
        return vm.dados;
    }

    function pegarItemPorUrl(url) {
        for (let i = 0; i < vm.dados.length; i++) {
            const item = vm.dados[i];
            if (item.url == url) {
                return item;
            }
        }
    }

    function pegar() {
        if (!vm.dados) {
            vm.dados = memorizador.obter('Dados');
            if (!vm.dados) {
                vm.dados = [];
                memorizador.definir('Dados', vm.dados);
            }
        }
        return vm.dados;
    }
}]);

app.factory('memorizador', function memorizadorFactory() {
    return {
        definir: definir,
        obter: obter
    }

    function definir(nome, valor) {
        return localStorage.setItem(nome, JSON.stringify(valor));
    }

    function obter(nome) {
        let result = localStorage.getItem(nome);
        if (result) {
            return JSON.parse(result);
        }
    }

});