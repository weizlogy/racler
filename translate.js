class RTAWTranslate {

  ondone = (translated) => {};
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
      const translated = data["translated"];
      // 翻訳前後が同じなら無視する
      if (text == translated) {
        return;
      }
      self.ondone(name, translated);
    })
    .fail(function(data) {
      self.onerror(name, data);
    });
  };

};

/** JSONP用のダミーコールバック. */
function test() { }
