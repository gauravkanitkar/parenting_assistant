import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// Mock the SecureEnvLoader before importing the server
jest.mock('../src/utils/env-loader', () => ({
  SecureEnvLoader: {
    getPort: () => 5001,
    getOpenAIKey: () => 'test-api-key',
    getFrontendUrl: () => 'http://localhost:3000',
  },
}));

// Import server after mocking
import app from '../src/server';

describe('Server API Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health').expect(200);

      expect(response.body).toHaveProperty('status', 'Server is running');
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('POST /api/chat', () => {
    it('should return AI response for valid message', async () => {
      const testMessage = 'Is my baby crying too much?';

      const response = await request(app)
        .post('/api/chat')
        .send({ message: testMessage })
        .expect(200);

      expect(response.body).toHaveProperty('response');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.response).toBe(
        'This is a test response from the AI assistant.'
      );
      expect(typeof response.body.response).toBe('string');
      expect(response.body.response.length).toBeGreaterThan(0);
    });

    it('should reject empty message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Message is required');
    });

    it('should reject missing message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Message is required');
    });

    it('should reject non-string message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 123 })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Message is required');
    });

    it('should reject message that is too long', async () => {
      const longMessage = 'a'.repeat(1001);

      const response = await request(app)
        .post('/api/chat')
        .send({ message: longMessage })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Message is too long');
    });

    it('should handle whitespace-only messages', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: '   \n\t  ' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Message is required');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app).get('/api/unknown').expect(404);

      expect(response.body).toHaveProperty('error', 'Endpoint not found');
    });

    it('should return 404 for unknown POST endpoints', async () => {
      const response = await request(app)
        .post('/api/unknown')
        .send({ data: 'test' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Endpoint not found');
    });
  });

  describe('Rate Limiting', () => {
    it('should accept multiple requests under limit', async () => {
      // Make several requests quickly
      const promises = Array(5)
        .fill(null)
        .map(() => request(app).get('/api/health').expect(200));

      await Promise.all(promises);
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(app).get('/api/health').expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});
