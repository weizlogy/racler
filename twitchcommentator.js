class TwitchCommentator {

  /** @type string */
  #url;
  /** @type string */
  #username;
  /** @type string */
  #password;

  /** @type WebSocket */
  #socket;

  /**
   * Twitch用コメンテータークラスコンストラクター
   * @param {string} url WebsocketのURL
   * @param {string} username NICK.
   * @param {string} password PASS.
   */
  constructor(url, username, password) {
    const self = this;
    self.#url = url;
    self.#username = username;
    self.#password = password;
  };

  onjoin = (name) => {  };
  onleave = (name) => {  };
  oncomment = (name, comment) => {  };
  onerror = (error) => {  };

  start = () => {
    const self = this;
    self.#socket = new WebSocket(self.#url);
    // エラー処理
    self.#socket.addEventListener('error', (error) => {
      self.onerror(error);
    });

    // ソケットが開いた
    self.#socket.addEventListener('open', (event) => {
      console.log(event)
      self.#socket.send('CAP REQ twitch.tv/commands');
      self.#socket.send('CAP REQ twitch.tv/membership');
      self.#socket.send(`PASS ${self.#password}`);
      self.#socket.send(`NICK ${self.#username}`);
      self.#socket.send(`JOIN #${self.#username}`);
    });
    
    // 打ち返し
    self.#socket.addEventListener('message', (event) => {
      console.log(event)
      const msgs = event.data.split('\r\n');

      msgs.forEach(msg => {

        // 空行除去
        if (msg == '') {
          return;
        }

        console.log(`[ ${msg} ]`);

        const twitchMsg = new TwitchMsg(msg);
        switch (twitchMsg.command()) {
          case 'PING':
            self.#socket.send(twitchMsg.param().replace('PING', 'PONG'));
            break;
          case 'JOIN':
            self.onjoin(twitchMsg.tags());
            break;
          case 'PART':
            self.onleave(twitchMsg.tags());
            break;
          case 'PRIVMSG':
            self.oncomment(twitchMsg.tags(), twitchMsg.param());
            break;
        };
      });
    });
  };
}

class TwitchMsg {

  /** @type string */
  #raw;

  /** @type string */
  #tags;
  /** @type string */
  #command;
  /** @type string */
  #param;

  /**
   * 
   * @param {string} raw 
   */
  constructor(raw) {
    const self = this;
    self.#raw = raw;
    self.#analyze();
  };

  #analyze = () => {
    const self = this;

    // システムメッセージ
    if (self.#raw.startsWith(':tmi.twitch.tv')) {
      return;
    }

    let temp = self.#raw.split(' ');

    // PING
    if (temp.length == 2) {
      self.#command = temp[0];
      self.#param = temp[1];
      return;
    }
    // その他
    // コマンド抽出
    temp = new RegExp(/^:(.+?)!(.+?)@(.+?) (.+?) (.+?)$/).exec(self.#raw);

    self.#tags = temp[1];
    self.#command = temp[4];
    self.#param = temp[5];
    if (self.#command == 'PRIVMSG') {
      self.#param = new RegExp(/^#(.+?) :(.+?)$/).exec(self.#param)[2];
    }
  };

  tags = () => { return this.#tags; };
  command = () => { return this.#command; };
  param = () => { return this.#param; };
};