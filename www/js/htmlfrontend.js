const root = document.getElementById("console-root");
var lastFormElm;

const scrollToBottom = function() {
  window.scrollTo(0, document.body.scrollHeight);
};

const delayerStack = [];

const delayer = function(callback) {
  return function() {
    delayerStack.push([callback, arguments]);
    runDelayer();
  }
};

let delayId;
const runDelayer = function() {
  if (delayId == null) {
    delayId = setTimeout(function() {
      delayId = null;
      const task = delayerStack.shift();
      if (task) {
        task[0].apply(null, task[1]);
        if (delayerStack.length != 0) {
          runDelayer();
        }
      }
    }, 100);
  }
};

const log = function(message) {
  clearForm();
  var input = createInputElm(message);
  input.disabled = true;
  root.appendChild(input);
  scrollToBottom();
};

const prompt = function(message, callback) {
  clearForm();
  const inputElm = createInputElm(message);
  const form = document.createElement("form");
  form.appendChild(inputElm);
  root.appendChild(form);
  inputElm.focus();
  form.onsubmit = function(event) {
    event.preventDefault();
    callback(inputElm.value.substr(message.length));
    return false; // necessary?
  };
  lastFormElm = form;
  scrollToBottom();
};

const createInputElm = function(message) {
  var input = document.createElement("input");
  input.className = "console-line";
  if (message) {
    input.value = message;
  }
  return input;
};

const clearForm = function() {
  if (lastFormElm) {
    lastFormElm.onsubmit = null;
    lastFormElm.firstElementChild.disabled = true;
    lastFormElm = null;
  }
};

const Logger = {
  log: delayer(log),
  prompt: delayer(prompt)
};

const runLL = function() {
  lunarcontrol.run(Logger);
};

runLL();