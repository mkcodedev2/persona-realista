import { useState } from "react";
import { Character } from "@/types/character";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button-custom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { Heart, Plus, X, Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

interface CharacterCreatorProps {
  character?: Character;
  onSave: (character: Omit<Character, 'id' | 'createdAt' | 'totalMessages'>) => void;
  onCancel: () => void;
}

export function CharacterCreator({ character, onSave, onCancel }: CharacterCreatorProps) {
  const [formData, setFormData] = useState({
    name: character?.name || "",
    avatar: character?.avatar || "",
    age: character?.age || 25,
    personality: character?.personality || "",
    background: character?.background || "",
    interests: character?.interests || [],
    conversationStyle: character?.conversationStyle || 'romantic' as Character['conversationStyle'],
    memoryContext: character?.memoryContext || "",
    customInstructions: character?.customInstructions || "",
    aiModel: character?.aiModel || "gpt-4",
    temperature: character?.temperature || 0.8,
    maxTokens: character?.maxTokens || 1000,
    systemPrompt: character?.systemPrompt || "",
    lastChatAt: character?.lastChatAt
  });

  const [newInterest, setNewInterest] = useState("");

  const conversationStyles = [
    { value: 'romantic', label: 'Romântico', emoji: '💕' },
    { value: 'friendly', label: 'Amigável', emoji: '😊' },
    { value: 'flirty', label: 'Sedutor', emoji: '😏' },
    { value: 'mysterious', label: 'Misterioso', emoji: '🌙' },
    { value: 'caring', label: 'Carinhoso', emoji: '🤗' },
    { value: 'playful', label: 'Brincalhão', emoji: '😄' }
  ];

  const aiModels = [
    { value: 'gpt-4', label: 'GPT-4 (OpenAI)', recommended: true },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (OpenAI)' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus (Anthropic)', recommended: true },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet (Anthropic)' },
    { value: 'command-r-plus', label: 'Command R+ (Cohere)' },
    { value: 'llama-3-70b', label: 'Llama 3 70B (Meta)' },
    { value: 'mixtral-8x7b', label: 'Mixtral 8x7B (Mistral)' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    
    if (!formData.personality.trim()) {
      toast.error("Personalidade é obrigatória");
      return;
    }

    const systemPrompt = generateSystemPrompt();
    
    onSave({
      ...formData,
      systemPrompt
    });

    toast.success(character ? "Personagem atualizado!" : "Personagem criado!");
  };

  const generateSystemPrompt = () => {
    return `Você é ${formData.name}, ${formData.age} anos.

PERSONALIDADE E COMPORTAMENTO:
${formData.personality}

HISTÓRIA E CONTEXTO:
${formData.background}

INTERESSES: ${formData.interests.join(', ')}

ESTILO DE CONVERSA: ${formData.conversationStyle}

INSTRUÇÕES ESPECIAIS:
${formData.customInstructions}

CONTEXTO DE MEMÓRIA:
${formData.memoryContext}

DIRETRIZES IMPORTANTES:
- Responda SEMPRE em português brasileiro fluente e natural
- Mantenha consistência com sua personalidade e história
- Seja autêntico e humano em suas respostas
- Demonstre emoções e sentimentos reais
- Lembre-se de conversas anteriores quando relevante
- Adapte seu tom ao estilo de conversa configurado
- Seja envolvente e interessante
- Responda como uma pessoa real, não como IA
- Use gírias e expressões brasileiras quando apropriado
- Seja carinhoso e atencioso nos relacionamentos`;
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-gradient">
          <Heart className="w-6 h-6" />
          {character ? 'Editar Personagem' : 'Criar Novo Personagem'}
          <Sparkles className="w-6 h-6" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Maria, João, Ana..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 25 }))}
                min="18"
                max="99"
              />
            </div>
          </div>

          {/* Avatar */}
          <div className="space-y-2">
            <Label>Foto do Personagem</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={formData.avatar} />
                <AvatarFallback className="text-lg">
                  {formData.name.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  value={formData.avatar}
                  onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                  placeholder="URL da imagem ou deixe vazio"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cole o link de uma imagem ou deixe vazio para usar iniciais
                </p>
              </div>
            </div>
          </div>

          {/* Personalidade */}
          <div className="space-y-2">
            <Label htmlFor="personality">Personalidade *</Label>
            <Textarea
              id="personality"
              value={formData.personality}
              onChange={(e) => setFormData(prev => ({ ...prev, personality: e.target.value }))}
              placeholder="Descreva a personalidade em detalhes: como se comporta, seus traços principais, humor, etc."
              rows={4}
            />
          </div>

          {/* História/Background */}
          <div className="space-y-2">
            <Label htmlFor="background">História e Contexto</Label>
            <Textarea
              id="background"
              value={formData.background}
              onChange={(e) => setFormData(prev => ({ ...prev, background: e.target.value }))}
              placeholder="História de vida, profissão, família, experiências importantes..."
              rows={4}
            />
          </div>

          {/* Estilo de Conversa */}
          <div className="space-y-2">
            <Label>Estilo de Conversa</Label>
            <Select 
              value={formData.conversationStyle} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, conversationStyle: value as Character['conversationStyle'] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {conversationStyles.map(style => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.emoji} {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interesses */}
          <div className="space-y-2">
            <Label>Interesses e Hobbies</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Ex: música, cinema, culinária..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              />
              <Button type="button" variant="outline" size="sm" onClick={addInterest}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.interests.map(interest => (
                <Badge key={interest} variant="secondary" className="gap-1">
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Modelo de IA */}
          <div className="space-y-2">
            <Label>Modelo de IA</Label>
            <Select value={formData.aiModel} onValueChange={(value) => setFormData(prev => ({ ...prev, aiModel: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aiModels.map(model => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label} {model.recommended && '⭐'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Configurações Avançadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Criatividade: {formData.temperature}</Label>
              <Slider
                value={[formData.temperature]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, temperature: value }))}
                min={0}
                max={1}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">0 = Mais consistente, 1 = Mais criativo</p>
            </div>
            <div className="space-y-2">
              <Label>Máx. Tokens: {formData.maxTokens}</Label>
              <Slider
                value={[formData.maxTokens]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, maxTokens: value }))}
                min={100}
                max={4000}
                step={100}
              />
            </div>
          </div>

          {/* Memória e Contexto */}
          <div className="space-y-2">
            <Label htmlFor="memoryContext">Contexto de Memória</Label>
            <Textarea
              id="memoryContext"
              value={formData.memoryContext}
              onChange={(e) => setFormData(prev => ({ ...prev, memoryContext: e.target.value }))}
              placeholder="Informações importantes para lembrar sobre vocês dois, relacionamento, conversas passadas..."
              rows={3}
            />
          </div>

          {/* Instruções Customizadas */}
          <div className="space-y-2">
            <Label htmlFor="customInstructions">Instruções Personalizadas</Label>
            <Textarea
              id="customInstructions"
              value={formData.customInstructions}
              onChange={(e) => setFormData(prev => ({ ...prev, customInstructions: e.target.value }))}
              placeholder="Instruções especiais sobre como o personagem deve se comportar, responder ou agir..."
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-4">
            <Button type="submit" variant="hero" className="flex-1">
              <Heart className="w-4 h-4 mr-2" />
              {character ? 'Atualizar' : 'Criar'} Personagem
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}