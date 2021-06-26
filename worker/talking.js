var timer = 300 * 1000
var id = 0;
var isTalk = true;

function start() {
  id = setInterval(() => {
    if (isTalk) {
      action();  
    }
    isTalk = true;
  }, timer);
};

function action() {
  postMessage({});
};

onmessage = (e) => {
  console.log('talkingWorker', e.data);

  if (e.data['command'] == 'test') {
    action();
  }

  if (e.data['command'] == 'reset') {
    isTalk = false;
  }

  if (e.data['command'] == 'start') {
    if (e.data['timer']) {
      timer = e.data['timer'];
    }
    start();
  }
};
