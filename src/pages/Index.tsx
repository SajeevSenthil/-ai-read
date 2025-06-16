
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Volume2, FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import FileUpload from '@/components/FileUpload';
import MessageBubble from '@/components/MessageBubble';
import { summarizeText } from '@/services/aiService';
import { speakText, stopSpeaking } from '@/utils/textToSpeech';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isPlaying?: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m VoiceAble, your AI-powered screen reader. You can paste text, upload files, or type directly. I\'ll summarize content and read it aloud for you. How can I help make content more accessible today?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, type: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const handleSubmit = async (text?: string) => {
    const contentToProcess = text || inputText.trim();
    if (!contentToProcess) return;

    // Add user message
    addMessage(contentToProcess, 'user');
    setInputText('');
    setIsProcessing(true);

    try {
      // Get AI summary
      const summary = await summarizeText(contentToProcess);
      const messageId = addMessage(summary, 'assistant');
      
      // Auto-play the summary
      setTimeout(() => {
        handlePlayMessage(messageId, summary);
      }, 500);
      
      toast({
        title: "Content Summarized",
        description: "Your content has been processed and summarized successfully.",
      });
    } catch (error) {
      console.error('Error processing content:', error);
      addMessage(
        "I apologize, but I'm having trouble processing your content right now. This might be because the AI service needs to be configured with your API key. Please try again later.",
        'assistant'
      );
      toast({
        title: "Processing Error",
        description: "Unable to summarize content. Please check your API configuration.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (content: string, filename: string) => {
    const fileMessage = `📄 **${filename}**\n\n${content}`;
    handleSubmit(fileMessage);
    setShowFileUpload(false);
  };

  const handlePlayMessage = async (messageId: string, content: string) => {
    try {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isPlaying: true } : { ...msg, isPlaying: false }
      ));
      
      await speakText(content);
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isPlaying: false } : msg
      ));
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Audio Error",
        description: "Unable to play audio. Please check your browser settings.",
        variant: "destructive"
      });
    }
  };

  const handleStopAudio = () => {
    stopSpeaking();
    setMessages(prev => prev.map(msg => ({ ...msg, isPlaying: false })));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">VoiceAble</h1>
            <p className="text-sm text-gray-600">AI-Powered Screen Reader</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onPlay={() => handlePlayMessage(message.id, message.content)}
              onStop={handleStopAudio}
            />
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border max-w-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm">Processing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <FileUpload
              onFileUpload={handleFileUpload}
              onClose={() => setShowFileUpload(false)}
            />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Paste your text here, or upload a file to get started..."
                className="min-h-[60px] max-h-32 resize-none pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                disabled={isProcessing}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFileUpload(true)}
                disabled={isProcessing}
                className="h-[60px] w-12 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                title="Upload file"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              
              <Button
                onClick={() => handleSubmit()}
                disabled={!inputText.trim() || isProcessing}
                className="h-[60px] w-12 bg-blue-600 hover:bg-blue-700"
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 py-3 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-600">
            Generated by VoiceAble - Accessible by Design
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
