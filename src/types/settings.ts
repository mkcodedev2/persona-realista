export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  autoSave: boolean;
  maxMessagesInMemory: number;
  defaultTemperature: number;
  defaultMaxTokens: number;
  showTypingIndicator: boolean;
  soundEnabled: boolean;
  compactMode: boolean;
  language: string;
}

export interface ConversationHistory {
  id: string;
  characterId: string;
  characterName: string;
  title: string;
  messages: import('./character').Message[];
  createdAt: Date;
  lastMessageAt: Date;
  isFavorite: boolean;
  messageCount: number;
}

export interface UserStats {
  totalCharacters: number;
  totalConversations: number;
  totalMessages: number;
  favoriteCharacters: string[];
  mostUsedCharacter?: string;
  averageMessageLength: number;
  longestConversation: number;
  firstUseDate: Date;
  lastActiveDate: Date;
}