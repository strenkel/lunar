var delayer = (function() {

  var delayId;
  var delayerStack = [];
  var delayTime = 75; // in millis

  // --- PUBLIC METHODS ---

  /**
   * @param {Function} callbacks
   * @returns {Function}
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

})();/**
 * Transcription of Storer's lunar lander FOCAL code to JavaScript.
 * Variable names and line numbers are taken from there. See:
 * https://www.cs.brandeis.edu/~storer/LunarLander/LunarLander/LunarLanderListing.jpg 
 */

var lunarcalc = {};

/**
 * Function, that returns an iterator (object with method 'next') doing the lunar landing calculation.
 */
lunarcalc.createIterator = function() {

  // Initial values; state of the iterator
  var L = 0; // Time (seconds)
  var A = 120; // Altitude (miles)
  var V = 1; // Velocity (miles/second)
  var M = 32500; // Total weight (LBS)

  // constants
  var N = 16500; // Capsule weight (LBS)
  var G = 0.001; // Gravity (miles/second**2)
  var Z = 1.8; // Fuel exhaust velocity (miles/seconds)

  // helper vars
  var S; // Time (seconds)
  var T; // Time (seconds)
  var I; // new altitude (miles)
  var J; // new velocity (miles/second)
  var K; // Fuel Rate (LBS/SEC)
  var fuelOutAt;
  var doIteration = false;
  var done = false;

  // --- PUBLIC METHODS ---

  /**
   * @param {Number} myK Fuel Rate (LBS/SEC)
   */
  var next = function(myK) {

    K = myK;
    T = 10; // Time in seconds for one breaking iteration

    while (doIteration && !done) {

      // Fuel out / on moon
      if (M - N - 0.001 < 0) {
        var fuelOutAt = L;
        calcFreeFall();
        done = true;
        break;
      }

      // Iteration ready
      if (T - 0.001 < 0) {
        break;
      }

      S = T;

      // too little fuel
      if (M - N - S * K < 0) {
        S = (M - N) / K;
      }

      // Line 3.50
      calcNewAltitudeAndVelocity();

      // New hight less than zero -> on the moon
      if (I <= 0) {
        calcOnTheMoon();
        done = true;
        break;
      }

      // 
      if (V > 0 && J < 0) {
        var result = calcDeepestPoint();
        if (result === "onTheMoon") {
          done = true;
          break;
        }
      } else {
        transferNewValues();
      }

    }

    doIteration = true;

    return {
      value: {
        time: L,
        altitude: A,
        velocity: V,
        fuel: M - N,
        fuelOutAt: fuelOutAt
      },
      done: done
    };

  };

  // -- PRIVATE METHODS --

  /**
   * Line 04.40.
   */
  var calcFreeFall = function() {
    S = (Math.sqrt(V * V + 2 * A * G) - V) / G;
    V = V + G * S;
    L = L + S;
  };

  /**
   * Block 06.
   */
  var transferNewValues = function() {
    L = L + S;
    T = T - S;
    M = M - S * K;
    A = I;
    V = J;
  };

  /**
   * Block 07.
   */
  var calcOnTheMoon = function() {
    while (S >= 0.005) {
      S = 2 * A / (V + Math.sqrt(V * V + 2 * A * (G - Z * K / M)));
      calcNewAltitudeAndVelocity();
      transferNewValues();
    }
  };

  /**
   * Block 08.
   */
  var calcDeepestPoint = function() {
    while (true) {
      var W = (1 - M * G / (Z * K)) / 2;
      S = M * V / (Z * K * (W + Math.sqrt(W * W + V / Z))) + 0.05;
      calcNewAltitudeAndVelocity();
      if (I <= 0) {
        calcOnTheMoon();
        return "onTheMoon";
      }
      transferNewValues();
      // Always true. A joke? 
      if (J >= 0 || V <= 0) {
        return "continue";
      }
    }
  };

  /**
   * Block 09.
   */
  var calcNewAltitudeAndVelocity = function() {
    var Q = S * K / M;
    // New velocity based on Tsiolkovsky rocket equation.
    // Taylor series of ln(1-Q) is used.
    J = V + G * S + Z * (-Q - Q ** 2 / 2 - Q ** 3 / 3 - Q ** 4 / 4 - Q ** 5 / 5);
    // new altitude
    I = A - G * S * S / 2 - V * S + Z * S * (Q / 2 + Q ** 2 / 6 + Q ** 3 / 12 + Q ** 4 / 20 + Q ** 5 / 30);
  };

  return {
    next: next
  }

};/**
 * Object with method 'run'.
 */
var lunarcontrol = (function(myLunarCalc) {

  "use strict";

  var inOut;
  var controlOutCallback;

  // --- PUBLIC METHODS ---

  /**
   * Controls all in- and outputs.
   *
   * myInOut is an object implementing two functions log and prompt.
   * log should accept a string for output and prompt should accept a string for output
   * and a callback function for input. The callback should be called with the string input.
   * 
   * myControlOutCallback is called, when user choose 'CONTROL OUT'.
   */
  var run = function(myInOut, myControlOutCallback) {

    inOut = myInOut;
    controlOutCallback = myControlOutCallback || function() {};

    logIntro();
    doLanding();
  };

  // --- PRIVATE METHODS ---

  /**
   * round(1.1234, 2) = "1.12"
   * round(1.995, 2) = "2.00"
   * 
   * @param {Number} x 
   * @param {Integer} d digits, d > 0 
   * @returns {String}
   */
  var round = function(x, d) {

    var pow = Math.pow(10, d);
    var x = Math.round(x * pow) / pow; 
    var trunc = Math.trunc(x);
    var decimals = Math.abs(x - trunc);
    trunc = Math.abs(trunc);
    var sign = x < 0 ? "-" : "";

    var dDecimalString = decimals
      .toString()
      .substr(2, d)
      .padEnd(d, "0");

    return sign + trunc.toString() + "." + dDecimalString;
  };

  var logIntro = function() {
    inOut.log("CONTROL CALLING LUNAR MODULE. MANUAL CONTROL IS NECESSARY");
    inOut.log("YOU MAY RESET FUEL RATE K EACH 10 SECS TO 0 OR ANY VALUE");
    inOut.log("BETWEEN 8 & 200 LBS/SEC. YOU'VE 16000 LBS FUEL. ESTIMATED");
    inOut.log("FREE FALL IMPACT TIME-120 SECS. CAPSULE WEIGHT-32500 LBS");
  };

  var logHeader = function() {
    inOut.log("FIRST RADAR CHECK COMING UP");
    inOut.log();
    inOut.log();
    inOut.log("COMMENCE LANDING PROCEDURE");
    inOut.log("TIME,SECS   ALTITUDE,MILES+FEET   VELOCITY,MPH   FUEL,LBS   FUEL RATE");
  };

  var doLanding = function() {

    logHeader();
    var lunarIterator = myLunarCalc.createIterator();

    var nextStep = function(K) {

      var next = lunarIterator.next(K);

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

  var validateInput = function(input, callback) {
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
  var getResultLine = function(value) {
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

  var printResult = function(value) {

    if (value.fuelOutAt) {
      var l = round(value.fuelOutAt, 2).padStart(8);
      inOut.log(`FUEL OUT AT ${l} SECS`);
    }

    var t = round(value.time, 2).padStart(8);
    inOut.log(`ON THE MOON AT ${t} SECS`);

    var W = 3600 * value.velocity;
    var w = round(W, 2).padStart(8);
    inOut.log(`IMPACT VELOCITY OF ${w} M.P.H.`);

    var mn = round(value.fuel, 2).padStart(8);
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
      inOut.log("SORRY,BUT THERE WERE NO SURVIVORS-YOU BLEW IT!");
      var deep = round(W * 0.277777, 2).padStart(8);
      inOut.log(`IN FACT YOU BLASTED A NEW LUNAR CRATER ${deep} FT. DEEP`);
    }
    inOut.log("");
    inOut.log("");
    inOut.log("");
    inOut.log("TRY AGAIN?");
    tryAgain();
  };

  var tryAgain = function() {
    inOut.prompt("(ANS. YES OR NO):", function(answer) {
      if (answer === "YES") {
        inOut.log("");
        inOut.log("");
        inOut.log("");
        doLanding();
      } else if (answer === "NO") {
        inOut.log("CONTROL OUT");
        controlOutCallback();
      } else {
        tryAgain();
      }
    });
  };

  return {
    run: run
  };

}) (lunarcalc);// add libraries lunarcontrol and delayer

(function(myLunarcontrol, myDelayer) {

  var readline = require('readline');
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  var Logger = {
    log: myDelayer.delay(console.log),
    prompt: myDelayer.delay(rl.question.bind(rl))
  };

  Logger.log();
  myLunarcontrol.run(Logger, function() {
    Logger.log();
    rl.close();
  });

}) (lunarcontrol, delayer);