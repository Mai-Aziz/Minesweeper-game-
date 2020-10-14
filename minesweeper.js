function Cell(row, column, opened, flagged, mined, neighborMineCount) {
	return {
		id: row + "" + column,
		row: row,
		column: column,
		opened: opened,
		flagged: flagged,
		mined: mined,
		neighborMineCount: neighborMineCount
	}
}

function Board(boardSize, mineCount) {
	var board = {};
	for (var row = 0; row < boardSize; row++) {
		for (var column = 0; column < boardSize; column++) {
			board[row + "" + column] = Cell(row, column, false, false, false, 0);
		}
	}
	board = placingMines(board, mineCount);
	board = calculateNeighborMineCounts(board, boardSize);
	return board;
}

var placingMines = function (board, mineCount) {
	var mineArray = [];
	for (var i = 0; i < mineCount; i++) {
		var randomRow = getRandomNumber(0, boardSize);
		var randomColumn = getRandomNumber(0, boardSize);
		var cell = randomRow + "" + randomColumn;
		while (mineArray.includes(cell)) {
			randomRow = getRandomNumber(0, boardSize);
			randomColumn = getRandomNumber(0, boardSize);
			cell = randomRow + "" + randomColumn;
		}
		mineArray.push(cell);
		board[cell].mined = true;
	}
	return board;
}

var calculateNeighborMineCounts = function (board, boardSize) {
	var cell;
	var neighborMineCount = 0;
	for (var row = 0; row < boardSize; row++) {
		for (var column = 0; column < boardSize; column++) {
			var id = row + "" + column;
			cell = board[row + "" + column];
			if (!cell.mined) {
				var neighbors = getNeighbors(id);
				neighborMineCount = 0;
				for (var i = 0; i < neighbors.length; i++) {
					neighborMineCount += isMined(board, neighbors[i]);
				}
				cell.neighborMineCount = neighborMineCount;
			}
		}
	}
	return board;
}

var getNeighbors = function (id) {
	var row = parseInt(id[0]);
	var column = parseInt(id[1]);
	var neighbors = [];
	neighbors.push((row - 1) + "" + (column - 1));
	neighbors.push((row - 1) + "" + column);
	neighbors.push((row - 1) + "" + (column + 1));
	neighbors.push(row + "" + (column - 1));
	neighbors.push(row + "" + (column + 1));
	neighbors.push((row + 1) + "" + (column - 1));
	neighbors.push((row + 1) + "" + column);
	neighbors.push((row + 1) + "" + (column + 1));

	for (var i = 0; i < neighbors.length; i++) { //for cells at the borders
		if (neighbors[i].length > 2) {
			neighbors.splice(i, 1);
			i--;
		}
	}

	return neighbors
}

var getCellColor = function (number) {
	var color = 'black';
	if (number === 1) {
		color = 'blue';
	}
	else if (number === 2) {
		color = 'green';
	}
	else if (number === 3) {
		color = 'orange';
	}
	else if (number === 4) {
		color = 'red';
	}
	return color;
}

var isMined = function (board, id) {
	var cell = board[id];
	var mined = 0;
	if (typeof cell !== 'undefined') {
		if (cell.mined) {
			mined = 1;
		}
		else {
			mined = 0;
		}
	}
	return mined;
}

var getRandomNumber = function (min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

var newGame = function (boardSize, mines) {
	minesRemaining = mines;
	gameOver = false;
	timer = 0;

	$('#time').text("0");
	$('button').css('background', 'url("assets/face.png")');
	$('#mines-remaining').text(minesRemaining);

	initializeCells(boardSize);
	board = Board(boardSize, mines);
	clearInterval(timeout);
	timeout = setInterval(function () {
		timer++;
		if (timer >= 999) {
			board = newGame(boardSize, mines);
		}
		$('#time').text(timer);
	}, 1000);

	return board;
}

var initializeCells = function (boardSize) {
	var row = 0;
	var column = 0;
	$(".cell").each(function () {
		$(this).attr("id", row + "" + column).css('color', 'black').text("");
		$('#' + $(this).attr("id")).css({
			'background-image':
				'radial-gradient(#c5c5c5,#b4b4b4)', 'box-shadow': '2px 2px 1px 1px white .7'
		});
		column++;
		if (column >= boardSize) { //move from row to the next one
			column = 0;
			row++;
		}

		$(this).off().click(function (e) {
			handleClick($(this).attr("id"));
			var isVictory = true;
			var cellsId = Object.keys(board);
			for (var i = 0; i < cellsId.length; i++) {
				if (!board[cellsId[i]].mined) {
					if (!board[cellsId[i]].opened) {
						isVictory = false;
						break;
					}
				}
			}

			if (isVictory) {
				gameOver = true;
				clearInterval(timeout);
			}
		});

		$(this).contextmenu(function (e) {
			handleRightClick($(this).attr("id"));
			return false;
		});
	})
}

var handleClick = function (id) {
	if (!gameOver) {
			var cell = board[id];
			var $cell = $('#' + id);
			if (!cell.opened) {
				if (!cell.flagged) {
					if (cell.mined) {
						loss();
						$cell.html(MINE).css('color', 'red');
					}
					else {
						cell.opened = true;
						if (cell.neighborMineCount > 0) {
							var color = getCellColor(cell.neighborMineCount);
							$cell.html(cell.neighborMineCount).css('color', color);
							$cell.html(cell.neighborMineCount).css({ 'background-image': 'radial-gradient(#e6e6e6,#c9c7c7)' });
						}
						else {
							$cell.html("")
								.css('background-image', 'radial-gradient(#e6e6e6,#c9c7c7)');
							var neighbors = getNeighbors(id);
							for (var i = 0; i < neighbors.length; i++) {
								var neighbor = neighbors[i];
								if (typeof board[neighbor] !== 'undefined' &&
									!board[neighbor].flagged && !board[neighbor].opened) {
									handleClick(neighbor); // recursion call
								
							}
						}
					}
				}
			}
		}
	}
}

var handleRightClick = function (id) {
	if (!gameOver) {
		var cell = board[id];
		var $cell = $('#' + id);
		if (!cell.opened) {
			if (!cell.flagged && minesRemaining > 0) {
				cell.flagged = true;
				$cell.html(FLAG).css('color', 'red');
				minesRemaining--;
			}
			else if (cell.flagged) {
				cell.flagged = false;
				$cell.html("").css('color', 'black');
				minesRemaining++;
			}

			$('#mines-remaining').text(minesRemaining);
		}
	}
}

var loss = function () {
	gameOver = true;
	$('button').css('background', 'url("assets/face_loss.png")');

	var cells = Object.keys(board);
	for (var i = 0; i < cells.length; i++) {
		if (board[cells[i]].mined && !board[cells[i]].flagged) {
			$('#' + board[cells[i]].id).html(MINE)
				.css('color', 'black');
		}
	}
	clearInterval(timeout);
}



var FLAG = "&#9873;";
var MINE = "&#9881;";
var boardSize = 9;
var mines = 10;
var timer = 0;
var timeout;
var minesRemaining;

$(document).keydown(function (event) {
	if (event.ctrlKey)
		ctrlIsPressed = true;
});

$(document).keyup(function () {
	ctrlIsPressed = false;
});

var ctrlIsPressed = false;
var board = newGame(boardSize, mines);

$('#new-game-button').click(function () {
	board = newGame(boardSize, mines);
})