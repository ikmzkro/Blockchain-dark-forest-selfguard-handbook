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
 * @function loadEnv
 * @description 環境変数からEthereumアドレスと秘密鍵を読み込み、内容を検証します。
 *
 * @returns {{ address: string; privateKeyHex: string }}
 * Ethereumアドレスと秘密鍵（16進数形式）のオブジェクトを返却します。
 *
 * @throws {Error} - 必要な環境変数が不足している場合にエラーをスローします。
 *
 * @details
 * 本関数は、以下の環境変数を取得して検証します：
 * - **SIGNED_ACOUNT_ADDRESS_ON_ETHERIUM**: 署名者のEthereumアドレス
 * - **PRIVATE_KEY**: Ethereum秘密鍵（16進数形式、64文字）
 *
 * セキュリティ上、秘密鍵は`.env`ファイルで管理し、`gitignore`に追加する必要があります。
 *
 * @example
 * ```typescript
 * const { address, privateKeyHex } = loadEnv();
 * console.log(address);  // Ethereumアドレスが表示される
 * console.log(privateKeyHex);  // 秘密鍵（16進数形式）が表示される
 * ```
 */
function loadEnv() {
    // 環境変数からアドレスと秘密鍵を取得
    const address = process.env.SIGNED_ACOUNT_ADDRESS_ON_ETHERIUM;
    const privateKeyHex = process.env.PRIVATE_KEY;
    // 必須変数が未設定の場合はエラーをスロー
    if (!address || !privateKeyHex) {
        throw new Error('❌ 環境変数が正しく設定されていません。');
    }
    return { address, privateKeyHex };
}
/**
 * @function createHashedMessage
 * @description 指定されたEthereumアドレスを含むメッセージを作成し、Keccak-256でハッシュ化します。
 *
 * @param {string} address - Ethereumアドレス（署名者のアドレス）
 * @returns {Buffer} - Keccak-256でハッシュ化されたメッセージのバイナリデータ（Buffer）
 *
 * @details
 * - メッセージ形式: 「ようこそ!\nAddress: <アドレス>\ntimestamp: <タイムスタンプ>」
 * - ハッシュアルゴリズム: Keccak-256 (Ethereumで標準的に使用されるハッシュ関数)
 * - ハッシュ値の長さ: 256ビット（64文字の16進数形式）
 * - このハッシュ値は後の署名生成時に利用されます。
 *
 * @example
 * ```typescript
 * const hashed = createHashedMessage('0xabc123...');
 * console.log(hashed.toString('hex')); // 16進数で表示されるKeccak-256ハッシュ
 * ```
 */
function createHashedMessage(address) {
    // タイムスタンプを取得し、メッセージを作成
    const timestamp = Date.now();
    const message = `ようこそ!\nAddress: ${address}\ntimestamp: ${timestamp}`;
    console.log(`📝 Original Message:\n${message}`);
    // 文字列をバイナリデータに変換（UTF-8エンコード）
    const messageBuffer = Buffer.from(message, 'utf-8');
    console.log('🛠️ Buffer形式のメッセージ:', messageBuffer);
    // Keccak-256ハッシュを生成（Ethereum標準のハッシュ関数）
    const hashedMessage = EthUtil.keccak(messageBuffer);
    console.log('🔹 Keccak-256ハッシュ (256bit):', hashedMessage);
    console.log(`🔍 Hashed Message (hex): ${hashedMessage.toString('hex')}`);
    return hashedMessage;
}
/**
 * @function validatePrivateKey
 * @description 16進数形式の秘密鍵をバッファに変換し、Ethereumのルールに基づいて有効性を確認します。
 *
 * @param {string} privateKeyHex - 16進数形式の秘密鍵（64文字の16進数文字列）
 * @returns {Buffer} - バッファ形式の秘密鍵（32バイト）
 *
 * @throws {Error} - 秘密鍵が無効な場合、エラーをスローします。
 *
 * @details
 * Ethereumの秘密鍵は`secp256k1`楕円曲線暗号アルゴリズムに基づき、以下の条件を満たす必要があります:
 * - **256ビット (32バイト)** の長さであること
 * - **1以上**かつ **SECP256K1_ORDER未満**であること
 * - 楕円曲線secp256k1における最大の秘密鍵値: SECP256K1_ORDER = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
 * - 不正な秘密鍵は署名作成や検証でエラーとなるため、事前にバリデーションが必要
 *
 * @example
 * ```typescript
 * const privateKey = '7f5b6c3e2d1a0f4e5c6d7b3a2f1e0d9c4b5a6c7d3e2f1a0b7c6d5e4f3b2a1c0';
 * const buffer = validatePrivateKey(privateKey);
 * console.log(buffer); // <Buffer 7f 5b 6c 3e ...>
 * ```
 */
function validatePrivateKey(privateKeyHex) {
    // 16進数の秘密鍵文字列をBufferに変換
    const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
    // 秘密鍵の有効性を確認
    if (!EthUtil.isValidPrivate(privateKeyBuffer)) {
        throw new Error('❌ 無効な秘密鍵です。32バイトの有効な秘密鍵を指定してください。');
    }
    return privateKeyBuffer;
}
/**
 * @function getSignature
 * @description ECDSA署名を生成し、`r`, `s`, `v` の3つのパラメータで署名を返します。
 *
 * @param {Buffer} hashedMessage - Keccak-256でハッシュ化されたaddressを含むメッセージのバイナリデータ。
 * @param {Buffer} privateKey - Ethereum秘密鍵（256bit,32バイト）のバイナリデータ。
 *
 * @returns {{ r: Buffer; s: Buffer; v: number }}
 * ECDSA署名結果として、`r`, `s`, `v` のパラメータを含むオブジェクトを返却します。
 *
 * @throws {Error} - 秘密鍵が無効、またはハッシュメッセージが正しくない場合にエラーをスローします。
 *
 * @details
 * Ethereumの署名は、`secp256k1`楕円曲線暗号アルゴリズムを基に`ECDSA`署名を生成します。
 * 以下の3つの値が署名結果として生成されます：
 * - **`r`**: 署名のx座標部分（32バイト）
 * - **`s`**: 署名のy座標部分（32バイト）
 * - **`v`**: 署名者の公開鍵を復元するために使用されるリカバリパラメータ（27または28）
 * 同じX座標に対して、y座標が上下対称に存在するため、公開鍵の計算時にvが必要になる
 * v = 27またはv = 0 → 正のy座標（偶数）
 * v = 28またはv = 1 → 負のy座標（奇数）
 *
 * 署名時には、メッセージが `keccak256` でハッシュ化されている必要があります。
 *
 * @example
 * ```typescript
 * const message = 'Hello Ethereum';
 * const hashedMessage = EthUtil.keccak(Buffer.from(message, 'utf-8'));
 * const privateKey = Buffer.from('7f5b6c...', 'hex');
 * const signature = getSignature(hashedMessage, privateKey);
 * console.log(signature);
 * ```
 */
function getSignature(hashedMessage, privateKey) {
    // ECDSA署名を生成
    return EthUtil.ecsign(hashedMessage, privateKey);
}
/**
 * @function verifySignature
 * @description Keccak-256ハッシュ化されたメッセージとECDSA署名を使って、署名者アドレスが期待通りかを検証します。
 *
 * @param {Buffer} hashedMessage - Keccak-256でハッシュ化されたメッセージのバイナリデータ。
 * @param {{ r: Buffer; s: Buffer; v: number }} signature - ECDSA署名（`r`, `s`, `v`）。
 * @param {string} expectedAddress - 検証対象となるEthereumアドレス（チェックサム形式が推奨）。
 *
 * @returns {boolean}
 * 署名が有効で、署名者アドレスが`expectedAddress`と一致する場合は`true`を返します。
 *
 * @throws {Error} - 入力データが不正、または公開鍵の復元に失敗した場合にエラーをスローします。
 *
 * @details
 * この関数は、`EthUtil.ecrecover()`を用いて署名から公開鍵を復元し、
 * `EthUtil.pubToAddress()`でアドレスを導出して検証を行います。
 * - `secp256k1`楕円曲線暗号アルゴリズムを使用
 * - ハッシュは`keccak256`で計算されている必要があります
 * - `v`値は27または28を指定する必要があります
 *
 * @example
 * ```typescript
 * const hashedMessage = EthUtil.keccak(Buffer.from('Hello Ethereum', 'utf-8'));
 * const signature = { r: rBuffer, s: sBuffer, v: 28 };
 * const address = '0xabc123...';
 * const isValid = verifySignature(hashedMessage, signature, address);
 * console.log(isValid); // true or false
 * ```
 */
function verifySignature(hashedMessage, signature, expectedAddress) {
    // 署名から公開鍵を復元
    const publicKey = EthUtil.ecrecover(hashedMessage, signature.v, EthUtil.toBuffer(signature.r), EthUtil.toBuffer(signature.s));
    console.log('publicKey:', publicKey);
    // publicKey: <Buffer 62 f4 58 2d 69 7d ba 6e 74 8c a9 17 aa 2e 55 b3 57 94 47 f5 bd 00 23 a5 78 b4 e3 be 59 0d fa db e0 62 84 a2 64 95 d2 14 5d 41 2a 15 a1 3a d7 16 56 86 ... 14 more bytes>
    console.log('EthUtil.pubToAddress(publicKey):', EthUtil.pubToAddress(publicKey));
    // EthUtil.pubToAddress(publicKey): <Buffer 6a 84 32 d3 21 27 3e 2b e8 a3 0a ef 08 39 15 cf db 7f 1b 85>
    // 公開鍵 (publicKey) からEthereumアドレス (address) を取得し、16進数文字列 (hex) 形式で出力する
    const recoveredAddress = EthUtil.bufferToHex(EthUtil.pubToAddress(publicKey));
    console.log(`🔍 Recovered Address: ${recoveredAddress}`);
    // アドレスを比較（チェックサム形式で比較）
    return EthUtil.toChecksumAddress(recoveredAddress) === EthUtil.toChecksumAddress(expectedAddress);
}
/**
 *
 */
try {
    const { address, privateKeyHex } = loadEnv();
    const hashedMessage = createHashedMessage(address);
    const privateKeyBuffer = validatePrivateKey(privateKeyHex);
    console.log('🔑 有効な秘密鍵です:', privateKeyBuffer);
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
