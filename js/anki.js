var varT1 = null;
var varT2 = null;
var varT3 = null;
var startDate, endDate;

function ankiGenerated(isFirst) {
    if (isFirst === true) {
        startDate = new Date();
    } else {
        endDate = new Date();
        // alert(endDate - startDate);
        $('#time-take').html(endDate - startDate);
        startDate = new Date();
    }
}

function clearAnkiHint() {
	clearTimeout(varT1);
	clearTimeout(varT2);
	clearTimeout(varT3);
}

function anki(number) {
    setHint("&nbsp;");
    var palavra = palavras["" + number + ""];
    t1(palavra);
    
}
function t1(palavra) {
    varT1 = setTimeout(() => {setHint("1"); t2(palavra);}, 1000);
}
function t2(palavra) {
    varT2 = setTimeout(() => {setHint("2"); t3(palavra);}, 1000);
}
function t3(palavra) {
    varT3 = setTimeout(() => {setHint(palavra)}, 1000);
}

function setHint(palavra) {
    $('#number-hint').html(palavra)
}