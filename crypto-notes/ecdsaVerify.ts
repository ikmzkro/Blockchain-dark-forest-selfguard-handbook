import * as EthUtil from 'ethereumjs-util';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * 環境変数を読み込み、検証する
 */
function loadEnv(): { address: string; privateKey: string } {
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
function createHashedMessage(address: string): Buffer {
  const timestamp = Date.now();
  const message = `ようこそ!\nAddress: ${address}\ntimestamp: ${timestamp}`;
  console.log(`📝 Original Message:\n${message}`);

  // 文字列や数値をバイナリデータに変換して暗号学的処理に対応させる：　Buffer.from(message, 'utf-8')
  // 同じデータなら同じハッシュ値が出るためKeccak-256ハッシュ化する：　EthUtil.keccak
  const hashedMessage = EthUtil.keccak(Buffer.from(message, 'utf-8'));

  console.log('Buffer形式のメッセージ:', Buffer.from(message, 'utf-8'));
  console.log('Keccak-256ハッシュ: 256bitの文字列', hashedMessage);
  console.log(`Hashed Message: 64文字の16進数で表示 ${hashedMessage.toString('hex')}`);

  return hashedMessage;
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
} catch (error) {
  console.error('⚠️ Error:', error);
}
