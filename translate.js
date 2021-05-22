class RTAWTranslate {

  ondone = (name, text, translated, detected) => { console.log(name, translated, detected); };
  onerror = (error) => {};

  constructor() { };

  exec = (text, apikey, source, target, name) => {
    const self = this;

    if (text === "") {
      return;
    }
    // 翻訳する
    console.log(
      `https://script.google.com/macros/s/${apikey}/exec?text=${(text)}&source=${source}&target=${target}`)
    $.ajax({
      url: `https://script.google.com/macros/s/${apikey}/exec?text=${(text)}&source=${source}&target=${target}`,
      dataType: "jsonp",
      jsonpCallback: "test",
      timeout: 10000
    }).done(function(data) {
      console.log('translate-done', data);
      const translated = data["translated"];
      const detected = data["detected"].toLowerCase();
      // 翻訳前後が同じなら翻訳結果を無視する
      if (detected == target) {
        self.ondone(name, text, text, target);
        return;
      }
      self.ondone(name, text, translated, detected);
    })
    .fail(function(data) {
      console.log('translate-fail', data);
      self.onerror(name, data);
    });
  };

};

/** JSONP用のダミーコールバック. */
function test() { }
