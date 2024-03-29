# RACLER

Read Aloud Comments from Livestreaming sitEs in Real time.

ライブ配信サイトのコメントを読み上げる。自動翻訳機能付き。

コメントのキーワードに反応して自動応答する。

# 動作環境

- Google Chrome

# Comment View

コメントを表示する場所。

# Connection settings

## URL

ライブ配信サイトのURLを指定する。

### Twitch

- ws://irc-ws.chat.twitch.tv:80
- wss://irc-ws.chat.twitch.tv:443

## UserName

ライブ配信サイトのユーザー名

## Password

ライブ配信サイトのコメントにアクセスするパスワード

# Comment format settings

## Mute LoginView

チェックすると、ライブ配信のチャンネルに入場 / 退出したユーザー状態を表示しない。

デフォルト：ミュートしない

## Join

ライブ配信のチャンネルに入場したユーザーの表示用フォーマット。

- ${name}
ユーザー名に置き換わる。

## Leave

ライブ配信のチャンネルから退出したユーザーの表示用フォーマット。

- ${name}
ユーザー名に置き換わる。

## Comment

ライブ配信のチャンネルでコメントしたユーザーの表示用フォーマット。

- ${name}
ユーザー名に置き換わる。

- ${comment}
コメントに置き換わる。

# Comment translate settings

## GAS deploy key

翻訳機能を持つgoogle apps scriptのデプロイキーを設定する。

デフォルト：アルパカさんの

落ちてる場合は自分で用意すること。

``` js
// サンプル
function doGet(e) {
  var p = e.parameter;
  var translatedText = LanguageApp.translate(p.text, p.source, p.target);
  return ContentService.createTextOutput(e.parameter.callback + '({"translated" : "' + translatedText + '"});').setMimeType(ContentService.MimeType.JAVASCRIPT);
}
```

## Target lang

翻訳対象の言語を設定する。

デフォルト：ja

## Target sub lang

翻訳対象とチャットの入力言語が同一の場合に、再翻訳する対象の言語を設定する。

- 未設定の場合は何もしない

- 設定されている場合は再翻訳結果をチャットに出力する

デフォルト：なし

## Timeout

翻訳タイムアウトを設定する。（ミリ秒）

デフォルト：10000

# Comment Keyword settings

キーワードに反応して自動応答する設定を入力する。
一行で一設定、複数行記載できる。

- 形式
キーワード: 自動応答文

## 特殊コメント

キーワードに!を含めた以下のフォーマットを設定するとカスタムチャットコマンドを用意できる。

```
!<ChatCommand>: <InternalCommand> <Process>
```

ex) !test: request http:~~~?${arg}

で、チャット欄から !test xxx と呼んでもらう。xxxは${arg}と入れ替わる。

### ChatCommand

外向けのチャットコマンド。これを使ってもらう。

### InternalCommand

内向けのコマンド。以下のコマンドが用意されている。

- request
<Process>にURLを指定し、結果をチャット欄に打ち返す。

# Comment NickName settings

ユーザーのニックネームを設定し、ニックネームでコメントを読み上げるようにする。
現時点では、Join / Leaveは対象外。

一行で一設定、複数行記載できる。

- 形式
ユーザー名: ニックネーム

# Speech voice settings

## Use multiple speacker (experimental)

チェックすると、翻訳前のコメントも読み上げる。

デフォルト：読み上げない

## Mute Join / Leave

チェックすると、ライブ配信のチャンネルに入場 / 退出したユーザーの読み上げをミュートする。

デフォルト：ミュートしない

## Mute @ target

チェックすると、@を含むコメントの読み上げをミュートする。

デフォルト：ミュートしない

## Voice

コメント読み上げの音声を設定する。

デフォルト：取得可能な音声一覧の先頭

## Volume

音声の音量を設定する。

デフォルト：1

## Pitch

音声の音程を設定する。

デフォルト：1

## Rate

音声の速度を設定する。

デフォルト：1

## Test

音声合成をテスト実行する。

# Auto command settings

チャットコマンドを定期的に実行する機能。

## Use auto command

チェックすると、機能を有効にする。

デフォルト：有効にしない

## Command

実行するコマンドを設定する。

デフォルト：なし

## Timer

コマンドの実行間隔を指定する。（ミリ秒）

デフォルト：300000

# 特記

- 各項目はパスワード以外クライアントPCに保存し、パスワードのみ画面を閉じると削除する。
