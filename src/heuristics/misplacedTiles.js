export default function misplacedTiles(X, goal, state) {
  var currPos = 0;
  var j = 0;
  var Y = state.length / X;
  console.error(state);
  while (currPos < state.length)
  {
    if (goal.indexOf(state[currPos]) !== currPos)
      j++;
    currPos++;
  }
  return (j);
}
