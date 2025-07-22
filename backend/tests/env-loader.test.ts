import { SecureEnvLoader } from '../src/utils/env-loader';
import { EncryptionService } from '../src/utils/encryption';

describe('SecureEnvLoader', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getOpenAIKey', () => {
    it('should return decrypted key when encrypted key is provided', () => {
      const testKey = 'sk-test-key-12345';
      const masterKey = 'test-master-key';
      const encryptedKey = EncryptionService.encrypt(testKey, masterKey);

      process.env.MASTER_KEY = masterKey;
      process.env.OPENAI_API_KEY_ENCRYPTED = encryptedKey;
      delete process.env.OPENAI_API_KEY;

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = SecureEnvLoader.getOpenAIKey();

      expect(result).toBe(testKey);
      expect(consoleSpy).toHaveBeenCalledWith(
        '🔓 Successfully decrypted OpenAI API key'
      );

      consoleSpy.mockRestore();
    });

    it('should return plain text key when encrypted key is not available', () => {
      const testKey = 'sk-plain-text-key';

      delete process.env.MASTER_KEY;
      delete process.env.OPENAI_API_KEY_ENCRYPTED;
      process.env.OPENAI_API_KEY = testKey;

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = SecureEnvLoader.getOpenAIKey();

      expect(result).toBe(testKey);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '⚠️  Using plain text API key. Consider encrypting it for better security.'
      );

      consoleWarnSpy.mockRestore();
    });

    it('should throw error when no API key is found', () => {
      delete process.env.MASTER_KEY;
      delete process.env.OPENAI_API_KEY_ENCRYPTED;
      delete process.env.OPENAI_API_KEY;

      expect(() => {
        SecureEnvLoader.getOpenAIKey();
      }).toThrow(
        'No OpenAI API key found. Please set OPENAI_API_KEY_ENCRYPTED + MASTER_KEY or OPENAI_API_KEY'
      );
    });

    it('should throw error when decryption fails', () => {
      process.env.MASTER_KEY = 'wrong-key';
      process.env.OPENAI_API_KEY_ENCRYPTED = 'invalid:encrypted:data';
      delete process.env.OPENAI_API_KEY;

      expect(() => {
        SecureEnvLoader.getOpenAIKey();
      }).toThrow('Failed to decrypt OpenAI API key');
    });
  });

  describe('getPort', () => {
    it('should return parsed port from environment', () => {
      process.env.PORT = '3000';
      expect(SecureEnvLoader.getPort()).toBe(3000);
    });

    it('should return default port when PORT is not set', () => {
      delete process.env.PORT;
      expect(SecureEnvLoader.getPort()).toBe(5000);
    });

    it('should handle invalid port values', () => {
      process.env.PORT = 'invalid';
      expect(SecureEnvLoader.getPort()).toBeNaN();
    });
  });

  describe('getFrontendUrl', () => {
    it('should return frontend URL from environment', () => {
      process.env.FRONTEND_URL = 'https://example.com';
      expect(SecureEnvLoader.getFrontendUrl()).toBe('https://example.com');
    });

    it('should return default URL when FRONTEND_URL is not set', () => {
      delete process.env.FRONTEND_URL;
      expect(SecureEnvLoader.getFrontendUrl()).toBe('http://localhost:3000');
    });
  });

  describe('getNodeEnv', () => {
    it('should return NODE_ENV from environment', () => {
      process.env.NODE_ENV = 'production';
      expect(SecureEnvLoader.getNodeEnv()).toBe('production');
    });

    it('should return default environment when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;
      expect(SecureEnvLoader.getNodeEnv()).toBe('development');
    });
  });
});
