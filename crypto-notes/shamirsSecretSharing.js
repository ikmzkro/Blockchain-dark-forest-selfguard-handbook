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
            const term = multiplyBuffers(this.coefficients[j], bufferExp(x, j));
            share = xorBuffers(share, term);
        }
        return Buffer.concat([x, share]);
    }
    recoverSecret(shares) {
        const recovered = recoverSecret(shares);
        return recovered.toString();
    }
}
exports.ShamirSecret = ShamirSecret;
function multiplyBuffers(a, b) {
    var _a;
    const result = Buffer.alloc(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = a[i] * ((_a = b[i]) !== null && _a !== void 0 ? _a : 1);
    }
    return result;
}
function bufferExp(buffer, exponent) {
    let result = Buffer.from([1]);
    for (let i = 0; i < exponent; i++) {
        result = multiplyBuffers(result, buffer);
    }
    return result;
}
function xorBuffers(a, b) {
    const length = Math.min(a.length, b.length);
    const result = Buffer.alloc(length);
    for (let i = 0; i < length; i++) {
        result[i] = a[i] ^ b[i];
    }
    return result;
}
function recoverSecret(shares) {
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
// Example Usage:
const shamirsecret = new ShamirSecret(2, "In the name of Adi Shamir");
const s1 = shamirsecret.computeShare(1);
const s2 = shamirsecret.computeShare(2);
const s3 = shamirsecret.computeShare(3);
// Simulate discarding original secret
const shamirRecover = new ShamirSecret(2);
const recovered = shamirRecover.recoverSecret([s1, s3]);
console.log('Recovered Secret:', recovered);
