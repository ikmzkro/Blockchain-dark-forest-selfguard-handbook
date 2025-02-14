"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EthUtil = require("ethereumjs-util");
var dotenv = require("dotenv");
dotenv.config();
// 環境変数の読み込み
var SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM = process.env.SIGNED_ACOUNT_ADDRESS_ON_ETHERIUM;
var PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM || !PRIVATE_KEY) {
    throw new Error('環境変数が設定されていません。');
}
// メッセージを作成
var timestamp = Date.now();
var MESSAGE = "\u3088\u3046\u3053\u305D!\nAddress: ".concat(SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM, "\ntimestamp: ").concat(timestamp);
console.log('Original Message:', MESSAGE);
// メッセージのハッシュ化
var HASHED_MESSAGE = EthUtil.keccak(Buffer.from(MESSAGE, 'utf-8'));
console.log('Hashed Message:', HASHED_MESSAGE.toString('hex'));
// 秘密鍵をBuffer形式に変換
var HASHED_PRIVATE_KEY = Buffer.from(PRIVATE_KEY, 'hex');
if (!EthUtil.isValidPrivate(HASHED_PRIVATE_KEY)) {
    throw new Error('無効な秘密鍵です。');
}
// メッセージと秘密鍵から署名を作成する関数
function getSignature(hashedMessage, privateKey) {
    var createdSignature = EthUtil.ecsign(hashedMessage, privateKey);
    return createdSignature;
}
// 署名とメッセージから署名者アドレスを検証する関数
function getVerifiedSigner(hashedMessage, createdSignature, signedAccountAddress) {
    // 作成された署名から公開鍵を導出
    var publicKey = EthUtil.ecrecover(hashedMessage, createdSignature.v, EthUtil.toBuffer(createdSignature.r), EthUtil.toBuffer(createdSignature.s));
    // 公開鍵から署名者のアドレスを導出
    var signerAccountAddress = EthUtil.bufferToHex(EthUtil.pubToAddress(publicKey));
    // 導出したアドレスと署名時のアドレスを比較して真偽値を返す
    return (EthUtil.toChecksumAddress(signerAccountAddress) ===
        EthUtil.toChecksumAddress(signedAccountAddress));
}
// 署名を作成する
var CREATED_SIGNATURE = getSignature(HASHED_MESSAGE, HASHED_PRIVATE_KEY);
console.log('Created Signature:', {
    r: CREATED_SIGNATURE.r.toString('hex'),
    s: CREATED_SIGNATURE.s.toString('hex'),
    v: CREATED_SIGNATURE.v,
});
// 署名を検証する
var isVerified = getVerifiedSigner(HASHED_MESSAGE, CREATED_SIGNATURE, SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM);
console.log("Signature verification result: ".concat(isVerified ? 'Success' : 'Failure'));
