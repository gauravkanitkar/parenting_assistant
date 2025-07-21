# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack AI-powered parenting assistant application designed to help new parents with newborn care questions. The system provides evidence-based, supportive advice through a chat interface.

## Architecture

**Backend** (`/backend/`): Express.js TypeScript API server
- Core server: `backend/src/server.ts`
- Utilities: `backend/src/utils/` (encryption, environment loading)
- OpenAI GPT-3.5-turbo integration for parenting advice
- Security-focused with helmet, CORS, rate limiting
- Encrypted API key storage system

**Frontend** (`/frontend/`): React TypeScript application  
- Main component: `frontend/src/App.tsx`
- Chat interface with message history
- Fallback responses when API is unavailable
- Quick question buttons for common parenting concerns

## Development Commands

### Backend
```bash
cd backend
npm run dev          # Development server with nodemon
npm run build        # TypeScript compilation
npm run start        # Production server
npm run type-check   # TypeScript type checking
```

### Frontend
```bash
cd frontend
npm start            # Development server (port 3000)
npm run build        # Production build
npm test             # Run tests
```

### Root Level
The root package.json contains combined dependencies but no scripts.

## Key Features

### API Key Security
- Uses AES-256-GCM encryption for OpenAI API keys
- Environment-based configuration with `SecureEnvLoader`
- Encryption utilities in `backend/src/utils/encryption.ts`
- Setup guide: `backend/ENCRYPTION-GUIDE.md`
- Interactive encryption tool: `backend/encrypt-key.js`

### API Endpoints
- `GET /api/health` - Health check
- `POST /api/chat` - Chat completion with parenting-specific system prompt

### Configuration
- Backend runs on port from env (default 5001)
- Frontend connects to `http://localhost:5001/api/chat`
- CORS configured for frontend URL
- Rate limiting: 100 requests per 15 minutes per IP

## Environment Setup

Backend requires either:
- Encrypted: `MASTER_KEY` + `OPENAI_API_KEY_ENCRYPTED`
- Plain text: `OPENAI_API_KEY`

Other variables: `PORT`, `NODE_ENV`, `FRONTEND_URL`

## Security Considerations

- Never commit API keys or master keys
- Use encrypted key storage in production
- Follow the encryption guide for secure deployment
- Rate limiting and input validation implemented
- Helmet middleware for security headers