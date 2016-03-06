'use strict';

let os = require('os');

const EMPTLY_PLAYER = 0;

let board = [
	0, 0, 0,
	0, 0, 0,
	0, 0, 0
];





function playSymbol(playerId){
	if(true){ return playerId; }
	if(playerId == EMPTLY_PLAYER){ return '-'; }
	if(playerId == 1){ return 'X'; }
	if(playerId == 2){ return 'O'; }
	throw Error('unknown player id: ' + playerId + ' ' + (typeof playerId));
}

function showBoard(board, path){
	// if(false && path !== undefined){
	// 	console.log(path);
	// }

	if(true){ console.log(board); }
	// if(false){
	// 	console.log('board: ' + board + (gameResolved(board)?'(final)':''));
	// }

	if(false){
		console.log(' ' + playSymbol(board[0]) + ' | ' + playSymbol(board[1]) + ' | ' + playSymbol(board[2]) + ' ');
		console.log('---+---+---');
		console.log(' ' + playSymbol(board[3]) + ' | ' + playSymbol(board[4]) + ' | ' + playSymbol(board[5]) + ' ');
		console.log('---+---+---');
		console.log(' ' + playSymbol(board[6]) + ' | ' + playSymbol(board[7]) + ' | ' + playSymbol(board[8]) + ' ');
		console.log();
	}

	// if(false){
	// 	console.log({
	// 		board: board
	// 	});
	// }
}

function gameCompleted(board){
	// board.reduce((prev, cur) => {
	// 	return prev || (cur == EMPTLY_PLAYER);
	// }, false);
	let completed = true;
	board.forEach(id => {
		if(id == EMPTLY_PLAYER) { completed &= false; }
	});
	//if(completed){ showBoard(board); }
	return completed;
}

function gameWinnner(board){
	function allEqual(a, b, c){
		if(board[a] == EMPTLY_PLAYER){ return false; }
		if(board[a] != board[b]){ return false; }
		if(board[a] != board[c]){ return false; }
		return true;
	}
	// horizontals
	if(allEqual(0, 1, 2)){ return board[0]; }
	if(allEqual(3, 4, 5)){ return board[3]; }
	if(allEqual(6, 7, 8)){ return board[6]; }
	// verticals
	if(allEqual(0, 3, 6)){ return board[0]; }
	if(allEqual(1, 4, 7)){ return board[1]; }
	if(allEqual(2, 5, 8)){ return board[2]; }
	// diagonals
	if(allEqual(0, 4, 8)){ return board[0]; }
	if(allEqual(2, 4, 6)){ return board[2]; }

	return EMPTLY_PLAYER;
}

function gameWon(board){
	return gameWinnner(board) != EMPTLY_PLAYER;
}

function gameResolved(board){
	return gameWon(board) || gameCompleted(board);
}

function boardTranspositions(board){
	function rotateOnce(board){
		let newBoard = [
			0, 0, 0,
			0, 0, 0,
			0, 0, 0
		];

		newBoard[0] = board[6];
		newBoard[1] = board[3];
		newBoard[2] = board[0];

		newBoard[3] = board[7];
		newBoard[4] = board[4];
		newBoard[5] = board[1];

		newBoard[6] = board[8];
		newBoard[7] = board[5];
		newBoard[8] = board[2];

		return newBoard;
	}
	function flipHorizontal(board){
		let newBoard = [
			0, 0, 0,
			0, 0, 0,
			0, 0, 0
		];

		newBoard[0] = board[6];
		newBoard[1] = board[7];
		newBoard[2] = board[8];

		newBoard[3] = board[3];
		newBoard[4] = board[4];
		newBoard[5] = board[5];

		newBoard[6] = board[0];
		newBoard[7] = board[1];
		newBoard[8] = board[2];

		return newBoard;
	}
	function flipVertical(board){
		let newBoard = [
			0, 0, 0,
			0, 0, 0,
			0, 0, 0
		];

		newBoard[0] = board[2];
		newBoard[1] = board[1];
		newBoard[2] = board[0];

		newBoard[3] = board[5];
		newBoard[4] = board[4];
		newBoard[5] = board[3];

		newBoard[6] = board[8];
		newBoard[7] = board[7];
		newBoard[8] = board[6];

		return newBoard;
	}

	let transpositions = [];
	transpositions.push(rotateOnce(board));
	transpositions.push(rotateOnce(rotateOnce(board)));
	transpositions.push(rotateOnce(rotateOnce(rotateOnce(board))));

	transpositions.push(flipHorizontal(board));
	transpositions.push(flipVertical(board));

	transpositions.push(rotateOnce(flipHorizontal(board)));
	transpositions.push(rotateOnce(flipVertical(board)));

	return transpositions;
}


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function shuffle(ary){
	let result = ary.slice(0);

	let i = result.length;
	while(i > 0){
		let j = getRandomInt(0, i);
		i -= 1;
		let tmp = result[i];
		result[i] = result[j];
		result[j] = tmp;
	}
	return result;
}




let boardCache = {};
function boardToKey(board){ return board.join(''); }
function cacheLookup(board){
	return boardCache[boardToKey(board)];
}
function lookupBoard(board){
	let tmp = boardCache[boardToKey(board)];
	if(tmp){ return tmp.board; }
	// return implicit undefined
}
function cacheBoard(board, meta){
	let boardClone = JSON.parse(JSON.stringify(board));
	let metaClone = JSON.parse(JSON.stringify(meta));
	metaClone.board = boardClone;
	boardCache[boardToKey(board)] = metaClone;

	return metaClone;
}



function generateBoards(parentBoard, board, path, forPlayerId, oppPlayerId, depth){
	function baseBoards(b, idx){
		if(b == EMPTLY_PLAYER){
			let newBoard = board.slice(0);
			newBoard[idx] = forPlayerId;
			return newBoard;
		}
		// notice the implicit return of undefined (ruby you complete me)
	}

	if(depth > 9){ throw Error('Depth out greater then 9'); }

	// the board passed is always non-deferred valid board.
	let selfBoard = cacheBoard(board, {
		path: path,

		resolved: gameResolved(board),
		completed: gameCompleted(board),
		won: gameWon(board),
		winner: gameWinnner(board),

		depth: depth
	});

	if (gameResolved(board)){ return; }

	// now, lets create some deferred potential new board states
	// first, generate the direct plays
	let deferredBoards = board
		.map(baseBoards) // turns our single board into base play boards
		.filter(b => b !== undefined) // trim the fat
		;

	deferredBoards = shuffle(deferredBoards);

	deferredBoards.forEach(b => {
		let refs = boardTranspositions(b)
			.map(cacheLookup)
			.filter(ref => ref !== undefined);

		refs.forEach(item => {
			if((depth + 1) != item.depth){
				console.log(depth, item); throw Error('depth mismatch');
			}
		});

		if(refs.length === 0){
			generateBoards(selfBoard, b, path, oppPlayerId, forPlayerId, depth + 1);
		}
	});
}

function generateStates(board, path, forPlayerId, oppPlayerId, depth, stopDepth){
	//showBoard(board, path);

	if(stopDepth && depth > stopDepth){ return; }

	let winner = gameWinnner(board);
	let won = gameWon(board);
	let completed = gameCompleted(board);
	let resolved = gameResolved(board);

	if(gameResolved(board)){
		//showBoard(board, path);

		// return {
		// 	resolved: 1,
		// 	won: won?1:0,
		// 	completed: (completed && !won)?1:0,
		// 	X: (winner == 1)?1:0,
		// 	O: (winner == 2)?1:0,
		// 	directAliass: 0,
		// 	alias: 0
		// };

		return {
			path: path,
			board: board,

			winner: winner,
			won: won,
			completed: completed,
			resolved: resolved
		};
	}


	//let result = [];
	for(let i = 0; i < board.length; i += 1){
		let elem = board[i];
		if(elem == EMPTLY_PLAYER){
			// open spot
			let nextBorad = board.slice(0);
			nextBorad[i] = forPlayerId;

			let newPath = path.slice(0);
			newPath.push(i);

			let directAliasBoard = lookupBoard(nextBorad);

			let aliasBoards = boardTranspositions(nextBorad)
				.map(lookupBoard)
				.filter(b => b !== undefined);

			if(directAliasBoard){
				//console.log('detected direct alias');
				//result.directAliass += 1;
			}
			else if(aliasBoards.length > 0)
			{
				//console.log('detected alias board');
				//console.log(aliasBoards);
				//result.alias += 1;
				// result.push({
				// 	path: newPath,
				// 	board: newBoard,

				// 	alias: aliasBoards;
				// });

			}
			else
			{
				cacheBoard(nextBorad);
				generateStates(nextBorad, newPath, oppPlayerId, forPlayerId, depth + 1, stopDepth);
			}
		}
	}
	//return { count: Math.max(1, cnt), board: board };
	//return result;
}

// let c = generateStates(board, [], 1, 2, 0, undefined);
// console.log(JSON.stringify(c));

generateBoards(null, board, [], 1, 2, 0);
console.log(Object.keys(boardCache).length);

console.log(Object.keys(boardCache).map(k => boardCache[k]).filter(item => item.resolved && !item.won).length);
console.log(Object.keys(boardCache).map(k => boardCache[k]).filter(item => item.winner == 1).length);
console.log(Object.keys(boardCache).map(k => boardCache[k]).filter(item => item.winner == 2).length);
console.log(Object.keys(boardCache).map(k => boardCache[k]).filter(item => item.won).length);
//console.log(boardCache);

