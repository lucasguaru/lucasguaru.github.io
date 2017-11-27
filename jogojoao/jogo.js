var canvas, ctx, ALTURA, LARGURA, frames = 0;
var maxPulos = 3;
var drawingPers = new Image();
drawingPers.src = "img/joao.png"; // can also be a remote URL e.g. http://
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
ALTURA = window.innerHeight;
LARGURA = window.innerWidth;
if (LARGURA > 800) {
    LARGURA = 800;
    ALTURA = 600;
}

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
    x: 50,
    y: 0,
    altura: 160,
    largura: 130,
    gravidade: 1.5,
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
    pular: function() {
        if (this.qtPulos++ < maxPulos) {
            this.velocidade = -this.forcaDoPulo;
        }
    },
    desenha: function() {
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
        this._obs.push({
            x: LARGURA,
            y: ALTURA - 100,
            altura: 45 + (45 * m),
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


function clique() {
    personagem.pular();
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