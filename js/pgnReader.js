function readPgn(fileName) {

  var fs = require('fs');
  var array = fs.readFileSync(fileName).toString();

  var pgnGames = array.split(/ 1\-0| 0\-1/);
  pgnGames.pop();

  for (i in pgnGames) {
    var game = pgnGames[i];

    while (game.charAt(0) === '\n') {
      game = game.substr(1);
    }

    while (game.charAt(0) === '\r') {
      game = game.substr(2);
    }

    if(game.match(/1\-0/) !== null) {
      pgnGames[i] = game + ' 1-0';
    } else if (game.match(/0\-1/) !== null) {
      pgnGames[i] = game + ' 0-1';
    } else if (game.match(/1\/2-1\/2/) !== null) {
      pgnGames[i] = games + ' 1/2-1/2';
    } else {
      pgnGames[i] = games + ' *';
    }
  }

  return pgnGames;

}

// var fileName = './pgns.pgn';
//
// var pgnGames = readPgn(fileName);
//
// for(i in pgnGames) {
//     console.log('Game ' + i);
//     console.log(pgnGames[i]);
//     console.log('\n');
// }

//console.log(pgnGames[1])
