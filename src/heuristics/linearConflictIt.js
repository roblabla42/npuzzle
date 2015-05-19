//import range from "range-gen";
import manhattan from "./manhattan";

export default function linearConflict(X, goal, state)
{
  var j = manhattan(X, goal, state);
  j += linearConflictVert(X, goal, state);
  j += linearConflictHoriz(X, goal, state);
  return (j);
}

function linearConflictVert(dir, X, goal, state)
{
  var conflicts = 0;
  var row = 0;
  while (row < goal.length / X)
  {
    var max = -1;
    var col = 0;
    while (col < X)
    {
      var cellVal = state[row * X + col];
      if (cellVal != 0 && goal.indexOf(cellVal) / X === row) // TODO : I could make a map here...
      {
        if (cellVal > max)
          max = cellVal;
        else
          conflicts += 2;
      }
      col++;
    }
    row++;
  }
  return (conflicts);
}

function linearConflictHoriz(dir, X, goal, state)
{
  var conflicts = 0;
  var col = 0;
  while (col < X)
  {
    var max = -1;
    var row = 0;
    while (row < goal.length / X)
    {
      var cellVal = state[row * X + col];
      if (cellVal != 0 && goal.indexOf(cellVal) % X === col)
      {
        if (cellVal > max)
          max = cellVal;
        else
          conflicts += 2;
      }
      row++;
    }
    col++;
  }
  return (conflicts);
}
