import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import OpenAI from 'openai';
import { SecureEnvLoader } from './utils/env-loader';

const app = express();
const PORT = SecureEnvLoader.getPort();

// Type definitions
interface ChatRequest extends Request {
  body: {
    message: string;
  };
}

interface ChatResponse {
  response: string;
  timestamp: string;
}

interface ErrorResponse {
  error: string;
}

// Initialize OpenAI with encrypted key
const openai = new OpenAI({
  apiKey: SecureEnvLoader.getOpenAIKey(),
});

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: SecureEnvLoader.getFrontendUrl(),
    credentials: true,
  })
);

// Rate limiting - prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Chat endpoint
app.post(
  '/api/chat',
  async (req: ChatRequest, res: Response<ChatResponse | ErrorResponse>) => {
    try {
      const { message } = req.body;

      // Validation
      if (
        !message ||
        typeof message !== 'string' ||
        message.trim().length === 0
      ) {
        return res.status(400).json({
          error: 'Message is required and must be a non-empty string',
        });
      }

      if (message.length > 1000) {
        return res.status(400).json({
          error: 'Message is too long. Please keep it under 1000 characters.',
        });
      }

      // Create specialized prompt for parenting advice
      const systemPrompt = `You are a supportive AI assistant for new parents. You provide evidence-based, gentle advice about newborn care. Key guidelines:

1. Always be reassuring and supportive - parenting is overwhelming
2. Reference reliable sources (AAP, WHO, pediatric guidelines) when relevant
3. Acknowledge when something is normal vs. when to call a doctor
4. Use warm, encouraging language with emojis when appropriate
5. Keep responses concise but thorough (200-300 words max)
6. Include practical tips when possible
7. Always remind parents to trust their instincts
8. If unsure about medical issues, recommend consulting pediatrician
9. Never provide specific medical diagnoses or treatments

Remember: Every baby is unique, and you're supporting tired, potentially anxious new parents.`;

      console.log(
        `[${new Date().toISOString()}] Processing message: ${message.substring(0, 50)}...`
      );

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 400,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error('No response generated from OpenAI');
      }

      console.log(
        `[${new Date().toISOString()}] Response generated successfully`
      );

      res.json({
        response,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Chat error:', error);

      // Handle specific OpenAI errors
      if (error.code === 'insufficient_quota') {
        return res.status(402).json({
          error: 'API quota exceeded. Please check your OpenAI billing.',
        });
      }

      if (error.code === 'invalid_api_key') {
        return res.status(401).json({
          error: 'Invalid API key. Please check your OpenAI configuration.',
        });
      }

      if (error.code === 'rate_limit_exceeded') {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again in a moment.',
        });
      }

      // Generic error response
      res.status(500).json({
        error: "I'm having trouble right now. Please try again in a moment.",
      });
    }
  }
);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
  });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Frontend URL: ${SecureEnvLoader.getFrontendUrl()}`);
    console.log(`🔑 OpenAI API Key: ✅ Configured (encrypted)`);
  });
}

export default app;
