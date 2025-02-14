import * as EthUtil from 'ethereumjs-util';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * @function loadEnv
 * @description 環境変数からEthereumアドレスと秘密鍵を読み込み、内容を検証します。
 */
function loadEnv(): { address: string; privateKeyHex: string } {
  const address = process.env.SIGNED_ACOUNT_ADDRESS_ON_ETHERIUM;
  const privateKeyHex = process.env.PRIVATE_KEY;
  if (!address || !privateKeyHex) {
    throw new Error('❌ 環境変数が正しく設定されていません。');
  }
  return { address, privateKeyHex };
}

/**
 * @function createEIP712HashedMessage
 * @description EIP-712仕様に基づいたメッセージを作成し、ハッシュ化します。
 */
function createEIP712HashedMessage(address: string): Buffer {
  const domain = {
    name: 'Ethereum Signature',
    version: '1',
    chainId: 1,
    verifyingContract: address
  };
  const message = {
    address,
    timestamp: Date.now()
  };
  const data = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      Message: [
        { name: 'address', type: 'address' },
        { name: 'timestamp', type: 'uint256' }
      ]
    },
    domain,
    primaryType: 'Message',
    message
  };

  const encodedMessage = JSON.stringify(data);
  return EthUtil.keccak(Buffer.from(encodedMessage));
}

/**
 * @function validatePrivateKey
 * @description 16進数形式の秘密鍵をバッファに変換し、有効性を確認します。
 */
function validatePrivateKey(privateKeyHex: string): Buffer {
  const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
  if (!EthUtil.isValidPrivate(privateKeyBuffer)) {
    throw new Error('❌ 無効な秘密鍵です。');
  }
  return privateKeyBuffer;
}

/**
 * @function getSignature
 * @description EIP-712署名を生成します。
 */
function getSignature(hashedMessage: Buffer, privateKey: Buffer) {
  return EthUtil.ecsign(hashedMessage, privateKey);
}

/**
 * @function verifySignature
 * @description 署名を検証して正しいアドレスであるか確認します。
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
  return EthUtil.toChecksumAddress(recoveredAddress) === EthUtil.toChecksumAddress(expectedAddress);
}

// 実行
try {
  const { address, privateKeyHex } = loadEnv();
  const hashedMessage = createEIP712HashedMessage(address);
  const privateKeyBuffer = validatePrivateKey(privateKeyHex);
  const signature = getSignature(hashedMessage, privateKeyBuffer);
  console.log('✍️ Signature:', signature);
  const isValid = verifySignature(hashedMessage, signature, address);
  console.log(`✅ Signature verification: ${isValid ? 'Success' : 'Failure'}`);
} catch (error) {
  console.error('⚠️ Error:', error);
}
