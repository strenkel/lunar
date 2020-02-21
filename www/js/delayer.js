var delayer = (function() {

  var delayId;
  var delayerStack = [];
  var delayTime = 75; // in millis

  // --- PUBLIC METHODS ---

  /**
   * Put the callback on a stack and execute the callbacks on the stack with a delay of delayTime ms.
   * Between each callback call is a delay of delayTime ms. delayTime is the minimun delay.
   * 
   * @param {Function} callback 
   */
  var delay = function(callback) {
    return function() {
      delayerStack.push([callback, arguments]);
      runDelayer();
    }
  };

  // --- PRIVATE METHODES ---

  var runDelayer = function() {
    if (delayId == null) {
      delayId = setTimeout(function() {
        delayId = null;
        var task = delayerStack.shift();
        if (task) {
          task[0].apply(null, task[1]);
          if (delayerStack.length != 0) {
            runDelayer();
          }
        }
      }, delayTime);
    }
  };

  return {
    delay: delay
  };

})();