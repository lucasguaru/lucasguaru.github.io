String.prototype.substringAfter = function(value, startPos = 0) {
	let pos = this.indexOf(value, startPos)
	if (pos > -1) {
		return this.substring(pos + value.length, this.length)
	}
	return this
}

String.prototype.substringBefore = function(value, startPos = 0) {
	let pos = this.indexOf(value, startPos)
	if (pos > -1) {
		return this.substring(startPos, pos)
	}
	return this.substring(startPos)
}

function log(value, text) {
    if (text) {
        console.log(text, value);
        return value;
    }

    console.log(value);
    return value;
}

function copyToClipboard(text) {
	try{
		if (copy) {
			copy(text)
			return
		}
	} catch(e) {
		
	}
    navigator.clipboard.writeText(text).then(function () {
        // alert('Copied to clipboard: ' + text);
    }, function (err) {
        console.error('Could not copy text: ', err);
    });
}