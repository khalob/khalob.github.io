      //Spawn timers
      var Mtimer = window.setInterval(spawnMarshmellow, 5000);
      var Ctimer = window.setInterval(spawnCheerio, 3000);

      //Gameover after 30 seconds.
      var GGtimer = window.setInterval(gameOver, 30000);

      //Take positions for Marshmellows
      var MtakenX = [];
      var MtakenY = [];

      //Take positions for Cheerios
      var CtakenX = [];
      var CtakenY = [];

      var score = 0;

      var computedStyle = function(el, style) {
        var cs;
        if (typeof el.currentStyle != 'undefined') {
          cs = el.currentStyle;
        } else {
          cs = document.defaultView.getComputedStyle(el, null);
        }
        return cs[style];
      }

      document.onkeydown = function(e) {
        var arsho = document.getElementById("arsho");
        var top = parseInt(computedStyle(arsho, 'top'));
        var left = parseInt(computedStyle(arsho, 'left'));
        switch (e.keyCode) {
          case 37: //Left
            if (left > 0) {
              arsho.style.left = left - 25 + "px";
              checkGround(top, left - 25 + "px");
            }
            break;
          case 38: //Up
            if (top > 0) {
              arsho.style.top = top - 25 + "px";
              checkGround(top - 25 + "px", left);
            }
            break;
          case 39: //Right
            if (left < 475) {
              arsho.style.left = left + 25 + "px";
              checkGround(top, left + 25 + "px");
            }
            break;
          case 40: //Down
            if (top < 475) {
              arsho.style.top = top + 25 + "px";
              checkGround(top + 25 + "px", left);
            }
            break;
        }
      };

      function getRandomPos() {
        var arsho = document.getElementById("arsho");
        var top = parseInt(computedStyle(arsho, 'top'));
        var left = parseInt(computedStyle(arsho, 'left'));

        var x = Math.floor((Math.random() * 20) + 0) * 25;
        var y = Math.floor((Math.random() * 20) + 0) * 25;
        var spotAlreadyTaken = false;
        for (i = 0; i < MtakenX.length; i++) {
          if (x == parseInt(MtakenX[i]) && y == parseInt(MtakenY[i])) {
            spotAlreadyTaken = true;
            break;
          }
        }
        for (i = 0; i < CtakenX.length; i++) {
          if (x == parseInt(CtakenX[i]) && y == parseInt(CtakenY[i])) {
            spotAlreadyTaken = true;
            break;
          }
        }
        if ((x !== top || y !== left) && spotAlreadyTaken == false) { //Wont land on arsho's or another objects position
          return [x, y];
        }
        return getRandomPos();
      }

      function updateScore() {
        var scoreBoard = document.getElementById("scoreBoard");
        scoreBoard.innerHTML = "Score " + score;
      }

      function checkGround(x, y) {
        //Checks if we are going to be on a marshmallow
        var crib = document.getElementById("crib");
        for (i = 0; i < MtakenX.length; i++) {
          if (parseInt(x) == parseInt(MtakenX[i]) && parseInt(y) == parseInt(MtakenY[i])) {
            MtakenX.splice(i, 1);
            MtakenY.splice(i, 1);
            crib.removeChild(crib.getElementsByClassName("marshmallow myDiv")[i]);
            score += 100;
            updateScore();
            break;
          }
        }
        //Checks if we are going to be on a cheerio
        for (i = 0; i < CtakenX.length; i++) {
          if (parseInt(x) == parseInt(CtakenX[i]) && parseInt(y) == parseInt(CtakenY[i])) {
            CtakenX.splice(i, 1);
            CtakenY.splice(i, 1);
            crib.removeChild(crib.getElementsByClassName("cheerio myDiv")[i]);
            score++;
            updateScore();
            break;
          }
        }
      }

      function spawnMarshmellow() {
        var m = document.createElement("DIV");
        var crib = document.getElementById("crib");
        m.id = "marshmallow";
        m.className = "marshmallow myDiv";
        var pos = getRandomPos();
        pos[0] = pos[0] + "px";
        pos[1] = pos[1] + "px";
        m.style.top = pos[0];
        m.style.left = pos[1];
        //Add pos to taken positions
        MtakenX.push(pos[0]);
        MtakenY.push(pos[1]);
        // This next line will just add it to the crib div
        crib.appendChild(m);
      }

      function spawnCheerio() {
        var c = document.createElement("DIV");
        var crib = document.getElementById("crib");
        c.id = "cheerio";
        c.className = "cheerio myDiv";
        var pos = getRandomPos();
        pos[0] = pos[0] + "px";
        pos[1] = pos[1] + "px";
        c.style.top = pos[0];
        c.style.left = pos[1];
        //Add pos to taken positions
        CtakenX.push(pos[0]);
        CtakenY.push(pos[1]);
        // This next line will just add it to the crib div
        crib.appendChild(c);
      }

      function gameOver() {
        clearTimeout(Mtimer);
        clearTimeout(Ctimer);
        clearTimeout(GGtimer);
        var scoreBoard = document.getElementById("scoreBoard");
        scoreBoard.innerHTML = "Gameover: Total Score " + score;
        document.onkeydown = null; //stop movement
      }
