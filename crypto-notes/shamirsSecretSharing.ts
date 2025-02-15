/**
 * Shamir's Secret Sharing implementation (TypeScript version inspired by Ruby code).
 */
import * as crypto from 'crypto';

export class ShamirSecret {
  private threshold: number;
  private secret?: Buffer;
  private coefficients?: Buffer[];

  // f(x)=a_0+a_1*x+a_2*x^2+...+a_k−1*x^k−1
  // a_0 = 秘密情報 (secret)
  // a_1, a_2, ... は乱数で決定される係数 (Coefficients)
  // 閾値 (threshold) = 多項式の次数 + 1
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

  public computeShare(shareNumber: number): Buffer {
    if (!this.coefficients) throw new Error('Coefficients not generated');
    let share = Buffer.alloc(this.secret!.length);
    const x = Buffer.from([shareNumber]);

    for (let j = 0; j < this.threshold; j++) {
      const term = multiplyBuffers(this.coefficients[j], bufferExp(x, j));
      share = xorBuffers(share, term);
    }
    return Buffer.concat([x, share]);
  }

  public recoverSecret(shares: Buffer[]): string {
    const recovered = recoverSecret(shares);
    return recovered.toString();
  }
}

export function multiplyBuffers(a: Buffer, b: Buffer): Buffer {
  const result = Buffer.alloc(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] * (b[i] ?? 1);
  }
  return result;
}

export function bufferExp(buffer: Buffer, exponent: number): Buffer {
  let result = Buffer.from([1]);
  for (let i = 0; i < exponent; i++) {
    result = multiplyBuffers(result, buffer);
  }
  return result;
}

export function xorBuffers(a: Buffer, b: Buffer): Buffer {
  const length = Math.min(a.length, b.length);
  const result = Buffer.alloc(length);
  for (let i = 0; i < length; i++) {
    result[i] = a[i] ^ b[i];
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

// Example Usage:
const shamirsecret = new ShamirSecret(2, "In the name of Adi Shamir");
console.log('shamirsecret:', shamirsecret);
const s1 = shamirsecret.computeShare(1);
const s2 = shamirsecret.computeShare(2);
const s3 = shamirsecret.computeShare(3);

// Simulate discarding original secret
const shamirRecover = new ShamirSecret(2);
const recovered = shamirRecover.recoverSecret([s1, s3]);
console.log('Recovered Secret:', recovered);