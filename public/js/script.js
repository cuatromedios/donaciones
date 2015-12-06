// JavaScript Document
function showmenu() {
	nav = document.getElementById("nav");
	navcontainer = document.getElementById("navcontainer");
	if (nav.style.height == "0px" || !nav.style.height) {
		nav.style.height = navcontainer.offsetHeight+"px";	
	} else {
		nav.style.height = "0px";	
	}
}
function showquestion(id) {
	question = document.getElementById("question"+id);
	questioncontainer = document.getElementById("question"+id+"container");
	if (question.style.height == "0px" || !question.style.height) {
		question.style.height = questioncontainer.offsetHeight+"px";	
	} else {
		question.style.height = "0px";	
	}
}