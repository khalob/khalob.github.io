      if ('addEventListener' in window) {
        window.addEventListener('load', function() {
          document.body.className = document.body.className.replace(/\bis-loading\b/, '');
        });
      }

      var projectButton = document.getElementById('projectButton'); // Assumes element with id='button'
      var projects = document.getElementById('projWrapper')
      projects.style.visibility = 'hidden'; //Default invisible

      projectButton.onclick = function() {
        var div = document.getElementById('projWrapper');
        div.style.visibility = 'visible';
        div.classList.toggle("closed");
      };

      var bubble = document.getElementById('contactButton'); // Assumes element with id='contactButton'
      //document.getElementById('emailBubble').style.display = 'none'; //Default invisible

      bubble.onclick = closeDiv;

      function closeDiv() {
        var div = document.getElementsByClassName('bubbleWrapper')[0];
        div.classList.toggle("closed");

      }
	  
      var copyTextareaBtn = document.getElementById('js-textareacopybtn'); // Assumes element with id='js-textareacopybtn'
	  
      copyTextareaBtn.onclick = function() {
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

      function updateTitle(obj) {
        var title = document.getElementById('titleDiv');
        title.innerHTML = obj.children[0].getAttribute("title");
      }

      function highlight(obj) {
        obj.children[0].setAttribute("style", "background-color: #2098d1; color: white;");
      }