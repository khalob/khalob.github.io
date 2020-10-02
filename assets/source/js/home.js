var projectButton = document.getElementById('projectButton'); // Assumes element with id='button'
var projects = document.getElementById('projWrapper');
projects.style.visibility = 'hidden'; //Default invisible
var bubble = document.getElementById('contactButton'); // Assumes element with id='contactButton'
bubble.onclick = closeDiv;
var copyTextareaBtn = document.getElementById('js-textareacopybtn'); // Assumes element with id='js-textareacopybtn'

projectButton.onclick = function () {
	var div = document.getElementById('projWrapper');
	div.style.visibility = 'visible';
	div.classList.toggle("closed");
};

function closeDiv() {
	var div = document.getElementsByClassName('bubbleWrapper')[0];
	div.classList.toggle("closed");
}

copyTextareaBtn.onclick = function () {
	var range = document.createRange();
	var selection = window.getSelection();
	range.selectNodeContents(document.getElementById('js-copytextarea'));
	selection.removeAllRanges();
	selection.addRange(range);
	try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		//alert('Copying text command was ' + msg);
	} catch (err) {
		//alert('Oops, unable to copy');
	}
};

function highlight(obj) {
	obj.children[0].setAttribute("style", "background-color: #2098d1; color: white;");
}
