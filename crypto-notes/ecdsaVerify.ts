import * as EthUtil from 'ethereumjs-util';
import * as dotenv from 'dotenv';

dotenv.config();

// 環境変数の読み込み
const SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM = process.env.SIGNED_ACOUNT_ADDRESS_ON_ETHERIUM;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM || !PRIVATE_KEY) {
  throw new Error('環境変数が設定されていません。');
}

// メッセージを作成
const timestamp = Date.now();
const MESSAGE = `ようこそ!\nAddress: ${SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM}\ntimestamp: ${timestamp}`;
console.log('Original Message:', MESSAGE);

// メッセージのハッシュ化
const HASHED_MESSAGE = EthUtil.keccak(Buffer.from(MESSAGE, 'utf-8'));
console.log('Hashed Message:', HASHED_MESSAGE.toString('hex'));

// 秘密鍵をBuffer形式に変換
const HASHED_PRIVATE_KEY = Buffer.from(PRIVATE_KEY, 'hex');
if (!EthUtil.isValidPrivate(HASHED_PRIVATE_KEY)) {
  throw new Error('無効な秘密鍵です。');
}

// メッセージと秘密鍵から署名を作成する関数
function getSignature(hashedMessage: Buffer, privateKey: Buffer) {
  const createdSignature = EthUtil.ecsign(hashedMessage, privateKey);
  return createdSignature;
}

// 署名とメッセージから署名者アドレスを検証する関数
function getVerifiedSigner(
  hashedMessage: Buffer,
  createdSignature: { r: Buffer; s: Buffer; v: number },
  signedAccountAddress: string
) {
  // 作成された署名から公開鍵を導出
  const publicKey = EthUtil.ecrecover(
    hashedMessage,
    createdSignature.v,
    EthUtil.toBuffer(createdSignature.r),
    EthUtil.toBuffer(createdSignature.s)
  );

  // 公開鍵から署名者のアドレスを導出
  const signerAccountAddress = EthUtil.bufferToHex(EthUtil.pubToAddress(publicKey));

  // 導出したアドレスと署名時のアドレスを比較して真偽値を返す
  return (
    EthUtil.toChecksumAddress(signerAccountAddress) ===
    EthUtil.toChecksumAddress(signedAccountAddress)
  );
}

// 署名を作成する
const CREATED_SIGNATURE = getSignature(HASHED_MESSAGE, HASHED_PRIVATE_KEY);
console.log('Created Signature:', {
  r: CREATED_SIGNATURE.r.toString('hex'),
  s: CREATED_SIGNATURE.s.toString('hex'),
  v: CREATED_SIGNATURE.v,
});

// 署名を検証する
const isVerified = getVerifiedSigner(
  HASHED_MESSAGE,
  CREATED_SIGNATURE,
  SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM
);
console.log(`Signature verification result: ${isVerified ? 'Success' : 'Failure'}`);
