
function readPgn(fileName) {

  var fs = require('fs');
  var array = fs.readFileSync(fileName).toString();
  console.log(array);
  array = array.replace(/\r?\n|\r/g, '\n');

  var pgnGames = array.split(/ 1\-0| 0\-1| 1\/2-1\/2/);
  pgnGames.pop();

  var pgnGamesArray = [];

  for (i in pgnGames) {
    var game = pgnGames[i];
    // game = game.replace(/\r/, '');

    while (game.charAt(0) === '\n') {
      game = game.substr(1);
    }

    // while (game.charAt(0) === '\r') {
    //   game = game.substr(2);
    // }

    if(game.match(/1\-0/) !== null) {
      pgnGames[i] = game + ' 1-0';
    } else if (game.match(/0\-1/) !== null) {
      pgnGames[i] = game + ' 0-1';
    } else if (game.match(/1\/2-1\/2/) !== null) {
      pgnGames[i] = game + ' 1/2-1/2';
    } else {
      pgnGames[i] = game + ' *';
    }

    pgnGamesArray[i] = pgnGames[i].split(/\n/);
  }

  return pgnGamesArray;

}

pgnData = readPgn('./pgns/pgns.pgn');

//Write the game to the DOM
function writeGameText(g) {

  //remove the header to get the moves
  var h = g.header();
  var gameHeaderText = '<h4>' + h.White + ' (' + h.WhiteElo + ') - ' + h.Black + ' (' + h.BlackElo + ')</h4>';
  gameHeaderText += '<h5>' + h.Event + ', ' + h.Site + ' ' + h.EventDate + '</h5>';
  var pgn = g.pgn();
  var gameMoves = pgn.replace(/\[(.*?)\]/gm, '').replace(h.Result, '').trim();

  //format the moves so each one is individually identified, so it can be highlighted
  moveArray = gameMoves.split(/([0-9]+\.\s)/).filter(function(n) {return n;});
  for (var i = 0, l = moveArray.length; i < l; ++i) {
    var s = $.trim(moveArray[i]);
    if (!/^[0-9]+\.$/.test(s)) { //move numbers
      m = s.split(/\s+/);
      for (var j = 0, ll = m.length; j < ll; ++j) {
        m[j] = '<span class="gameMove' + (i + j - 1) + '"><a id="myLink" href="#" onclick="goToMove(' + (i + j - 1) + ');return false;">' + m[j] + '</a></span>';
      }
      s = m.join(' ');
    }
    moveArray[i] = s;
  }
  $("#game-data").html(gameHeaderText + '<div class="gameMoves">' + moveArray.join(' ') + ' <span class="gameResult">' + h.Result + '</span></div>');

}

//buttons
$('#btnStart').on('click', function() {
  game.reset();
  currentPly = -1;
  board.position(game.fen());
});
$('#btnPrevious').on('click', function() {
  if (currentPly >= 0) {
    game.undo();
    currentPly--;
    board.position(game.fen());
  }
});
$('#btnNext').on('click', function() {
  if (currentPly < gameHistory.length - 1) {
    currentPly++;
    game.move(gameHistory[currentPly].san);
    board.position(game.fen());
  }
});
$('#btnEnd').on('click', function() {
  while (currentPly < gameHistory.length - 1) {
    currentPly++;
    game.move(gameHistory[currentPly].san);
  }
  board.position(game.fen());
});

//key bindings
$(document).ready(function(){

  $(document).keydown(function(e){
    if (e.keyCode == 39) { //right arrow
      if (e.ctrlKey) {
        $('#btnEnd').click();
      } else {
        $('#btnNext').click();
      }
      return false;
    }
  });

  $(document).keydown(function(e){
    if (e.keyCode == 37) { //left arrow
      if (e.ctrlKey) {
        $('#btnStart').click();
      } else {
        $('#btnPrevious').click();
      }
    }
    return false;
  });

  $(document).keydown(function(e){
    if (e.keyCode == 38) { //up arrow
      if (currentGame > 0) {
        if (e.ctrlKey) {
          loadGame(0);
        } else {
          loadGame(currentGame - 1);
        }
      }
      $('#gameSelect').val(currentGame);
    }
    return false;
  });

  $(document).keydown(function(e){
    if (e.keyCode == 40) { //down arrow
      if (currentGame < pgnData.length - 1) {
        if (e.ctrlKey) {
          loadGame(pgnData.length - 1);
        } else {
          loadGame(currentGame + 1);
        }
      }
      $('#gameSelect').val(currentGame);
    }
    return false;
  });


});

//used for clickable moves in gametext
//not used for buttons for efficiency
function goToMove(ply) {
  if (ply > gameHistory.length - 1) ply = gameHistory.length - 1;
  game.reset();
  for (var i = 0; i <= ply; i++) {
    game.move(gameHistory[i].san);
  }
  currentPly = i - 1;
  board.position(game.fen());
}

var onChange = function onChange() { //fires when the board position changes
  //highlight the current move
  $("[class^='gameMove']").removeClass('highlight');
  $('.gameMove' + currentPly).addClass('highlight');
}

function loadGame(i) {
  game = new Chess();
  game.load_pgn(pgnData[i].join('\n'), {newline_char:'\n'});
  writeGameText(game);
  gameHistory = game.history({verbose: true});
  goToMove(-1);
  currentGame = i;
}

//start doing stuff
var board, //the chessboard
    game, //the current  game
    games, //array of all loaded games
    gameHistory,
    currentPly,
    currentGame;

//only need the headers here, issue raised on github
//read all the games to populate the select
for (var i = 0; i < pgnData.length; i++) {
  var g = new Chess();
  g.load_pgn(pgnData[i].join('\n'), {newline_char:'\n'});
  var h = g.header();
  $('#gameSelect')
     .append($('<option></option>')
     .attr('value', i)
     .text(h.White + ' - ' + h.Black + ', ' + h.Event + ' ' + h.Site + ' ' + h.Date));
}

//set up the board
var cfg = {
  pieceTheme: './chessboardjs/img/chesspieces/wikipedia/{piece}.png',
  position: 'start',
  showNotation: false,
  onChange: onChange
};
board = new ChessBoard('board', cfg);
$(window).resize(board.resize);

//load the first game
loadGame(0);
