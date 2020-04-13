let config = {
	apiKey: "AIzaSyDAa_Gey0LPsclpNXIsWqnbiL52J9ApuN0",
	authDomain: "rps-5f79a.firebaseapp.com",
	databaseURL: "https://rps-5f79a.firebaseio.com",
	projectId: "rps-5f79a",
	storageBucket: "rps-5f79a.appspot.com",
};
firebase.initializeApp(config);

const gameLogic = (mySelection, oppSelection) => {
	a = options.indexOf(mySelection);
	b = options.indexOf(oppSelection);
	if (a === b) return ["tie", "tie"];
	if (a === 0) {
		if (b === 1) return ["Paper covers Rock", oppId];
		if (b === 2) return ["Rock crushes Scissors", myId];
		if (b === 3) return ["Rock crushes Lizard :(", myId];
		if (b === 4) return ["Spock vaporizes Rock", oppId];
	}
	if (a === 1) {
		if (b === 0) return ["Paper covers Rock", myId];
		if (b === 2) return ["Scissors cuts Paper", oppId];
		if (b === 3) return ["Lizard eats Paper", oppId];
		if (b === 4) return ["Paper disproves Spock", myId];
	}
	if (a === 2) {
		if (b === 0) return ["Rock crushes Scissors", oppId];
		if (b === 1) return ["Scissors cuts Paper", myId];
		if (b === 3) return ["Scissors decapitates Lizard :(", myId];
		if (b === 4) return ["Spock smashes Scissors", oppId];
	}
	if (a === 3) {
		if (b === 0) return ["Rock crushes Lizard :(", oppId];
		if (b === 1) return ["Lizard eats Paper", myId];
		if (b === 2) return ["Scissors decapitates Lizard :(", oppId];
		if (b === 4) return ["Lizard poisons Spock", myId];
	}
	if (a === 4) {
		if (b === 0) return ["Spock vaporizes Rock", myId];
		if (b === 1) return ["Paper disproves Spock", oppId];
		if (b === 2) return ["Spock vaporizes Rock", myId];
		if (b === 3) return ["Lizard poisons Spock", oppId];
	}
};
