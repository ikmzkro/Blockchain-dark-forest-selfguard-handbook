import * as fs from 'fs';
import * as path from 'path';
import * as bip39 from 'bip39';
import * as ecc from 'tiny-secp256k1';
import { ECPairFactory, ECPairInterface } from 'ecpair';
import { ethers } from 'ethers';

/**
 * Utility function to remove a specified character from the start of a string.
 * @param str - The input string.
 * @param charToRemove - The character to remove.
 * @returns The string without the specified leading character.
 */
const removeCharacterFromStart = (str: string, charToRemove: string): string => {
  return str.startsWith(charToRemove) ? str.slice(charToRemove.length) : str;
};

/**
 * Class representing an HD Wallet Service for Ethereum.
 * https://iancoleman.io/bip39/
 */
export class HdWalletService {
  /**
   * Generates or retrieves a mnemonic from a specified file and derives the corresponding Ethereum address.
   * @returns The Ethereum address associated with the mnemonic.
   */
  public async handleMnemonic(): Promise<string> {
    const mnemonic = this.getMnemonic();
    const address = this.getAddressFromMnemonic(mnemonic);
    return address;
  }

  /**
   * Retrieves the mnemonic from a file.
   * @param filename - The name of the file containing the mnemonic.
   * @returns The mnemonic phrase.
   * @throws Error if the file is not found or the mnemonic is invalid.
   */
  getMnemonic(filename = 'mnemonic.txt'): string {
    let mnemonic: string;
    try {
      mnemonic = fs.readFileSync(path.join(process.cwd(), '/secrets', filename), 'utf-8').trimEnd();
    } catch (error) {
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
  getAddressFromMnemonic(mnemonic: string): string {
    const { address } = this.getEthHdNode(mnemonic);
    return address;
  }

  /**
   * Derives an EC key pair from the given mnemonic.
   * @param mnemonic - The mnemonic phrase.
   * @returns The derived EC key pair.
   */
  getKeyPairFromMnemonic(mnemonic: string): ECPairInterface {
    const node = this.getEthHdNode(mnemonic);
    const ECPair = ECPairFactory(ecc);
    const keyPair = ECPair.fromPrivateKey(
      Buffer.from(removeCharacterFromStart(node.privateKey, '0x'), 'hex'),
    );
    return keyPair;
  }

  /**
   * Derives an HD node for Ethereum from the mnemonic seed.
   * @param mnemonic - The mnemonic phrase.
   * @returns The derived Ethereum HD node.
   */
  private getEthHdNode(mnemonic: string): ethers.HDNodeWallet {
    try {
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      console.log('seed:', seed);
      // Derives the HD node using the Ethereum BIP-44 derivation path.
      return ethers.HDNodeWallet.fromSeed(seed).derivePath(`m/44'/60'/0'/0/0`);
    } catch (error) {
      throw new Error(`Failed to derive HD node: ${error}`);
    }
  }

  /**
   * Retrieves the Ethereum balance of the specified address.
   * @param pubKey - The Ethereum address.
   * @returns The balance in wei as a bigint.
   */
  async getEthBalance(pubKey: string): Promise<bigint> {
    const provider = this.getEthereumNetworkProvider();
    return await provider.getBalance(pubKey);
  }

  /**
   * Creates an Ethereum provider for the Sepolia test network.
   * @returns An Ethereum provider.
   */
  getEthereumNetworkProvider(): ethers.AbstractProvider {
    return ethers.getDefaultProvider('sepolia', {
      infura: process.env.INFURA_API_KEY ?? {},
      exclusive: ['infura'],
    });
  }
}

// Example usage
(async () => {
  const walletService = new HdWalletService();
  const address = await walletService.handleMnemonic();
  console.log(`Derived Ethereum address: ${address}`);
})();
