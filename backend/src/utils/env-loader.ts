import dotenv from 'dotenv';
import { EncryptionService } from './encryption';

// Load environment variables
dotenv.config();

export class SecureEnvLoader {
  /**
   * Gets and decrypts the OpenAI API key
   * @returns The decrypted OpenAI API key
   */
  static getOpenAIKey(): string {
    const encryptedKey = process.env.OPENAI_API_KEY_ENCRYPTED;
    const masterKey = process.env.MASTER_KEY;

    // Fallback to plain text key for backward compatibility
    if (!encryptedKey || !masterKey) {
      const plainKey = process.env.OPENAI_API_KEY;
      if (!plainKey) {
        throw new Error(
          'No OpenAI API key found. Please set OPENAI_API_KEY_ENCRYPTED + MASTER_KEY or OPENAI_API_KEY'
        );
      }
      console.warn(
        '⚠️  Using plain text API key. Consider encrypting it for better security.'
      );
      return plainKey;
    }

    try {
      const decryptedKey = EncryptionService.decrypt(encryptedKey, masterKey);
      console.log('🔓 Successfully decrypted OpenAI API key');
      return decryptedKey;
    } catch (error) {
      throw new Error(`Failed to decrypt OpenAI API key: ${error}`);
    }
  }

  /**
   * Gets other environment variables normally
   */
  static getPort(): number {
    return parseInt(process.env.PORT || '5000', 10);
  }

  static getFrontendUrl(): string {
    return process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  static getNodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }
}
