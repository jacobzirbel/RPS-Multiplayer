window.onload = () => {
	db.ref("game/players").on("value", (snapshot) => {
		let val = snapshot.val();
		if (!myId) {
			createUserButtons(val);
		}
	});

	db.ref("game/result").on("value", (snapshot) => {
		let result = snapshot.val();
		if (result) {
			// result (eg "Paper covers Rock") is parsed to get game info
			// page knows mySelection (eg 'Paper') so it sets oppSelection to the other (eg 'Rock')
			// Winner is always first word in result, so if the first word of the result is Paper, and mySelection is paper, then I am the winner
			// This is not robust code but it gets the job done
			oppSelection = result.sel.find((e) => e !== mySelection) || mySelection;
			outcome = result.outcome;
			document.getElementById("mySelection").textContent =
				"Selection: " + mySelection;
			document.getElementById("oppSelection").textContent =
				"Selection: " + oppSelection;
			let winner = outcome.split(" ").indexOf(mySelection) ? oppId : myId;
			if (outcome.includes("Nothing")) winner = "No one";
			addToWins(winner);
			addToChat(winner + " wins! " + outcome);
			winner = winner === myId ? "You" : "Opponent";
			document.getElementById("outcome").innerHTML = "Winner: " + winner;
			db.ref("game/result").set({});
			db.ref("game/players/player1/selection").set("");
			db.ref("game/players/player2/selection").set("");
			createButtons();
		}
	});
	db.ref("chat").once("value", (snap) => {});
	db.ref("chat").on("child_added", (snap) => {
		console.log(snap.key);
		let e = { time: snap.key, message: snap.val() };
		let newChat = document.createElement("p");
		newChat.textContent = e.message;
		newChat.setAttribute("class", "chat-message");
		document.getElementById("chat").prepend(newChat);
	});
	db.ref("game/reset").on("value", (snap) => {
		if (snap.val()) location.reload();
		db.ref("game/").child("reset").set("");
	});
	startChatInputListener();
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
let connectionsRef = db.ref("connections");
let connectedRef = db.ref(".info/connected");
let myId, oppId;

const optionClick = (selection) => {
	mySelection = selection;
	document.getElementById("oppSelection").textContent = "Selection: ";
	document.getElementById("mySelection").textContent =
		"Selection: " + mySelection;
	db.ref("game/players")
		.child(myId + "/selection")
		.set(mySelection);
	hideButtons();
	db.ref("game/selection").once("value", (snapshot) => {
		// there is one node in db for 'selection'
		// always set to whichever player selects first
		// game logic is handled by player that selected 2nd
		if (snapshot.val()) {
			play(selection, snapshot.val());
			db.ref("game/selection").set({});
		} else {
			db.ref("game/selection").set(selection);
		}
	});
};
const resetDisplay = () => {
	document.getElementById("mySelection").textContent = "Selection: ";
	document.getElementById("oppSelection").textContent = "Selection: ";
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
				.ref("game/players")
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
	if (winner !== "No one")
		db.ref("game/players/" + winner).once("value", (snapshot) => {
			db.ref("game/players/" + winner + "/wins").set(snapshot.val().wins + 1);
		});
	updateDisplay(true);
};

const updateDisplay = (winsOnly = false) => {
	db.ref("game/players/").once("value", (snapshot) => {
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
	db.ref("game/result").set({
		sel: [oppSelection, mySelection],
		outcome: result,
	});
	addToChat(result);
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
const startChatInputListener = () => {
	document.getElementById("submit").addEventListener("click", () => {
		addToChat(
			(myId || "Guest") + " : " + document.getElementById("message").value
		);
	});
};
const addToChat = (message) => {
	db.ref("chat").child(moment().format("MMDDHHmmss")).set(message);
};
const resetEverything = () => {
	addToChat("users and wins have been reset");
	db.ref("game").set({
		players: {
			player1: { selection: "", wins: 0 },
			player2: { selection: "", wins: 0 },
		},
		selection: "",
		reset: "1",
	});
};
