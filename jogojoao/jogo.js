var canvas, ctx, ALTURA, LARGURA, frames = 0;
var maxPulos = 3;
var drawingPers = new Image();
drawingPers.src = "img/joao-dragao.png"; // can also be a remote URL e.g. http://
drawingPers.onload = function() {
   personagem.carregou = true;
   personagem.drawing = this;
};
var drawingDesaf = new Image();
drawingDesaf.src = "img/amora.png"; // can also be a remote URL e.g. http://
drawingDesaf.onload = function() {
   desafio.carregou = true;
   desafio.drawing = this;
};
ALTURA = window.innerHeight - 2;
LARGURA = window.innerWidth - 2;
// if (LARGURA > 800) {
//     LARGURA = 1200;
//     ALTURA = 800;
// }

var chao = {
    y: ALTURA - 80,
    altura: 80,
    cor: "#ffdf70",
    desenha: function() {
        ctx.fillStyle = this.cor;
        ctx.fillRect(0, this.y, LARGURA, this.altura);
    }
},
personagem = {
    x: 100,
    y: 0,
    altura: 110,
    largura: 120,
    gravidade: 1.2,
    velocidade: 0,
    forcaDoPulo: 23,
    qtPulos: 0,
    atualiza: function() {
        this.velocidade += this.gravidade;
        this.y += this.velocidade;
        if (this.y > chao.y - this.altura + 70) {
            this.y = chao.y - this.altura + 70;
            this.qtPulos = 0;
        }
    },
    pular: function(ignora) {
        if (this.qtPulos++ < maxPulos) {
            this.velocidade = -this.forcaDoPulo;
        } else {
            this.aumentarTamanho = true;
        }
    },
    desenha: function() {
        if (this.aumentarTamanho) {
            this.largura = this.largura + 7;
            this.altura = this.altura + 7;
        }
        if (this.largura > 300) {
            this.aumentarTamanho = false;
        }
        if (this.carregou) {
            ctx.drawImage(this.drawing, this.x, this.y, this.largura, this.altura);
        }
    }
},
obstaculos = {
    _obs: [],
    velocidade: 10,
    insere: function() {
        var m = Math.random();
        var altura = 45 + (45 * m);
        this._obs.push({
            x: LARGURA,
            y: ALTURA - (ALTURA * m) - 20,
            altura: altura,
            largura: 55 + (55 * m)
        });
    },
    atualiza: function() {
        if (desafio.carregou) {
            var tam = this._obs.length;
            for (var i = 0; i < tam; i++) {
                var obs = this._obs[i];
                obs.x -= this.velocidade;
                if (obs.x + obs.largura < 0) {
                    this._obs.splice(i, 1);
                    tam--;
                    i--;
                }
                // ctx.drawImage(desafio.drawing, obs.x, obs.y, obs.largura, obs.altura);
            }
        }
    },
    desenha: function() {
        if (desafio.carregou) {
            var tam = this._obs.length;
            for (var i = 0; i < tam; i++) {
                var obs = this._obs[i];
                ctx.drawImage(desafio.drawing, obs.x, obs.y, obs.largura, obs.altura);
            }
        }
    }
},
desafio = {
    x: LARGURA - 100,
    y: ALTURA - 120,
    altura: 90,
    largura: 110,
    velocidade: 0,
    desenha: function() {
        if (this.carregou) {
            ctx.drawImage(this.drawing, this.x, this.y, this.largura, this.altura);
        }
    }
};


function clique(ignora) {
    personagem.pular(ignora);
    obstaculos.insere();
}
function main() {
    canvas = document.createElement("canvas");
    canvas.width = LARGURA;
    canvas.height = ALTURA;
    canvas.style.border = "1px solid #000";

    ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);
    document.body.addEventListener("mousedown", clique);
    document.body.addEventListener("keypress", function(event) {
        if (event.keyCode == 32 || event.keyCode == 38) {
            clique(true);
        }
    });

    roda();
}
function roda() {
    atualiza();
    desenha();
    window.requestAnimationFrame(roda);
}
function atualiza() {
    frames++;
    personagem.atualiza();
    obstaculos.atualiza();
}
function desenha() {
    ctx.fillStyle = "#50beff";
    ctx.fillRect(0, 0, LARGURA, ALTURA);
    chao.desenha();
    obstaculos.desenha();
    personagem.desenha();
    // desafio.desenha();
}

main();