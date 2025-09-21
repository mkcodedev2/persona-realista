import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Users, Shield, TrendingUp, Calendar, MessageCircle } from 'lucide-react';
import { RelationshipStatus } from '@/types/templates';
import { Character, Message } from '@/types/character';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';

interface RelationshipManagerProps {
  characters: Character[];
  messages: Message[];
}

export function RelationshipManager({ characters, messages }: RelationshipManagerProps) {
  const [relationships, setRelationships] = useLocalStorage<RelationshipStatus[]>('relationships', []);

  // Initialize relationships for new characters
  useEffect(() => {
    const existingIds = relationships.map(r => r.characterId);
    const newCharacters = characters.filter(char => !existingIds.includes(char.id));
    
    if (newCharacters.length > 0) {
      const newRelationships = newCharacters.map(char => ({
        characterId: char.id,
        level: 50,
        mood: 'neutral' as const,
        trust: 50,
        romance: char.conversationStyle === 'romantic' ? 60 : 30,
        friendship: char.conversationStyle === 'friendly' ? 70 : 40,
        lastInteraction: new Date(),
        importantEvents: [],
        preferences: {}
      }));
      
      setRelationships(prev => [...prev, ...newRelationships]);
    }
  }, [characters, relationships, setRelationships]);

  // Update relationships based on recent messages
  useEffect(() => {
    const now = Date.now();
    const dayAgo = now - (24 * 60 * 60 * 1000);
    
    // Get recent messages for each character
    const recentMessagesByCharacter = characters.reduce((acc, char) => {
      const charMessages = messages.filter(m => 
        m.characterId === char.id && 
        m.timestamp.getTime() > dayAgo
      );
      acc[char.id] = charMessages;
      return acc;
    }, {} as Record<string, Message[]>);

    // Update relationship status based on activity
    setRelationships(prev => prev.map(rel => {
      const char = characters.find(c => c.id === rel.characterId);
      const recentMessages = recentMessagesByCharacter[rel.characterId] || [];
      
      if (!char || recentMessages.length === 0) return rel;

      // Calculate interaction boost based on message count and recency
      const interactionBoost = Math.min(recentMessages.length * 2, 10);
      const timeSinceLastInteraction = (now - rel.lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
      
      // Decay relationship over time if no interaction
      const decayFactor = timeSinceLastInteraction > 7 ? -5 : 0;
      
      // Adjust mood based on conversation style and recent activity
      let newMood = rel.mood;
      if (recentMessages.length > 5) {
        newMood = char.conversationStyle === 'romantic' ? 'loving' : 
                 char.conversationStyle === 'friendly' ? 'happy' :
                 char.conversationStyle === 'playful' ? 'playful' : 'excited';
      }

      return {
        ...rel,
        level: Math.max(0, Math.min(100, rel.level + interactionBoost + decayFactor)),
        trust: Math.max(0, Math.min(100, rel.trust + (interactionBoost * 0.5))),
        romance: char.conversationStyle === 'romantic' 
          ? Math.max(0, Math.min(100, rel.romance + interactionBoost))
          : rel.romance,
        friendship: Math.max(0, Math.min(100, rel.friendship + (interactionBoost * 0.8))),
        mood: newMood,
        lastInteraction: recentMessages.length > 0 ? new Date() : rel.lastInteraction
      };
    }));
  }, [messages, characters, setRelationships]);

  const getMoodEmoji = (mood: RelationshipStatus['mood']) => {
    const moods = {
      happy: '😊',
      neutral: '😐',
      sad: '😔',
      angry: '😠',
      excited: '🤩',
      confused: '😕',
      loving: '🥰',
      playful: '😄'
    };
    return moods[mood] || '😐';
  };

  const getMoodColor = (mood: RelationshipStatus['mood']) => {
    const colors = {
      happy: 'text-green-500',
      neutral: 'text-gray-500',
      sad: 'text-blue-500',
      angry: 'text-red-500',
      excited: 'text-yellow-500',
      confused: 'text-purple-500',
      loving: 'text-pink-500',
      playful: 'text-orange-500'
    };
    return colors[mood] || 'text-gray-500';
  };

  const getRelationshipLevel = (level: number) => {
    if (level >= 90) return { label: 'Inseparáveis', color: 'text-pink-500' };
    if (level >= 75) return { label: 'Muito Próximos', color: 'text-green-500' };
    if (level >= 60) return { label: 'Bons Amigos', color: 'text-blue-500' };
    if (level >= 40) return { label: 'Conhecidos', color: 'text-yellow-500' };
    if (level >= 20) return { label: 'Distantes', color: 'text-orange-500' };
    return { label: 'Estranhos', color: 'text-red-500' };
  };

  const sortedRelationships = relationships
    .map(rel => ({
      ...rel,
      character: characters.find(c => c.id === rel.characterId)
    }))
    .filter(rel => rel.character)
    .sort((a, b) => b.level - a.level);

  if (sortedRelationships.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Nenhum relacionamento ainda</h3>
        <p className="text-muted-foreground">
          Converse com seus personagens para desenvolver relacionamentos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Status dos Relacionamentos</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedRelationships.map(({ character, ...rel }) => {
          if (!character) return null;
          
          const levelInfo = getRelationshipLevel(rel.level);
          const recentMessages = messages.filter(m => 
            m.characterId === character.id && 
            Date.now() - m.timestamp.getTime() < (7 * 24 * 60 * 60 * 1000)
          ).length;

          return (
            <Card key={rel.characterId} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={character.avatar} />
                    <AvatarFallback>
                      {character.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{character.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-medium", levelInfo.color)}>
                        {levelInfo.label}
                      </span>
                      <span className={cn("text-lg", getMoodColor(rel.mood))}>
                        {getMoodEmoji(rel.mood)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Relationship Level */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Nível de Relacionamento</span>
                    <span className="font-medium">{rel.level}%</span>
                  </div>
                  <Progress value={rel.level} className="h-2" />
                </div>

                {/* Trust */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Confiança
                    </span>
                    <span className="font-medium">{rel.trust}%</span>
                  </div>
                  <Progress value={rel.trust} className="h-2" />
                </div>

                {/* Romance (if applicable) */}
                {character.conversationStyle === 'romantic' && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        Romance
                      </span>
                      <span className="font-medium">{rel.romance}%</span>
                    </div>
                    <Progress value={rel.romance} className="h-2" />
                  </div>
                )}

                {/* Friendship */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Amizade
                    </span>
                    <span className="font-medium">{rel.friendship}%</span>
                  </div>
                  <Progress value={rel.friendship} className="h-2" />
                </div>

                {/* Stats */}
                <div className="pt-2 border-t">
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {Math.floor((Date.now() - rel.lastInteraction.getTime()) / (1000 * 60 * 60 * 24))}d atrás
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{recentMessages} msgs/semana</span>
                    </div>
                  </div>
                </div>

                {/* Mood badge */}
                <div className="flex justify-center">
                  <Badge variant="outline" className="gap-1">
                    <span className={getMoodColor(rel.mood)}>
                      {getMoodEmoji(rel.mood)}
                    </span>
                    Humor: {rel.mood === 'neutral' ? 'Neutro' : 
                            rel.mood === 'happy' ? 'Feliz' :
                            rel.mood === 'sad' ? 'Triste' :
                            rel.mood === 'angry' ? 'Irritado' :
                            rel.mood === 'excited' ? 'Animado' :
                            rel.mood === 'confused' ? 'Confuso' :
                            rel.mood === 'loving' ? 'Apaixonado' :
                            rel.mood === 'playful' ? 'Brincalhão' : rel.mood}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}