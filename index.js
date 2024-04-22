// Express モジュールの読み込み
const express = require("express");
const createJwt = require("./util/createJwt.js");
const pemToJwk = require("./util/pemToJwk.js");
const cors = require("cors");
const app = express();
const memoryStore = {}; // nonceを一時的に持ってくためのメモリ

// CORSを全てのルートで許可する
app.use(cors());

// 認可エンドポイント
app.get("/oauth/auth", (req, res) => {
  const state = req.query.state;
  memoryStore["nonce"] = req.query.nonce; // トークンエンドポイントで返却できるようにメモリに保持しておく
  // stateをきちんとURLエンコードする
  // TODO: ログイン画面の作成
  res.redirect(
    `http://localhost:8081/oidc/token/bizsol-mock?code=cb46420e53c24580a4c4e0fe8f999999&state=${encodeURIComponent(
      state
    )}`
  );
});

// トークンエンドポイント
app.post("/oauth/token", (req, res) => {
  // TODO: codeに紐づくIDトークンの作成&返却
  const nonce = memoryStore["nonce"]; // メモリに保持しておいたnonceを取得
  const idToken = createJwt(nonce);
  res.json({
    access_token: "7d0e8fddb23a40a2b5f73c2771e9c4c7", // TODO:アクセストークンも都度採番がよいか
    token_type: "Bearer",
    expires_in: 120,
    contractor_id: "0000000000000000AG0123456789A001",
    scope: "openid",
    id_token: idToken,
  });
});

// ユーザ情報エンドポイント
app.get("/userinfo", (req, res) => {
  // TODO: アクセストークンに紐づくユーザーデータの返却
  res.json({
    sub: "9999AG0123456789A001",
    user_name: "ＮＴＴデータ太郎",
    nickname: null,
    zoneinfo: "Asia/Tokyo",
    locale: "ja-JP",
    phone_number: null,
    email: "nttdatataro@example.com",
    email_verified: true,
    address: {},
    option: {
      kigyo_kana: "ｵｵｿﾞﾗｼﾖｳｼﾞ(ｶ",
      kigyo_kanji: "大空商事",
      kigyo_kana_jusho: "ﾄｳｷﾖｳﾄﾐﾅﾄｸｴﾋﾞｽ1-1-1",
      kigyo_tel_no: "1234567890",
      kanrisha_kengen_kbn: "1",
      riyo_login_id: "12345678",
    },
  });
});

// jwtエンドポイント
app.get("/oauth/public_keys", async (req, res) => {
  // 以下はpublic_key.pemをpemToJwkでJWK形式にしたJSON
  const jwk = await pemToJwk();
  res.json({ keys: [jwk] }); // keyが1つでも複数でもキーセットを返却する必要がある
});

// サーバーをポート 8082 で起動
app.listen(8082, () => {
  console.log("Server is running on http://localhost:8082");
});
