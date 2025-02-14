import crypto from 'crypto';

// Modulus and generator for a simplified Schnorr signature (not production-safe)
const p = BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f');
const g = BigInt(2);

// Helper functions
function modExp(base: bigint, exp: bigint, mod: bigint): bigint {
    let result = BigInt(1);
    let x = base % mod;
    let e = exp;
    while (e > 0) {
        if (e % BigInt(2) === BigInt(1)) {
            result = (result * x) % mod;
        }
        x = (x * x) % mod;
        e /= BigInt(2);
    }
    return result;
}

function hashToBigInt(data: string): bigint {
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return BigInt('0x' + hash) % p;
}

// Key pair generation
function generateKeyPair(): { privateKey: bigint; publicKey: bigint } {
    const privateKey = BigInt('0x' + crypto.randomBytes(32).toString('hex')) % p;
    const publicKey = modExp(g, privateKey, p);
    return { privateKey, publicKey };
}

// Sign a message
function signMessage(message: string, privateKey: bigint): { R: bigint; s: bigint } {
    const k = BigInt('0x' + crypto.randomBytes(32).toString('hex')) % p;
    const R = modExp(g, k, p);
    const e = hashToBigInt(R.toString() + message);
    const s = (k + e * privateKey) % p;
    return { R, s };
}

// Verify a signature
function verifySignature(message: string, publicKey: bigint, signature: { R: bigint; s: bigint }): boolean {
    const e = hashToBigInt(signature.R.toString() + message);
    const lhs = modExp(g, signature.s, p);
    const rhs = (signature.R * modExp(publicKey, e, p)) % p;
    return lhs === rhs;
}

// Example usage
const { privateKey, publicKey } = generateKeyPair();
console.log(`Private Key: ${privateKey}`);
console.log(`Public Key: ${publicKey}`);

const message = 'Hello, Schnorr!';
const signature = signMessage(message, privateKey);
console.log(`Signature: R=${signature.R}, s=${signature.s}`);

const isValid = verifySignature(message, publicKey, signature);
console.log(`Signature valid: ${isValid}`);
