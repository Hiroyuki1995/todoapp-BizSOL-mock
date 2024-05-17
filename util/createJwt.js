import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";

import { fileURLToPath } from "url";

// ESモジュール内で __dirname 相当のパスを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
/**
 *
 * @param {*} obj
 * @param {string} obj.sub ユーザ識別子
 * @param {string} obj.nonce ノンス
 * @returns
 */
const createJwt = (obj) => {
  const payload = {
    iss: "http://localhost:8082",
    sub: obj.sub,
    aud: "00000000", // バックエンドで定義しているクライアントIDと一緒にすべし
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // トークンの有効期限を1時間後(60秒*60分)に設定
    iat: Math.floor(Date.now() / 1000),
    auth_time: Math.floor(Date.now() / 1000),
    nonce: obj.nonce,
  };
  const token = jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    header: header,
  });
  console.log(`token: ${token}`);
  return token;
};

export default createJwt;

createJwt("noncetest");
