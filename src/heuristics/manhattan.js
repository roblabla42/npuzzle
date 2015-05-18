export default function manhattan(X, goal, state) {
  function calculateDistance(pos1, pos2) {
    var x1 = pos1 % X;
    var y1 = Math.floor(pos1 / X);
    var x2 = pos2 % X;
    var y2 = Math.floor(pos2 / X);
    return (Math.abs(x2 - x1) + Math.abs(y2 - y1));
  }
  var currPos = 0;
  var j = 0;
  var Y = state.length / X;
  while (currPos < state.length)
  {
    j += calculateDistance(goal.indexOf(state[currPos]), currPos);
    currPos++;
  }
  return (j);
}
