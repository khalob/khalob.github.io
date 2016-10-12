  if ('addEventListener' in window) {
	window.addEventListener('load', function() {
	  document.body.className = document.body.className.replace(/\bis-loading\b/, '');
	});
  }

  function updateTitle(obj) {
	var title = document.getElementById('titleDiv');
	title.innerHTML = obj.children[0].getAttribute("title");
  }