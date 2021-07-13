class RTAWTranslate {

  ondone = (name, text, translated, detected) => { console.log(name, translated, detected); };
  onerror = (error) => {};

  constructor() { };

  exec = (text, apikey, source, target, name, timeout, isSub) => {
    const self = this;

    if (text === "") {
      return;
    }

    // コールバック動的対応
    const fname = 'test' + Date.now();
    window[fname] = () => {};

    // 翻訳する
    console.log(
      `https://script.google.com/macros/s/${apikey}/exec?text=${(text)}&source=${source}&target=${target}`)
    $.ajax({
      url: `https://script.google.com/macros/s/${apikey}/exec?text=${(text)}&source=${source}&target=${target}`,
      dataType: "jsonp",
      jsonpCallback: fname,
      timeout: timeout
    }).done(function(data) {
      console.log('translate-done', data);
      const translated = data["translated"];
      const detected = data["detected"].toLowerCase();
      // サブターゲット翻訳
      if (isSub) {
        self.onsubdone(name, text, translated, detected);
        return;
      }
      // 翻訳前後が同じなら翻訳結果を無視する
      if (detected == target) {
        self.ondone(name, text, text);
        return;
      }
      self.ondone(name, text, translated, detected);
    })
    .fail(function(XMLHttpRequest, textStatus, errorThrown) {
      console.log('translate-fail', XMLHttpRequest.status, textStatus, errorThrown);
      // サブターゲット翻訳で失敗してもエラー処理しないでいいです
      if (!isSub) {
        self.onerror(name, text, `${textStatus}. ${errorThrown}.`);
      }
    })
    .always(() => {
      window[fname] = null;
    });
  };

};
