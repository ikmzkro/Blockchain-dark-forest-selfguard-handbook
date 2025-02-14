import * as crypto from 'crypto';
import * as EthUtil from 'ethereumjs-util';


// 256ビット（32バイト）の秘密鍵をランダム生成
const privateKey = crypto.randomBytes(32);

// 楕円曲線暗号 (ECC) の secp256k1 曲線を使って秘密鍵から公開鍵を生成
// Ethereumでは公開鍵暗号方式にこのsecp256k1曲線が採用されています
// secp256k1曲線を使って秘密鍵から公開鍵を生成
const ecdh = crypto.createECDH('secp256k1');
ecdh.setPrivateKey(privateKey);

// PublicKey=k×G
// PublicKey:公開鍵：楕円曲線上の点 (x, y)
// k：秘密鍵（スカラー値）
// G：基準点（Generator Point）
const publicKey = ecdh.getPublicKey();

// Ethereumの公開鍵は**非圧縮形式（65バイト）**で表されます
// 1	    0x04	       非圧縮形式であることを示すプレフィックス。
// 2-33	    x座標（32バイト）	曲線上のx座標。
// 34-65	y座標（32バイト）	曲線上のy座標。
// 公開鍵の形式には圧縮形式（33バイト）もり、y² = x³ + ax + bと符号によりY座標が導出できる
// 1	0x02 or 0x03	Y座標の符号（偶数なら0x02、奇数なら0x03）
// 32	X座標	         楕円曲線上のX座標（32バイト）。
console.log('🔓 公開鍵:', publicKey.toString('hex'));


// 公開鍵をKeccak-256でハッシュ化してEthereumアドレスを生成
// 非圧縮形式の公開鍵は、先頭に0x04が付くので先頭の04を除外
const publicKeyWithoutPrefix = publicKey.slice(1);
const hashedPublicKey = EthUtil.keccak(publicKeyWithoutPrefix);
// Ethereumアドレスは、公開鍵のKeccak256ハッシュ値の後半20バイト
const ethereumAddress = EthUtil.bufferToHex(hashedPublicKey.slice(-20));

// 公開鍵 → Keccak-256 → 64バイト(256ビット)のハッシュ値。
// ハッシュの後半**20バイト（160ビット）**を取得。
// 先頭に0xを付けることでEthereumアドレスが完成。

// なぜ160ビットが選ばれたのか？
// Ethereumアカウントを識別するだけなら、公開鍵の全体情報は不要。
// 公開鍵の Keccak-256ハッシュの後半20バイトだけで、十分な一意性が保証される。
// ビット数	アドレス数	特徴
// 128ビット	2¹²⁸ ≈ 3.4×10³⁸	　　　　　　　　IPv6アドレスに近い規模だが少ない
// 160ビット	2¹⁶⁰ ≈ 1.46×10⁴⁸	バランスの良い安全性・効率性
// 256ビット	2²⁵⁶ ≈ 1.15×10⁷⁷	安全だがアドレスが長すぎる

console.log('🏠 Ethereumアドレス:', ethereumAddress);
