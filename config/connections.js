var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

class Connections {
	constructor(){
		//list that contains players online
		this.player_list = [];
	};
	addPlayer(player){
		this.player_list.push(player);
	}
	findPlayer(playerid){
		return this.player_list.filter(function (element) {
			return element.id === playerid;
		})[0];
	}
	listPlayers(){
		console.log("currently online");
		for (i = 0; i < this.player_list.length; i++) {
		    console.log(this.player_list[i].id);
		}
	}
	listPlayersOnline(){
		io.sockets.emit("players_online", this.noPlayers());
	}
	noPlayers(){
		return this.player_list.length;
	}
	sendPlayerList(){
		return this.player_list;
	}
	removePlayerFromList(socket_id){
		this.player_list = this.player_list.filter(
			function(player){
				return player.id !== socket_id;
			}
		);
	}
}
module.exports = new Connections();