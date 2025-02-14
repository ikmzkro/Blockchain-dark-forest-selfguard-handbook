import * as EthUtil from 'ethereumjs-util';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * 環境変数を読み込み、検証する
 */
function loadEnv(): { address: string; privateKeyHex: string } {
  const address = process.env.SIGNED_ACOUNT_ADDRESS_ON_ETHERIUM;
  const privateKeyHex = process.env.PRIVATE_KEY;

  if (!address || !privateKeyHex) {
    throw new Error('環境変数が正しく設定されていません。');
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
function createHashedMessage(address: string): Buffer {
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
 * 秘密鍵をバッファに変換し、有効性を確認する関数
 * @param privateKeyHex - 16進数形式の秘密鍵文字列
 * @returns バッファ形式の秘密鍵
 * @throws エラー - 秘密鍵が無効な場合
 */
function validatePrivateKey(privateKeyHex: string): Buffer {
  // 16進数文字列をBufferに変換
  const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');

  // 秘密鍵の有効性を確認
  if (!EthUtil.isValidPrivate(privateKeyBuffer)) {
    throw new Error('❌ 無効な秘密鍵です。32バイトの有効な秘密鍵を指定してください。');
  }

  return privateKeyBuffer;
}

/**
 * 署名を作成する
 */
function getSignature(hashedMessage: Buffer, privateKey: Buffer): {
  r: Buffer;
  s: Buffer;
  v: number;
} {
  return EthUtil.ecsign(hashedMessage, privateKey);
}

/**
 * 署名を検証し、署名者アドレスが正しいか判定する
 */
function verifySignature(
  hashedMessage: Buffer,
  signature: { r: Buffer; s: Buffer; v: number },
  expectedAddress: string
): boolean {
  const publicKey = EthUtil.ecrecover(
    hashedMessage,
    signature.v,
    EthUtil.toBuffer(signature.r),
    EthUtil.toBuffer(signature.s)
  );

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
} catch (error) {
  console.error('⚠️ Error:', error);
}
