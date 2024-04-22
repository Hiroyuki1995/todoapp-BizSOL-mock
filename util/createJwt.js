const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

// 秘密鍵の読み込み
// 外部から読み込まれてもこのファイルからの相対パスでいけるように、path.resolveを追加
const privateKey = fs.readFileSync(
  path.resolve(__dirname, "../key/private_key.pem")
);

// JWTのヘッダとペイロードを定義
const header = {
  typ: "JWT",
  alg: "RS256", // BizSOL開発者ポータルはSR256だが、そのようなアルゴリズムは存在しないと思われる
  kid: "AHzZpJ4UDIJ530HJD9lXkAp7vtQ0-lPc5KChtUrnXtc",
};

// JWTの生成
const createJwt = (nonce) => {
  const payload = {
    iss: "https://www.apigw.opencanvas.ne.jp",
    sub: "9999AG0123456789A001",
    aud: "00000000", // バックエンドで定義しているクライアントIDと一緒にすべし
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // トークンの有効期限を1時間後(60秒*60分)に設定
    iat: Math.floor(Date.now() / 1000),
    auth_time: Math.floor(Date.now() / 1000),
    nonce: nonce,
  };
  const token = jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    header: header,
  });
  console.log(`token: ${token}`);
  return token;
};

module.exports = createJwt;

createJwt("noncetest");
