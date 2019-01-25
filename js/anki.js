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

let numberList = null;
let startedNumberList = false;
let selected = null;
let avgElapsedTime = 0;
let MILESECONDS = 1000;
let AVG_FIRST_LEVEL = 2.5 * MILESECONDS;
let AVG_SECOND_LEVEL = 2.5 * MILESECONDS;
let LENGTH_RANDOM = 5;

function generateNumber() {
    genNumberList();
    let elTime = getTimeElapsed();
    if (selected != null) {
        if (selected.avg == 0) {
            // selected.avg = elTime;
            selected.avg = 3000;
        } else {
            selected.avg = parseInt((selected.avg + elTime)/2);
        }
        console.log('selected.avg: ' + selected.avg);
    }
    saveNumberList();
    
    // let avg = getAvg(sublist)
    selected = getNext();

    return selected.value;
}

function saveNumberList() {
    localStorage.setItem("numberList", JSON.stringify(numberList));
}

function getNext() {
    let sublist = getSublist(LENGTH_RANDOM);
    let biggest = null;
    for (let i = 0; i < sublist.length; i++) {
        const el = sublist[i];
        if (el.avg === 0) {
            return el;
        }
        if (biggest != null) {
            if (el.avg === 0 || (el != selected && el.avg > biggest.avg)) {
                biggest = el;
            }
        } else if (el != selected) {
            biggest = el;
        }
    }
    return biggest;
}

function getSublist(length) {
    let sublist = [];
    let selectedRange = numberList.list;
    for (let i = 0; i < selectedRange.length; i++) {
        const el = selectedRange[i];
        if (el.avg > AVG_FIRST_LEVEL) {
            sublist.push(el);
            if (sublist.length == length) {
                return sublist;
            }
        }
    }
    if (sublist.length < length) {
        for (let i = 0; i < selectedRange.length; i++) {
            const el = selectedRange[i];
            if (el.avg === 0) {
                sublist.push(el);
                if (sublist.length == length) {
                    return sublist;
                }
            }
        }
    }

    return sublist;
}

function getAvg(selectedRange) {
    let avg = 0;
    let avgCount = 0;
    for (let i = 0; i < selectedRange.length; i++) {
        const el = selectedRange[i];
        if (el.avg > 0) {
            avg += el.avg;
            avgCount++;
        }
    }
    return avg / avgCount;
}

function getRandom(selectedRange) {
	var index = Math.floor(Math.random() * selectedRange.length);
	console.log('selectedRange.length: ' + selectedRange.length + ' - index: ' + index);
	return selectedRange[index];
}

function genNumberList() {
    if (startedNumberList === false) {
        let tempNumberList = localStorage.getItem("numberList");
        if (tempNumberList != null) {
            numberList = JSON.parse(tempNumberList);
        } else {
            numberList = {list : []};
        }
        for (let index = 1; index < 100; index++) {
            numberList.list.push({value: "" + (index), avg: 0});
        }
        for (let index = 0; index < 10; index++) {
            numberList.list.push({value: "0" + (index), avg: 0});
        }
        numberList.list.push({value: "0", avg: 0});
        startedNumberList = true;
    }
}

function getFromLocalStorage() {

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