module.exports = function range(start, stop, step)
{
  if (arguments.length === 1)
  {
    stop = start;
    start = 0;
    step = 1;
  }
  else if (arguments.length === 2)
    step = 1;
  var nextIndex = start;
  if (step >= 0)
  {
    return { [Symbol.iterator]: function() {
      return {
        next: function() {
          if (nextIndex < stop)
          {
            var ret = { value: nextIndex, done: false };
            nextIndex += step;
            return ret;
          }
          else
            return { done: true };
        }
      };
    }};
  }
  else
  {
    return { [Symbol.iterator]: function() {
      return {
        next: function() {
          if (nextIndex > stop)
          {
            var ret = { value: nextIndex, done: false };
            nextIndex += step;
            return ret;
          }
          else
            return { done: true };
        }
      };
    }};
  }
}
