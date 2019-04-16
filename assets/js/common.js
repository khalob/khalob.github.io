if ('addEventListener' in window) {
	window.addEventListener('load', function() {
	  document.body.className = document.body.className.replace(/\bis-loading\b/, '');
	});
}

function updateTitle(obj) {
	var title = document.getElementById('pagesTitleDiv');
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

//events
$('.page-link a').on('mouseover', function(){
  var $title = $('#titleDiv, #pagesTitleDiv');
  $title.text(this.getAttribute("title"));
});
