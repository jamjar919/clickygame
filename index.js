// load dependencies
	var express = require('express');
	var app = express();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);
	var fs = require('fs');

// load necessary variables for system
	var uniqueSocketID = 0;
	// counting # of players seperately to counting a list of connected players is more efficent.
	var players_online = 0;
	var openConnections = [];
	var instructionsStack = [];
	//number of miliseconds per iteration
	var timeMiliPerIteration = 1;
	var clockIteration = 10;
	var playerList = [];

	class Connection {
		constructor(socket, id){
			this.socket = socket;
			this.id = id;
			var openConnections = []; //debatable
			var uniqueSocketID = 0; //debatable
		}
	}

// load game variables (for testing for one player)

	function player(id, socket){
		this.socket = socket;
		this.id = id;
		this.counter = 0;
		this.unlockables = new unlockables(id);
		this.increment = function(number){
			this.counter = this.counter + number;
		}
	}

	function unlockables(id) {
		this.id = id;
		this.timer = false;
		this.multiplier = 1;
		this.check - false;
		this.clock_multiplier = 1000;
		this.clock_increment = 0.001;
		this.clock = false;

		this.incrementMultiplier = function(number){
			this.multiplier = number;
		}
	}

//initiate express
	app.use(express.static('public'));
	var port = 8000;

	app.get("/", function(req, res) {
		res.sendFile(__dirname + "/index.html");
	});

	http.listen(port, function(){
		console.log("Server up on http://localhost:%s", port);
	});

io.on('connect', function(socket){
	var datSocketID = socket.id;
	console.log('client ' + datSocketID + ' has joined the server');
	// console.log(openConnections);

	//send number of players online, to everyone.
	listPlayersOnline("+");

	//adds this socket to the list of players.
	playerList.push(new player(socket.id, socket));

	//print players
	printPlayers();

	//just be weary that each socket represents an individual player.
	socket.on('clicky-instruction', function(instructionPackage){
		var Instruction = JSON.parse(instructionPackage);
		Instruction.id = socket.id; //append socket id so we can process it according to player.
		instructionsStack.push(Instruction);
	});


	socket.on('disconnect', function() {
		// display players online.
		listPlayersOnline("-");

		//remove from player list
		playerList = playerList.filter(function(connections){return connections.id !== datSocketID;});

		//print players
		printPlayers();
	});
});

function printPlayers(){
	for (i = 0; i < playerList.length; i++) {
	    console.log(playerList[i].id);
	}
}

// count the number of players online.
function listPlayersOnline(val){
	if (val == "+"){
		players_online++;
	} else if (val == "-") {
		players_online--;
	}
	io.sockets.emit("players_online", players_online);
}

//finds a player in the Player List
function findPlayer(playerid){
	return playerList.filter(function (element) {
		return element.id === playerid;})[0];
}

// calculate difference and sends it to socket.
function doDifference(user, val){
	//we'll need to find the player in relation to the id.
	user.increment(val);
	sendclockPlayer(user);
}

function sendclockPlayer(player){
	player.socket.emit("send_counter_value", Math.floor(player.counter));
};

//function to parse and manage controls of the inputs
function clickyControl(){
	while (instructionsStack.length != 0){
		console.log("Instruction execeuting");
		var Instruction = instructionsStack.pop();
		usr = findPlayer(Instruction.id);
		switch(Instruction.instruction) {
			// don't have a drone to test.
		    case "CLICK":
		   		doDifference(usr, 1);
		    	// console.log("incremented click");
		    	break;
		   	case "CLOCK":
		   		usr.unlockables.clock = true;
		   		usr.unlockables.clock_increment+= 0.001;
		   		// console.log("clocky enabled");
		   		doDifference(usr, -10);
		   		break;
		    default:
				break;
		}
	}
};

//function that deals wits updating clocks.
function updateClocksForPlayers() {
	for (i = 0; i < playerList.length; i++){
		var user = playerList[i];
		if (user.unlockables.clock == true){
			doDifference(user, user.unlockables.clock_increment);
		}
	}
}

setInterval(updateClocksForPlayers, clockIteration);
setInterval(clickyControl, timeMiliPerIteration);


