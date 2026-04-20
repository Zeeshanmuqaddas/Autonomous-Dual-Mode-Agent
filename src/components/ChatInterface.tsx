import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, RefreshCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { chatWithAgent, type Message, type AgentResponse } from '../lib/gemini';

interface ChatInterfaceProps {
  onModeChange: (mode: AgentResponse['mode']) => void;
  onMessageCountChange: (count: number) => void;
}

export function ChatInterface({ onModeChange, onMessageCountChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello! I am your Autonomous AI Agent. Are you looking for business automation help (orders, reports) or a study coach (concepts, quizzes)?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<string[]>(['Analyze recent orders', 'Explain Object-Oriented Programming']);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    onMessageCountChange(messages.length);
  }, [messages, onMessageCountChange]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setSuggestedActions([]);

    try {
      // Exclude the currently created message from history passing
      const history = messages; 
      const response = await chatWithAgent(history, userMessage.text);
      
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.response
      };

      setMessages(prev => [...prev, modelMessage]);
      onModeChange(response.mode);
      
      if (response.suggestedActions?.length > 0) {
        setSuggestedActions(response.suggestedActions);
      }
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I encountered an error trying to process your request. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: '1',
        role: 'model',
        text: "Hello! I am your Autonomous AI Agent. I have wiped my short-term memory. How can I assist you?"
      }
    ]);
    setSuggestedActions(['Analyze recent orders', 'Explain Object-Oriented Programming']);
    onModeChange('General');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm z-10">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Agent Interface</h2>
          <p className="text-sm text-gray-500">Interact with your deployed agent</p>
        </div>
        <button 
          onClick={handleClear}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          <RefreshCcw size={16} />
          Clear Context
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-4 max-w-4xl mx-auto",
              message.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm",
              message.role === 'user' ? "bg-blue-600" : "bg-gray-800"
            )}>
              {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>

            {/* Bubble */}
            <div className={cn(
              "px-5 py-4 rounded-2xl max-w-[80%]",
              message.role === 'user' 
                ? "bg-blue-600 text-white rounded-br-none shadow-md" 
                : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
            )}>
              {message.role === 'model' ? (
                <div className="prose prose-sm prose-gray max-w-none prose-p:leading-relaxed">
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.text}</p>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4 max-w-4xl mx-auto flex-row">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm bg-gray-800">
              <Bot size={20} />
            </div>
            <div className="px-5 py-4 rounded-2xl bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm flex items-center">
              <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
              <span className="ml-3 text-sm text-gray-500">Agent is thinking...</span>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          {/* Suggested actions */}
          {suggestedActions.length > 0 && !isLoading && (
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(action)}
                  className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the agent to help with your business or study..."
              disabled={isLoading}
              className="w-full pl-5 pr-14 py-4 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all outline-none disabled:opacity-50 text-gray-800"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2.5 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="mt-2 text-center text-[11px] text-gray-400">
            Powered by Gemini
          </div>
        </div>
      </div>
    </div>
  );
}
