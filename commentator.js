class Commentator {

  /** @type Commentator */
  #worker;

  /**
   * コメンテータークラスコンストラクター
   * @param {string} url WebsocketのURL
   * @param {string} username IRC接続用ユーザー名
   * @param {string} password IRC接続用パスワード
   */
  constructor(url, username, password) {
    const self = this;
    if (url.indexOf('twitch') != -1) {
      self.#worker = new TwitchCommentator(url, username, password);
      self.#worker.onjoin = (name) => { self.onjoin(name); };
      self.#worker.onleave = (name) => { self.onleave(name); };
      self.#worker.oncomment = (name, comment) => { self.oncomment(name, comment); };
      self.#worker.onerror = (error) => { self.onerror(error); };
    }
  };

  onjoin = (name) => {  };
  onleave = (name) => {  };
  oncomment = (name, comment) => {  };
  onerror = (error) => {  };

  start = () => {
    const self = this;
    if (self.#worker == null) {
      self.onerror();
      return;
    }
    self.#worker.start();
  };

  stop = () => {
    const self = this;
    if (self.#worker == null) {
      return;
    }
    self.#worker.stop();
  };
};
