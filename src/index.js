require("source-map-support").install();
var lpastar = require("./astar");

var R = require("ramda");
var parser = require("./parser");

if (process.argv.length < 3)
  console.log("Usage: node dist/index.js [map]");
else
  parser(process.argv[2], main);

//console.log(isEnd(3, [1, 2, 3, 8, 0, 4, 7, 6, 5]));

function main(err, start, X, toFind) {
  try {
  if (err)
    throw err;
  else
  {
    var Y = start.length / X;

    if (Y !== Math.floor(Y))
      throw new Error("WTF");
    if (inv(start) % 2 === 0)
      throw new Error("Unsolvable !");
    var solution = lpastar({
      start: start,
      isEnd: isEndSpiral.bind(null, X),
      neighbor: neighborWithOld.bind(null, X, Y, 0),
      distance: R.always(1),
      heuristic: manhattan.bind(null, X, spiralToIndex)
    });
    R.forEach(R.compose(console.log, pretty.bind(null, X)), solution.path);
  }
  } catch (e) {
    console.error("Whoops, got an error: ", e.stack);
  }
}

var isEnd = R.reduceIndexed((acc, elem, idx) => acc && elem == idx + 1, true);

function isEndSpiral(X, node) {
  var good = true;
  var Y = node.length / X;
  doSpiral(X, Y, function(i, x, y) {
    if (!(node[y * X + x] === i || (node[y * X + x] === 0 && i === X * Y))) {
      good = false;
      return true;
    }
  });
  return (good);
}

var inv = R.compose(R.reduce(R.add, 0), R.mapIndexed(function (elt, i, lst) {
  return R.reduce((acc, cur) => cur > elt ? acc + 1 : acc, 0, lst.slice(0, i));
}));

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

function manhattan(X, dataToIndex, state) {
  return (sumDistance(X, dataToIndex, state, 0, 0, state.length / X));
}

function sumDistance(X, dataToIndex, state, currPos, j, Y) {
  function calculateDistance(pos1, pos2) {
    var x1 = pos1 % X;
    var y1 = Math.floor(pos1 / X);
    var x2 = pos2 % X;
    var y2 = Math.floor(pos2 / X);
    //console.log("distance", Math.abs(x2 - x1) + Math.abs(y2 - y1));
    return (Math.abs(x2 - x1) + Math.abs(y2 - y1));
  }
  if (currPos >= state.length)
    return (j); 
  //console.log("spiralToIndex(", state[currPos], ") = ", spiralToIndex(X, Y, state[currPos]));
  //console.log(currPos);
  j += calculateDistance(dataToIndex(X, Y, state[currPos]), currPos);
  return (sumDistance(X, dataToIndex, state, ++currPos, j, Y));
}

function pretty(X, state) {
  function sumChecked(X, state, i, line) {
    if (i >= state.length)
      return ;
    line += state[i] + " ";
    if (i % X === X - 1)
    {
      console.log(line);
      line = "";
    }
    sumChecked(X, state, ++i, line);
  }
  var i = 0;
  var line = "";
  sumChecked(X, state, i, line);
}

function doSpiral(X, Y, fn) {
  function untilEnd(X, Y, fn, x, y, total, dx, dy, i, j) {
    i++;
    x += dx;
    y += dy;
    if (++j === X) {
      if (dy < 0) { x++; y++; X -= 2 }
      j = dx; dx = -dy; dy = j; j = 0;
    }
    if (i - 1 < total && fn(i, x, y) !== true)
      untilEnd(X, Y, fn, x, y, total, dx, dy, i, j);
  }
//  var Xbackup = X;
  var x = 0, y = 0;
  var total = X * Y;
  X--;
  var dx = 1, dy = 0;
  var i = 1, j = 0;
  if (i - 1 < total && fn(i, x, y) !== true)
    untilEnd(X, Y, fn, x, y, total, dx, dy, i, j);
}

function spiralToIndex(X, Y, toFind) {
  var foundX = null;
  var foundY = null;
  if (toFind === 0)
    toFind = X * Y;
  doSpiral(X, Y, function(i, x, y) {
    if (i === toFind)
    {
      foundX = x;
      foundY = y;
      return true;
    }
  });
  if (foundX === null)
    throw new Error("wut");
  return (foundY * X + foundX);
}
