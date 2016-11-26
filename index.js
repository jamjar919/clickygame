// load dependencies
	var express = require('express');
	var app = express();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);
	var fs = require('fs');

// load necessary variables for system
	var conn = require('./config/connections.js');
	// var player = require('./config/player.js');
	var instructionsStack = [];
	//number of miliseconds per iteration
	const timeMiliPerIteration = 1;
	const clockIteration = 10;
	var playerList = [];

	// class Connection {
	// 	// var connectionList = [];
	// 	constructor(socket, id){
	// 		this.socket = socket;
	// 		this.id = id;
	// 		// var openConnections = []; //debatable
	// 		// var uniqueSocketID = 0; //debatable
	// 	}
	// }

	// class Connections {
	// 	constructor(){
	// 		//list that contains players online
	// 		this.player_list = [];
	// 	};
	// 	addPlayer(player){
	// 		this.player_list.push(player);
	// 	}
	// 	findPlayer(playerid){
	// 		return this.player_list.filter(function (element) {
	// 			return element.id === playerid;
	// 		})[0];
	// 	}
	// 	listPlayers(){
	// 		console.log("currently online");
	// 		for (i = 0; i < this.player_list.length; i++) {
	// 		    console.log(this.player_list[i].id);
	// 		}
	// 	}
	// 	listPlayersOnline(){
	// 		io.sockets.emit("players_online", this.noPlayers());
	// 	}
	// 	noPlayers(){
	// 		return this.player_list.length;
	// 	}
	// 	sendPlayerList(){
	// 		return this.player_list;
	// 	}
	// 	removePlayerFromList(socket_id){
	// 		this.player_list = this.player_list.filter(
	// 			function(player){
	// 				return player.id !== socket_id;
	// 			}
	// 		);
	// 	}
	// }

	class player {
		constructor(id, socket){
			//generate random name.
			this.name = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
			this.socket = socket;
			this.id = id;
			this.counter = 0;
			this.unlockables = new unlockables(id);
			this.requirements = new unlockables_costs(id);
		}
		increment(number){
			this.counter = this.counter + number;
		}
		sendCounter(){
			this.socket.emit("send_counter_value", this.counter);
		}
		sendPlayerProperties(){
			this.socket.emit("player_properties", this.name);
		}
		sendUnlockableRequirements(){
			this.socket.emit("player_unlockable_requirements", this.requirements);
		}
	}

	// unlockables class
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

	//unlockables costs class
	function unlockables_costs(id){
		this.clock = 5;
		this.multiplier = 10;
		this.tenx = 1000;
		this.increaseClockCost = function(){
			this.clock = Math.pow(2.11/2, this.clock);
			// n = this.clock;
			// this.clock = (n^3 * (100-n))/(50);
		}
		this.increasetenxCost = function(){
			this.tenx = this.tenx ^ (3/2);
			// this.tenx = (n^3 * (150-n))/(50);
			// this.tenx = this.tenx * Math.log(this.tenx)/Math.log(10);
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


//initialise connections
// var conn = new Connections();

io.on('connect', function(socket){
	var datSocketID = socket.id;
	console.log('client ' + datSocketID + ' has joined the server');

	//initialise player class
	var socket_player = new player(socket.id, socket);
	socket_player.sendPlayerProperties();

	//add player to connections
	conn.addPlayer(socket_player);

	//print players
	conn.listPlayers();
	conn.listPlayersOnline();

	//initialise player requirements on client
	socket_player.sendUnlockableRequirements();

	socket.on('clicky-instruction', function(instructionPackage){
		var Instruction = JSON.parse(instructionPackage);
		//append socket id so we can process it according to player.
		Instruction.id = socket.id;
		instructionsStack.push(Instruction);
	});

	socket.on('disconnect', function() {
		//remove it from connections list
		conn.removePlayerFromList(datSocketID);
		//print players
		conn.listPlayers();
		conn.listPlayersOnline();
	});
});

// calculate difference and sends it to socket.
function doDifference(user, val){
	//we'll need to find the player in relation to the id.
	user.increment(val);
	user.sendCounter();

}

//function to parse and manage controls of the inputs
function clickyControl(){
	while (instructionsStack.length != 0){
		// console.log("Instruction execeuting");
		var Instruction = instructionsStack.pop();
		usr = conn.findPlayer(Instruction.id);
		switch(Instruction.instruction) {
		    case "CLICK":
		   		doDifference(usr, 1 * usr.unlockables.multiplier);
		    	// console.log("incremented click");
		    	break;
		   	case "CLOCK":
		   		if (usr.counter >= usr.requirements.clock){
		   			usr.unlockables.clock = true;
		   			doDifference(usr, -usr.requirements.clock);
		   			usr.requirements.increaseClockCost();
		   			usr.sendUnlockableRequirements();
		   		}
		   		// console.log("clocky enabled");
		   		break;
		   	case "10X":
		   		if (usr.counter >= usr.requirements.tenx){
			   		doDifference(usr, -usr.requirements.tenx);
			   		usr.requirements.increasetenxCost();
			   		usr.sendUnlockableRequirements();
			   	}
		    default:
				break;
		}
	}
};

//function that deals with updating clocks.
function updateClocksForPlayers() {
	for (i = 0; i < conn.noPlayers(); i++){
		var user = conn.sendPlayerList()[i];
		if (user.unlockables.clock == true){
			doDifference(user, user.unlockables.clock_increment);
		}
	}
}

setInterval(updateClocksForPlayers, clockIteration);
setInterval(clickyControl, timeMiliPerIteration);