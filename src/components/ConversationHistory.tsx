import { useState, useMemo } from "react";
import { ConversationHistory as ConversationHistoryType, UserSettings } from "@/types/settings";
import { Character } from "@/types/character";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button-custom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  MessageCircle, 
  Heart,
  Trash2,
  Download,
  Filter,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ConversationHistoryProps {
  conversations: ConversationHistoryType[];
  characters: Character[];
  onConversationSelect: (conversation: ConversationHistoryType) => void;
  onConversationDelete: (conversationId: string) => void;
  onToggleFavorite: (conversationId: string) => void;
  onBack: () => void;
}

export function ConversationHistory({
  conversations,
  characters,
  onConversationSelect,
  onConversationDelete,
  onToggleFavorite,
  onBack
}: ConversationHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<'all' | 'favorites' | 'recent'>('all');

  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Filtrar por busca
    if (searchQuery.trim()) {
      filtered = filtered.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.characterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filtrar por tipo
    switch (filterBy) {
      case 'favorites':
        filtered = filtered.filter(conv => conv.isFavorite);
        break;
      case 'recent':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter(conv => conv.lastMessageAt >= thirtyDaysAgo);
        break;
    }

    // Ordenar por data mais recente
    return filtered.sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }, [conversations, searchQuery, filterBy]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Agora mesmo";
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const getCharacterAvatar = (characterId: string) => {
    return characters.find(c => c.id === characterId)?.avatar || "";
  };

  const handleDelete = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja deletar esta conversa?")) {
      onConversationDelete(conversationId);
      toast.success("Conversa deletada");
    }
  };

  const handleToggleFavorite = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(conversationId);
  };

  const exportConversations = () => {
    const dataStr = JSON.stringify(filteredConversations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversas-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Conversas exportadas!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Card className="rounded-none border-b">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Histórico de Conversas
              </CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={exportConversations}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'favorites', 'recent'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={filterBy === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterBy(filter)}
                >
                  {filter === 'all' && 'Todas'}
                  {filter === 'favorites' && 'Favoritas'}
                  {filter === 'recent' && 'Recentes'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="container mx-auto px-4 py-6">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || filterBy !== 'all' 
                ? "Nenhuma conversa encontrada" 
                : "Nenhuma conversa ainda"
              }
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || filterBy !== 'all'
                ? "Tente ajustar os filtros de busca"
                : "Comece uma conversa para ver o histórico aqui"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConversations.map((conversation) => (
              <Card 
                key={conversation.id}
                className="cursor-pointer transition-colors hover:border-primary/50 group"
                onClick={() => onConversationSelect(conversation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={getCharacterAvatar(conversation.characterId)} />
                      <AvatarFallback className="text-sm">
                        {conversation.characterName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium truncate">{conversation.characterName}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.title}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => handleToggleFavorite(conversation.id, e)}
                          >
                            <Heart 
                              className={cn(
                                "w-3 h-3",
                                conversation.isFavorite ? "fill-current text-red-500" : "text-muted-foreground"
                              )} 
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 text-destructive"
                            onClick={(e) => handleDelete(conversation.id, e)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {conversation.messages.slice(-1)[0]?.content || "Sem mensagens"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-3 h-3" />
                      <span>{conversation.messageCount} mensagens</span>
                    </div>
                    <span>{formatDate(conversation.lastMessageAt)}</span>
                  </div>
                  
                  {conversation.isFavorite && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Favorita
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}