window.addEventListener('load', function() {
    if (window.location.href.startsWith("http://gscbrasilpr01.bs.br.bsch:8082/arsys/forms/")) {
        alert('oi');
    } else {
        alert('não leu');
    }
});
console.log("carregou script");