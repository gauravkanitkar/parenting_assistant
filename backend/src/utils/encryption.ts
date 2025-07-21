import crypto from 'crypto';

export class EncryptionService {
  private static readonly algorithm = 'aes-256-gcm';
  
  /**
   * Encrypts a string using AES-256-GCM
   * @param text The text to encrypt
   * @param masterKey The master key for encryption (32 bytes)
   * @returns Encrypted string with IV and auth tag
   */
  static encrypt(text: string, masterKey: string): string {
    try {
      // Ensure master key is 32 bytes
      const key = crypto.scryptSync(masterKey, 'salt', 32);
      
      // Generate random IV
      const iv = crypto.randomBytes(16);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      cipher.setAAD(Buffer.from('parenting-assistant', 'utf8'));
      
      // Encrypt
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get auth tag
      const authTag = cipher.getAuthTag();
      
      // Combine IV, auth tag, and encrypted data
      return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  }
  
  /**
   * Decrypts a string encrypted with encrypt()
   * @param encryptedData The encrypted string
   * @param masterKey The master key for decryption
   * @returns Decrypted string
   */
  static decrypt(encryptedData: string, masterKey: string): string {
    try {
      // Parse the encrypted data
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }
      
      const [ivHex, authTagHex, encrypted] = parts;
      
      // Ensure master key is 32 bytes
      const key = crypto.scryptSync(masterKey, 'salt', 32);
      
      // Convert from hex
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAAD(Buffer.from('parenting-assistant', 'utf8'));
      decipher.setAuthTag(authTag);
      
      // Decrypt
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  }
  
  /**
   * Generates a secure random master key
   * @returns A 64-character hex string suitable as a master key
   */
  static generateMasterKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}