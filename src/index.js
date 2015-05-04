var lpastar = require("./astar");

var R = require("ramda");
var parser = require("./parser");

if (process.argv.length < 3)
  console.log("Usage: node dist/index.js [map]");
else
  parser(process.argv[2], main);

function main(err, start, X, toFind) {
  if (err)
    console.log("Woops, got an error", err);
  else
  {
    var Y = start.length / X;

    if (Y !== Math.floor(Y))
      throw new Error("WTF");

    console.log(start);
    console.log(JSON.stringify(lpastar({
      start: start,
      isEnd: R.reduceIndexed((acc, elem, idx) => acc && elem == idx + 1, true),
      neighbor: neighborWithOld.bind(null, X, Y, toFind),
      distance: R.always(1),
      heuristic: manhattan.bind(null, X)
    }), null, 4));
  }
}

function switchX(block, pos1, pos2) {
  var newblock = block.slice(0);
  var tmp = newblock[pos1];
  newblock[pos1] = newblock[pos2];
  newblock[pos2] = tmp;
  return newblock;
}

function neighborWithOld(X, Y, toFind, block) {
  function addStateIf(cond, newState) {
    if (cond) nextStates.push(newState);
  }
  var nextStates = [];
  var pos = block.indexOf(toFind);
  addStateIf(pos % X > 0, switchX(block, pos, pos - 1));
  addStateIf(pos % X < X - 1, switchX(block, pos, pos + 1));
  addStateIf(Math.floor(pos / X) > 0, switchX(block, pos, pos - X));
  addStateIf(Math.floor(pos / X) < Y - 1, switchX(block, pos, pos + X));
  return (nextStates);
}

function manhattan(X, state) {
  function calculateDistance(pos1, pos2) {
    var x1 = pos1 % X;
    var y1 = Math.floor(pos1 / X);
    var x2 = pos2 % X;
    var y2 = Math.floor(pos2 / X);
    return (Math.abs(x2 - x1) + Math.abs(y2 - y1));
  }
  var currPos = 0;
  var j = 0;
  while (currPos < state.length)
  {
    j += calculateDistance(currPos, state[currPos] - 1);
    currPos++;
  }
  return (j);
}
