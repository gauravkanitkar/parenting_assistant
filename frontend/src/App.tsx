import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import { Send, Baby, Heart } from 'lucide-react';
import './App.css';

// Type definitions
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Add these type definitions at the top
interface ApiResponse {
  response: string;
  timestamp: string;
}

interface ApiError {
  error: string;
}

const App: React.FC = () => {
  // State with proper typing
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI parenting assistant. Ask me anything about newborn care, feeding, sleep, or if you\'re worried about something - I\'m here to help! 👶'
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Quick question buttons - typed as readonly array
  const quickQuestions: readonly string[] = [
    "Is this crying normal?",
    "Should I wake baby to feed?",
    "Is baby eating enough?",
    "Why won't baby sleep?",
    "Is this behavior normal?",
    "When should I call the doctor?"
  ] as const;

  const getAIResponse = async (userQuestion: string): Promise<string> => {
    // First, try the real API
    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userQuestion }),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      console.log('✅ Using real AI response');
      return data.response;
      
    } catch (error: unknown) {
      console.warn('⚠️ API failed, falling back to local responses:', error);
      
      // Fallback to your existing smart implementation
      return getFallbackResponse(userQuestion);
    }
  };

  const getFallbackResponse = async (userQuestion: string): Promise<string> => {
    // Simulate realistic thinking time
    await new Promise<void>(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const question = userQuestion.toLowerCase();
    
    // Sleep-related questions
    if (question.includes('sleep') || question.includes('nap') || question.includes('wake')) {
      const sleepResponses: string[] = [
        "Newborn sleep is chaotic but normal! Babies sleep 14-17 hours daily in 2-4 hour chunks. Their circadian rhythms develop around 3-4 months. Try: room-sharing (not bed-sharing), swaddling, white noise, and following safe sleep guidelines (back sleeping, firm mattress, no loose bedding). Remember: 'Sleep when baby sleeps' isn't just advice - it's survival! 😴",
        "Sleep troubles are the #1 new parent challenge! Newborns don't know day from night yet. Help them learn: bright light during day feeds, dim light at night, and consistent bedtime routines (even for newborns). If baby won't sleep, check: hunger, diaper, temperature, or overstimulation. You're not failing - this is temporary! 🌙"
      ];
      return sleepResponses[Math.floor(Math.random() * sleepResponses.length)];
    }
    
    // Feeding questions
    if (question.includes('feed') || question.includes('eat') || question.includes('hungry') || question.includes('milk')) {
      const feedingResponses: string[] = [
        "Feeding frequency varies by baby and feeding method! Breastfed babies typically eat every 2-3 hours (8-12 times daily), formula-fed babies every 3-4 hours. Early hunger cues: rooting, sucking motions, hand-to-mouth. Late cues: crying (try to feed before this!). Trust your instincts - if baby seems hungry, offer food! 🍼",
        "Both breast and bottle feeding are wonderful ways to nourish your baby! Breastfeeding: expect cluster feeding, growth spurts, and establishing supply takes time. Formula feeding: follow preparation instructions carefully, watch for cues of fullness. Mixed feeding is also perfectly fine! What matters is a fed baby and supported parent. 💙"
      ];
      return feedingResponses[Math.floor(Math.random() * feedingResponses.length)];
    }
    
    // Crying questions
    if (question.includes('cry') || question.includes('fussy') || question.includes('calm') || question.includes('soothe')) {
      const cryingResponses: string[] = [
        "Crying is baby's main communication tool! Common reasons: hunger, tiredness, dirty diaper, need for comfort, overstimulation, or just processing their day. Try the '5 S's': Swaddling, Side/stomach position (while awake), Shushing, Swinging/swaying, Sucking (pacifier/finger). Sometimes babies just need to cry - it's not your fault! 😢",
        "Fussy periods are exhausting but normal! Many babies have a 'witching hour' (often evening) where they're extra fussy. This usually peaks around 6 weeks and improves by 3-4 months. Strategies: skin-to-skin contact, gentle motion, white noise, fresh air, or tag-team with your partner. It's okay to put baby down safely and take a break! 🌅"
      ];
      return cryingResponses[Math.floor(Math.random() * cryingResponses.length)];
    }
    
    // "Is this normal?" questions
    if (question.includes('normal') || question.includes('worry') || question.includes('concerned') || question.includes('should i call') || question.includes('doctor')) {
      const normalResponses: string[] = [
        "Your concerns are completely valid - parenting is overwhelming! Most newborn behaviors are normal: irregular sleep, frequent feeding, fussiness, hiccups, sneezing, irregular breathing during sleep. Call your pediatrician if: fever (100.4°F+), difficulty breathing, extreme lethargy, poor feeding, or your gut says something's wrong. Trust your instincts! 🩺",
        "New parent anxiety is SO normal! Every parent wonders if they're doing it right. Red flags to call doctor immediately: fever, difficulty breathing, blue lips/face, extreme lethargy, not eating, fewer than 6 wet diapers daily after day 5. For everything else: when in doubt, call! Pediatricians expect new parent questions. 📞"
      ];
      return normalResponses[Math.floor(Math.random() * normalResponses.length)];
    }
    
    // Default comprehensive response
    return "That's a thoughtful question! Newborn care involves so much learning. Every baby is unique, and there's often no single 'right' answer. For specific medical concerns, always consult your pediatrician - they're your best resource for personalized advice. What specific aspect of this would you like to explore more? I'm here to support you through this journey! 🤗";
  };

  // Handle sending a message with proper typing
  const handleSendMessage = async (): Promise<void> => {
    if (!inputMessage.trim()) return;
    
    const userMessage: Message = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const aiResponse = await getAIResponse(inputMessage);
      const assistantMessage: Message = { role: 'assistant', content: aiResponse };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'I\'m having trouble right now, but I\'m here to help! For immediate concerns, don\'t hesitate to contact your pediatrician. What would you like to discuss?' 
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsLoading(false);
  };

  // Handle quick question clicks
  const handleQuickQuestion = async (question: string): Promise<void> => {
    const userMessage: Message = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    
    try {
      const aiResponse = await getAIResponse(question);
      const assistantMessage: Message = { role: 'assistant', content: aiResponse };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'I\'m having trouble right now, but I\'m here to help! For immediate concerns, don\'t hesitate to contact your pediatrician. What would you like to discuss?' 
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsLoading(false);
  };

  // Handle Enter key press with proper event typing
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle input change with proper event typing
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setInputMessage(e.target.value);
  };

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <Baby className="header-icon baby-icon" size={24} />
          <h1 className="header-title">New Parent AI Assistant</h1>
          <Heart className="header-icon heart-icon" size={20} />
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        {messages.map((message: Message, index: number) => (
          <div
            key={index}
            className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="message assistant-message">
            <div className="message-content">
              <div className="loading-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="quick-questions">
            <p className="quick-questions-title">Or try these common questions:</p>
            <div className="quick-questions-grid">
              {quickQuestions.map((question: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="quick-question-button"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about newborn care..."
            className="message-input"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="send-button"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;