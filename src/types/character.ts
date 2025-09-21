export interface Character {
  id: string;
  name: string;
  avatar?: string;
  age?: number;
  personality: string;
  background: string;
  interests: string[];
  conversationStyle: 'romantic' | 'friendly' | 'flirty' | 'mysterious' | 'caring' | 'playful';
  memoryContext: string;
  customInstructions: string;
  aiModel: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  createdAt: Date;
  lastChatAt?: Date;
  totalMessages: number;
}

export interface Message {
  id: string;
  characterId: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

export interface ChatSession {
  id: string;
  characterId: string;
  messages: Message[];
  createdAt: Date;
  lastMessageAt: Date;
}

export interface AIConfig {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  openRouterApiKey?: string;
  cohereApiKey?: string;
  groqApiKey?: string;
  selectedModel: string;
  temperature: number;
  maxTokens: number;
}