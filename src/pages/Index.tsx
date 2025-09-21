import { useState, useEffect } from "react";
import { Character, Message, ChatSession, AIConfig } from "@/types/character";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CharacterCard } from "@/components/CharacterCard";
import { CharacterCreator } from "@/components/CharacterCreator";
import { ChatInterface } from "@/components/ChatInterface";
import { AIConfigPanel } from "@/components/AIConfigPanel";
import { AIService } from "@/services/aiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button-custom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Plus, 
  Settings, 
  Search, 
  Sparkles, 
  MessageCircle,
  Users,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import heroImage from "@/assets/hero-romantic-ai.webp";
import exampleAvatar1 from "@/assets/example-avatar-1.webp";
import exampleAvatar2 from "@/assets/example-avatar-2.webp";
import { v4 as uuidv4 } from 'uuid';

type ViewMode = 'home' | 'create' | 'edit' | 'chat' | 'config';

const Index = () => {
  const [characters, setCharacters] = useLocalStorage<Character[]>("roleplay-characters", []);
  const [chatSessions, setChatSessions] = useLocalStorage<ChatSession[]>("roleplay-chat-sessions", []);
  const [aiConfig, setAiConfig] = useLocalStorage<AIConfig>("roleplay-ai-config", {
    selectedModel: "openrouter/auto",
    temperature: 0.8,
    maxTokens: 1000
  });

  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [aiService, setAiService] = useState(() => new AIService(aiConfig));

  useEffect(() => {
    setAiService(new AIService(aiConfig));
  }, [aiConfig]);

  // Criar personagens de exemplo se não houver nenhum
  useEffect(() => {
    if (characters.length === 0) {
      const exampleCharacters: Character[] = [
        {
          id: uuidv4(),
          name: "Sofia",
          avatar: exampleAvatar1,
          age: 25,
          personality: "Carinhosa, inteligente e divertida. Sofia é uma pessoa muito comunicativa que adora conversar sobre qualquer assunto. Ela é empática, tem um ótimo senso de humor e sempre tenta alegrar o dia das pessoas ao seu redor.",
          background: "Sofia trabalha como designer gráfica e adora arte. Nas horas vagas, ela gosta de ler livros, assistir filmes e descobrir novos lugares na cidade. É apaixonada por música e toca violão.",
          interests: ["Arte e Design", "Música", "Cinema", "Livros", "Viagens", "Fotografia"],
          conversationStyle: 'romantic',
          memoryContext: "",
          customInstructions: "Seja sempre carinhosa e atenciosa. Use emojis ocasionalmente. Demonstre interesse genuíno pelas conversas.",
          aiModel: "openrouter/auto",
          temperature: 0.8,
          maxTokens: 1000,
          systemPrompt: "",
          createdAt: new Date(),
          totalMessages: 0
        },
        {
          id: uuidv4(),
          name: "Gabriel",
          avatar: exampleAvatar2,
          age: 28,
          personality: "Confiante, aventureiro e bem-humorado. Gabriel é uma pessoa muito positiva que adora contar histórias e fazer as pessoas rirem. Ele é determinado, leal aos amigos e sempre disposto a ajudar.",
          background: "Gabriel é engenheiro de software e empreendedor. Adora tecnologia, esportes e aventuras ao ar livre. Nos fins de semana gosta de fazer trilhas, praticar surf ou simplesmente relaxar com os amigos.",
          interests: ["Tecnologia", "Esportes", "Aventuras", "Surf", "Trilhas", "Empreendedorismo"],
          conversationStyle: 'friendly',
          memoryContext: "",
          customInstructions: "Seja descontraído e bem-humorado. Conte histórias interessantes e seja um bom ouvinte.",
          aiModel: "openrouter/auto", 
          temperature: 0.7,
          maxTokens: 1000,
          systemPrompt: "",
          createdAt: new Date(),
          totalMessages: 0
        }
      ];
      
      setCharacters(exampleCharacters);
    }
  }, []);

  const filteredCharacters = characters.filter(char =>
    char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.personality.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCharacter = (characterData: Omit<Character, 'id' | 'createdAt' | 'totalMessages'>) => {
    const newCharacter: Character = {
      ...characterData,
      id: uuidv4(),
      createdAt: new Date(),
      totalMessages: 0
    };

    setCharacters(prev => [...prev, newCharacter]);
    setCurrentView('home');
    toast.success(`${newCharacter.name} foi criado!`);
  };

  const handleEditCharacter = (characterData: Omit<Character, 'id' | 'createdAt' | 'totalMessages'>) => {
    if (!editingCharacter) return;

    const updatedCharacter: Character = {
      ...editingCharacter,
      ...characterData,
    };

    setCharacters(prev => 
      prev.map(char => char.id === editingCharacter.id ? updatedCharacter : char)
    );
    setEditingCharacter(null);
    setCurrentView('home');
    toast.success(`${updatedCharacter.name} foi atualizado!`);
  };

  const handleDeleteCharacter = (character: Character) => {
    if (window.confirm(`Tem certeza que deseja deletar ${character.name}?`)) {
      setCharacters(prev => prev.filter(char => char.id !== character.id));
      setChatSessions(prev => prev.filter(session => session.characterId !== character.id));
      toast.success(`${character.name} foi deletado`);
    }
  };

  const handleChatStart = (character: Character) => {
    setSelectedCharacter(character);
    
    // Buscar sessão de chat existente ou criar nova
    const existingSession = chatSessions.find(session => session.characterId === character.id);
    if (existingSession) {
      setCurrentMessages(existingSession.messages);
    } else {
      setCurrentMessages([]);
    }
    
    setCurrentView('chat');
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedCharacter) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: uuidv4(),
      characterId: selectedCharacter.id,
      content,
      isUser: true,
      timestamp: new Date()
    };

    setCurrentMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Gerar resposta da IA
      const response = await aiService.generateResponse(
        selectedCharacter, 
        currentMessages, 
        content
      );

      if (response.error) {
        throw new Error(response.error);
      }

      // Adicionar resposta da IA
      const aiMessage: Message = {
        id: uuidv4(),
        characterId: selectedCharacter.id,
        content: response.content,
        isUser: false,
        timestamp: new Date()
      };

      const newMessages = [...currentMessages, userMessage, aiMessage];
      setCurrentMessages(newMessages);

      // Salvar sessão de chat
      const sessionId = `${selectedCharacter.id}-session`;
      const session: ChatSession = {
        id: sessionId,
        characterId: selectedCharacter.id,
        messages: newMessages,
        createdAt: new Date(),
        lastMessageAt: new Date()
      };

      setChatSessions(prev => {
        const filtered = prev.filter(s => s.characterId !== selectedCharacter.id);
        return [...filtered, session];
      });

      // Atualizar estatísticas do personagem
      setCharacters(prev => 
        prev.map(char => 
          char.id === selectedCharacter.id 
            ? { ...char, lastChatAt: new Date(), totalMessages: newMessages.length }
            : char
        )
      );

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error(error instanceof Error ? error.message : "Erro ao gerar resposta");
    } finally {
      setIsTyping(false);
    }
  };

  const handleConfigUpdate = (newConfig: AIConfig) => {
    setAiConfig(newConfig);
    toast.success("Configuração da IA atualizada!");
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'create':
        return (
          <CharacterCreator
            onSave={handleCreateCharacter}
            onCancel={() => setCurrentView('home')}
          />
        );

      case 'edit':
        return editingCharacter && (
          <CharacterCreator
            character={editingCharacter}
            onSave={handleEditCharacter}
            onCancel={() => {
              setEditingCharacter(null);
              setCurrentView('home');
            }}
          />
        );

      case 'chat':
        return selectedCharacter && (
          <ChatInterface
            character={selectedCharacter}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            onBack={() => setCurrentView('home')}
            onSettingsOpen={() => setCurrentView('config')}
            isTyping={isTyping}
          />
        );

      case 'config':
        return (
          <AIConfigPanel
            config={aiConfig}
            onConfigUpdate={handleConfigUpdate}
            onClose={() => setCurrentView('home')}
          />
        );

      default:
        return (
          <div className="min-h-screen bg-background">
            {/* Header discreto */}
            <div className="border-b bg-card">
              <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto text-center">
                  <h1 className="text-4xl font-bold mb-4 text-foreground">
                    Chat Inteligente
                  </h1>
                  
                  <p className="text-lg text-muted-foreground mb-6">
                    Converse com personagens personalizados usando IA avançada
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
                    <Button 
                      variant="default" 
                      onClick={() => setCurrentView('create')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Personagem
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentView('config')}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </Button>
                  </div>

                  {/* Stats simples */}
                  {characters.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-sm text-muted-foreground">
                      <div className="text-center">
                        <div className="font-semibold text-foreground">{characters.length}</div>
                        <div>Personagens</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-foreground">
                          {chatSessions.reduce((total, session) => total + session.messages.length, 0)}
                        </div>
                        <div>Mensagens</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-foreground">
                          {chatSessions.length}
                        </div>
                        <div>Conversas</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Characters Section */}
            <div className="container mx-auto px-4 py-8">
              {characters.length > 0 ? (
                <>
                  <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-semibold">Personagens</h2>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                      <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentView('create')}
                      >
                        <Plus className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">Novo</span>
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCharacters.map(character => (
                      <CharacterCard
                        key={character.id}
                        character={character}
                        onChatStart={handleChatStart}
                        onEdit={(char) => {
                          setEditingCharacter(char);
                          setCurrentView('edit');
                        }}
                        onDelete={handleDeleteCharacter}
                      />
                    ))}
                  </div>

                  {filteredCharacters.length === 0 && searchQuery && (
                    <div className="text-center py-12">
                      <Search className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Nenhum resultado para "{searchQuery}"
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <Card className="max-w-md mx-auto text-center p-6">
                  <CardHeader>
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <CardTitle className="text-xl">Começar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Crie seu primeiro personagem para começar as conversas
                    </p>
                    <Button 
                      variant="default" 
                      onClick={() => setCurrentView('create')}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Personagem
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );
    }
  };

  return renderCurrentView();
};

export default Index;