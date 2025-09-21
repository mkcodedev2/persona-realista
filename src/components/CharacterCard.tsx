import { Character } from "@/types/character";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button-custom";
import { Heart, MessageCircle, Settings, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface CharacterCardProps {
  character: Character;
  onChatStart: (character: Character) => void;
  onEdit: (character: Character) => void;
  onDelete: (character: Character) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (characterId: string) => void;
}

export function CharacterCard({ character, onChatStart, onEdit, onDelete, isFavorite, onToggleFavorite }: CharacterCardProps) {
  const getStyleFromConversationStyle = (style: Character['conversationStyle']) => {
    const styles = {
      romantic: "bg-card border-primary/20",
      friendly: "bg-card border-border",
      flirty: "bg-card border-primary/20", 
      mysterious: "bg-muted/50 border-border",
      caring: "bg-accent/5 border-border",
      playful: "bg-card border-border"
    };
    return styles[style] || "bg-card";
  };

  const formatLastChat = (date?: Date) => {
    if (!date) return "Nunca conversou";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return "Agora mesmo";
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-colors hover:border-primary/50 border-border/50",
      getStyleFromConversationStyle(character.conversationStyle)
    )}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-primary/30">
              <AvatarImage src={character.avatar} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {character.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {character.lastChatAt && new Date().getTime() - character.lastChatAt.getTime() < 24 * 60 * 60 * 1000 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
            )}
          </div>

          <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground truncate">{character.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {character.conversationStyle}
                  </Badge>
                  {isFavorite && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                </div>
              </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {character.personality}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {character.totalMessages} mensagens
              </span>
              <span>{formatLastChat(character.lastChatAt)}</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => onChatStart(character)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Conversar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(character)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleFavorite(character.id)}
                >
                  <Star className={cn("w-4 h-4", isFavorite ? "text-yellow-500 fill-current" : "text-muted-foreground")} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(character)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}