  var imageURL = [
	"https://upload.wikimedia.org/wikipedia/commons/7/7c/Cima_da_Conegliano,_God_the_Father.jpg", //<!-- God -->
	"http://cdn.playbuzz.com/cdn/d5b63c56-7a1b-4f2c-8a0a-6e7ebc53f6c1/a5aeafb6-4e2e-4b6d-bef0-dd4495b5be0c.jpg", //<!-- Angel -->
	"http://img04.deviantart.net/f0b3/i/2012/265/4/5/the_commoner_by_speculumhistoriae-d5fiftn.jpg", //<!-- Human -->
	"https://s-media-cache-ak0.pinimg.com/736x/3e/9c/5a/3e9c5ad3af07e573b0e74bdb0a1dce3e.jpg", //<!-- Dog -->
	"http://animalwonder.com/wp-content/uploads/2014/09/grasshopper.jpg", //<!-- Grasshopper -->
	"https://static-secure.guim.co.uk/sys-images/Guardian/Pix/pictures/2014/9/24/1411574454561/03085543-87de-47ab-a4eb-58e7e39d022e-620x372.jpeg", //<!-- Potato -->
	"http://vignette3.wikia.nocookie.net/reddeadredemption/images/f/f6/Diamond!.jpg/revision/latest?cb=20131226165754", //<!-- Diamond -->
	"http://i.ebayimg.com/00/s/NTY2WDg0OQ==/z/0z8AAOSwirZTtqWL/$_32.JPG" //<!-- Gold -->
  ];
  var imageTitle = ["God", "Angel", "Human", "Dog", "Grasshopper", "Potato", "Diamond", "Gold"];
  var currentImage = 0;

  function prev() {
	var id0 = document.getElementById("im0");
	remHighlight();
	if (currentImage > 0) {
	  id0.src = imageURL[currentImage = currentImage - 1];
	} else {
	  id0.src = imageURL[currentImage = 7];
	}
	id0.title = imageTitle[currentImage];
	addHighlight();
  }

  function addHighlight() {
	var id = document.getElementById("im" + (currentImage + 1));
	id.style = "width: 50px; height: 50px;";
  }

  function remHighlight() {
	var id = document.getElementById("im" + (currentImage + 1));
	id.style = "width: 50px; height: 50px; opacity: .5;";

  }

  function next() {
	var id0 = document.getElementById("im0");
	remHighlight();
	if (currentImage < 7) {
	  id0.src = imageURL[currentImage = currentImage + 1];
	} else {
	  id0.src = imageURL[currentImage = 0];
	}
	id0.title = imageTitle[currentImage];
	addHighlight();
  }

  function changeCurImage(x) {
	var id0 = document.getElementById("im0");
	remHighlight();
	currentImage = x;
	id0.src = imageURL[currentImage];
	addHighlight();
  }