  var jumpSize = 0;

  function mouseOver() {
	var cases = document.getElementsByName("case");
	var checked = "";
	for (var i = 0; i < cases.length; i++) {
	  st = cases[i].checked;
	  st1 = cases[i].id;
	  if (st == true) {
		checked = st1;
		break;
	  }
	}
	if (checked == "small") {
	  jumpSize = 10;
	} else if (checked == "medium") {
	  jumpSize = 25;
	} else if (checked == "big") {
	  jumpSize = 48;
	} else {
	  jumpSize = 0;
	}

	if (jumpSize > 0) {
	  var mole = document.getElementById("mole").style;
	  mole.background = "orange";
	  var pos = getRandomPos();
	  mole.left = ((50 + pos[0]) + "%");
	  mole.top = ((50 + pos[1]) + "%");
	} else {
	  alert("Please select a jump size.");
	}
  }

  function getRandomPos() {
	var x = Math.floor((Math.random() * jumpSize) + 1);
	x *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
	var y = Math.floor((Math.random() * jumpSize) + 1);
	y *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
	if (x + 50 > 93 || y + 50 > 93) {
	  getRandomPos();
	} else {
	  return [x, y];
	}
  }
