class RTAWNameRelatedVoice {

  #names;

  constructor() { };

  load = (target) => {
    const self = this;

    // textareaをJSON化
    self.#names = target.split('\n');

    console.log('NNV=>', self.#names)
  };

  exists = (name) => {
    const self = this;

    // テストコード
    if (name == 'test2') {
      return true;
    }

    return self.#names.indexOf(name) != -1;
  };
};
