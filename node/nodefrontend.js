// add libraries lunarcontrol and delayer

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