import * as crypto from 'crypto';
import * as EthUtil from 'ethereumjs-util';


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
