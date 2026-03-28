// Objeto original
const pessoa = {
  nome: "Lucas",
  idade: 30,
};

// Criando um Proxy
const pessoaProxy = new Proxy(pessoa, {
  // Intercepta leitura
  get(obj, prop) {
    console.log(`📖 Lendo propriedade: ${prop}`);
    return obj[prop];
  },

  // Intercepta escrita
  set(obj, prop, value) {
    console.log(`✏️ Alterando ${prop} para ${value}`);
    obj[prop] = value;
    return true; // obrigatório retornar true
  },
});

// Usando
console.log(pessoaProxy.nome); // dispara get
pessoaProxy.idade = 31; // dispara set
