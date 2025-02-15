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
/**
 * Shamir's Secret Sharing implementation with a class-based structure.
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
        this.coefficients = [this.secret];
        for (let i = 1; i < this.threshold; i++) {
            this.coefficients.push(crypto.randomBytes(this.secret.length));
        }
    }
    computeShare(shareNumber) {
        if (!this.coefficients)
            throw new Error('Coefficients not generated');
        let share = Buffer.alloc(this.secret.length);
        const x = Buffer.from([shareNumber]);
        for (let j = 0; j < this.threshold; j++) {
            const term = this.multiplyBuffers(this.coefficients[j], this.bufferExp(x, j));
            share = this.xorBuffers(share, term);
        }
        return Buffer.concat([x, share]);
    }
    multiplyBuffers(a, b) {
        var _a;
        const result = Buffer.alloc(a.length);
        for (let i = 0; i < a.length; i++) {
            result[i] = a[i] * ((_a = b[i]) !== null && _a !== void 0 ? _a : 1);
        }
        return result;
    }
    bufferExp(buffer, exponent) {
        let result = Buffer.from([1]);
        for (let i = 0; i < exponent; i++) {
            result = this.multiplyBuffers(result, buffer);
        }
        return result;
    }
    xorBuffers(a, b) {
        const length = Math.min(a.length, b.length);
        const result = Buffer.alloc(length);
        for (let i = 0; i < length; i++) {
            result[i] = a[i] ^ b[i];
        }
        return result;
    }
    recoverSecret(shares) {
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
    bufferSub(a, b) {
        var _a;
        const result = Buffer.alloc(a.length);
        for (let i = 0; i < a.length; i++) {
            result[i] = a[i] - ((_a = b[i]) !== null && _a !== void 0 ? _a : 0);
        }
        return result;
    }
    divideBuffers(a, b) {
        const result = Buffer.alloc(a.length);
        for (let i = 0; i < a.length; i++) {
            result[i] = b[i] !== 0 ? Math.floor(a[i] / b[i]) : 0;
        }
        return result;
    }
}
exports.ShamirSecret = ShamirSecret;
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
