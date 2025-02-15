/**
 * Shamir's Secret Sharing implementation with a class-based structure.
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
    this.coefficients = [this.secret!];
    for (let i = 1; i < this.threshold; i++) {
      this.coefficients.push(crypto.randomBytes(this.secret!.length));
    }
  }

  public computeShare(shareNumber: number): Buffer {
    if (!this.coefficients) throw new Error('Coefficients not generated');
    let share = Buffer.alloc(this.secret!.length);
    const x = Buffer.from([shareNumber]);

    for (let j = 0; j < this.threshold; j++) {
      const term = this.multiplyBuffers(this.coefficients[j], this.bufferExp(x, j));
      share = this.xorBuffers(share, term);
    }
    return Buffer.concat([x, share]);
  }

  public multiplyBuffers(a: Buffer, b: Buffer): Buffer {
    const result = Buffer.alloc(a.length);
    for (let i = 0; i < a.length; i++) {
      result[i] = a[i] * (b[i] ?? 1);
    }
    return result;
  }
  
  public bufferExp(buffer: Buffer, exponent: number): Buffer {
    let result = Buffer.from([1]);
    for (let i = 0; i < exponent; i++) {
      result = this.multiplyBuffers(result, buffer);
    }
    return result;
  }
  
  public xorBuffers(a: Buffer, b: Buffer): Buffer {
    const length = Math.min(a.length, b.length);
    const result = Buffer.alloc(length);
    for (let i = 0; i < length; i++) {
      result[i] = a[i] ^ b[i];
    }
    return result;
  }
  
  public recoverSecret(shares: Buffer[]): Buffer {
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
          const numerator = this.bufferSub(xj, Buffer.from([0]));
          const denominator = this.bufferSub(xj, xi);
          li = this.multiplyBuffers(li, this.divideBuffers(numerator, denominator));
        }
      }
      secret = this.xorBuffers(secret, this.multiplyBuffers(li, yi));
    }
    return secret;
  }
  
  public bufferSub(a: Buffer, b: Buffer): Buffer {
    const result = Buffer.alloc(a.length);
    for (let i = 0; i < a.length; i++) {
      result[i] = a[i] - (b[i] ?? 0);
    }
    return result;
  }
  
  public divideBuffers(a: Buffer, b: Buffer): Buffer {
    const result = Buffer.alloc(a.length);
    for (let i = 0; i < a.length; i++) {
      result[i] = b[i] !== 0 ? Math.floor(a[i] / b[i]) : 0;
    }
    return result;
  }
  
}

// Example usage:
const shamir = new ShamirSecret(2, 'In the name of Adi Shamir');
console.log('shamir:', shamir);
const s1 = shamir.computeShare(1);
const s2 = shamir.computeShare(2);
const s3 = shamir.computeShare(3);
console.log('s1:', s1);
console.log('s2:', s2);
console.log('s3:', s3);

const shamirRecover = new ShamirSecret(2);
const recovered = shamirRecover.recoverSecret([s1, s3]);
console.log('Recovered Secret:', recovered);
