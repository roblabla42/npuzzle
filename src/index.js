require("source-map-support").install();
var argv = require("yargs")
  .usage('Usage: $0 <command> [options]')
  .command('solve', 'Solve an npuzzle')
  .command('generate', 'Generate an npuzzle')
  .demand(1)
  .options('f', {
    alias: 'file',
    describe: 'Use given file as map. Defaults to stdin',
    type: 'string'
  })
  .options('g', {
    alias: 'goal',
    describe: 'The goal type. One of "spiral", "normal", or a file',
    default: 'spiral',
    type: 'string'
  })
  .options('h', {
    alias: 'heuristic',
    describe: 'The heuristic function to use. One of "manhattan", or a nodejs module name',
    default: 'manhattan',
    type: 'string'
  })
  .strict()
  .argv;

var fs = require("fs");
var R = require("ramda");
var parser = require("./parser");

var lpastar = require("./astar");
var coerceToBool = R.compose(R.not, R.not);
var isOdd = R.compose(coerceToBool, R.modulo(R.__, 2));
var isEven = R.complement(isOdd);

if (argv._[0] === "generate")
  require("./cmd/generate")(argv);
else
{
  (async function() {
  var makeGoal;
  var stream;
  if (argv.g === "spiral")
    makeGoal = makeGoalSpiral;
  else if (argv.g !== "normal")
    makeGoal = await makeGoalFile(argv.g);
  else
    makeGoal = makeGoalNormal;
  if (argv.file)
    stream = fs.createReadStream(argv.file);
  else
    stream = process.stdin;
  var { arr, X } = await parser(stream);
  await main(lpastar, R.always(1), require("./heuristics/" + argv.h), makeGoal, arr, X);
  })().then(null, function(err) {
    setImmediate(function() {
      throw err;
    });
  });
}
//console.log(isEnd(3, [1, 2, 3, 8, 0, 4, 7, 6, 5]));

async function main(algorithm, distance, heuristic, makeGoal, start, X) {
  try {
    var Y = start.length / X;
    if (Y !== Math.floor(Y))
      throw new Error("Invalid map : it needs to be a rectangle");

    var goal = makeGoal(start, X, Y);
    console.log("Goal is");
    pretty(X, goal);
    if (start.length != goal.length)
      throw new Error("Invalid goal : goal is not of the same size");

    var cmp = isEven(inv(goal)) ? isEven : isOdd;
    if (!(isOdd(X) && cmp(inv(start))
        || (isEven(X) && (isOdd(blankRow(start, X)) === cmp(inv(start))))))
      throw new Error("Unsolvable !");

    var solution = await algorithm({
      start: start,
      isEnd: R.eqDeep(goal),
      neighbor: neighborWithOld.bind(null, X, Y, 0),
      distance: distance.bind(null, X),
      heuristic: heuristic.bind(null, X, goal)
    });
    R.forEach(pretty.bind(null, X), solution.path);
  } catch (e) {
    console.error("Whoops, got an error: ", e.stack);
  }
}

var blankRow = (start, X, toFind) => (X - start.indexOf(toFind) / X);

var inv = R.compose(R.reduce(R.add, 0), R.mapIndexed(function (elt, i, lst) {
  return R.reduce((acc, cur) => elt > cur && cur !== 0 ? acc + 1 : acc, 0, lst.slice(i+1));
}));

function swap(block, pos1, pos2) {
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
  addStateIf(pos % X > 0, swap(block, pos, pos - 1));
  addStateIf(pos % X < X - 1, swap(block, pos, pos + 1));
  addStateIf(Math.floor(pos / X) > 0, swap(block, pos, pos - X));
  addStateIf(Math.floor(pos / X) < Y - 1, swap(block, pos, pos + X));
  return (nextStates);
}

function prettyNew(X, state) {
  var i = 0;
  var line = "";
  while (i < state.length) {
    line += state[i] + " ";
    if (i % X === X - 1)
    {
      console.log(line);
      line = "";
    }
    i++;
  }
}

function pretty(X, state) {
  var i = 0;
  var line = "";
  var maxNbrSize = 1;
  console.log(state);
  while (i < state.length) {
    if (maxNbrSize < Math.floor(Math.log10(state[i])))
      maxNbrSize = Math.floor(Math.log10(state[i]));
    i++;
  }
  while (i < state.length) {
    line += " ".repeat(maxNbrSize - Math.floor(Math.log10(state[i]))) + state[i];
    if (i % X === X - 1) {
      console.log(line);
      line = "";
    }
    i++;
  }
  console.log();
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

function makeGoalSpiral(start, X, Y) {
  var arr = [];
  doSpiral(X, Y, (i, x, y) => arr[y * X + x] = i == X * Y ? 0 : i);
  return (arr);
}

function makeGoalNormal(start, X, Y) {
  var arr = [];
  var i = 1;
  while (i <= X * Y)
  {
    arr[i - 1] = i;
    i++;
  }
  arr[arr.length-1] = 0;
  return (arr);
}

function makeGoalFile(file, start, X, Y) {
  return new Promise(function (resolve, reject) {
    parser(fs.createReadStream(file), function (err, arr) {
      if (err)
        reject(err);
      else
        resolve(() => arr);
    });
  });
}
