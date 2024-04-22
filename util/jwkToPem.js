const jose = require("node-jose");

// GoogleのJWK
const jwk = {
  alg: "RS256",
  use: "sig",
  kty: "RSA",
  n: "w1Tonp1EkpYfTTYROKafxaqQjZXHem6kMH4g-AgQvHIGz91XD4j4WDIxwik9FhRnYG9nVqbYV8LI5Z7cZrmWx89UVl-N5svzGFAdX1_6FAQnc1EjvaaaU0vBQU6ZOusWND4YFg-b9T5uk4p1rITwv_rCgIq3TS5vA-EuERGOmfFfNdsRC6FN1W7fj1LB2mSAzgezeSSqnP9Blirvg99zNhCBlltWvS0aXsmCuVn13-xdnmQb0W9sB1l6vFso5jCTpUjDX3t1VlHYdqBSxayhMGW3AK3O4kUrYPMK6C6O-XGgcwwLcYAw70fytm-YnwXUvxBtaaq8wgsuE7jPcaVyPw",
  e: "AQAB",
  kid: "6ce11aecf9eb14024a44bbfd1bcf8b32a12287fa",
};

// BizSOL開発者ポータルのJWK。keyidが適当なためこのままでは使えない
// const jwk = {
//   kty: "EC",
//   crv: "P-256",
//   x: "jw2ZZ9rHePu2FGA_1zCPujMq95MBsulYoPf4GrzRMfI",
//   y: "_7027yn1zuPAevKxTHqfKi-08uDDFtiQRh-jvUAAdjw",
//   use: "sig",
//   kid: "fapi_id_token_kid",
// };

// JWKをPEMフォーマットに変換する関数
async function jwkToPem(jwk) {
  const key = await jose.JWK.asKey(jwk);
  const pem = key.toPEM(); // 公開鍵をPEMフォーマットで出力
  console.log(pem);
}

// 関数を実行
jwkToPem(jwk);

// 関数をモジュールとしてエクスポート
module.exports = { jwkToPem };
