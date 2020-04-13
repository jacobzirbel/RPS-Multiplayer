window.onload = () => {
	createButtons();
};
let config = {
	apiKey: "AIzaSyDAa_Gey0LPsclpNXIsWqnbiL52J9ApuN0",
	authDomain: "rps-5f79a.firebaseapp.com",
	databaseURL: "https://rps-5f79a.firebaseio.com",
	projectId: "rps-5f79a",
	storageBucket: "rps-5f79a.appspot.com",
};
firebase.initializeApp(config);
let database = firebase.database();
let options = ["Rock", "Paper", "Scissors", "Lizard", "Spock"];
var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");
let selections = { 1: "", 2: "" };

const optionClick = (selection) => {
	mySelection = selection;
	hideButtons();
	database.ref("selection").once("value", (snapshot) => {
		if (snapshot.val()) {
			compare(selection, snapshot.val());
			database.ref("selection").set({});
		} else {
			database.ref("selection").set(selection);
		}
	});
};
const hideButtons = () => {
	document.getElementById("controls").innerHTML = "";
};
const createButtons = () => {
	hideButtons();
	options.forEach((e) => {
		let button = document.createElement("button");
		button.textContent = e;
		button.onclick = () => optionClick(e);
		document.getElementById("controls").appendChild(button);
	});
};
const compare = (mySelection, oppSelection) => {
	let result = gameLogic(mySelection, oppSelection);
	console.log(result);
};
const gameLogic = (mySelection, oppSelection) => {
	a = options.indexOf(mySelection);
	b = options.indexOf(oppSelection);
	if (a === b) return ["tie", "tie"];
	if (a === 0) {
		if (b === 1) return ["Paper covers Rock", false];
		if (b === 2) return ["Rock crushes Scissors", true];
		if (b === 3) return ["Rock crushes Lizard :(", true];
		if (b === 4) return ["Spock vaporizes Rock", false];
	}
	if (a === 1) {
		if (b === 0) return ["Paper covers Rock", true];
		if (b === 2) return ["Scissors cuts Paper", false];
		if (b === 3) return ["Lizard eats Paper", false];
		if (b === 4) return ["Paper disproves Spock", true];
	}
	if (a === 2) {
		if (b === 0) return ["Rock crushes Scissors", false];
		if (b === 1) return ["Scissors cuts Paper", true];
		if (b === 3) return ["Scissors decapitates Lizard :(", true];
		if (b === 4) return ["Spock smashes Scissors", false];
	}
	if (a === 3) {
		if (b === 0) return ["Rock crushes Lizard :(", false];
		if (b === 1) return ["Lizard eats Paper", true];
		if (b === 2) return ["Scissors decapitates Lizard :(", false];
		if (b === 4) return ["Lizard poisons Spock", true];
	}
	if (a === 4) {
		if (b === 0) return ["Spock vaporizes Rock", true];
		if (b === 1) return ["Paper disproves Spock", false];
		if (b === 2) return ["Spock vaporizes Rock", true];
		if (b === 3) return ["Lizard poisons Spock", false];
	}
};
