var translate = new RTAWTranslate();
var nickname = new RTAWNickName();
var nameRelatedVoice = new RTAWNameRelatedVoice();

var talkingWorker = new Worker('worker/talking.js');

var beforeName = '';

var logins = {};

var speakingTimerId;

window.addEventListener('DOMContentLoaded', function() {
  console.log('loaded.');

  // 音声合成のVOICE一覧生成
  speechSynthesis.onvoiceschanged = () => {
    console.log('onvoiceschanged.');
    const createVoiceList = function(target) {
      const selectbox = document.querySelector(target)
      const voices = speechSynthesis.getVoices();
      for (let i = 0; i < voices.length; i++) {
        const option = document.createElement('option');
        option.setAttribute('value', i);
        option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
        selectbox.appendChild(option);
      }
    }

    createVoiceList('select[name="voice-target"]');
    createVoiceList('select[name="voice-target-names"]');

    // 設定情報の保存と復元
    document.querySelectorAll('input, select, textarea').forEach((element) => {
      let store = (element.type == 'password') ? sessionStorage : localStorage;
      const storageItem = store.getItem(element.name);
      if (storageItem) {
        if (element.type == 'checkbox' && storageItem) {
          element.checked = storageItem.toLowerCase() === 'true';
        } else {
          element.value = storageItem;
        }
      }
      element.onchange = function(event) {
        ((element.type == 'password') ? sessionStorage : localStorage).setItem(
          event.target.name, event.target.value);
        if (element.type == 'checkbox') {
          localStorage.setItem(event.target.name, event.target.checked);
          return;
        }
      }
    });
  };
  speechSynthesis.getVoices();

  document.querySelector('div[name="connection-submit"]').onclick = function() {
    console.log('connection-submitted.');
    // ステータス表示領域
    const status = document.querySelector('div[name="connection-submit"]');
    status.classList.remove('status-ok');
    status.classList.remove('status-ng');
    // 接続情報取得
    const url = document.querySelector('input[name="connection-url"]').value;
    const channel = document.querySelector('input[name="connection-channel"]').value;
    const username = document.querySelector('input[name="connection-username"]').value;
    const password = document.querySelector('input[name="connection-password"]').value;

    let commentator = new Commentator(url, username, password, channel);

    commentator.onjoin = (name) => {
      const format = document.querySelector('input[name="join-format"]').value || '';
      const text = format.replace('${name}', name);
      CreateCommentView(text);
      if (!document.querySelector('input[name="mute-join-leave-use-it"]').checked) {
        AlpataSpeaks(text, username, false);
      }
      logins[name] = logins[name] || { status: '', comment: 0 };
      logins[name].status = 'join';
      updateLoginView();
    };
    commentator.onleave = (name) => {
      const format = document.querySelector('input[name="leave-format"]').value || '';
      const text = format.replace('${name}', name);
      CreateCommentView(text);
      if (!document.querySelector('input[name="mute-join-leave-use-it"]').checked) {
        AlpataSpeaks(text, username, false);
      }
      logins[name].status = 'leave';
      updateLoginView();
    };
    commentator.oncomment = (name, comment) => {
      DispatchComment(username, name, comment);
      CheckCommand(name, comment, channel, commentator);
      logins[name] = logins[name] || { status: '', comment: 0 };
      logins[name].comment += 1;
      talkingWorker.postMessage({ command: 'reset' });
    };
    commentator.onerror = (error) => {
      CreateCommentView(error);
    };

    //** コメント監視開始 */
    commentator.start();

    // 翻訳処理のイベントハンドラー
    translate.ondone = (name, comment, translated, detected) => {
      let text;

      if (detected) {
        text = commentFormatter(name, translated);
        CreateCommentView(`(${detected}) ${comment} => ${text}`);

        if (document.querySelector(`input[name="multiple-speacker-use-it"]`).checked) {
          AlpataSpeaks(text, name, false, detected);
        }
      } else {
        // 言語検出なしの場合はサブターゲットで再翻訳
        const subTarget = document.querySelector('input[name="gas-target-sub"]').value || '';
        if (subTarget) {
          AlpacaTranslate(name, comment, subTarget, true);
        }
        text = commentFormatter(name, comment);
        CreateCommentView(text);
      }
      AlpataSpeaks(text, name, true);
    };

    translate.onsubdone = (name, comment, translated, detected) => {
      let text = commentFormatter(name, translated);
      commentator.sendmsg('', channel, translated);
    };

    translate.onerror = (name, comment, error) => {
      CreateCommentView(`${name} | ${comment} => ${error}`);
      AlpataSpeaks(`${comment}`, name, true);
    };

    // ニックネーム読み込み
    nickname.load(document.querySelector('textarea[name="ta-comment-nickname"]').value);
    // 名前に依存した音声ターゲットの読み込み
    nameRelatedVoice.load(document.querySelector('textarea[name="ta-names-voice"]').value);

    // LoginViewの調整
    let display = 'inherit';
    if (document.querySelector(`input[name="mute-join-mute-loginview"]`).checked) {
      display = 'none';
    }
    document.querySelector('div[name="login"]').style = 'display: ' + display;

    // Workerの読み込み
    talkingWorker.onmessage = () => {
      const target = document.querySelector('input[name="auto-command-target"]').value;
      CheckCommand('', target, channel, commentator);
    };
    if (document.querySelector('input[name="auto-command-use-it"]').checked) {
      talkingWorker.postMessage({
        command: 'start',
        timer: parseInt(
          document.querySelector('input[name="auto-command-timer"]').value, 10)
      });
    }

  }

  // test codes
  document.querySelector('div[name="speech-speaker-submit"]').onclick = function() {
    AlpataSpeaks("吾輩はアルパカである。名前はまだない。", 'test1', false);
  }
  document.querySelector('div[name="speech-speaker-names-submit"]').onclick = function() {
    AlpataSpeaks("吾輩はアルパカである。名前はまだない。", 'test2', false);
  }
  document.querySelector('div[name="auto-command-submit"]').onclick = function() {
    talkingWorker.postMessage({ command: 'test' });
  }

});

/**
 * 音声合成処理.
 * @param {string} text speakする文字列
 * @param {boolean} isPriorize 優先するか？(true: する / false: しない)
 */
function AlpataSpeaks(text, name, isPriorize, detected) {
  if (isPriorize) {
    // 一時的にキャンセル
    // speechSynthesis.cancel();
  }

  let target = 'voice-target';
  if (nameRelatedVoice.exists(name)) {
    target = 'voice-target-names';
  }

  const selectbox = document.querySelector(`select[name="${target}"]`)

  // 言語に応じて音声選択
  let voice = speechSynthesis.getVoices()[selectbox.selectedIndex];
  if (detected && (detected != document.querySelector('input[name="gas-target"]').value || 'ja')) {
    let tempVoice = speechSynthesis.getVoices().find(value => value.lang.startsWith(detected));
    if (tempVoice) {
      voice = tempVoice;
      console.log('voice auto selected.', voice);
    } else {
      console.log('cant find voice.', detected);
    }
  }

  // Cherokee convert
  if (document.querySelector('input[name="speak-cherokee-use-it"]').checked) {
    if (text.indexOf('Ꭰ') != -1
        || text.indexOf('Ꭱ') != -1
        || text.indexOf('Ꭲ') != -1
        || text.indexOf('Ꭳ') != -1
        || text.indexOf('Ꭴ') != -1) {
      text = Array.from(text).map(v => Cherokee[v] || v).join('');
      console.log('Cherokee-ed', text);
    }
  }

  const utter = new SpeechSynthesisUtterance(text);
  utter.volume = document.querySelector(`input[name="${target}-volume"]`).value
  utter.pitch = document.querySelector(`input[name="${target}-pitch"]`).value
  utter.rate = document.querySelector(`input[name="${target}-rate"]`).value
  utter.voice = voice;
  utter.lang = voice.lang;

  utter.onerror = (event) => {
    console.log(event.error);
    speechSynthesis.cancel();
  };

  utter.onend = (event) => {
    console.log('speech end.');
  };

  speechSynthesis.speak(utter);

  // たまに音声合成が止まったりするのを解除する
  if (speakingTimerId) {
    clearTimeout(speakingTimerId);
  }
  speakingTimerId = setTimeout(() => {
    speechSynthesis.cancel();
  }, 30000);
}

function AlpacaTranslate(name, text, target, isSub) {
  // 翻訳情報取得
  const apikey = document.querySelector('input[name="gas-deploy-key"]').value || 'AKfycbx76Gd_ytJJxInNVqVMUhEXpzEL1zsZpb_vRw-Z7S3ZR6n-5dM';
  const timeout = parseInt(document.querySelector('input[name="gas-timeout"]').value, 10) || 10000;
  // 翻訳元を指定しない場合は自動判定するということなので
  translate.exec(text, apikey, '', target, name, timeout, isSub);
}

function CreateCommentView(text) {
  const output = document.querySelector('div[name="comment"]');
  const newNode = document.createElement('div');
  newNode.textContent = text;
  output.insertBefore(newNode, output.firstChild)
}

function CheckCommand(name, comment, channel, commentator) {
  // textareaをJSON化
  const keywords =
    JSON.parse('{' + document.querySelector('textarea[name="ta-comment-keyword"]').value.split('\n')
      .map(v => { return v.replace(/^(.+?): (.+?)$/, '"$1": "$2"') }).join(',') + '}');

  // 特殊コメント対応
  if (comment.startsWith('!!')) {
    const temp = new RegExp(/^!!(.+?):(.+?)$/).exec(comment);
    const cmd = temp[1];
    const arg = temp[2];
    console.log(cmd, arg);

    // !!chatcmd: intercmd proc
    const spcmd = new RegExp(/^(.+?) (.+?)$/).exec(keywords['!!' + cmd]);
    const intercmd = spcmd[1];
    const proc = spcmd[2];
    console.log(intercmd, proc);
    
    switch (intercmd) {
      case 'request':
        fetch(proc.replace('${arg}', arg), {
          method: 'POST',
          mode: "cors",
          headers: { },
          body: { }
        }).then(res => {
          console.log(res)
          if (!res.ok) {
            return res.status + ': ' + res.statusText
          }
          return res.text()
        })
        .then(text => {
          commentator.sendmsg(name, channel, text);
          AlpataSpeaks(text, name);
        });
        break;
    }
    return;
  }

  // 通常コメント対応
  Object.keys(keywords).forEach(key => {
    if (comment.indexOf(key) == -1) {
      return;
    }
    AlpataSpeaks(keywords[key], name, false);
  });
}

function updateLoginView() {
  const view = document.querySelector('div[name="login"]');
  view.innerHTML = '';

  // ステータス > コメント > 名前　順
  Object.keys(logins).sort((v1, v2) => {
    const c1 = logins[v1].status;
    const c2 = logins[v2].status;
    if (c1 == c2) {
      const comment = logins[v2].comment - logins[v1].comment;
      if (comment != 0) {
        return comment;
      }
      return v1 > v2 ? 1 : -1;
    }
    return c1 > c2 ? 1 : -1;
  }).forEach(value => {
    const login = document.createElement('div');
    login.innerHTML = `<span class="${logins[value].status}">●</span><span> ${value} </span><span> - ${logins[value].comment}</span>`;
    view.appendChild(login);
  });
}

function commentFormatter(name, comment) {
  const format = document.querySelector('input[name="comment-format"]').value || '';
  let text =
    format.replace('${name}', nickname.toNickIfExists(name))
      .replace('${comment}', comment);

  //console.log('1)', beforeName, text);

  if (beforeName == name) {
    text = comment;
  }
  beforeName = name;

  //console.log('2)', beforeName, text);

  return text;
}

function DispatchComment(username, name, comment) {
  if (comment.startsWith('!!')) {
    CreateCommentView(comment);
    return;
  }
  if (username == name) {
    return;
  }
  if (document.querySelector('input[name="mute-atmark-target-use-it"]').checked) {
    if (comment.indexOf('@') != -1) {
      return;
    }
  }
  const target = document.querySelector('input[name="gas-target"]').value || 'ja';
  AlpacaTranslate(name, comment, target);
}
