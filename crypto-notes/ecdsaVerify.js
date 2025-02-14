"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EthUtil = require("ethereumjs-util");
var dotenv = require("dotenv");
dotenv.config();
// 0. 環境変数の取得
var SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM = process.env.SIGNED_ACOUNT_ADDRESS_ON_ETHERIUM;
var PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM || !PRIVATE_KEY) {
    throw new Error('環境変数が設定されていません。');
}
// 1. メッセージの作成
var timestamp = Date.now();
var MESSAGE = "\u3088\u3046\u3053\u305D!\nAddress: ".concat(SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM, "\ntimestamp: ").concat(timestamp);
console.log('Original Message:', MESSAGE);
// 2. メッセージのハッシュ化
var HASHED_MESSAGE = EthUtil.keccak(Buffer.from(MESSAGE, 'utf-8'));
console.log('Hashed Message:', HASHED_MESSAGE.toString('hex'));
// 3. 署名の作成
var PRIVATE_KEY_BUFFER = Buffer.from(PRIVATE_KEY, 'hex');
if (!EthUtil.isValidPrivate(PRIVATE_KEY_BUFFER)) {
    throw new Error('無効な秘密鍵です。');
}
var signature = EthUtil.ecsign(HASHED_MESSAGE, PRIVATE_KEY_BUFFER);
var signatureHex = EthUtil.toRpcSig(signature.v, signature.r, signature.s);
console.log('Signature:', signatureHex);
// 4. 公開鍵の取得
var publicKey = EthUtil.ecrecover(HASHED_MESSAGE, signature.v, signature.r, signature.s);
var derivedAddress = EthUtil.bufferToHex(EthUtil.pubToAddress(publicKey));
console.log('Derived Address:', derivedAddress);
console.log('Original Address:', SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM);
// 5. 署名の検証
var isValidSignature = derivedAddress.toLowerCase() === (SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM === null || SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM === void 0 ? void 0 : SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM.toLowerCase());
console.log("Signature verification result: ".concat(isValidSignature ? 'Success' : 'Failure'));
