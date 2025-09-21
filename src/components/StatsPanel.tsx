import { useMemo } from "react";
import { UserStats } from "@/types/settings";
import { Character, ChatSession } from "@/types/character";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button-custom";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft,
  BarChart3,
  Users,
  MessageCircle,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  Heart
} from "lucide-react";

interface StatsPanelProps {
  characters: Character[];
  chatSessions: ChatSession[];
  onBack: () => void;
}

export function StatsPanel({ characters, chatSessions, onBack }: StatsPanelProps) {
  
  const stats = useMemo(() => {
    const totalMessages = chatSessions.reduce((total, session) => total + session.messages.length, 0);
    
    // Encontrar personagem mais usado
    const characterUsage = characters.map(char => {
      const sessions = chatSessions.filter(s => s.characterId === char.id);
      const messageCount = sessions.reduce((total, s) => total + s.messages.length, 0);
      return { character: char, messageCount, sessionCount: sessions.length };
    }).sort((a, b) => b.messageCount - a.messageCount);

    // Calcular média de mensagens por conversa
    const avgMessagesPerConversation = chatSessions.length > 0 
      ? Math.round(totalMessages / chatSessions.length) 
      : 0;

    // Encontrar conversa mais longa
    const longestConversation = Math.max(0, ...chatSessions.map(s => s.messages.length));

    // Calcular média de caracteres por mensagem
    const allMessages = chatSessions.flatMap(s => s.messages);
    const avgMessageLength = allMessages.length > 0
      ? Math.round(allMessages.reduce((total, msg) => total + msg.content.length, 0) / allMessages.length)
      : 0;

    // Datas importantes
    const firstUseDate = chatSessions.length > 0 
      ? new Date(Math.min(...chatSessions.map(s => s.createdAt.getTime())))
      : new Date();

    const lastActiveDate = chatSessions.length > 0
      ? new Date(Math.max(...chatSessions.map(s => s.lastMessageAt.getTime())))
      : new Date();

    // Atividade nos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentMessages = allMessages.filter(msg => new Date(msg.timestamp) >= sevenDaysAgo);

    return {
      totalCharacters: characters.length,
      totalConversations: chatSessions.length,
      totalMessages,
      characterUsage,
      avgMessagesPerConversation,
      longestConversation,
      avgMessageLength,
      firstUseDate,
      lastActiveDate,
      recentActivity: recentMessages.length,
      mostActiveCharacter: characterUsage[0]?.character,
      daysUsing: Math.max(1, Math.ceil((Date.now() - firstUseDate.getTime()) / (1000 * 60 * 60 * 24)))
    };
  }, [characters, chatSessions]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const getProgressColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage >= 70) return "bg-green-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <Card className="rounded-none border-b">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estatísticas de Uso
            </CardTitle>
          </div>
        </CardHeader>
      </Card>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Cards de estatísticas principais */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCharacters}</p>
                  <p className="text-sm text-muted-foreground">Personagens</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalMessages}</p>
                  <p className="text-sm text-muted-foreground">Mensagens</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalConversations}</p>
                  <p className="text-sm text-muted-foreground">Conversas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.recentActivity}</p>
                  <p className="text-sm text-muted-foreground">Últimos 7 dias</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personagens mais usados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5" />
                Personagens Mais Ativos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.characterUsage.slice(0, 5).map((usage, index) => (
                <div key={usage.character.id} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm font-medium w-6">#{index + 1}</span>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={usage.character.avatar} />
                      <AvatarFallback className="text-xs">
                        {usage.character.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{usage.character.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {usage.messageCount} mensagens • {usage.sessionCount} conversas
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={(usage.messageCount / (stats.characterUsage[0]?.messageCount || 1)) * 100}
                    className="w-20"
                  />
                </div>
              ))}
              {stats.characterUsage.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum dado de uso ainda
                </p>
              )}
            </CardContent>
          </Card>

          {/* Estatísticas detalhadas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Estatísticas Detalhadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Média de mensagens/conversa</span>
                  <Badge variant="outline">{stats.avgMessagesPerConversation}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Conversa mais longa</span>
                  <Badge variant="outline">{stats.longestConversation} mensagens</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Caracteres por mensagem</span>
                  <Badge variant="outline">{stats.avgMessageLength}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Dias usando o app</span>
                  <Badge variant="outline">{stats.daysUsing}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Primeiro uso</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(stats.firstUseDate)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Última atividade</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(stats.lastActiveDate)}
                  </span>
                </div>
              </div>

              {stats.mostActiveCharacter && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Personagem Favorito
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={stats.mostActiveCharacter.avatar} />
                      <AvatarFallback>
                        {stats.mostActiveCharacter.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{stats.mostActiveCharacter.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.characterUsage[0]?.messageCount} mensagens trocadas
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {stats.totalMessages === 0 && (
          <Card className="mt-6">
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Comece a conversar!</h3>
              <p className="text-muted-foreground">
                Suas estatísticas aparecerão aqui conforme você usar o app.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}