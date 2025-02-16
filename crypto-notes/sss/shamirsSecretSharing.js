"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShamirSecret = void 0;
exports.multiplyBuffers = multiplyBuffers;
exports.bufferExp = bufferExp;
exports.xorBuffers = xorBuffers;
exports.recoverSecret = recoverSecret;
exports.bufferSub = bufferSub;
exports.divideBuffers = divideBuffers;
/**
 * Shamir's Secret Sharing implementation (TypeScript version inspired by Ruby code).
 */
const crypto = __importStar(require("crypto"));
class ShamirSecret {
    constructor(threshold, secret) {
        this.threshold = threshold;
        if (secret) {
            this.secret = Buffer.from(secret);
            this.generateCoefficients();
        }
    }
    generateCoefficients() {
        this.coefficients = [this.secret]; // a0 = secret (y切片)
        for (let i = 1; i < this.threshold; i++) {
            this.coefficients.push(crypto.randomBytes(this.secret.length)); // a1, a2, ... = ランダムな係数
        }
    }
    /**
     * Computes a share for a given share number (x-coordinate).
     * This simulates calculating f(x) for the polynomial constructed from coefficients.
     *
     * @param shareNumber - The x-coordinate (share number).
     * @returns Buffer containing the share (x and f(x)).
     */
    computeShare(shareNumber) {
        if (!this.coefficients)
            throw new Error('Coefficients not generated');
        // 1️. 初期化: 多項式の和 (y) を 0 で初期化
        let share = Buffer.alloc(this.secret.length);
        console.log('Initial share (y):', share);
        // 2️. シェア番号 (x 座標) をバッファに変換
        const x = Buffer.from([shareNumber]); // shareNumberをバッファに変換してx座標を作成
        console.log('Share number (x):', x);
        // 3️. 多項式 f(x) を計算
        for (let j = 0; j < this.threshold; j++) {
            // 多項式の各項(term) = a_j * x^j を計算
            const term = multiplyBuffers(this.coefficients[j], bufferExp(x, j)); // j番目の係数とxのj乗を掛け算
            console.log(`Term ${j} (a_${j} * x^${j}):`, term);
            // XOR で多項式の和を加算 (XOR はバイト単位の加算)
            share = xorBuffers(share, term); // 現在のシェアに新しい項を加算
            console.log(`Accumulated share after term ${j}:`, share); // 現在のシェアの状態を表示
        }
        // 4️. シェアとして (x, y=f(x)) を返す
        return Buffer.concat([x, share]);
    }
    recoverSecret(shares) {
        const threshold = shares.length;
        const secretLength = shares[0].length - 1; // y座標の長さ
        let secret = Buffer.alloc(secretLength);
        for (let i = 0; i < threshold; i++) {
            const xi = shares[i].slice(0, 1); // x座標
            const yi = shares[i].slice(1); // y座標
            let li = Buffer.from([1]);
            console.log(`Processing share ${i}: xi=${xi.toString('hex')}, yi=${yi.toString('hex')}`);
            for (let j = 0; j < threshold; j++) {
                if (i !== j) {
                    const xj = shares[j].slice(0, 1);
                    const numerator = bufferSub(xj, Buffer.from([0]));
                    const denominator = bufferSub(xj, xi);
                    console.log(`  Comparing xi=${xi.toString('hex')} with xj=${xj.toString('hex')}`);
                    console.log(`  Numerator: ${numerator.toString('hex')}, Denominator: ${denominator.toString('hex')}`);
                    // ゼロ除算を防ぐ
                    if (denominator.equals(Buffer.from([0]))) {
                        console.log(`  Denominator is zero, skipping...`);
                        continue;
                    }
                    li = multiplyBuffers(li, divideBuffers(numerator, denominator));
                }
            }
            secret = xorBuffers(secret, multiplyBuffers(li, yi)); // y座標を使ってシークレットを復元
        }
        return secret.toString(); // ここでsecretを文字列に変換
    }
}
exports.ShamirSecret = ShamirSecret;
/**
 * Multiplies two buffers element-wise (byte-by-byte).
 * @param a - First buffer (e.g., coefficient).
 * @param b - Second buffer (e.g., x^j).
 * @returns Resulting buffer from multiplication.
 */
function multiplyBuffers(a, b) {
    var _a;
    const result = Buffer.alloc(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = a[i] * ((_a = b[i]) !== null && _a !== void 0 ? _a : 1);
    }
    return result;
}
/**
 * Computes the power of a buffer (x^exponent).
 *
 * @param buffer - The buffer representing x.
 * @param exponent - The exponent.
 * @returns Buffer representing x^exponent.
 */
function bufferExp(buffer, exponent) {
    let result = Buffer.from([1]); // x^0 = 1
    for (let i = 0; i < exponent; i++) {
        result = multiplyBuffers(result, buffer);
    }
    return result;
}
/**
 * Performs XOR operation between two buffers.
 *
 * @param a - First buffer.
 * @param b - Second buffer.
 * @returns XOR result buffer.
 */
function xorBuffers(a, b) {
    // 配列の範囲外にアクセスすることを防ぎ、エラーを回避する
    const length = Math.min(a.length, b.length);
    const result = Buffer.alloc(length);
    for (let i = 0; i < length; i++) {
        result[i] = a[i] ^ b[i]; // XOR演算で多項式の項を加算
    }
    return result;
}
function recoverSecret(shares) {
    const threshold = shares.length;
    const secretLength = shares[0].length - 1; // y座標の長さ
    let secret = Buffer.alloc(secretLength);
    for (let i = 0; i < threshold; i++) {
        const xi = shares[i].slice(0, 1); // x座標
        const yi = shares[i].slice(1); // y座標
        let li = Buffer.from([1]);
        for (let j = 0; j < threshold; j++) {
            if (i !== j) {
                const xj = shares[j].slice(0, 1);
                const numerator = bufferSub(xj, Buffer.from([0]));
                const denominator = bufferSub(xj, xi);
                li = multiplyBuffers(li, divideBuffers(numerator, denominator));
            }
        }
        secret = xorBuffers(secret, multiplyBuffers(li, yi)); // y座標を使ってシークレットを復元
    }
    return secret;
}
function bufferSub(a, b) {
    var _a;
    const result = Buffer.alloc(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = a[i] - ((_a = b[i]) !== null && _a !== void 0 ? _a : 0);
    }
    return result;
}
function divideBuffers(a, b) {
    const result = Buffer.alloc(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = b[i] !== 0 ? Math.floor(a[i] / b[i]) : 0;
    }
    return result;
}
// シャミアの秘密分散法では多項式を用いる。
// f(x)=a_0+a_1*x+a_2*x^2+...+a_k−1*x^k−1
// a_0 = 秘密情報 (secret)
// a_1, a_2, ... は乱数で決定される係数 (coefficients)
// 閾値 (threshold) = 多項式の次数 + 1
// arg_1: 閾値の数。2つ以上のシェアが必要。
// arg_2: 分割したいシークレット(ex: 秘密鍵)
const shamirsecret = new ShamirSecret(2, "nekonekonekkko");
console.log('shamirsecret:', shamirsecret);
// Shamirの秘密分散法は多項式補間（ラグランジュ補間）に基づいている
// x 座標として「シェア番号」を使います。
// y 座標として「シェアの値」を計算します。
// シェアを計算
const s1 = shamirsecret.computeShare(1);
const s2 = shamirsecret.computeShare(2); // 2つ目のシェアを計算
console.log('s1:', s1);
console.log('s2:', s2);
// 2つのシェアを使って復元
const shamirRecover = new ShamirSecret(2);
const recovered = shamirRecover.recoverSecret([s1, s2]); // 2つのシェアを渡す
console.log('recovered:', recovered.toString());
