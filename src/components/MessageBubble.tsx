
import React from 'react';
import { Volume2, VolumeX, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isPlaying?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  onPlay: () => void;
  onStop: () => void;
}

const MessageBubble = ({ message, onPlay, onStop }: MessageBubbleProps) => {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-[70%] ${isUser ? 'order-1' : 'order-2'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-900'
          } shadow-sm`}
        >
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
          
          {!isUser && (
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={message.isPlaying ? onStop : onPlay}
                className="h-7 px-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                title={message.isPlaying ? "Stop reading" : "Read aloud"}
              >
                {message.isPlaying ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 order-2">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
