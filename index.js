// Express モジュールの読み込み
const express = require("express");
const createJwt = require("./util/createJwt.js");
const pemToJwk = require("./util/pemToJwk.js");
const cors = require("cors");
const { engine } = require("express-handlebars");
const fs = require("fs");
const app = express();
const crypto = require("crypto");
const { stringify } = require("remark");
const dbPath = "db/data.json";
const memoryStore = {}; // nonceを一時的に持ってくためのメモリ
const aud = "00000000";
const clientPassword = "abcdef";

// CORSを全てのルートで許可する
app.use(cors());
// Handlebarsを読み取ることができるミドルウェア
app.engine("hbs", engine({ extname: ".hbs", defaultLayout: false }));
app.set("view engine", "hbs");
app.set("views", "./views");
// URLエンコードされたデータを解析するためのミドルウェア
app.use(express.urlencoded({ extended: true })); // extended: true を設定することで、より複雑なオブジェクト構造も解析できるようになります。

// データの読み込み
function loadData() {
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function basicAuthentication(req, res, next) {
  // Authorization ヘッダーを取得
  const authHeader = req.headers["authorization"];

  // Basic 認証データがあるかチェック
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    // return res.status(401).json({ error: 'Authorization header missing or not Basic.' });
    res.status(403).json({ error: "Basic token not found in request headers" });
  }

  // 'Basic 'を除去してエンコードされた文字列を取得
  const base64Credentials = authHeader.split(" ")[1];
  // Base64エンコードされた文字列をデコード
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );

  // コロンでユーザー名とパスワードを分割
  const [reqClientId, reqClientSecret] = credentials.split(":");
  console.log(`reqClientId:${reqClientId}, reqClientSecret:${reqClientSecret}`);

  if (reqClientId === aud && reqClientSecret === clientPassword) {
    next();
  } else {
    res.status(403).json({
      error: "clientId or reqClientSecret is invalid in request headers",
    });
  }
}

function bearerAuthentication(req, res, next) {
  // Authorization ヘッダーを取得
  const authHeader = req.headers["authorization"];

  // Basic 認証データがあるかチェック
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // return res.status(401).json({ error: 'Authorization header missing or not Basic.' });
    res
      .status(403)
      .json({ error: "Bearer token not found in request headers" });
  }

  // Bearer とトークンを分割
  const bearer = authHeader.split(" ");
  // トークンを取得 (Bearerスキーマの後の部分)
  const bearerToken = bearer[1];
  console.log(`bearerToken:${bearerToken}`);
  // トークンと紐づいているユーザーを特定
  const data = loadData();
  const userInfo = data.users.find(
    (user) => user.access_token === bearerToken && user.sub === req.query.sub
  );
  if (typeof user !== "undefined") {
    // トークンに紐づくユーザーが存在する場合は次へ
    req.userInfo = userInfo;
    next();
  } else {
    // トークンに紐づくユーザーが存在しない場合はエラーレスポンス
    res
      .status(403)
      .json({ error: "Bearer token is invalid in request headers" });
  }
}

// ログイン画面
app.get("/oauth/auth", (req, res) => {
  console.log(`query: ${JSON.stringify(req.query)}`);
  const state = req.query.state;
  memoryStore["nonce"] = req.query.nonce; // トークンエンドポイントで返却できるようにメモリに保持しておく
  const data = loadData();
  res.render("users", { users: data.users, state: state });
});

// 認可エンドポイント
app.get("/oauth/login", (req, res) => {
  const state = req.query.state;
  const sub = req.query.sub;
  const code = crypto.randomUUID();
  const data = loadData();

  // users配列を走査し、指定されたsubを持つユーザーにcodeを追加
  data.users.forEach((user) => {
    if (user.sub === sub) {
      user.code = code;
    }
  });

  // 変更したデータをJSONファイルに書き戻す
  fs.writeFile(dbPath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("ファイル書き込み中にエラーが発生しました:", err);
    } else {
      console.log("ファイルが正常に更新されました。");
    }
  });

  res.redirect(
    `http://localhost:8081/oidc/token/bizsol-mock?code=${code}&state=${encodeURIComponent(
      state
    )}`
  );
});

// トークンエンドポイント
app.post("/oauth/token", basicAuthentication, (req, res) => {
  // app.post("/oauth/token", (req, res) => {
  console.log(`req.body: ${JSON.stringify(req.body)}`);
  // codeに紐づくIDトークンの作成&返却
  const code = req.body.code;
  const data = loadData();
  const user = data.users.find((user) => user.code === code);
  const nonce = memoryStore["nonce"]; // メモリに保持しておいたnonceを取得
  const idToken = createJwt({ ...user, nonce: nonce });
  const accessToken = crypto.randomUUID(); // アクセストークンも自動採番し、DBへ登録
  // users配列を走査し、指定されたsubを持つユーザーにcodeを追加
  data.users.forEach((user) => {
    if (user.code === code) {
      user.access_token = accessToken;
    }
  });
  // 変更したデータをJSONファイルに書き戻す
  fs.writeFile(dbPath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("ファイル書き込み中にエラーが発生しました:", err);
    } else {
      console.log("ファイルが正常に更新されました。");
    }
  });
  res.json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 120,
    contractor_id: user.contractor_id,
    scope: "openid",
    id_token: idToken,
  });
});

// ユーザ情報エンドポイント
app.get("/userinfo", bearerAuthentication, (req, res) => {
  // アクセストークンに紐づくユーザーデータの返却
  const userInfo = req.userInfo;
  res.json({
    sub: userInfo.sub,
    user_name: userInfo.user_name,
    zoneinfo: "Asia/Tokyo",
    locale: "ja-JP",
    email: userInfo.email,
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
