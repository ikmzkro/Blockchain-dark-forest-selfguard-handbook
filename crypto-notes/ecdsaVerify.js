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
const EthUtil = __importStar(require("ethereumjs-util"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
/**
 * 環境変数を読み込み、検証する
 */
function loadEnv() {
    const address = process.env.SIGNED_ACOUNT_ADDRESS_ON_ETHERIUM;
    const privateKey = process.env.PRIVATE_KEY;
    if (!address || !privateKey) {
        throw new Error('環境変数が正しく設定されていません。');
    }
    return { address, privateKey };
}
/**
 * メッセージを作成し、ハッシュ化する
 */
function createHashedMessage(address) {
    const timestamp = Date.now();
    const message = `ようこそ!\nAddress: ${address}\ntimestamp: ${timestamp}`;
    console.log(`📝 Original Message:\n${message}`);
    const hashedMessage = EthUtil.keccak(Buffer.from(message, 'utf-8'));
    console.log(`🔹 Hashed Message: ${hashedMessage.toString('hex')}`);
    return hashedMessage;
}
/**
 * 署名を作成する
 */
function getSignature(hashedMessage, privateKey) {
    return EthUtil.ecsign(hashedMessage, privateKey);
}
/**
 * 署名を検証し、署名者アドレスが正しいか判定する
 */
function verifySignature(hashedMessage, signature, expectedAddress) {
    const publicKey = EthUtil.ecrecover(hashedMessage, signature.v, EthUtil.toBuffer(signature.r), EthUtil.toBuffer(signature.s));
    const recoveredAddress = EthUtil.bufferToHex(EthUtil.pubToAddress(publicKey));
    console.log(`🔍 Recovered Address: ${recoveredAddress}`);
    return EthUtil.toChecksumAddress(recoveredAddress) === EthUtil.toChecksumAddress(expectedAddress);
}
/**
 * 1. 環境変数を読み込み
 * 2. メッセージを作成し、ハッシュ化する
 * 3. 秘密鍵で署名を作成する
 * 4. 公開鍵で署名を検証する
 */
try {
    const { address, privateKey } = loadEnv();
    const hashedMessage = createHashedMessage(address);
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    if (!EthUtil.isValidPrivate(privateKeyBuffer)) {
        throw new Error('❌ 無効な秘密鍵です。');
    }
    const signature = getSignature(hashedMessage, privateKeyBuffer);
    console.log(`✍️ Created Signature:`, {
        r: signature.r.toString('hex'),
        s: signature.s.toString('hex'),
        v: signature.v,
    });
    const isVerified = verifySignature(hashedMessage, signature, address);
    console.log(`✅ Signature verification result: ${isVerified ? 'Success' : 'Failure'}`);
}
catch (error) {
    console.error('⚠️ Error:', error);
}
