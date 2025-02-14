import * as crypto from 'crypto';

// Aliceの鍵ペア作成
const aliceECDH = crypto.createECDH('secp256k1');
aliceECDH.generateKeys();
const alicePublicKey = aliceECDH.getPublicKey();
const alicePrivateKey = aliceECDH.getPrivateKey();

// Bobの鍵ペア作成
const bobECDH = crypto.createECDH('secp256k1');
bobECDH.generateKeys();
const bobPublicKey = bobECDH.getPublicKey();
const bobPrivateKey = bobECDH.getPrivateKey();

// 共通鍵の作成
const aliceSharedKey = aliceECDH.computeSecret(bobPublicKey);
const bobSharedKey = bobECDH.computeSecret(alicePublicKey);

// 結果の確認
console.log('🔑 Alice共通鍵:', aliceSharedKey.toString('hex'));
console.log('🔑 Bob共通鍵:', bobSharedKey.toString('hex'));
console.log('🔍 鍵が一致する:', aliceSharedKey.equals(bobSharedKey)); // true
