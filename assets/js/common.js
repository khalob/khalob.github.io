  function updateTitle(obj) {
	var title = document.getElementById('titleDiv');
	title.innerHTML = obj.children[0].getAttribute("title");
  }