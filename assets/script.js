window.onload = () => {
	db.ref("players").on("value", (snapshot) => {
		let val = snapshot.val();
		if (!myId) {
			createUserButtons(val);
		}
	});
	db.ref("result").on("value", (snapshot) => {
		let result = snapshot.val();
		if (result) {
			oppSelection = result.sel.find((e) => e !== mySelection) || mySelection;
			outcome = result.outcome;
			document.getElementById("mySelection").textContent =
				"Selection: " + mySelection;
			document.getElementById("oppSelection").textContent =
				"Selection: " + oppSelection;
			let winner = outcome.split(" ").indexOf(mySelection) ? oppId : myId;
			if (outcome.includes("Nothing")) winner = "It's a tie";
			addToWins(winner);
			document.getElementById("outcome").innerHTML =
				"Winner: " + winner + "<br>" + outcome;
			db.ref("result").set({});
			db.ref("players/player1/selection").set("");
			db.ref("players/player2/selection").set("");
			createButtons();
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
let db = firebase.database();
let options = ["Rock", "Paper", "Scissors", "Lizard", "Spock"];
let connectionsRef = db.ref("/connections");
let connectedRef = db.ref(".info/connected");
let myId, oppId;

const optionClick = (selection) => {
	mySelection = selection;
	document.getElementById("oppSelection").textContent = "Selection: ";
	document.getElementById("mySelection").textContent =
		"Selection: " + mySelection;
	db.ref("players")
		.child(myId + "/selection")
		.set(mySelection);
	hideButtons();
	db.ref("selection").once("value", (snapshot) => {
		if (snapshot.val()) {
			play(selection, snapshot.val());
			db.ref("selection").set({});
		} else {
			db.ref("selection").set(selection);
		}
	});
};
const resetDisplay = () => {
	document.getElementById("mySelection").textContent = "";
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
			var con = db
				.ref("players")
				.child(myId + "/connected")
				.push(true);
			con.onDisconnect().set({});
		}
	});
	createButtons();
	updateDisplay();
	document.getElementById("home").innerHTML = "";
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

const addToWins = (winner) => {
	if (!winner.includes("tie"))
		db.ref("players/" + winner).once("value", (snapshot) => {
			db.ref("players/" + winner + "/wins").set(snapshot.val().wins + 1);
		});
	updateDisplay(true);
};

const updateDisplay = (winsOnly = false) => {
	db.ref("players/").once("value", (snapshot) => {
		let val = snapshot.val()[myId];
		document.getElementById("oppWins").textContent =
			"Wins: " + snapshot.val()[oppId].wins;
		document.getElementById("myWins").textContent = "Wins: " + val.wins;
		if (!winsOnly) {
			document.getElementById("mySelection").textContent =
				"Selection: " + val.selection;
			if (val.selection) {
				mySelection = val.selection;
				hideButtons();
			}
		}
	});
};
const play = (mySelection, oppSelection) => {
	let result = gameLogic(mySelection, oppSelection);
	db.ref("result").set({
		sel: [oppSelection, mySelection],
		outcome: result,
	});
};

const gameLogic = (mySelection, oppSelection) => {
	a = options.indexOf(mySelection);
	b = options.indexOf(oppSelection);
	if (a === b) return "Nothing nothings Nothing";
	if (a === 0) {
		if (b === 1) return "Paper covers Rock";
		if (b === 2) return "Rock crushes Scissors";
		if (b === 3) return "Rock crushes Lizard :(";
		if (b === 4) return "Spock vaporizes Rock";
	}
	if (a === 1) {
		if (b === 0) return "Paper covers Rock";
		if (b === 2) return "Scissors cuts Paper";
		if (b === 3) return "Lizard eats Paper";
		if (b === 4) return "Paper disproves Spock";
	}
	if (a === 2) {
		if (b === 0) return "Rock crushes Scissors";
		if (b === 1) return "Scissors cuts Paper";
		if (b === 3) return "Scissors decapitates Lizard :(";
		if (b === 4) return "Spock smashes Scissors";
	}
	if (a === 3) {
		if (b === 0) return "Rock crushes Lizard :(";
		if (b === 1) return "Lizard eats Paper";
		if (b === 2) return "Scissors decapitates Lizard :(";
		if (b === 4) return "Lizard poisons Spock";
	}
	if (a === 4) {
		if (b === 0) return "Spock vaporizes Rock";
		if (b === 1) return "Paper disproves Spock";
		if (b === 2) return "Spock vaporizes Rock";
		if (b === 3) return "Lizard poisons Spock";
	}
};
