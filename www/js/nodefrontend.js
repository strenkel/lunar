const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const Logger = {
  log: console.log,
  prompt: rl.question.bind(rl)
};

require('./llrunner.js').run(Logger);