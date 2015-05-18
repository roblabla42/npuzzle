export default function generate({X=3, goal = [1,2,3,8,0,4,7,6,5], it = 25} = {}) {
  if (it === 0)
    return (goal);
  else
  {
    var switches = [switchLeft, switchRight, switchUp, switchDown];
    var newgoal = switches[Math.floor(Math.random() * 4)](goal);
    return (generate({X, newgoal, it: it - 1}));
  }
}
