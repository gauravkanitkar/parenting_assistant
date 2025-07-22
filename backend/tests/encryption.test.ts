import { EncryptionService } from '../src/utils/encryption';

describe('EncryptionService', () => {
  const testText = 'sk-test-openai-key-12345';
  const testMasterKey = 'test-master-key-32-characters-long';

  describe('generateMasterKey', () => {
    it('should generate a 64-character hex string', () => {
      const masterKey = EncryptionService.generateMasterKey();
      expect(masterKey).toHaveLength(64);
      expect(masterKey).toMatch(/^[0-9a-f]+$/);
    });

    it('should generate unique keys each time', () => {
      const key1 = EncryptionService.generateMasterKey();
      const key2 = EncryptionService.generateMasterKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe('encrypt', () => {
    it('should encrypt text successfully', () => {
      const encrypted = EncryptionService.encrypt(testText, testMasterKey);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(testText);
      expect(encrypted.split(':')).toHaveLength(3); // iv:authTag:encrypted
    });

    it('should produce different encrypted values for same input', () => {
      const encrypted1 = EncryptionService.encrypt(testText, testMasterKey);
      const encrypted2 = EncryptionService.encrypt(testText, testMasterKey);

      expect(encrypted1).not.toBe(encrypted2); // Due to random IV
    });

    it('should handle empty master key (crypto will derive a key)', () => {
      // Empty master key will still work with scrypt derivation
      const encrypted = EncryptionService.encrypt(testText, '');
      expect(encrypted).toBeDefined();
      expect(encrypted.split(':')).toHaveLength(3);

      // Should be able to decrypt with same empty key
      const decrypted = EncryptionService.decrypt(encrypted, '');
      expect(decrypted).toBe(testText);
    });
  });

  describe('decrypt', () => {
    it('should decrypt text successfully', () => {
      const encrypted = EncryptionService.encrypt(testText, testMasterKey);
      const decrypted = EncryptionService.decrypt(encrypted, testMasterKey);

      expect(decrypted).toBe(testText);
    });

    it('should throw error for invalid encrypted data format', () => {
      expect(() => {
        EncryptionService.decrypt('invalid-format', testMasterKey);
      }).toThrow('Invalid encrypted data format');
    });

    it('should throw error for wrong master key', () => {
      const encrypted = EncryptionService.encrypt(testText, testMasterKey);

      expect(() => {
        EncryptionService.decrypt(encrypted, 'wrong-master-key');
      }).toThrow('Decryption failed');
    });

    it('should throw error for corrupted encrypted data', () => {
      expect(() => {
        EncryptionService.decrypt('corrupted:data:here', testMasterKey);
      }).toThrow('Decryption failed');
    });
  });

  describe('encrypt/decrypt round trip', () => {
    const testCases = [
      'simple-text',
      'sk-1234567890abcdef',
      'special-chars!@#$%^&*()',
      'unicode-text-🔐🚀',
      '',
      'a'.repeat(1000), // Long string
    ];

    testCases.forEach(text => {
      it(`should handle round trip for: "${text.substring(0, 20)}..."`, () => {
        const encrypted = EncryptionService.encrypt(text, testMasterKey);
        const decrypted = EncryptionService.decrypt(encrypted, testMasterKey);

        expect(decrypted).toBe(text);
      });
    });
  });
});
