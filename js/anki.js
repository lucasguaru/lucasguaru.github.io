var varT1 = null;
var varT2 = null;
var varT3 = null;
var startDate, endDate;

function getTimeElapsed() {
    if (startDate == null) {
        startDate = new Date();
        return 0;
    } else {
        endDate = new Date();
        // alert(endDate - startDate);
        let timeDiff = endDate - startDate;
        // $('#time-take').html(endDate - startDate);
        startDate = new Date();
        return timeDiff;
    }
}

function clearAnkiHint() {
	clearTimeout(varT1);
	clearTimeout(varT2);
	clearTimeout(varT3);
}

function ankiGenerate() {
    clearAnkiHint();
    setHint("&nbsp;");
    var number = generateNumber();
    var palavra = palavras["" + number];
    t1(palavra);
    
    setNumber(number);
}

let numberList = {};
let startedNumberList = false;
let selected = null;
let avgElapsedTime = 0;

function generateNumber() {
    if (startedNumberList === false) {
        genNumberList();
    }
    let sublist = numberList.list.slice(0,10);
    selected = getRandom(sublist);
    let elTime = getTimeElapsed();
    if (selected.media == 0) {
        selected.media = elTime;
    } else {
        selected.media = (selected.media + elTime)/2;
    }
	console.log('selected.media: ' + selected.media);
    return selected.value;
}

function getRandom(selectedRange) {
	var index = Math.floor(Math.random() * selectedRange.length);
	console.log('selectedRange.length: ' + selectedRange.length + ' - index: ' + index);
	return selectedRange[index];
}

function genNumberList() {
    numberList.list = [];
    for (let index = 1; index < 100; index++) {
        numberList.list.push({value: "" + (index), media: 0});
    }
    for (let index = 0; index < 10; index++) {
        numberList.list.push({value: "0" + (index), media: 0});
    }
    numberList.list.push({value: "0", media: 0});

    startedNumberList = true;
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

function setNumber(palavra) {
    $('#random-number').html(palavra)
}

function setHint(palavra) {
    $('#number-hint').html(palavra)
}