var lunarcontrol = (function() {

  "use strict";

  var inOut;

  /**
   * Controls all in- and outputs.
   *
   * inout is an object implementing two functions log and prompt.
   * log should accept a string for output and prompt should accept a string for output
   * and a callback function for input. The callback should be called with the string input.
   */
  var run = function(myInOut) {

    inOut = myInOut;

    logIntro();
    doLanding();
  };

  const createLLIterator = require('./lunarcalc.js/index.js').createLLIterator;

  /**
   * @param {Number} x 
   * @param {Integer} d digits, d > 0 
   * @returns {String}
   */
  const round = function(x, d) {

    var trunc = Math.trunc(x);
    var decimals = Math.abs(x - trunc);

    var dDecimalString = decimals
      .toString()
      .substr(2, d)
      .padEnd(d, "0");

    return trunc.toString() + "." + dDecimalString;
  };

  const logIntro = function() {
    inOut.log("CONTROL CALLING LUNAR MODULE. MANUAL CONTROL IS NECESSARY");
    inOut.log("YOU MAY RESET FUEL RATE K EACH 10 SECS TO 0 OR ANY VALUE");
    inOut.log("BETWEEN 8 & 200 LBS/SEC. YOU'VE 16000 LBS FUEL. ESTIMATED");
    inOut.log("FREE FALL IMPACT TIME-120 SECS. CAPSULE WEIGHT-32500 LBS");
  };

  const logHeader = function() {
    inOut.log("FIRST RADAR CHECK COMING UP");
    inOut.log();
    inOut.log();
    inOut.log("COMMENCE LANDING PROCEDURE");
    inOut.log("TIME,SECS   ALTITUDE,MILES+FEET   VELOCITY,MPH   FUEL,LBS   FUEL RATE");
  };

  const doLanding = function() {

    logHeader();
    const llIterator = createLLIterator();

    const nextStep = function(K) {

      var next = llIterator.next(K);

      if (next.done) {
        printResult(next.value);
        return;
      }

      inOut.prompt(getResultLine(next.value), function(input) {
        validateInput(input, nextStep);
      });
    };

    nextStep();
  };

  const validateInput = function(input, callback) {
    var K = Number.parseInt(input);
    if (Number.isFinite(K) && (K === 0 || K >= 8 && K <= 200)) {
      callback(K);
    } else {
      inOut.prompt("NOT POSSIBLE" + ".".repeat(51) + "K=:", function(nextInput) {
        validateInput(nextInput, callback);
      });
    }
  };

  /**
   * @param {*} value
   * @returns {String} 
   */
  const getResultLine = function(value) {
    var L = value.time;
    var A = value.altitude;
    var V = value.velocity;
    var MN = value.fuel;

    // 2.10 - 2.20
    var l = Math.round(L).toString().padStart(8, " ");
    var aMiles = Math.floor(A).toString().padStart(15, " ");
    var aFeet = Math.round((5280 * (A - Math.floor(A)))).toString().padStart(7, " ");
    var v = round(3600 * V, 2).padStart(15, " ");
    var fuel = round(MN, 1).padStart(12, " ");
    return `${l}${aMiles}${aFeet}${v}${fuel}      K=:`;
  };

  const printResult = function(value) {

    if (value.fuelOutAt) {
      var l = round(value.fuelOutAt, 2).padStart(8);
      inOut.log(`FUEL OUT AT ${l} SECS`);
    }

    var t = round(value.time, 2).padStart(8);
    inOut.log(`ON THE MOON AT ${t} SECS`);

    var W = 3600 * value.velocity;
    var w = round(W, 2).padStart(6);
    inOut.log(`IMPACT VELOCITY OF ${w} M.P.H.`);

    var mn = round(value.fuel, 2).padStart(6);
    inOut.log(`FUEL LEFT: ${mn} LBS`);

    if (W < 1) {
      inOut.log("PERFECT LANDING !-(LUCKY)");
    } else if (W < 10) {
      inOut.log("GOOD LANDING-(COULD BE BETTER)");
    } else if (W < 22) {
      inOut.log("CONGRATULATIONS ON A POOR LANDING");
    } else if (W < 40) {
      inOut.log("CRAFT DAMAGE. GOOD LUCK")
    } else if (W < 60) {
      inOut.log("CRASH LANDING-YOU'VE 5 HRS OXYGEN")
    } else {
      inOut.log("SORRY,BUT THERE WHERE NO SURVIVORS-YOU BLEW IT!");
      var deep = round(W * 0.277777, 2).padStart(9);
      inOut.log(`IN FACT YOU BLASTED A NEW LUNAR CRATER ${deep} FT. DEEP`);
    }
    inOut.log("");
    inOut.log("");
    inOut.log("");
    inOut.log("TRY AGAIN?");
    tryAgain();
  };

  const tryAgain = function() {
    inOut.prompt("(ANS. YES OR NO):", function(answer) {
      if (answer === "YES") {
        inOut.log("");
        inOut.log("");
        inOut.log("");
        doLanding();
      } else if (answer === "NO") {
        inOut.log("CONTROL OUT");
        rl.close();
      } else {
        tryAgain();
      }
    });
  };

  return {
    run: run
  };

}) ();