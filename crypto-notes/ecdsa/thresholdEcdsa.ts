// import crypto from 'crypto';
// import elliptic from 'elliptic';

// // Initialize secp256k1 curve
// const ec = new elliptic.ec('secp256k1');

// // Shamir's Secret Sharing
// function splitSecret(secret: bigint, n: number, t: number): bigint[] {
//     const coefficients = [secret];
//     for (let i = 1; i < t; i++) {
//         coefficients.push(BigInt('0x' + crypto.randomBytes(32).toString('hex')));
//     }

//     const shares: bigint[] = [];
//     for (let x = 1; x <= n; x++) {
//         let y = coefficients[0];
//         for (let i = 1; i < t; i++) {
//             y += coefficients[i] * BigInt(x) ** BigInt(i);
//         }
//         shares.push(y);
//     }
//     return shares;
// }

// // Reconstruct the secret using Lagrange interpolation
// function reconstructSecret(shares: [number, bigint][]): bigint {
//     let secret = BigInt(0);
//     for (const [xi, yi] of shares) {
//         let product = yi;
//         for (const [xj] of shares) {
//             if (xi !== xj) {
//                 product *= BigInt(xj) * modInverse(BigInt(xj) - BigInt(xi));
//             }
//         }
//         secret += product;
//     }
//     return secret;
// }

// function modInverse(a: bigint, m: bigint = ec.n!): bigint {
//     let [m0, x0, x1] = [m, BigInt(0), BigInt(1)];
//     let n = a % m;
//     while (n > 1n) {
//         let q = n / m;
//         [m, n] = [n % m, m];
//         [x0, x1] = [x1 - q * x0, x0];
//     }
//     return x1 < 0 ? x1 + m0 : x1;
// }

// // Generate key pair
// function generateKeyPair(): { privateKey: bigint; publicKey: elliptic.ec.KeyPair } {
//     const key = ec.genKeyPair();
//     const privateKey = BigInt(key.getPrivate().toString());
//     return { privateKey, publicKey: key };
// }

// // Sign message
// function signMessage(message: string, privateKey: bigint): { r: string; s: string } {
//     const hash = crypto.createHash('sha256').update(message).digest();
//     const key = ec.keyFromPrivate(privateKey.toString(16));
//     const signature = key.sign(hash);
//     return { r: signature.r.toString(16), s: signature.s.toString(16) };
// }

// // Verify signature
// function verifySignature(message: string, publicKey: elliptic.ec.KeyPair, signature: { r: string; s: string }): boolean {
//     const hash = crypto.createHash('sha256').update(message).digest();
//     return publicKey.verify(hash, signature);
// }

// // Example
// const { privateKey, publicKey } = generateKeyPair();
// const shares = splitSecret(privateKey, 5, 3);

// console.log('Private Key:', privateKey);
// console.log('Shares:', shares);

// // Reconstruct with 3 shares
// const reconstructed = reconstructSecret(
//     shares.slice(0, 3).map((share, i) => [i + 1, share])
// );
// console.log('Reconstructed Key:', reconstructed);

// const message = 'Hello, Threshold ECDSA!';
// const signature = signMessage(message, reconstructed);
// console.log('Signature:', signature);

// const isValid = verifySignature(message, publicKey, signature);
// console.log('Signature valid:', isValid);
