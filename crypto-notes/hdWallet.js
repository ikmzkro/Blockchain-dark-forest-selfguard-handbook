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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HdWalletService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const bip39 = __importStar(require("bip39"));
const ecc = __importStar(require("tiny-secp256k1"));
const ecpair_1 = require("ecpair");
const ethers_1 = require("ethers");
/**
 * Utility function to remove a specified character from the start of a string.
 * @param str - The input string.
 * @param charToRemove - The character to remove.
 * @returns The string without the specified leading character.
 */
const removeCharacterFromStart = (str, charToRemove) => {
    return str.startsWith(charToRemove) ? str.slice(charToRemove.length) : str;
};
/**
 * Class representing an HD Wallet Service for Ethereum.
 * https://iancoleman.io/bip39/
 */
class HdWalletService {
    /**
     * Generates or retrieves a mnemonic from a specified file and derives the corresponding Ethereum address.
     * @returns The Ethereum address associated with the mnemonic.
     */
    handleMnemonic() {
        return __awaiter(this, void 0, void 0, function* () {
            const mnemonic = this.getMnemonic();
            const address = this.getAddressFromMnemonic(mnemonic);
            return address;
        });
    }
    /**
     * Retrieves the mnemonic from a file.
     * @param filename - The name of the file containing the mnemonic.
     * @returns The mnemonic phrase.
     * @throws Error if the file is not found or the mnemonic is invalid.
     */
    getMnemonic(filename = 'mnemonic.txt') {
        let mnemonic;
        try {
            mnemonic = fs.readFileSync(path.join(process.cwd(), '/secrets', filename), 'utf-8').trimEnd();
        }
        catch (error) {
            console.error('Error reading mnemonic file:', error);
            throw new Error('Mnemonic file is not correctly written or not found.');
        }
        if (!bip39.validateMnemonic(mnemonic)) {
            throw new Error('Invalid mnemonic');
        }
        return mnemonic;
    }
    /**
     * Derives an Ethereum address from the given mnemonic.
     * @param mnemonic - The mnemonic phrase.
     * @returns The derived Ethereum address.
     */
    getAddressFromMnemonic(mnemonic) {
        const { address } = this.getEthHdNode(mnemonic);
        return address;
    }
    /**
     * Derives an EC key pair from the given mnemonic.
     * @param mnemonic - The mnemonic phrase.
     * @returns The derived EC key pair.
     */
    getKeyPairFromMnemonic(mnemonic) {
        const node = this.getEthHdNode(mnemonic);
        const ECPair = (0, ecpair_1.ECPairFactory)(ecc);
        const keyPair = ECPair.fromPrivateKey(Buffer.from(removeCharacterFromStart(node.privateKey, '0x'), 'hex'));
        return keyPair;
    }
    /**
     * Derives an HD node for Ethereum from the mnemonic seed.
     * @param mnemonic - The mnemonic phrase.
     * @returns The derived Ethereum HD node.
     */
    getEthHdNode(mnemonic) {
        try {
            const seed = bip39.mnemonicToSeedSync(mnemonic);
            // Derives the HD node using the Ethereum BIP-44 derivation path.
            return ethers_1.ethers.HDNodeWallet.fromSeed(seed).derivePath(`m/44'/60'/0'/0/0`);
        }
        catch (error) {
            throw new Error(`Failed to derive HD node: ${error}`);
        }
    }
    /**
     * Retrieves the Ethereum balance of the specified address.
     * @param pubKey - The Ethereum address.
     * @returns The balance in wei as a bigint.
     */
    getEthBalance(pubKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = this.getEthereumNetworkProvider();
            return yield provider.getBalance(pubKey);
        });
    }
    /**
     * Creates an Ethereum provider for the Sepolia test network.
     * @returns An Ethereum provider.
     */
    getEthereumNetworkProvider() {
        var _a;
        return ethers_1.ethers.getDefaultProvider('sepolia', {
            infura: (_a = process.env.INFURA_API_KEY) !== null && _a !== void 0 ? _a : {},
            exclusive: ['infura'],
        });
    }
}
exports.HdWalletService = HdWalletService;
// Example usage
(() => __awaiter(void 0, void 0, void 0, function* () {
    const walletService = new HdWalletService();
    const address = yield walletService.handleMnemonic();
    console.log(`Derived Ethereum address: ${address}`);
}))();
