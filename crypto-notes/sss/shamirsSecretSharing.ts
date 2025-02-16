/**
 * Shamir's Secret Sharing implementation (TypeScript version inspired by Ruby code).
 */
import * as crypto from 'crypto';

export class ShamirSecret {
  private threshold: number;
  private secret?: Buffer;
  private coefficients?: Buffer[];

  constructor(threshold: number, secret?: string) {
    this.threshold = threshold;
    if (secret) {
      this.secret = Buffer.from(secret);
      this.generateCoefficients();
    }
  }

  private generateCoefficients(): void {
    this.coefficients = [this.secret!]; // a0 = secret (y切片)
    for (let i = 1; i < this.threshold; i++) {
      this.coefficients.push(crypto.randomBytes(this.secret!.length)); // a1, a2, ... = ランダムな係数
    }
  }

  /**
   * Computes a share for a given share number (x-coordinate).
   * This simulates calculating f(x) for the polynomial constructed from coefficients.
   * 
   * @param shareNumber - The x-coordinate (share number).
   * @returns Buffer containing the share (x and f(x)).
   */
  public computeShare(shareNumber: number): Buffer {
    if (!this.coefficients) throw new Error('Coefficients not generated');

    // 1️. 初期化: 多項式の和 (y) を 0 で初期化
    let share = Buffer.alloc(this.secret!.length);
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
  
  public recoverSecret(shares: Buffer[]): string {
    const recovered = recoverSecret(shares);
    return recovered.toString();
  }
}

  /**
   * Multiplies two buffers element-wise (byte-by-byte).
   * @param a - First buffer (e.g., coefficient).
   * @param b - Second buffer (e.g., x^j).
   * @returns Resulting buffer from multiplication.
   */
  export function multiplyBuffers(a: Buffer, b: Buffer): Buffer {
    const result = Buffer.alloc(a.length);
    for (let i = 0; i < a.length; i++) {
      result[i] = a[i] * (b[i] ?? 1);
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
  export function bufferExp(buffer: Buffer, exponent: number): Buffer {
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
  export function xorBuffers(a: Buffer, b: Buffer): Buffer {
    // 配列の範囲外にアクセスすることを防ぎ、エラーを回避する
    const length = Math.min(a.length, b.length);
    const result = Buffer.alloc(length);
    for (let i = 0; i < length; i++) {
      result[i] = a[i] ^ b[i]; // XOR演算で多項式の項を加算
    }
    return result;
  }


export function recoverSecret(shares: Buffer[]): Buffer {
  const threshold = shares.length;
  const secretLength = shares[0].length - 1;
  let secret = Buffer.alloc(secretLength);

  for (let i = 0; i < threshold; i++) {
    const xi = shares[i].slice(0, 1);
    const yi = shares[i].slice(1);
    let li = Buffer.from([1]);

    for (let j = 0; j < threshold; j++) {
      if (i !== j) {
        const xj = shares[j].slice(0, 1);
        const numerator = bufferSub(xj, Buffer.from([0]));
        const denominator = bufferSub(xj, xi);
        li = multiplyBuffers(li, divideBuffers(numerator, denominator));
      }
    }
    secret = xorBuffers(secret, multiplyBuffers(li, yi));
  }
  return secret;
}

export function bufferSub(a: Buffer, b: Buffer): Buffer {
  const result = Buffer.alloc(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] - (b[i] ?? 0);
  }
  return result;
}

export function divideBuffers(a: Buffer, b: Buffer): Buffer {
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
const shamirsecret = new ShamirSecret(2, "In the name of Adi Shamir");
console.log('shamirsecret:', shamirsecret);

// Shamirの秘密分散法は多項式補間（ラグランジュ補間）に基づいている
// x 座標として「シェア番号」を使います。
// y 座標として「シェアの値」を計算します。
const s1 = shamirsecret.computeShare(1);
console.log('s1:', s1);
const s2 = shamirsecret.computeShare(2);
console.log('s2:', s2);
const s3 = shamirsecret.computeShare(3);
console.log('s3:', s3);

// Simulate discarding original secret
const shamirRecover = new ShamirSecret(2);
const recovered = shamirRecover.recoverSecret([s1, s3]);
console.log('Recovered Secret:', recovered);