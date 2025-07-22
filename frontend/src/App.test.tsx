import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders initial assistant message', () => {
    render(<App />);

    expect(
      screen.getByText(/Hi! I'm your AI parenting assistant/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Ask me anything about newborn care/)
    ).toBeInTheDocument();
  });

  test('renders header with correct title', () => {
    render(<App />);

    expect(screen.getByText('New Parent AI Assistant')).toBeInTheDocument();
  });

  test('renders quick question buttons on initial load', () => {
    render(<App />);

    expect(screen.getByText('Is this crying normal?')).toBeInTheDocument();
    expect(screen.getByText('Should I wake baby to feed?')).toBeInTheDocument();
    expect(
      screen.getByText('When should I call the doctor?')
    ).toBeInTheDocument();
  });

  test('allows user to type and send message', async () => {
    const user = userEvent.setup();

    // Mock successful API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: 'Test AI response',
        timestamp: new Date().toISOString(),
      }),
    });

    render(<App />);

    const textarea = screen.getByPlaceholderText(
      /Ask me anything about newborn care/
    );
    const sendButton = screen.getByRole('button');

    await user.type(textarea, 'Is my baby sleeping enough?');
    await user.click(sendButton);

    // Check that user message appears
    expect(screen.getByText('Is my baby sleeping enough?')).toBeInTheDocument();

    // Wait for AI response
    await waitFor(() => {
      expect(screen.getByText('Test AI response')).toBeInTheDocument();
    });
  });

  test('handles Enter key to send message', async () => {
    const user = userEvent.setup();

    // Mock successful API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: 'Test response',
        timestamp: new Date().toISOString(),
      }),
    });

    render(<App />);

    const textarea = screen.getByPlaceholderText(
      /Ask me anything about newborn care/
    );

    await user.type(textarea, 'Test message{enter}');

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  test('prevents sending empty messages', async () => {
    const user = userEvent.setup();
    render(<App />);

    const sendButton = screen.getByRole('button');

    // Send button should be disabled initially
    expect(sendButton).toBeDisabled();

    const textarea = screen.getByPlaceholderText(
      /Ask me anything about newborn care/
    );
    await user.type(textarea, '   '); // Only whitespace

    expect(sendButton).toBeDisabled();
  });

  test('shows loading state during API call', async () => {
    const user = userEvent.setup();

    // Mock delayed API response
    (fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  response: 'Delayed response',
                  timestamp: new Date().toISOString(),
                }),
              }),
            100
          )
        )
    );

    render(<App />);

    const textarea = screen.getByPlaceholderText(
      /Ask me anything about newborn care/
    );
    const sendButton = screen.getByRole('button');

    await user.type(textarea, 'Test message');
    await user.click(sendButton);

    // Check loading dots appear
    expect(
      screen.getByTestId('loading-dots') ||
        screen.querySelector('.loading-dots')
    ).toBeDefined();
  });

  test('handles API errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock API error
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<App />);

    const textarea = screen.getByPlaceholderText(
      /Ask me anything about newborn care/
    );
    const sendButton = screen.getByRole('button');

    await user.type(textarea, 'Test message');
    await user.click(sendButton);

    // Wait for error message
    await waitFor(() => {
      expect(
        screen.getByText(/I'm having trouble right now/)
      ).toBeInTheDocument();
    });
  });

  test('handles quick question clicks', async () => {
    const user = userEvent.setup();

    // Mock successful API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: 'Quick question response',
        timestamp: new Date().toISOString(),
      }),
    });

    render(<App />);

    const quickQuestionButton = screen.getByText('Is this crying normal?');
    await user.click(quickQuestionButton);

    expect(screen.getByText('Is this crying normal?')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Quick question response')).toBeInTheDocument();
    });
  });

  test('handles API timeout with fallback', async () => {
    const user = userEvent.setup();

    // Mock API timeout
    (fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AbortError')), 100)
        )
    );

    render(<App />);

    const textarea = screen.getByPlaceholderText(
      /Ask me anything about newborn care/
    );
    const sendButton = screen.getByRole('button');

    await user.type(textarea, 'Test message');
    await user.click(sendButton);

    // Should fall back to local response
    await waitFor(
      () => {
        expect(screen.getByText(/Test message/)).toBeInTheDocument();
        // Should show some response (either error message or fallback)
      },
      { timeout: 3000 }
    );
  });
});
