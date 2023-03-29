var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var home = require('./routes/home');

app.use('/', express.static('public'));

app.use('/', home);

var rooms = [];


io.on('connection', function(socket){
  	console.log('a user connected');

  	socket.on('join-room', function (room) {
  		var roomsList = io.sockets.adapter.rooms;
     	if (roomsList[room] && roomsList[room]['length'] === 2) {
     		socket.emit('room-full');
      	} else if (roomsList[room]) {
      		socket.join(room);
      		var members = Object.keys(roomsList[room].sockets);
        	var opponent = io.sockets.connected[members[0]];
        	socket.emit('begin-game', socket.id, 2);
        	opponent.emit('begin-game', opponent.id, 1);
        	var p1 = [];
        	var p2 = [];
        	var board = [];

        	for (var i = 0; i < 6; i++) {
        		var arr = [];
        		for (var j = 0; j < 8; j++) {
        			arr.push(false);
        		}
        		p1.push(arr);
        	}

        	for (var i = 0; i < 6; i++) {
        		var arr = [];
        		for (var j = 0; j < 8; j++) {
        			arr.push(false);
        		}
        		p2.push(arr);
        	}


        	for (var i = 0; i < 6; i++) {
        		var arr = [];
        		for (var j = 0; j < 8; j++) {
        			arr.push(false);
        		}
        		board.push(arr);
        	}

        	rooms.push({
        		room: room,
        		p1: opponent.id,
        		p2: socket.id,
        		turn: 1,
        		p1Board: p1,
        		p2Board: p2,
        		board: board,
        	});
      	} else {
      		socket.join(room);
      	}
  	});

	var Check = false;

	socket.on("checkboxValueChanged", function(checked) {
	Check = checked;
	});
	  

  	socket.on('update-state', function (room, player, row, col) {
  		for (var i = 0; i < rooms.length; i++) {
  			var gameRoom = rooms[i];
  			if (gameRoom.turn === player) {
	  			var currTurn;
	  			if (gameRoom.room === room) {
	  				if (gameRoom.turn === 1) {
	  					currTurn = 1;
	  					rooms[i].turn = 2;
	  				} else {
	  					currTurn = 2;
	  					rooms[i].turn = 1;
	  				}
		  			var playerID;
		  			var opponentID;
		  			if (player === 1) {
		  				playerID = rooms[i]['p1'];
		        		opponentID = rooms[i]['p2'];
		  			} else {
		  				playerID = rooms[i]['p2'];
		  				opponentID = rooms[i]['p1'];
		  			}

		  			var r = 0;

		  			for (var k = 0; k < 6; k++) {
		  				if (rooms[i]['board'][k][col]) {
		  					break;
		  				}
		  				r++;
		  			}

		  			r = r - 1;

		  			if (r === -1) {
		  				r = 0;
		  			}
					if (Check) {
						if (currTurn === 1) {
							rooms[i]['p1Board'][r][col] = true;
							rooms[i]['p2Board'][r][col] = false;
							rooms[i]['board'][r][col] = true;	  				 				
						} else {
							rooms[i]['p2Board'][r][col] = true;
							rooms[i]['p1Board'][r][col] = false;	  				
							 rooms[i]['board'][r][col] = true;
						}
						if (player === 1) {
							player2 = 2;
						}
						else {
							player2 = 1;
						}
						io.to(playerID).emit('color-cell', r, col, player2);
						io.to(opponentID).emit('color-cell', r, col, player2);
					}
					else{
		  			if (currTurn === 1) {
		  				rooms[i]['p1Board'][r][col] = true;
		  				rooms[i]['p2Board'][r][col] = false;
		  				rooms[i]['board'][r][col] = true;	  				 				
		  			} else {
		  				rooms[i]['p2Board'][r][col] = true;
		  				rooms[i]['p1Board'][r][col] = false;	  				
	   					rooms[i]['board'][r][col] = true;
		  			}
					io.to(playerID).emit('color-cell', r, col, player);
	  				io.to(opponentID).emit('color-cell', r, col, player);
				}

	  				io.to(playerID).emit('update-turn', rooms[i], rooms[i]['p1Board'][5]);
	  				io.to(opponentID).emit('update-turn', rooms[i], rooms[i]['p1Board'][5]);

	  				if (currTurn === 1) {
		   				if (checkWinCondition(rooms[i]['p1Board'])) {
		  					io.to(playerID).emit('win');
		  					io.to(opponentID).emit('lose');
		  				} else if (checkGameOver(rooms[i]['board'])) {
		  					io.to(playerID).emit('tie');
		  					io.to(opponentID).emit('tie');
		  				}
		  			} else {
		   				if (checkWinCondition(rooms[i]['p2Board'])) {
		  					io.to(playerID).emit('win');
		  					io.to(opponentID).emit('lose');
		  				} else if (checkGameOver(rooms[i]['board'])) {
		  					io.to(playerID).emit('tie');
		  					io.to(opponentID).emit('tie');
		  				}
		  			}	
	  			}
  			} else {
  				if (gameRoom.room == room) {
  					socket.emit('patience');
  				}
  			}
  		}
  	});
	

  	var checkWinCondition = function (board) {
  		for (var i = 0; i < 3; i++) {
  			for (var j = 0; j < 8; j++) {
  				if (board[i][j] && board[i+1][j] && board[i+2][j] && board[i+3][j]) {
  					return true;
  				}
  			}
  		}
  		for (var i = 0; i < 6; i++) {
  			for (var j = 0; j < 5; j++) {
  				if (board[i][j] && board[i][j+1] && board[i][j+2] && board[i][j+3]) {
  					return true;
  				}
  			}
  		}
  		for (var i = 0; i < 3; i++) {
  			for (var j = 0; j < 5; j++) {
  				if (board[i][j] && board[i+1][j+1] && board[i+2][j+2] && board[i+3][j+3]) {
  					return true;
  				}
  			}
  		}
  		for (var i = 4; i < 6; i++) {
  			for (var j = 0; j < 5; j++) {
  				if (board[i][j] && board[i-1][j+1] && board[i-2][j+2] && board[i-3][j+3]) {
  					return true;
  				}
  			}
  		}
  		return false;
  	}

  	var checkGameOver = function (board) {
  		for (var i = 0; i < 6; i++) {
  			for (var j = 0; j < 8; j++) {
  				if (!board[i][j]) {
  					return false;
  				}
  			}
  		}
  		return true;
  	}

	  socket.on('chat-message', function (message) {
		io.emit('chat-message', message);
	  });

});

var port = process.env.PORT || 3000;
http.listen(port, function () {
  console.log('listening on port ' + port);
});