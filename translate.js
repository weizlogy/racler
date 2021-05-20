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
      const detected = data["detected"];
      // 翻訳前後が同じなら無視する
      if (text == translated) {
        return;
      }
      self.ondone(name, text, translated, detected.toLowerCase());
    })
    .fail(function(data) {
      console.log('translate-fail', data);
      self.onerror(name, data);
    });
  };

};

/** JSONP用のダミーコールバック. */
function test() { }
