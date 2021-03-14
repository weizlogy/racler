# RACLER

Read Aloud Comments from Livestreaming sitEs in Real time.

ライブ配信サイトのコメントを読み上げる。

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

# Comment Keyword settings

キーワードに反応して自動応答する設定を入力する。
一行で一設定、複数行記載できる。

- 形式
キーワード: 自動応答文

# Speech voice settings

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

# 特記

- 各項目はパスワード以外クライアントPCに保存し、パスワードのみ画面を閉じると削除する。
