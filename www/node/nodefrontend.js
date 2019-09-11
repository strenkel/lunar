var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var Logger = {
  log: console.log,
  prompt: rl.question.bind(rl)
};

require('./llrunner.js').run(Logger);