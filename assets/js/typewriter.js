function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
        args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function animateTyping(element, sentence, options) {
  var count = 0,
      delay = options.startingDelay || 0,
      endingDelay = options.endingDelay || 2000,
      tick = options.tickAmount || 200,
      tickTolerance = options.ticketTolerance || 0,
      pauseAmount = options.pauseAmount || 2000,
      fun,
      hadPause = false,
      written = "",
      letter = "",
      letters = sentence.split("");

  //Prevent text curor's flashing animation
  element.addClass("typing");

  while (count < sentence.length) {
    //Get Letter
    letter = letters[count];
    if (letter !== "_") {
      //Write letter or remove after delay
      if (letter === "-") {
        written = written.slice(0, -1);
      } else {
        written += letter;
      }
      fun = debounce(function(write, wasPaused) {
        element.text(write);
        //Prevent text curor's flashing animation
        if (wasPaused) {
          element.addClass("typing");
        }
      }, delay);
      fun(written, hadPause);
      hadPause = false;
      delay += getRandomInteger(tick - tickTolerance, tick + tickTolerance);
    } else {
      //Allow text cursor to start blinking again
      setTimeout(function() {
        element.removeClass("typing");
      }, delay);
      hadPause = true;
      //Long delay to mimic pausing
      delay += pauseAmount;
    }
    //Increment, to find next letter
    count++;
  }

  setTimeout(function() {
    element.removeClass("typing");
  }, delay);
  setTimeout(function() {
    element.addClass("finalize-typing");
  }, delay + endingDelay);
}

function generateTextToAnimate(base, array, numberOfNouns, finalNoun){
  var result = base || '';
  var noun = '';
  var randomInt = 0;
  while (numberOfNouns > 0){
     numberOfNouns--;
     randomInt = getRandomInteger(0, array.length);
     result += array.splice(randomInt, 1);
  }
  return result + finalNoun;
}

var nouns = [
  ' a Software Engineer_--------------------',
  ' learning everyday_------------------',
  ' an Ecommerce Developer_----------------------',
  ' interested in new opportunities_-------------------------------',
  ' a Web Developer_----------------',
];

var textToAnimation = generateTextToAnimate("Hello I'm...", nouns, 3, " Khalob.");
var animatedElement = $("#homepage-title");
var opt = {
  startingDelay: 300,
  tickAmount: 90,
  ticketTolerance: 15,
  pauseAmount: 2000
};

animateTyping(animatedElement, textToAnimation, opt);
