class RTAWNickName {

  #nickname;

  constructor() { };

  load = (target) => {
    const self = this;

    // textareaをJSON化
    self.#nickname =
      JSON.parse('{' + target.split('\n')
        .map(v => { return v.replace(/^(.+?): (.+?)$/, '"$1": "$2"') }).join(',') + '}');
  };

  toNickIfExists = (name) => {
    const self = this;

    return self.#nickname[name] || name;
  };
};
