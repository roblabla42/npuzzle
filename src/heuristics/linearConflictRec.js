//import range from "range-gen";
import manhattan from "./manhattan";

export default function linearConflict(X, goal, state)
{
  var j = manhattan(X, goal, state);
  j += linearConflictOneWay(X, goal, state, true, 0, 0);
  j += linearConflictOneWay(X, goal, state, false, 0, 0);
  return (j);
}

function linearConflictOneWay(X, goal, state, way, conflicts, i) {
  function whichWay(X, goal, way, num, pos) {
    return (((way && !num) || (!way && num)) ? pos >= goal.length / X : pos >= X);
  }
  function isConflict(cellVal, way, goal, X, i) {
    return ((way ? goal.indexOf(cellVal) / X : goal.indexOf(cellVal) % X) === i);
  }
  function countConflicts(X, goal, state, way, conflicts, i, max, j) {
    if (whichWay(X, goal, way, true, j))
      return (conflicts);
    var cellVal = (way ? state[i * X + j] : state[j * X + i]);
    if (cellVal != 0 && isConflict(cellVal, way, goal, X, i)) {
      if (cellVal > max)
        max = cellVal;
      else
        conflicts += 2;
    }
    return (countConflicts(X, goal, state, way, conflicts, i, max, j + 1));
  }
  if (whichWay(X, goal, way, false, i))
    return (conflicts);
  conflicts = countConflicts(X, goal, state, way, conflicts, i, -1, 0);
  return (linearConflictOneWay(X, goal, state, way, conflicts, i + 1));
}
