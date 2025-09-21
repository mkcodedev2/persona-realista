import { Character } from './character';

export interface CharacterTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  template: Omit<Character, 'id' | 'createdAt' | 'lastChatAt' | 'totalMessages'>;
  isCustom: boolean;
  createdAt: Date;
  usageCount: number;
  rating: number;
}

export type TemplateCategory = 
  | 'romance' 
  | 'friendship' 
  | 'professional' 
  | 'fantasy' 
  | 'anime' 
  | 'historical' 
  | 'sci-fi' 
  | 'mystery' 
  | 'adventure' 
  | 'custom';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  setting: string;
  atmosphere: 'romantic' | 'mysterious' | 'adventurous' | 'casual' | 'dramatic' | 'playful';
  contextPrompt: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface RelationshipStatus {
  characterId: string;
  level: number; // 0-100
  mood: 'happy' | 'neutral' | 'sad' | 'angry' | 'excited' | 'confused' | 'loving' | 'playful';
  trust: number; // 0-100
  romance: number; // 0-100
  friendship: number; // 0-100
  lastInteraction: Date;
  importantEvents: string[];
  preferences: Record<string, any>;
}