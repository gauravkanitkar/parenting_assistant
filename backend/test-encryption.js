#!/usr/bin/env node

/**
 * Test script to demonstrate encryption functionality
 */

const crypto = require('crypto');

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
      return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  }
  
  static decrypt(encryptedData, masterKey) {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }
      
      const [ivHex, authTagHex, encrypted] = parts;
      const key = crypto.scryptSync(masterKey, 'salt', 32);
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAAD(Buffer.from('parenting-assistant', 'utf8'));
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  }
  
  static generateMasterKey() {
    return crypto.randomBytes(32).toString('hex');
  }
}

console.log('🔐 Testing Encryption/Decryption...\n');

// Test data
const testApiKey = 'sk-test1234567890abcdefghijklmnopqrstuvwxyz';
const masterKey = EncryptionService.generateMasterKey();

console.log('📝 Original API Key:', testApiKey);
console.log('🔑 Generated Master Key:', masterKey);

try {
  // Encrypt
  const encrypted = EncryptionService.encrypt(testApiKey, masterKey);
  console.log('🔒 Encrypted:', encrypted);
  
  // Decrypt
  const decrypted = EncryptionService.decrypt(encrypted, masterKey);
  console.log('🔓 Decrypted:', decrypted);
  
  // Verify
  if (testApiKey === decrypted) {
    console.log('\n✅ Encryption/Decryption test PASSED!');
    console.log('\n📋 Example .env configuration:');
    console.log('-----------------------------------');
    console.log(`MASTER_KEY=${masterKey}`);
    console.log(`OPENAI_API_KEY_ENCRYPTED=${encrypted}`);
    console.log('# Remove this line after encryption:');
    console.log('# OPENAI_API_KEY=your-original-key');
  } else {
    console.log('\n❌ Encryption/Decryption test FAILED!');
  }
} catch (error) {
  console.error('❌ Test failed:', error.message);
}