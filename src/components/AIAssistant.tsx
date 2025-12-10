import { useState } from 'react';
import { X, Send, Sparkles, Lightbulb } from 'lucide-react';

interface AIAssistantProps {
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export function AIAssistant({ onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI productivity assistant powered by Google Gemini. I can help you with task suggestions, learning recommendations, and productivity tips. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Mock AI response (In production, this would call Google Gemini API)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateMockResponse(input),
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);

    setInput('');
  };

  const generateMockResponse = (userInput: string): string => {
    const lower = userInput.toLowerCase();
    
    if (lower.includes('task') || lower.includes('todo')) {
      return "I recommend breaking down large tasks into smaller, manageable chunks. Try using the Pomodoro Technique: work for 25 minutes, then take a 5-minute break. This helps maintain focus and prevents burnout.";
    }
    
    if (lower.includes('book') || lower.includes('read')) {
      return "Reading is a great habit! Try setting a daily reading goal, even if it's just 10 pages. Consider reading during your morning routine or before bed. Don't forget to track your progress in the Reading Tracker!";
    }
    
    if (lower.includes('learn') || lower.includes('study')) {
      return "For effective learning, try the Feynman Technique: explain what you've learned in simple terms. Also, space out your study sessions over time (spaced repetition) rather than cramming. Keep up your learning streak!";
    }
    
    if (lower.includes('money') || lower.includes('expense') || lower.includes('budget')) {
      return "Try the 50/30/20 rule for budgeting: 50% for needs, 30% for wants, and 20% for savings. Track all your expenses in the Finance Tracker to identify areas where you can save more.";
    }
    
    if (lower.includes('goal') || lower.includes('motivation')) {
      return "Set SMART goals: Specific, Measurable, Achievable, Relevant, and Time-bound. Break big goals into smaller milestones and celebrate each win. The XP system is designed to keep you motivated!";
    }
    
    return "That's a great question! I'm here to help you stay productive. You can ask me about task management, reading habits, budgeting tips, learning strategies, or goal setting. What would you like to know more about?";
  };

  const quickPrompts = [
    "How can I be more productive?",
    "Suggest a reading goal",
    "Help me budget better",
    "Learning tips",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-slate-900">AI Assistant</h2>
              <p className="text-sm text-slate-600">Powered by Google Gemini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p>{message.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Prompts */}
        <div className="px-6 py-3 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">Quick prompts:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {quickPrompts.map(prompt => (
              <button
                key={prompt}
                onClick={() => {
                  setInput(prompt);
                }}
                className="text-sm px-3 py-1 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-6 border-t border-slate-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything about productivity..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              onClick={sendMessage}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Note: This is a mock AI assistant. In production, it would use Google Gemini API.
          </p>
        </div>
      </div>
    </div>
  );
}
