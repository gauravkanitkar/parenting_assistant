# 🔐 API Key Encryption Guide

This guide explains how to encrypt your OpenAI API key for enhanced security instead of storing it in plain text.

## 🎯 Benefits

- **Enhanced Security**: API key is encrypted using AES-256-GCM
- **Separation of Concerns**: Master key can be stored separately from encrypted key
- **Backward Compatibility**: Fallback to plain text key if encryption isn't set up
- **Easy Migration**: Simple tools to encrypt existing keys

## 🚀 Quick Setup

### Step 1: Encrypt Your API Key

Run the encryption utility:

```bash
cd backend
node encrypt-key.js
```

Follow the prompts to:

1. Enter your OpenAI API key
2. Choose to generate a new master key or use an existing one
3. Get encrypted values for your `.env` file

### Step 2: Update Your .env File

Replace your current `.env` with:

```env
# Encrypted API Key (recommended)
MASTER_KEY=your-64-character-master-key-here
OPENAI_API_KEY_ENCRYPTED=encrypted-key-data-here

# Other settings
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Remove this after encryption:
# OPENAI_API_KEY=your-plain-text-key
```

### Step 3: Restart Your Server

The backend will automatically detect and use the encrypted key.

## 🔧 Advanced Usage

### Manual Encryption (TypeScript)

```typescript
import { EncryptionService } from './src/utils/encryption';

const masterKey = EncryptionService.generateMasterKey();
const encrypted = EncryptionService.encrypt('your-api-key', masterKey);
console.log('Encrypted:', encrypted);
```

### Testing Encryption

```bash
node test-encryption.js
```

## 📁 File Structure

```
backend/
├── src/
│   └── utils/
│       ├── encryption.ts      # Core encryption service
│       └── env-loader.ts      # Secure environment loader
├── encrypt-key.js             # Interactive encryption tool
├── test-encryption.js         # Test script
└── .env                       # Your environment variables
```

## 🔒 Security Best Practices

1. **Store Master Key Separately**:
   - Consider using environment variables from your hosting platform
   - Use secret management services (AWS Secrets Manager, Azure Key Vault, etc.)
   - Store in a different system than your encrypted key

2. **Rotate Keys Regularly**:
   - Generate new master keys periodically
   - Re-encrypt your API key with new master keys

3. **Environment Separation**:
   - Use different master keys for development/staging/production
   - Never commit master keys to version control

4. **Access Control**:
   - Limit who has access to master keys
   - Use principle of least privilege

## 🛠️ Environment Variable Options

The system supports multiple configurations:

| Setup                       | Environment Variables                     | Use Case                      |
| --------------------------- | ----------------------------------------- | ----------------------------- |
| **Encrypted (Recommended)** | `MASTER_KEY` + `OPENAI_API_KEY_ENCRYPTED` | Production, enhanced security |
| **Plain Text (Fallback)**   | `OPENAI_API_KEY`                          | Development, quick setup      |

## 🚨 Migration from Plain Text

1. **Current setup** (plain text):

   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```

2. **Run encryption tool**:

   ```bash
   node encrypt-key.js
   ```

3. **Update .env**:

   ```env
   MASTER_KEY=generated-master-key
   OPENAI_API_KEY_ENCRYPTED=encrypted-data
   # OPENAI_API_KEY=sk-your-key-here  # Comment out or remove
   ```

4. **Restart server** - encryption will be automatically detected

## 🔍 Troubleshooting

### "Decryption failed" Error

- Verify master key is correct
- Ensure encrypted key wasn't corrupted during copy/paste
- Check that both values are in the same environment

### "No OpenAI API key found" Error

- Make sure either encrypted or plain text key is set
- Verify `.env` file is in the correct location
- Check environment variable names are correct

### Server Won't Start

- Test encryption with `node test-encryption.js`
- Verify all required dependencies are installed
- Check TypeScript compilation with `npm run build`

## 🔄 Key Rotation Process

1. **Generate new master key**:

   ```bash
   node encrypt-key.js  # Choose option 1
   ```

2. **Update environment variables**
3. **Restart application**
4. **Securely delete old master key**

## 💡 Production Deployment

For production environments, consider:

- **Container Secrets**: Use Docker secrets or Kubernetes secrets
- **Cloud Key Management**: AWS KMS, Azure Key Vault, GCP Secret Manager
- **Environment Variables**: Set `MASTER_KEY` via your hosting platform
- **CI/CD Integration**: Inject secrets during deployment

## 📞 Support

If you encounter issues:

1. Run the test script: `node test-encryption.js`
2. Check server logs for specific error messages
3. Verify environment variable configuration
4. Ensure all dependencies are installed

The system maintains backward compatibility, so you can always fall back to plain text keys during troubleshooting.
