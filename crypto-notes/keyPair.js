"use strict";
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
const crypto = __importStar(require("crypto"));
const EthUtil = __importStar(require("ethereumjs-util"));
// 256ビット（32バイト）の秘密鍵をランダム生成
const privateKey = crypto.randomBytes(32);
// 楕円曲線暗号 (ECC) の secp256k1 曲線を使って秘密鍵から公開鍵を生成
// Ethereumでは公開鍵暗号方式にこのsecp256k1曲線が採用されています
const ecdh = crypto.createECDH('secp256k1');
ecdh.setPrivateKey(privateKey);
// 出力
console.log('🔑 秘密鍵:', privateKey.toString('hex'));
console.log('🔓 公開鍵:', ecdh.getPublicKey().toString('hex'));
// 公開鍵からEthereumアドレスを取得
const pubKey = ecdh.getPublicKey();
console.log('pubKey:', pubKey);
const hashedPubKey = EthUtil.keccak(pubKey.slice(1));
const address = EthUtil.bufferToHex(hashedPubKey.slice(-20));
console.log('🏠 Ethereumアドレス:', address);
