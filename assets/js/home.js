  var projectButton = document.getElementById('projectButton'); // Assumes element with id='button'
  var projects = document.getElementById('projWrapper')
  projects.style.visibility = 'hidden'; //Default invisible
  var bubble = document.getElementById('contactButton'); // Assumes element with id='contactButton'
  bubble.onclick = closeDiv;
  var copyTextareaBtn = document.getElementById('js-textareacopybtn'); // Assumes element with id='js-textareacopybtn'
  
  projectButton.onclick = function() {
	var div = document.getElementById('projWrapper');
	div.style.visibility = 'visible';
	div.classList.toggle("closed");
  };
  
  function closeDiv() {
	var div = document.getElementsByClassName('bubbleWrapper')[0];
	div.classList.toggle("closed");
  }
  
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

  function highlight(obj) {
	obj.children[0].setAttribute("style", "background-color: #2098d1; color: white;");
  }
  
  if ('addEventListener' in window) {
	window.addEventListener('load', function() {
	  document.body.className = document.body.className.replace(/\bis-loading\b/, '');
	});
  }
  
   function updateTitle(obj) {
	var title = document.getElementById('titleDiv');
	title.innerHTML = obj.children[0].getAttribute("title");
  }
  
  function fetchRepoLastUpdated() {
        var repoLastUpdated = "Last updated: May 20, 2017";
        $.ajax({
            type: "GET",
            url: "https://api.github.com/repos/khalob/khalob.github.io",
            success: function(data){
              //Retrieve the last push time to the repo for update time
              repoLastUpdated = new Date(Date.parse(data.pushed_at)).toString();
			  var wordsOfDate = repoLastUpdated.split(" ");
			  var formmatedDate = wordsOfDate[1] + " " + wordsOfDate[2] + ", " + wordsOfDate[3]
			  var curDateDiv = document.getElementById('curDate');
			  curDateDiv.innerHTML = "Last updated: " + formmatedDate;
            },
            //On complete fail return err and set to sometime today
            failure: function(errMsg) {
                console.log(err);
                repoLastUpdated = "Last updated: May 20, 2017";
            }
        });
  }
  
fetchRepoLastUpdated();