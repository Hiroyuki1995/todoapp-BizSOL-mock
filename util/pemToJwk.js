const fs = require("fs");
const path = require("path");
const jose = require("node-jose");

const pemToJwk = async () => {
  // PEMファイルの内容を読み込む
  const pem = fs.readFileSync(
    path.resolve(__dirname, "../key/public_key.pem"),
    "utf8"
  );

  // PEMからJWKオブジェクトに変換
  const keystore = jose.JWK.createKeyStore();
  const jwk = await jose.JWK.asKey(pem, "pem", {
    alg: "RS256", // 使用するアルゴリズム
    use: "sig", // 用途（署名用）
  });

  // JWK形式のキーを出力
  // console.log("JWK:", JSON.stringify(jwk.toJSON(true), null, 2));
  return jwk;
};

// 関数の実行（例として'public_key.pem'を指定）
pemToJwk().catch(console.error);

module.exports = pemToJwk;
