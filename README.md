# モックサーバの起動方法

以下を実行

```bash
node index.js
```

# JWT の作成方法

0. ライブラリのインストール

```bash
npm install
```

1. 秘密鍵(pem 形式)を作成(/key にて実行)

```bash
openssl genrsa -out private_key.pem 2048
```

2. 公開鍵(pem 形式)の生成(/key にて実行)

```bash
openssl rsa -in private_key.pem -outform PEM -pubout -out public_key.pem
```

3. 作成したい JWT のヘッダとペイロードを/util/createJwt.js に定義。
4. createJwt を実行(/util にて実行)

```bash
node createJwt.js
```

5. 以下のようにログに token が出力される

```
token: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFIelpwSjRVRElKNTMwSEpEOWxYa0FwN3Z0UTAtbFBjNUtDaHRVcm5YdGMifQ.eyJpc3MiOiJodHRwczovL3d3dy5hcGlndy5vcGVuY2FudmFzLm5lLmpwIiwic3ViIjoiOTk5OUFHMDEyMzQ1Njc4OUEwMDEiLCJhdWQiOiIwMDAwMDAwMCIsImV4cCI6MTcxMzgwNTYzOSwiaWF0IjoxNzEzODAyMDM5LCJhdXRoX3RpbWUiOjE3MTM4MDIwMzksIm5vbmNlIjoibm9uY2V0ZXN0In0.SXAPncJXTX-RItP0sgNyrgFOIddmxG2kMDIapVcIEGZikgdYDeUz3Dh4MSyxQ4d99qMf9aTfCEODT8MJtKLGuRtaz2BKkkMmv5FjpR2Y6l9DzetFckRrqVPq2Ig8kU94O-0ERCduRY6pP7X5VzqFgbm4LzxZ5LWQXUiGtjFsJiAB0y9zO8bpfLExnVgQKYL64MP-HxVcnx0el_5qhuC6AId2tVot0FTqMkcaHoyJuUB4yAfrxoMtvd56FqkHg2IxOvNnQT9kJXeaDLt6zvt3J9CmvoAABXTscFvkJVWhB87ConUlY9AeEeQLI0axWWfegxLKNDJJ4WWK_Ha59YzBaQ
```

# JWT トークンの簡単な検証方法

1. https://jwt.io/#debugger へアクセス
2. Encoded に JWT の文字列をペースト
3. verify signature の public key に JWK をペーストすることで、「Signature Verified」か「Invalid Signature」がわかる

- このとき、JWKS（JWK セット）ではなく、JWS を入れることに注意

- JWKS の例

```json
{
  "keys": [
    {
      "kty": "RSA",
      "kid": "AHzZpJ4UDIJ530HJD9lXkAp7vtQ0-lPc5KChtUrnXtc",
      "use": "sig",
      "alg": "RS256",
      "n": "yzRbeo2zy1EeNjC-TG31nISiKlAIcXzepKO7bkVzxV_Td4GF3JLLpaxnSZkefY06Q1PDtTuSS48u5ZxLnaUCV2lcA7RAO0kq5AQaZUcRdpBvYreH_KHLQDso3YbRVIHrP_DJb2Pb7YjtaBdGSHorrtMcePdPE_sEh07ia62nTwGpRuEZtZVRCrtuioGTA1oQR2vZje-30S08ENnsiNIxXMXatOX34HnoY3syqdnefSsLIAqtORNoTtINMx2pUjfso8gL83YQxHETnTK-PCl5SxwYAlnum2w1oCt9E3a_Yo8gcQYDpd8OsX-TuCMzkv9zU637ryu50Hstda9WTGhLYw",
      "e": "AQAB"
    }
  ]
}
```

- JWK の例

```json
{
  "kty": "RSA",
  "kid": "AHzZpJ4UDIJ530HJD9lXkAp7vtQ0-lPc5KChtUrnXtc",
  "use": "sig",
  "alg": "RS256",
  "n": "yzRbeo2zy1EeNjC-TG31nISiKlAIcXzepKO7bkVzxV_Td4GF3JLLpaxnSZkefY06Q1PDtTuSS48u5ZxLnaUCV2lcA7RAO0kq5AQaZUcRdpBvYreH_KHLQDso3YbRVIHrP_DJb2Pb7YjtaBdGSHorrtMcePdPE_sEh07ia62nTwGpRuEZtZVRCrtuioGTA1oQR2vZje-30S08ENnsiNIxXMXatOX34HnoY3syqdnefSsLIAqtORNoTtINMx2pUjfso8gL83YQxHETnTK-PCl5SxwYAlnum2w1oCt9E3a_Yo8gcQYDpd8OsX-TuCMzkv9zU637ryu50Hstda9WTGhLYw",
  "e": "AQAB"
}
```

- ここで提供している、/util/pemTojwk.js 実行時にログ出力される JWK をペーストすれば、
- イメージは以下
  ![alt text](image.png)
