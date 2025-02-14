"use strict";
// 公開鍵を復元する ecrecover 処理がわかりにくい
// const recoveredPublicKey = EthUtil.ecrecover(
//     hashedMessage,                   // メッセージハッシュ
//     signature.v,                     // ※どちらの鍵かを示す
//     EthUtil.toBuffer(signature.r),   // r値
//     EthUtil.toBuffer(signature.s)    // s値
//   );
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// ※同じX座標に対して、y座標が上下対称に存在するため、公開鍵の計算時にvが必要になる
// v = 27またはv = 0 → 正のy座標（偶数）
// v = 28またはv = 1 → 負のy座標（奇数）
const crypto = __importStar(require("crypto"));
const ethUtil = __importStar(require("ethereumjs-util"));
const util_1 = require("@ethereumjs/util");
/**
 * ECDSA公開鍵を署名から復元する関数。
 * @param hashedMessage - Keccak256でハッシュ化されたメッセージ。
 * @param v - リカバリID（27/28 または 0/1）。
 * @param r - 署名のr値。
 * @param s - 署名のs値。
 * @returns 公開鍵（Buffer形式）。
 */
function customEcrecover(hashedMessage, v, r, s) {
    const curve = crypto.createECDH('secp256k1');
    // 1️. rとsをBigIntに変換
    const rBig = BigInt('0x' + r.toString('hex'));
    const sBig = BigInt('0x' + s.toString('hex'));
    // 2️. 楕円曲線のパラメータ
    const G = util_1.secp256k1.curve.g; // 基準点G
    const n = util_1.secp256k1.curve.n; // 曲線の位数
    // 3. メッセージハッシュをBigIntに変換
    const z = BigInt('0x' + hashedMessage.toString('hex'));
    // 4️. リカバリIDからy座標の符号を判別
    const recId = v - 27; // 27や28形式の場合
    // 5️. rからR点を計算
    const R = util_1.secp256k1.curve.pointFromX(recId === 1, rBig);
    // 6️. 公開鍵の計算式: Q = s⁻¹ * (zG + rR)
    const sInv = sBig ** (n - BigInt(2)) % n; // sの逆元
    // zGを計算
    const zG = G.mul(z);
    // rRを計算
    const rR = R.mul(rBig);
    // 公開鍵 Q を計算
    const publicKey = zG.add(rR).mul(sInv);
    // 7️. 公開鍵をBuffer形式で返す
    return Buffer.from(publicKey.encode('uncompressed', true));
}
// 実行テスト
const message = 'Hello, Ethereum!';
const hashedMessage = ethUtil.keccak(Buffer.from(message));
const privateKey = crypto.randomBytes(32);
const signature = ethUtil.ecsign(hashedMessage, privateKey);
const recoveredPublicKey = customEcrecover(hashedMessage, signature.v, ethUtil.toBuffer(signature.r), ethUtil.toBuffer(signature.s));
console.log('🔓 復元された公開鍵:', recoveredPublicKey.toString('hex'));
// 公開鍵からアドレスを計算して検証
const hashedPubKey = ethUtil.keccak(recoveredPublicKey.slice(1));
const recoveredAddress = ethUtil.bufferToHex(hashedPubKey.slice(-20));
console.log('🏠 復元されたアドレス:', recoveredAddress);
