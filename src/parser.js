import fs from "fs";
import R from "ramda";
import linestream from "line-stream";

export default function parse(filename, cb) {
  var toFind = null;
  var arr = [];
  var X = -Infinity;
  var alreadyCalledCb = false;

  fs.createReadStream(filename)
    .on('error', (e) => {
      cb(e);
    })
    .pipe(linestream())
    .on('data', (line) => {
      line = line.split('#', 1)[0].trim();
      if (toFind === null)
        toFind = processFirstLine(line);
      else if (line !== "")
      {
        var tmp = processArray(X, line);
        if (X === -Infinity && tmp.length > 0)
          X = tmp.length;
        arr = R.concat(arr, tmp);
      }
    })
    .on('error', (e) => {
      cb(e);
    })
    .on('end', () => {
      cb(null, arr, X, toFind);
    });
};

function processFirstLine(line) {
  if (line === "")
    return null;
  else {
    var toFind = parseInt(line);
    if (toFind < 0 || isNaN(toFind))
      throw new Error("Bad toFind value");
    else
      return toFind;
  }
}

function processArray(X, line) {
  var newarr = R.map(parseInt, R.filter(R.compose(R.not, R.isEmpty), line.split(' ')));
  if (newarr.length === 0)
    return [];
  else if (X !== -Infinity && X !== newarr.length)
    throw new Error("This isn't a rectangle");
  else
    return newarr;
}
