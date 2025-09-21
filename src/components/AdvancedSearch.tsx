import { useState } from 'react';
import { Search, Filter, X, SortAsc, SortDesc, Calendar, MessageSquare, Heart, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button-custom';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Character } from '@/types/character';
import { ConversationHistory } from '@/types/settings';

interface AdvancedSearchProps {
  characters: Character[];
  conversations: ConversationHistory[];
  onResults: (results: { characters: Character[]; conversations: ConversationHistory[] }) => void;
  className?: string;
}

interface SearchFilters {
  query: string;
  conversationStyle: string;
  ageRange: { min: number; max: number };
  messageCount: { min: number; max: number };
  dateRange: { start: Date | null; end: Date | null };
  tags: string[];
  sortBy: 'name' | 'lastChat' | 'totalMessages' | 'created';
  sortOrder: 'asc' | 'desc';
  includeConversations: boolean;
}

const defaultFilters: SearchFilters = {
  query: '',
  conversationStyle: 'all',
  ageRange: { min: 18, max: 100 },
  messageCount: { min: 0, max: 1000 },
  dateRange: { start: null, end: null },
  tags: [],
  sortBy: 'lastChat',
  sortOrder: 'desc',
  includeConversations: true
};

export function AdvancedSearch({ characters, conversations, onResults, className }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Extract all available tags from characters
  const availableTags = Array.from(
    new Set(
      characters.flatMap(char => 
        char.interests.concat([
          char.conversationStyle,
          char.aiModel.split('-')[0],
          char.age && char.age < 25 ? 'jovem' : char.age && char.age > 40 ? 'maduro' : 'adulto'
        ].filter(Boolean))
      )
    )
  ).sort();

  const conversationStyles = [
    { value: 'all', label: 'Todos os estilos' },
    { value: 'romantic', label: 'Romântico' },
    { value: 'friendly', label: 'Amigável' },
    { value: 'flirty', label: 'Flertador' },
    { value: 'mysterious', label: 'Misterioso' },
    { value: 'caring', label: 'Carinhoso' },
    { value: 'playful', label: 'Brincalhão' }
  ];

  const applyFilters = () => {
    let filteredCharacters = characters;
    let filteredConversations = conversations;

    // Text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filteredCharacters = filteredCharacters.filter(char =>
        char.name.toLowerCase().includes(query) ||
        char.personality.toLowerCase().includes(query) ||
        char.background.toLowerCase().includes(query) ||
        char.interests.some(interest => interest.toLowerCase().includes(query))
      );

      if (filters.includeConversations) {
        filteredConversations = filteredConversations.filter(conv =>
          conv.title.toLowerCase().includes(query) ||
          conv.characterName.toLowerCase().includes(query) ||
          conv.messages.some(msg => msg.content.toLowerCase().includes(query))
        );
      }
    }

    // Filter by conversation style
    if (filters.conversationStyle !== 'all') {
      filteredCharacters = filteredCharacters.filter(char =>
        char.conversationStyle === filters.conversationStyle
      );
    }

    // Filter by age range
    filteredCharacters = filteredCharacters.filter(char =>
      char.age && char.age >= filters.ageRange.min && char.age <= filters.ageRange.max
    );

    // Filter by message count
    filteredCharacters = filteredCharacters.filter(char =>
      char.totalMessages >= filters.messageCount.min && char.totalMessages <= filters.messageCount.max
    );

    // Filter by date range
    if (filters.dateRange.start) {
      filteredCharacters = filteredCharacters.filter(char =>
        char.createdAt >= filters.dateRange.start!
      );
      
      if (filters.includeConversations) {
        filteredConversations = filteredConversations.filter(conv =>
          conv.createdAt >= filters.dateRange.start!
        );
      }
    }

    if (filters.dateRange.end) {
      filteredCharacters = filteredCharacters.filter(char =>
        char.createdAt <= filters.dateRange.end!
      );
      
      if (filters.includeConversations) {
        filteredConversations = filteredConversations.filter(conv =>
          conv.createdAt <= filters.dateRange.end!
        );
      }
    }

    // Filter by tags
    if (filters.tags.length > 0) {
      filteredCharacters = filteredCharacters.filter(char => {
        const charTags = [
          ...char.interests,
          char.conversationStyle,
          char.aiModel.split('-')[0],
          char.age && char.age < 25 ? 'jovem' : char.age && char.age > 40 ? 'maduro' : 'adulto'
        ].filter(Boolean);
        
        return filters.tags.some(tag => charTags.includes(tag));
      });
    }

    // Sort results
    const sortCharacters = (chars: Character[]) => {
      return chars.sort((a, b) => {
        let comparison = 0;
        
        switch (filters.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'lastChat':
            comparison = (a.lastChatAt?.getTime() || 0) - (b.lastChatAt?.getTime() || 0);
            break;
          case 'totalMessages':
            comparison = a.totalMessages - b.totalMessages;
            break;
          case 'created':
            comparison = a.createdAt.getTime() - b.createdAt.getTime();
            break;
        }
        
        return filters.sortOrder === 'asc' ? comparison : -comparison;
      });
    };

    filteredCharacters = sortCharacters(filteredCharacters);

    // Sort conversations
    if (filters.includeConversations) {
      filteredConversations = filteredConversations.sort((a, b) => {
        const comparison = b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
        return filters.sortOrder === 'asc' ? -comparison : comparison;
      });
    }

    onResults({ 
      characters: filteredCharacters, 
      conversations: filters.includeConversations ? filteredConversations : [] 
    });
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    onResults({ characters, conversations });
  };

  const removeTag = (tagToRemove: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const activeFiltersCount = [
    filters.query.trim() ? 1 : 0,
    filters.conversationStyle !== 'all' ? 1 : 0,
    filters.tags.length,
    filters.dateRange.start || filters.dateRange.end ? 1 : 0
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className={className}>
      <div className="flex gap-2 mb-4">
        {/* Main search input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar personagens, conversas..."
            value={filters.query}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            className="pl-10"
          />
        </div>

        {/* Advanced filters */}
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtros Avançados</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <Separator />

              {/* Conversation Style */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Estilo de Conversa</label>
                <Select
                  value={filters.conversationStyle}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, conversationStyle: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conversationStyles.map(style => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {filters.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTag(tag)}
                        className="ml-1 h-auto p-0 hover:bg-transparent"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addTag}>
                  <SelectTrigger>
                    <SelectValue placeholder="Adicionar tag..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags
                      .filter(tag => !filters.tags.includes(tag))
                      .map(tag => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ordenar por</label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lastChat">Último Chat</SelectItem>
                      <SelectItem value="name">Nome</SelectItem>
                      <SelectItem value="totalMessages">Mensagens</SelectItem>
                      <SelectItem value="created">Criação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ordem</label>
                  <Button
                    variant="outline"
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                    }))}
                    className="w-full justify-start"
                  >
                    {filters.sortOrder === 'asc' ? (
                      <SortAsc className="w-4 h-4 mr-2" />
                    ) : (
                      <SortDesc className="w-4 h-4 mr-2" />
                    )}
                    {filters.sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button onClick={applyFilters} className="flex-1">
                  Aplicar Filtros
                </Button>
                <Button variant="outline" onClick={() => setIsFiltersOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Quick search button */}
        <Button onClick={applyFilters}>
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.query.trim() && (
            <Badge variant="secondary">
              Busca: "{filters.query}"
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, query: '' }))}
                className="ml-1 h-auto p-0 hover:bg-transparent"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          
          {filters.conversationStyle !== 'all' && (
            <Badge variant="secondary">
              Estilo: {conversationStyles.find(s => s.value === filters.conversationStyle)?.label}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, conversationStyle: 'all' }))}
                className="ml-1 h-auto p-0 hover:bg-transparent"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}

          {filters.tags.map(tag => (
            <Badge key={tag} variant="secondary">
              Tag: {tag}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTag(tag)}
                className="ml-1 h-auto p-0 hover:bg-transparent"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}