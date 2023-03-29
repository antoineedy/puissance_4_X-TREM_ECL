var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

router.post('/', function (req, res) {
	res.sendFile(__dirname + '/gameBoard.html');
});

module.exports = router;