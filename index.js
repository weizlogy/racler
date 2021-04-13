var beforeName = '';

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

    // 設定情報の保存と復元
    document.querySelectorAll('input, select, textarea').forEach((element) => {
      let store = (element.type == 'password') ? sessionStorage : localStorage;
      const storageItem = store.getItem(element.name);
      if (storageItem) {
        element.value = storageItem;
      }
      element.onchange = function(event) {
        ((element.type == 'password') ? sessionStorage : localStorage).setItem(
          event.target.name, event.target.value);
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
    const username = document.querySelector('input[name="connection-username"]').value;
    const password = document.querySelector('input[name="connection-password"]').value;

    let commentator = new Commentator(url, username, password);

    commentator.onjoin = (name) => {
      const format = document.querySelector('input[name="join-format"]').value || '';
      const text = format.replace('${name}', name);
      CreateCommentView(text);
      AlpataSpeaks(text, false);
    };
    commentator.onleave = (name) => {
      const format = document.querySelector('input[name="leave-format"]').value || '';
      const text = format.replace('${name}', name);
      CreateCommentView(text);
      AlpataSpeaks(text, false);
    };
    commentator.oncomment = (name, comment) => {
      const format = document.querySelector('input[name="comment-format"]').value || '';
      let text = format.replace('${name}', name).replace('${comment}', comment);
      if (beforeName == name) {
        text = comment;
      }
      beforeName = name;
      CreateCommentView(text);
      AlpataSpeaks(text, true);
      AutoReply(name, comment, username, commentator);
    };
    commentator.onerror = (error) => {
      CreateCommentView(error);
    };

    commentator.start();
  }

  document.querySelector('div[name="speech-speaker-submit"]').onclick = function() {
    AlpataSpeaks("吾輩はアルパカである。名前はまだない。", false);
  }

});

/**
 * 音声合成処理.
 * @param {string} text speakする文字列
 * @param {boolean} isPriorize 優先するか？(true: する / false: しない)
 */
function AlpataSpeaks(text, isPriorize) {
  if (isPriorize) {
    speechSynthesis.cancel();
  }
  const selectbox = document.querySelector(`select[name="voice-target"]`)
  const voice = speechSynthesis.getVoices()[selectbox.selectedIndex];
  const utter = new SpeechSynthesisUtterance(text);
  utter.volume = document.querySelector(`input[name="voice-target-volume"]`).value
  utter.pitch = document.querySelector(`input[name="voice-target-pitch"]`).value
  utter.rate = document.querySelector(`input[name="voice-target-rate"]`).value
  utter.voice = voice;
  utter.lang = voice.lang;
  speechSynthesis.speak(utter);
}

function CreateCommentView(text) {
  const output = document.querySelector('div[name="comment"]');
  const newNode = document.createElement('div');
  newNode.textContent = text;
  output.insertBefore(newNode, output.firstChild)
}

function AutoReply(name, comment, channel, commentator) {
  // textareaをJSON化
  const keywords =
    JSON.parse('{' + document.querySelector('textarea').value.split('\n')
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
        .then(text => commentator.sendmsg(name, channel, text))
        break;
    }
    return;
  }

  // 通常コメント対応
  Object.keys(keywords).forEach(key => {
    if (comment.indexOf(key) == -1) {
      return;
    }
    AlpataSpeaks(keywords[key], false);
  });
}
