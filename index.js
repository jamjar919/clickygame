// load dependencies
	var express = require('express');
	var app = express();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);
	var fs = require('fs');

// load necessary variables for system
	var uniqueSocketID = 0;
	var openConnections = [];
	var instructionsStack = [];
	//number of miliseconds per iteration
	var timeMiliPerIteration = 1;

	class Connection {
		constructor(socket, id){
			this.socket = socket;
			this.id = id;
			var openConnections = []; //debatable
			var uniqueSocketID = 0; //debatable
		}
	}

// load game variables (for testing for one player)
	var game_counter = 0;
	var clocky = false;
	var clocky_multiplier = 1000;
	var check = false;

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
	var thisSocketID = uniqueSocketID;
	uniqueSocketID++;

	openConnections.push(new Connection(uniqueSocketID,thisSocketID));
	console.log('client ' + thisSocketID + ' has joined the server');
	console.log(openConnections);


	socket.on('clicky-instruction', function(instructionPackage){
		var Instruction = JSON.parse(instructionPackage);
		instructionsStack.push(Instruction);
		clicky_mechanics();

		sendclock(socket);
	});


	socket.on('disconnect', function() {
		console.log('client ' + thisSocketID + ' has left the server; ' + openConnections.length + ' connections left.');

		openConnections = openConnections.filter(function(openConnections){
			return openConnections.id !== thisSocketID;
		});
	});
});

function sendclock(socket){
	socket.emit("send_counter_value", game_counter);
};

//function to parse and manage controls of the inputs
function clickyControl(){
	while (instructionsStack.length != 0){
		console.log("Instruction execeuting");
		var Instruction = instructionsStack.pop();
		switch(Instruction.instruction) {
			// don't have a drone to test.
		    case "CLICK":
		   		game_counter++;
		    	console.log("incremented click");
		    	break;
		   	case "COUNT":
		   		clocky = true;
		   		console.log("clocky enabled");
		   		game_counter = game_counter - 10;
		   		break;
		   	case "ANIMATE_CIRCLE":
		   		break;
		   	case "ANIMATE_RECTANGLE":
		   		break;
		   	case "ANIMATE_PENTAGON":
		   		break;
		    default:
				break;
		}
	}
};

//function that deals with
function clocky(){
	while (clocky == true){
		setInterval(upclick(), clocky_multiplier);
	}
}

//function to manage multipliers and incrementers
function clicky_mechanics(){
}

while (clocky == true){
	setInterval(upclick(), clocky_multiplier);
	sendclock(socket);
}

setInterval(clickyControl, timeMiliPerIteration);


