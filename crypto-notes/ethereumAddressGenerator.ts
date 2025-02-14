import * as crypto from 'crypto';
import * as EthUtil from 'ethereumjs-util';

/**
 * 秘密鍵を生成する
 * @returns 32バイトのランダムな秘密鍵（Buffer形式）
 */
function generatePrivateKey(): Buffer {
  return crypto.randomBytes(32);
}

/**
 * 公開鍵を生成する（非圧縮形式:x,y座標が混在する形式）
 * @param privateKey - 秘密鍵（Buffer形式）
 * @returns 公開鍵（Buffer形式）
 */
function generatePublicKey(privateKey: Buffer): Buffer {
  const ecdh = crypto.createECDH('secp256k1');
  ecdh.setPrivateKey(privateKey);
  return ecdh.getPublicKey();
}

/**
 * Ethereumアドレスを生成する
 * 公開鍵のKeccak-256ハッシュの後半20バイトを取得(160bitで十分セキュアなのでBTCの設計からそうなっている)
 * @param publicKey - 公開鍵（非圧縮形式のBuffer）
 * @returns Ethereumアドレス（文字列形式）
 */
function generateEthereumAddress(publicKey: Buffer): string {
  // 非圧縮形式の公開鍵は先頭に0x04が付くため、除外する
  const publicKeyWithoutPrefix = publicKey.slice(1);
  const hashedPublicKey = EthUtil.keccak(publicKeyWithoutPrefix);
  return EthUtil.bufferToHex(hashedPublicKey.slice(-20));
}

/**
 * EIP-55準拠のアドレスに変換
 * @param address - 小文字のEthereumアドレス
 * @returns EIP-55形式のアドレス（大文字・小文字混在）
 */
function toChecksumAddress(address: string): string {
  const hash = EthUtil.keccak(Buffer.from(address.slice(2), 'hex')).toString('hex');
  return '0x' + address.slice(2).split('').map((char, index) => {
    return parseInt(hash[index], 16) >= 8 ? char.toUpperCase() : char.toLowerCase();
  }).join('');
}

/**
 * Ethereumアドレスを生成して出力
 */
function main(): void {
  const privateKey = generatePrivateKey();
  console.log('🔑 秘密鍵:', privateKey.toString('hex'));

  const publicKey = generatePublicKey(privateKey);
  console.log('🔓 公開鍵(非圧縮形式):', publicKey.toString('hex'));

  const ethereumAddress = generateEthereumAddress(publicKey);
  console.log('🏠 Ethereumアドレス(小文字):', ethereumAddress);

  const checksumAddress = toChecksumAddress(ethereumAddress);
  console.log('🔑 Ethereumアドレス(EIP-55形式):', checksumAddress);
}

// プログラムの実行
main();
