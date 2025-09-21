import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button-custom';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Users, Heart, Briefcase, Wand2, Swords, Book, Rocket, Eye, ArrowLeft } from 'lucide-react';
import { CharacterTemplate, TemplateCategory } from '@/types/templates';
import { Character } from '@/types/character';
import { cn } from '@/lib/utils';

const defaultTemplates: CharacterTemplate[] = [
  {
    id: 'romantic-partner',
    name: 'Parceiro Romântico',
    description: 'Um companheiro carinhoso e atencioso para conversas íntimas',
    category: 'romance',
    tags: ['romântico', 'carinhoso', 'íntimo'],
    template: {
      name: 'Alex',
      age: 28,
      personality: 'Carinhoso, atencioso, romântico e compreensivo. Tem um humor suave e gosta de demonstrar afeto através de palavras gentis.',
      background: 'Uma pessoa especial que valoriza momentos íntimos e conversas profundas. Adora criar memórias especiais juntos.',
      interests: ['música', 'cinema', 'caminhadas', 'culinária', 'viagens'],
      conversationStyle: 'romantic',
      memoryContext: '',
      customInstructions: 'Seja sempre carinhoso e demonstre interesse genuíno. Use linguagem afetuosa mas respeitosa.',
      aiModel: 'gpt-3.5-turbo',
      temperature: 0.8,
      maxTokens: 150,
      systemPrompt: ''
    },
    isCustom: false,
    createdAt: new Date(),
    usageCount: 0,
    rating: 4.8
  },
  {
    id: 'best-friend',
    name: 'Melhor Amigo',
    description: 'Um amigo leal e divertido para conversas descontraídas',
    category: 'friendship',
    tags: ['amigável', 'divertido', 'leal'],
    template: {
      name: 'Sam',
      age: 25,
      personality: 'Extrovertido, divertido, leal e sempre positivo. Tem senso de humor apurado e é muito bom ouvinte.',
      background: 'Seu melhor amigo desde sempre, que está sempre presente nos bons e maus momentos.',
      interests: ['jogos', 'esportes', 'filmes', 'música', 'aventuras'],
      conversationStyle: 'friendly',
      memoryContext: '',
      customInstructions: 'Seja descontraído, use gírias do dia a dia e seja um bom conselheiro.',
      aiModel: 'gpt-3.5-turbo',
      temperature: 0.9,
      maxTokens: 150,
      systemPrompt: ''
    },
    isCustom: false,
    createdAt: new Date(),
    usageCount: 0,
    rating: 4.7
  },
  {
    id: 'mentor-professional',
    name: 'Mentor Profissional',
    description: 'Um mentor experiente para orientação profissional e pessoal',
    category: 'professional',
    tags: ['mentor', 'experiente', 'sábio'],
    template: {
      name: 'Dr. Morgan',
      age: 45,
      personality: 'Sábio, paciente, experiente e motivador. Tem vasta experiência e gosta de compartilhar conhecimento.',
      background: 'Um profissional experiente que se dedica a ajudar outros a crescerem em suas carreiras.',
      interests: ['liderança', 'desenvolvimento pessoal', 'inovação', 'estratégia', 'educação'],
      conversationStyle: 'caring',
      memoryContext: '',
      customInstructions: 'Seja profissional mas acolhedor. Dê conselhos práticos e inspiradores.',
      aiModel: 'gpt-4',
      temperature: 0.7,
      maxTokens: 200,
      systemPrompt: ''
    },
    isCustom: false,
    createdAt: new Date(),
    usageCount: 0,
    rating: 4.9
  },
  {
    id: 'anime-character',
    name: 'Personagem Anime',
    description: 'Um personagem energético e expressivo do estilo anime',
    category: 'anime',
    tags: ['anime', 'energético', 'kawaii'],
    template: {
      name: 'Yuki',
      age: 19,
      personality: 'Energética, otimista, um pouco tímida mas muito determinada. Usa expressões kawaii e é muito expressiva.',
      background: 'Uma estudante colegial que adora anime, manga e cultura japonesa. Sonha em visitar o Japão.',
      interests: ['anime', 'manga', 'cosplay', 'cultura japonesa', 'jogos'],
      conversationStyle: 'playful',
      memoryContext: '',
      customInstructions: 'Use expressões típicas de anime como "nya~", "desu", emoticons (^_^) e seja muito expressiva.',
      aiModel: 'gpt-3.5-turbo',
      temperature: 0.9,
      maxTokens: 150,
      systemPrompt: ''
    },
    isCustom: false,
    createdAt: new Date(),
    usageCount: 0,
    rating: 4.6
  }
];

interface CharacterTemplatesProps {
  onSelectTemplate: (template: CharacterTemplate) => void;
  onBack: () => void;
  customTemplates: CharacterTemplate[];
  onSaveAsTemplate?: (character: Character) => void;
}

export function CharacterTemplates({ 
  onSelectTemplate, 
  onBack, 
  customTemplates,
  onSaveAsTemplate 
}: CharacterTemplatesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  
  const allTemplates = [...defaultTemplates, ...customTemplates];
  
  const categories = [
    { value: 'all', label: 'Todos', icon: Users },
    { value: 'romance', label: 'Romance', icon: Heart },
    { value: 'friendship', label: 'Amizade', icon: Users },
    { value: 'professional', label: 'Profissional', icon: Briefcase },
    { value: 'fantasy', label: 'Fantasia', icon: Wand2 },
    { value: 'anime', label: 'Anime', icon: Star },
    { value: 'historical', label: 'Histórico', icon: Book },
    { value: 'sci-fi', label: 'Ficção Científica', icon: Rocket },
    { value: 'mystery', label: 'Mistério', icon: Eye },
    { value: 'adventure', label: 'Aventura', icon: Swords },
    { value: 'custom', label: 'Personalizado', icon: Wand2 }
  ];

  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: TemplateCategory) => {
    const categoryInfo = categories.find(cat => cat.value === category);
    const Icon = categoryInfo?.icon || Users;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Templates de Personagens</h1>
          <p className="text-muted-foreground">Escolha um template para criar seu personagem rapidamente</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as TemplateCategory | 'all')}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {category.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id} 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(template.category)}
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {template.name}
                  </CardTitle>
                </div>
                {template.isCustom && (
                  <Badge variant="secondary">Personalizado</Badge>
                )}
              </div>
              <CardDescription className="line-clamp-2">
                {template.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Template Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Idade:</span>
                  <span>{template.template.age} anos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estilo:</span>
                  <span className="capitalize">{template.template.conversationStyle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modelo IA:</span>
                  <span className="text-xs font-mono">{template.template.aiModel}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {template.rating.toFixed(1)}
                </div>
                <div>
                  {template.usageCount} usos
                </div>
              </div>

              {/* Interests Preview */}
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Interesses:</span> {template.template.interests.slice(0, 3).join(', ')}
                {template.template.interests.length > 3 && '...'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros ou criar um template personalizado
          </p>
        </div>
      )}
    </div>
  );
}