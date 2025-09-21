import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button-custom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Play, MapPin, Palette, ArrowLeft } from 'lucide-react';
import { Scenario } from '@/types/templates';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface ScenarioManagerProps {
  onSelectScenario: (scenario: Scenario) => void;
  onBack: () => void;
}

const defaultScenarios: Scenario[] = [
  {
    id: 'cafe-romantic',
    name: 'Café Romântico',
    description: 'Um encontro aconchegante em um café charmoso',
    setting: 'Um café íntimo com luzes suaves, música jazz ao fundo e o aroma de café fresco no ar.',
    atmosphere: 'romantic',
    contextPrompt: 'Vocês estão em um café aconchegante, sentados em uma mesa próxima à janela. É uma tarde agradável e vocês podem conversar tranquilamente.',
    tags: ['romance', 'casual', 'íntimo'],
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'adventure-forest',
    name: 'Aventura na Floresta',
    description: 'Uma exploração emocionante em uma floresta misteriosa',
    setting: 'Uma floresta densa e antiga, com árvores altas que filtram a luz do sol, sons de pássaros e vida selvagem.',
    atmosphere: 'adventurous',
    contextPrompt: 'Vocês estão explorando uma floresta antiga e misteriosa. O caminho à frente é incerto, mas a aventura os chama.',
    tags: ['aventura', 'natureza', 'mistério'],
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'cyberpunk-city',
    name: 'Cidade Cyberpunk',
    description: 'Uma metrópole futurista com neon e tecnologia avançada',
    setting: 'Uma cidade futurística com arranha-céus cobertos de neon, carros voadores e tecnologia avançada em cada esquina.',
    atmosphere: 'dramatic',
    contextPrompt: 'Vocês estão em uma metrópole cyberpunk, onde tecnologia e humanidade se misturam de formas complexas.',
    tags: ['ficção científica', 'futuro', 'tecnologia'],
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'beach-sunset',
    name: 'Praia ao Pôr do Sol',
    description: 'Uma praia tranquila durante um pôr do sol espetacular',
    setting: 'Uma praia serena com areia dourada, ondas suaves e um pôr do sol pintando o céu em tons de laranja e rosa.',
    atmosphere: 'romantic',
    contextPrompt: 'Vocês estão caminhando por uma praia deserta enquanto o sol se põe no horizonte, criando um momento mágico.',
    tags: ['romance', 'natureza', 'tranquilo'],
    isActive: true,
    createdAt: new Date()
  }
];

export function ScenarioManager({ onSelectScenario, onBack }: ScenarioManagerProps) {
  const [scenarios, setScenarios] = useLocalStorage<Scenario[]>('scenarios', defaultScenarios);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAtmosphere, setSelectedAtmosphere] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    setting: '',
    atmosphere: 'casual' as Scenario['atmosphere'],
    contextPrompt: '',
    tags: [] as string[],
    newTag: ''
  });

  const atmospheres = [
    { value: 'all', label: 'Todas as atmosferas' },
    { value: 'romantic', label: 'Romântica' },
    { value: 'mysterious', label: 'Misteriosa' },
    { value: 'adventurous', label: 'Aventureira' },
    { value: 'casual', label: 'Casual' },
    { value: 'dramatic', label: 'Dramática' },
    { value: 'playful', label: 'Brincalhona' }
  ];

  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAtmosphere = selectedAtmosphere === 'all' || scenario.atmosphere === selectedAtmosphere;
    
    return matchesSearch && matchesAtmosphere && scenario.isActive;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      setting: '',
      atmosphere: 'casual',
      contextPrompt: '',
      tags: [],
      newTag: ''
    });
  };

  const handleCreateScenario = () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Nome e descrição são obrigatórios');
      return;
    }

    const newScenario: Scenario = {
      id: uuidv4(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      setting: formData.setting.trim(),
      atmosphere: formData.atmosphere,
      contextPrompt: formData.contextPrompt.trim(),
      tags: formData.tags,
      isActive: true,
      createdAt: new Date()
    };

    setScenarios(prev => [...prev, newScenario]);
    setIsCreateDialogOpen(false);
    resetForm();
    toast.success('Cenário criado com sucesso!');
  };

  const handleEditScenario = () => {
    if (!editingScenario || !formData.name.trim() || !formData.description.trim()) {
      toast.error('Nome e descrição são obrigatórios');
      return;
    }

    const updatedScenario: Scenario = {
      ...editingScenario,
      name: formData.name.trim(),
      description: formData.description.trim(),
      setting: formData.setting.trim(),
      atmosphere: formData.atmosphere,
      contextPrompt: formData.contextPrompt.trim(),
      tags: formData.tags
    };

    setScenarios(prev => prev.map(s => s.id === editingScenario.id ? updatedScenario : s));
    setEditingScenario(null);
    resetForm();
    toast.success('Cenário atualizado com sucesso!');
  };

  const handleDeleteScenario = (scenarioId: string) => {
    setScenarios(prev => prev.map(s => 
      s.id === scenarioId ? { ...s, isActive: false } : s
    ));
    toast.success('Cenário removido com sucesso!');
  };

  const startEdit = (scenario: Scenario) => {
    setEditingScenario(scenario);
    setFormData({
      name: scenario.name,
      description: scenario.description,
      setting: scenario.setting,
      atmosphere: scenario.atmosphere,
      contextPrompt: scenario.contextPrompt,
      tags: [...scenario.tags],
      newTag: ''
    });
  };

  const addTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getAtmosphereIcon = (atmosphere: Scenario['atmosphere']) => {
    const icons = {
      romantic: '💕',
      mysterious: '🔮',
      adventurous: '🗺️',
      casual: '☕',
      dramatic: '🎭',
      playful: '🎈'
    };
    return icons[atmosphere] || '✨';
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Cenários</h1>
            <p className="text-muted-foreground">Configure ambientes para suas conversas</p>
          </div>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cenário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Cenário</DialogTitle>
              <DialogDescription>
                Configure um ambiente personalizado para suas conversas
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome do Cenário</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Café Romântico"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Atmosfera</label>
                  <Select 
                    value={formData.atmosphere}
                    onValueChange={(value: Scenario['atmosphere']) => 
                      setFormData(prev => ({ ...prev, atmosphere: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {atmospheres.slice(1).map(atm => (
                        <SelectItem key={atm.value} value={atm.value}>
                          {atm.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Uma breve descrição do cenário"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Ambiente Detalhado</label>
                <Textarea
                  value={formData.setting}
                  onChange={(e) => setFormData(prev => ({ ...prev, setting: e.target.value }))}
                  placeholder="Descreva o ambiente em detalhes..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Prompt de Contexto</label>
                <Textarea
                  value={formData.contextPrompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, contextPrompt: e.target.value }))}
                  placeholder="Contexto inicial para a conversa..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={formData.newTag}
                    onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                    placeholder="Adicionar tag..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" onClick={addTag}>Adicionar</Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTag(tag)}
                        className="ml-1 h-auto p-0 hover:bg-transparent"
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateScenario} className="flex-1">
                  Criar Cenário
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Buscar cenários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedAtmosphere} onValueChange={setSelectedAtmosphere}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {atmospheres.map(atm => (
              <SelectItem key={atm.value} value={atm.value}>
                {atm.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScenarios.map(scenario => (
          <Card key={scenario.id} className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getAtmosphereIcon(scenario.atmosphere)}</span>
                  <CardTitle className="text-lg">{scenario.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(scenario)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteScenario(scenario.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{scenario.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <strong>Ambiente:</strong> {scenario.setting}
              </div>

              <div className="flex flex-wrap gap-1">
                {scenario.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button 
                onClick={() => onSelectScenario(scenario)}
                className="w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                Usar Cenário
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingScenario} onOpenChange={() => setEditingScenario(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Cenário</DialogTitle>
            <DialogDescription>
              Modifique as configurações do cenário
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome do Cenário</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Café Romântico"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Atmosfera</label>
                <Select 
                  value={formData.atmosphere}
                  onValueChange={(value: Scenario['atmosphere']) => 
                    setFormData(prev => ({ ...prev, atmosphere: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {atmospheres.slice(1).map(atm => (
                      <SelectItem key={atm.value} value={atm.value}>
                        {atm.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Uma breve descrição do cenário"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Ambiente Detalhado</label>
              <Textarea
                value={formData.setting}
                onChange={(e) => setFormData(prev => ({ ...prev, setting: e.target.value }))}
                placeholder="Descreva o ambiente em detalhes..."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Prompt de Contexto</label>
              <Textarea
                value={formData.contextPrompt}
                onChange={(e) => setFormData(prev => ({ ...prev, contextPrompt: e.target.value }))}
                placeholder="Contexto inicial para a conversa..."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={formData.newTag}
                  onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                  placeholder="Adicionar tag..."
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag}>Adicionar</Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTag(tag)}
                      className="ml-1 h-auto p-0 hover:bg-transparent"
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleEditScenario} className="flex-1">
                Salvar Alterações
              </Button>
              <Button variant="outline" onClick={() => setEditingScenario(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {filteredScenarios.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Nenhum cenário encontrado</h3>
          <p className="text-muted-foreground">
            Crie cenários personalizados para tornar suas conversas mais envolventes
          </p>
        </div>
      )}
    </div>
  );
}