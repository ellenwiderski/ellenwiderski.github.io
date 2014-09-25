funfact = function() {
	myFact = document.createElement("p")
	myFact.innerHTML = factarray[count];
	funfacts = document.getElementById("funfacts")
	if (funfacts.childElementCount > 1) {
		funfacts.removeChild(funfacts.childNodes[3]);
	}
	funfacts.appendChild(myFact);
	if (count < 9) count+=1;
	else count = 0;
}

count = 0;
factarray = ["I'm in a band",
			"I have a pet turtle, hedgehog, and goldfish",
			"Danger is not my middle name",
			"I own at least four pairs of wool socks",
			"My car is blue",
			"I know Curtis, the Fresh Prince of Mill-er",
			"Everything I own is purple",
			"I have over 25 favorite movies",
			"I like multiples of five",
			"I am a huge fan"]