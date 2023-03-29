$(document).ready(function () {
	var $board = $('#board');
	var game = new Game({
		$board: $board
  	});
  	game.initiateBoard();
});