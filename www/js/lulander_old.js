const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * @param {Number} x 
 * @param {Integer} d
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

var A; // Altitude
var V; // Velocity, miles per second
var W; // Velocity, miles per hour
var M; // Total Weight, LBS
var N; // CAPSULE WEIGHT, LBS
var G;
var Z;
var L = 0; // Time: 0, 10, 20, ...
var I = 0;
var K; // Fuel Rate, LBS/SEC
var S;
var J;
var Q;
var T;

// 1.04 - 1.50
const intro = function() {
  console.log();
  console.log();
  console.log();
  console.log("CONTROL CALLING LUNAR LANDER MODULE. MANUAL CONTROL IS NECESSARY");
  console.log("YOU MAY RESET FUEL RATE K EACH 10 SECS TO 0 OR ANY VALUE");
  console.log("BETWEEN 8 & 200 LBS/SEC. YOU'VE 16000 LBS FUEL. ESTIMATED");
  console.log("FREE FALL IMPACT TIME-120 SECS. CAPSULE WEIGHT-32500 LBS");
  start();
};

// 1.20 -1.50
const start = function() {
  console.log("FIRST RADAR CHECK COMING UP");
  console.log();
  console.log();
  console.log();
  console.log("COMMENCE LANDING PROCEDURE");
  console.log("TIME,SECS   ALTITUDE,MILES+FEET   VELOCITY,MPH   FUEL,LBS   FUEL RATE");
  A = 120; V = 1; M = 32500; N = 16500; G = 0.001; Z = 1.8;
  L = 0; I = 0; J = 0;

  nextIteration();
};

const nextIteration = function() {

  // 2.10 - 2.20
  var l = L.toString().padStart(8, " ");
  var aMiles = Math.floor(A).toString().padStart(15, " ");
  var aFeet = Math.round((5280 * (A - Math.floor(A)))).toString().padStart(7, " ");
  var v = round(3600 * V, 2).padStart(15, " ");
  var fuel = round(M - N, 1).padStart(12, " ");
  var out = `${l}${aMiles}${aFeet}${v}${fuel}      K=:`;

  rl.question(out, function(input) {

    K = Number.parseInt(input);
    calculateNextIteration();
  });
};

const calculateNextIteration = function() {
  T = 10;
  // 3.10
  while (true) {
    if (M - N - 0.001 < 0) {
      fuelOut(); // fuel out
      return;
    }

    if (T - 0.001 < 0) {
      nextIteration();
      return;
    }
    S = T;

    // 3.40
    if (N + S * K - M > 0) {
      S = (M - N) / K;
    }

    // 3.50
    f9();
    if (I <= 0) {
      f7();
      return;
    }
    if (V > 0 && J < 0) {
      var result = f8();
      if (result === "break") {
        return;
      }
    } else {
      f6();
    }
  }
};

// 4.10, 4.40
const fuelOut = function() {
  var l = round(L, 2).padStart(8);
  console.log(`FUEL OUT AT ${l} SECS`);
  S = (Math.sqrt(V * V + 2 * A * G) - V) / G;
  V = V + G * S;
  L = L + S;
  onTheMoon();
};

// 5.10 - 5.90
const onTheMoon = function() {
  var l = round(L, 2).padStart(8);
  console.log(`ON THE MOON AT ${l} SECS`);
  W = 3600 * V;
  var w = round(W, 2).padStart(6);
  console.log(`IMPACT VELOCITY OF ${w} M.P.H.`);
  var mn = round(M - N, 2).padStart(6);
  console.log(`FUEL LEFT: ${mn} LBS`);
  if (W < 1) {
    console.log("PERFECT LANDING !-(LUCKY)");
  } else if (W < 10) {
    console.log("GOOD LANDING-(COULD BE BETTER)");
  } else if (W < 22) {
    console.log("CONGRATULATIONS ON A POOR LANDING");
  } else if (W < 40) {
    console.log("CRAFT DAMAGE. GOOD LUCK")
  } else if (W < 60) {
    console.log("CRASH LANDING-YOU'VE 5 HRS OXYGEN")
  } else {
    console.log("SORRY,BUT THERE WHERE NO SURVIVORS-YOU BLEW IT!");
    var deep = round(W * 0.277777, 2).padStart(9);
    console.log(`IN FACT YOU BLASTED A NEW LUNAR CRATER ${deep} FT. DEEP`);
  }
  console.log("");
  console.log("");
  console.log("");
  console.log("TRY AGAIN?");
  tryAgain();
};

// 5.92 - 5.98
const tryAgain = function() {
  rl.question("(ANS. YES OR NO):", function(answer) {
    if (answer === "YES") {
      start();
    } else if (answer === "NO") {
      console.log("CONTROL OUT");
      console.log("");
      console.log("");
      console.log("");
      rl.close();
      return;
    }
    tryAgain();
  });
};

const f6 = function() {
  L = L + S;
  T = T - S;
  M = M - S * K;
  A = I;
  V = J;
};

const f7 = function() {
  while (S >= 0.005) {
    S = 2 * A / (V + Math.sqrt(V * V + 2 * A * (G - Z * K / M)));
    f9();
    f6();
  }
  onTheMoon();
};

const f8 = function() {
  while (true) {
    W = (1 - M * G / (Z * K)) / 2;
    S = M * V / (Z * K * (W + Math.sqrt(W * W + V / Z))) + 0.05;
    f9();
    if (I <= 0) {
      f7();
      return "break";
    }
    f6();
    if ( J >= 0 || V <= 0) {
      return "continue";
    }
  }
};

const f9 = function() {
  Q = S * K / M;
  J = V + G * S + Z * (-Q - Q ** 2 / 2 - Q ** 3 / 3 - Q ** 4 / 4 - Q ** 5 / 5);
  I = A - G * S * S / 2 - V * S + Z * S * (Q / 2 + Q ** 2 / 6 + Q ** 3 / 12 + Q ** 4 / 20 + Q ** 5 / 30);
};

intro();