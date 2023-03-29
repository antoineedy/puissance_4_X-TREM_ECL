var socket = io();
var player = 0;
var myRoom;
var myBoard = [];

var Game = function (board) {
	myGame = this;
	this.$board = board.$board;
}


Game.prototype.initiateBoard = function () {
	for (var i = 0; i < 6; i++) {
		var $newRow = $('<div>');
		for (var j = 0; j < 8; j++) {
			var $newCol = $('<div>');
			$newCol.attr({
				row: i,
				col: j
			});
			$newCol.addClass('cell');
			$newRow.append($newCol);
		}
		$newRow.addClass('row');
		$('#board').append($newRow);
	}

	$('.cell').on('click', function () {
		var row = $(this).attr('row');
		var col = $(this).attr('col');
		console.log('Row: ' + row + ', Col:' + col);
	});

	$('.cell').on('click', this.clicked);

	$('#room-submit').on('click', function (e) {
	    var room = $('#room-input').val();
	    $('#room-id').html('ID de la salle : ' + room);
	    socket.emit('join-room', room);
	    myRoom = room;
	    $('#room-input').val('');
  	});

}

Game.prototype.clicked = function (e) {
	var cell = e.target;
	var row = $(cell).attr('row');
	var col = $(cell).attr('col');

	socket.emit('update-state', myRoom, player, row, col);
}



socket.on('room-full', function () {
	$('.room-full').css('display', 'inline');
	console.log('La salle est pleine, reviens plus tard !');
});

const checkbox = document.getElementById("delete-row");

var CheChe = false;

checkbox.addEventListener("change", function() {
	const checked = checkbox.checked; // récupérer la valeur de la case à cocher
	socket.emit("checkboxValueChanged", checked); // envoyer la valeur via socket.io
	console.log("c'est la big str");
	console.log(checked);
	CheChe = checked;
  });
  

socket.on('win', function () {
	console.log('You win!');
	$('.victory').css('display', 'block');
	$('#begin-title').css('display', 'none');
	$('#player-id').css('display', 'none');
	$('#turn-id').css('display', 'none');
	socket.disconnect();
});

socket.on('lose', function () {
	console.log('You lose!');
	$('.defeat').css('display', 'block');
	$('#begin-title').css('display', 'none');
	$('#player-id').css('display', 'none');
	$('#turn-id').css('display', 'none');
	socket.disconnect();
});

socket.on('tie', function () {
	console.log('You tied!');
	$('.tie').css('display', 'block');
	$('#begin-title').css('display', 'none');
	$('#player-id').css('display', 'none');
	$('#turn-id').css('display', 'none');
	socket.disconnect();
});

socket.on('patience', function () {
	console.log('Patience hit');
	$('#patience').css('display', 'inline');
	setTimeout(function () {
		$('#patience').css('display', 'none');
	}, 3000);
});

socket.on('begin-game', function (id, num) {
	$('#begin-title').css('display', 'block');
	$('#room-title').css('display', 'none');
	$('#room-input').css('display', 'none');
	$('#room-submit').css('display', 'none');
	player = num;
	console.log('Player number: ' + num);
	$('#player-id').html('Tu es le joueur ' + num);
	$('#turn-id').html('Au tour du joueur 1 !');	
});

socket.on('update-turn', function (room, check) {
	$('#turn-id').html('Au tour du joueur ' + room['turn'] + '!');
});


socket.on('color-cell', function (r, c, turn) {
	var $cell = $('.cell');
	$cell.each(function () {
		var row = $(this).attr('row');
		var col = $(this).attr('col');
		if (row == r && col == c) {
			if (turn === 1) {
				$(this).addClass('p1');
			} else {
				$(this).addClass('p2');
			}
		}
	});
});

socket.on('error', function(e) {
	console.log('Hit error: ' + e);
});

$('#chat form').submit(function (e) {
	e.preventDefault();
	var message = {
	  text : $('#m').val()
	};
	$('#m').val('');
	if (message.text.trim().length !== 0) { // Gestion message vide
	  socket.emit('chat-message', message);
	}
	$('#chat input').focus(); // Focus sur le champ du message
  });
  
  /**
   * Réception d'un message
   */
  socket.on('chat-message', function (message) {
	console.log('Message: ' + message.text)
	$('#messages').append($('<li>').text(message.text));
  });
  
