window.onload = () => {
	database.ref("players").on("value", (snapshot) => {
		let val = snapshot.val();
		if (!myId) createUserButtons(val);
	});
	database.ref("result").on("value", (snapshot) => {
		result = snapshot.val();
		if (result) {
			oppSelection = result.sel.find((e) => e !== mySelection) || mySelection;
			document.getElementById("mySelection").textContent =
				"Selection: " + mySelection;
			document.getElementById("oppSelection").textContent =
				"Selection: " + oppSelection;
			document.getElementById("outcome").textContent = result.outcome;
			database.ref("result").set({});
		}
	});
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
let connectionsRef = database.ref("/connections");
let connectedRef = database.ref(".info/connected");
let myId, oppId;
const optionClick = (selection) => {
	mySelection = selection;
	hideButtons();
	database.ref("selection").once("value", (snapshot) => {
		if (snapshot.val()) {
			play(selection, snapshot.val());
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

const playerSelect = (selection) => {
	myId = "player" + (selection + 1);
	oppId = "player" + ((selection ? 0 : 1) + 1);
	connectedRef.on("value", (snap) => {
		if (snap.val()) {
			var con = database
				.ref("players")
				.child(myId + "/connected")
				.push(true);
			con.onDisconnect().set({});
		}
	});
	document.getElementById("home").innerHTML = "";

	createButtons();
};

const createUserButtons = (val) => {
	let buttons = [val.player1, val.player2].map((e, i) => {
		let button = document.createElement("button");
		button.disabled = Boolean(e.connected);
		button.textContent = e.name || "Join as user " + (i + 1);
		button.onclick = () => playerSelect(i);
		return button;
	});
	document.getElementById("home").innerHTML = "";
	buttons.forEach((e) => document.getElementById("home").appendChild(e));
};

const play = (mySelection, oppSelection) => {
	let result = gameLogic(mySelection, oppSelection);
	database
		.ref("result")
		.set({ sel: [oppSelection, mySelection], outcome: result[0] });
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
