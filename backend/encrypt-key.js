#!/usr/bin/env node

/**
 * Utility script to encrypt your OpenAI API key
 * Usage: node encrypt-key.js
 */

const crypto = require('crypto');
const readline = require('readline');

class EncryptionService {
  static algorithm = 'aes-256-gcm';

  static encrypt(text, masterKey) {
    try {
      const key = crypto.scryptSync(masterKey, 'salt', 32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      cipher.setAAD(Buffer.from('parenting-assistant', 'utf8'));

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();
      return (
        iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
      );
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  static generateMasterKey() {
    return crypto.randomBytes(32).toString('hex');
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('🔐 OpenAI API Key Encryption Tool\n');

rl.question('Enter your OpenAI API key: ', apiKey => {
  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.log('❌ Invalid API key format. Must start with "sk-"');
    rl.close();
    return;
  }

  console.log('\nChoose an option:');
  console.log('1. Generate a new master key');
  console.log('2. Use an existing master key');

  rl.question('\nEnter your choice (1 or 2): ', choice => {
    if (choice === '1') {
      const masterKey = EncryptionService.generateMasterKey();
      const encryptedKey = EncryptionService.encrypt(apiKey, masterKey);

      console.log('\n✅ Encryption successful!\n');
      console.log('Add these to your .env file:');
      console.log('-----------------------------------');
      console.log(`MASTER_KEY=${masterKey}`);
      console.log(`OPENAI_API_KEY_ENCRYPTED=${encryptedKey}`);
      console.log('-----------------------------------\n');
      console.log(
        '⚠️  IMPORTANT: Store the MASTER_KEY securely and separately from your code!'
      );
      console.log('💡 You can now remove the plain OPENAI_API_KEY from .env');
    } else if (choice === '2') {
      rl.question('Enter your master key: ', masterKey => {
        if (!masterKey || masterKey.length < 32) {
          console.log('❌ Master key must be at least 32 characters long');
          rl.close();
          return;
        }

        try {
          const encryptedKey = EncryptionService.encrypt(apiKey, masterKey);

          console.log('\n✅ Encryption successful!\n');
          console.log('Add this to your .env file:');
          console.log('-----------------------------------');
          console.log(`OPENAI_API_KEY_ENCRYPTED=${encryptedKey}`);
          console.log('-----------------------------------\n');
          console.log(
            '💡 You can now remove the plain OPENAI_API_KEY from .env'
          );
        } catch (error) {
          console.log(`❌ Encryption failed: ${error.message}`);
        }

        rl.close();
      });
    } else {
      console.log('❌ Invalid choice. Please run the script again.');
      rl.close();
    }

    if (choice === '1') {
      rl.close();
    }
  });
});
