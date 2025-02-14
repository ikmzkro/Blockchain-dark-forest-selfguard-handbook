import * as EthUtil from 'ethereumjs-util';
import * as dotenv from 'dotenv';

dotenv.config();

const SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM = process.env.SIGNED_ACOUNT_ADDRESS_ON_ETHERIUM;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM || !PRIVATE_KEY) {
  throw new Error('環境変数が設定されていません。');
}

// 1. メッセージの作成
const timestamp = Date.now();
const MESSAGE = `ようこそ!\nAddress: ${SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM}\ntimestamp: ${timestamp}`;
console.log('Original Message:', MESSAGE);

// 2. メッセージのハッシュ化
const HASHED_MESSAGE = EthUtil.keccak(Buffer.from(MESSAGE, 'utf-8'));
console.log('Hashed Message:', HASHED_MESSAGE.toString('hex'));

// 3. 署名の作成
const PRIVATE_KEY_BUFFER = Buffer.from(PRIVATE_KEY, 'hex');
if (!EthUtil.isValidPrivate(PRIVATE_KEY_BUFFER)) {
  throw new Error('無効な秘密鍵です。');
}
const signature = EthUtil.ecsign(HASHED_MESSAGE, PRIVATE_KEY_BUFFER);
const signatureHex = EthUtil.toRpcSig(signature.v, signature.r, signature.s);
console.log('Signature:', signatureHex);

// 4. 公開鍵の取得
const publicKey = EthUtil.ecrecover(HASHED_MESSAGE, signature.v, signature.r, signature.s);
const derivedAddress = EthUtil.bufferToHex(EthUtil.pubToAddress(publicKey));

console.log('Derived Address:', derivedAddress);
console.log('Original Address:', SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM);

// 5. 署名の検証
const isValidSignature = derivedAddress.toLowerCase() === SIGNED_ACCOUNT_ADDRESS_ON_ETHEREUM?.toLowerCase();
console.log(`Signature verification result: ${isValidSignature ? 'Success' : 'Failure'}`);
