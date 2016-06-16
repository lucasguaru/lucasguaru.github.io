var ranges = [];

ranges[1] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
ranges[2] = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
ranges[3] = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
ranges[4] = [31, 32, 33, 34, 35, 36, 37, 38, 39, 40];
ranges[5] = [41, 42, 43, 44, 45, 46, 47, 48, 49, 50];
ranges[6] = [51, 52, 53, 54, 55, 56, 57, 58, 59, 60];
ranges[7] = [61, 62, 63, 64, 65, 66, 67, 68, 69, 70];
ranges[8] = [71, 72, 73, 74, 75, 76, 77, 78, 79, 80];
ranges[9] = [81, 82, 83, 84, 85, 86, 87, 88, 89, 90];
ranges[10] = [91, 92, 93, 94, 95, 96, 97, 98, 99, '00'];
ranges[11] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '0'];

ranges[0] = ranges[1].concat(ranges[2]).concat(ranges[3]).concat(ranges[4]).concat(ranges[5]).concat(ranges[6]).concat(ranges[7]).concat(ranges[8]).concat(ranges[9]).concat(ranges[10]).concat(ranges[11]);

var selectedRange = null;
var lastRangeId = 0;

escolherRange(3);

function escolherRange(rangeId) {
	$('#pag' + lastRangeId).removeClass('active');
	$('#pag' + rangeId).addClass('active');
	lastRangeId = rangeId;
	selectedRange = ranges[rangeId];
	gerarNumero();
}

function gerarNumero() {
	var number = getRandom(selectedRange);
	$('#random-number').text(number);
}

function getRandom(selectedRange) {
	var index = Math.floor(Math.random() * selectedRange.length);
	console.log('selectedRange.length: ' + selectedRange.length + ' - index: ' + index);
	return selectedRange[index];
}

$(document).ready(function() {
	$('#btnGerarNumero').click(function() {
		gerarNumero();
	});
});
