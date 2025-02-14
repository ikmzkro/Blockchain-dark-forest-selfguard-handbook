// 公開鍵を復元する ecrecover 処理がわかりにくい
// const recoveredPublicKey = EthUtil.ecrecover(
//     hashedMessage,                   // メッセージハッシュ
//     signature.v,                     // ※どちらの鍵かを示す
//     EthUtil.toBuffer(signature.r),   // r値
//     EthUtil.toBuffer(signature.s)    // s値
//   );

// ※同じX座標に対して、y座標が上下対称に存在するため、公開鍵の計算時にvが必要になる
// v = 27またはv = 0 → 正のy座標（偶数）
// v = 28またはv = 1 → 負のy座標（奇数）