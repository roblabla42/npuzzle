import fs from "fs";
import R from "ramda";
import linestream from "line-stream";

export default function parse(stream) {
  var arr = [];
  var X = -Infinity;
  var alreadyCalledCb = false;

  return new Promise(function(resolve, reject) {
    stream
      .on('error', (e) => {
        reject(e);
      })
      .pipe(linestream())
      .on('data', (line) => {
        line = line.split('#', 1)[0].trim();
        if (X === -Infinity)
          X = processFirstLine(line);
        else if (line !== "")
        {
          var tmp = processArray(X, line);
          arr = R.concat(arr, tmp);
        }
      })
      .on('error', (e) => {
        reject(e);
      })
      .on('end', () => {
        resolve({arr, X});
      });
  });
};

function processFirstLine(line) {
  if (line === "")
    return -Infinity;
  else {
    var X = parseInt(line);
    if (X < 0 || isNaN(X))
      throw new Error("Bad X value");
    else
      return X;
  }
}

function processArray(X, line) {
  var newarr = R.map(parseInt, R.filter(R.compose(R.not, R.isEmpty), line.split(' ')));
  if (newarr.length === 0)
    return newarr;
  else if (X !== newarr.length)
    throw new Error("This isn't a rectangle");
  else
    return newarr;
}
