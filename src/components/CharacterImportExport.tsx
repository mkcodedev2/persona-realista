import { useState } from "react";
import { Character } from "@/types/character";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button-custom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  Download,
  Upload,
  FileText,
  Share,
  Copy,
  Check,
  Users,
  Package
} from "lucide-react";
import { toast } from "sonner";

interface CharacterImportExportProps {
  characters: Character[];
  onImportCharacters: (characters: Character[]) => void;
  onBack: () => void;
}

export function CharacterImportExport({
  characters,
  onImportCharacters,
  onBack
}: CharacterImportExportProps) {
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState("");
  const [shareCode, setShareCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSelectAll = () => {
    if (selectedCharacters.length === characters.length) {
      setSelectedCharacters([]);
    } else {
      setSelectedCharacters(characters.map(c => c.id));
    }
  };

  const handleCharacterSelect = (characterId: string, checked: boolean) => {
    if (checked) {
      setSelectedCharacters(prev => [...prev, characterId]);
    } else {
      setSelectedCharacters(prev => prev.filter(id => id !== characterId));
    }
  };

  const exportSelected = () => {
    if (selectedCharacters.length === 0) {
      toast.error("Selecione pelo menos um personagem");
      return;
    }

    const selectedChars = characters.filter(c => selectedCharacters.includes(c.id));
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      characters: selectedChars.map(char => ({
        ...char,
        // Remove IDs e datas para compatibilidade
        id: undefined,
        createdAt: undefined,
        totalMessages: 0,
        lastChatAt: undefined
      }))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `personagens-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`${selectedCharacters.length} personagens exportados!`);
  };

  const generateShareCode = () => {
    if (selectedCharacters.length === 0) {
      toast.error("Selecione pelo menos um personagem");
      return;
    }

    const selectedChars = characters.filter(c => selectedCharacters.includes(c.id));
    const shareData = {
      v: "1.0",
      chars: selectedChars.map(char => ({
        n: char.name,
        a: char.avatar,
        p: char.personality,
        b: char.background,
        i: char.interests,
        s: char.conversationStyle,
        ci: char.customInstructions,
        temp: char.temperature,
        tokens: char.maxTokens
      }))
    };

    const compressed = btoa(JSON.stringify(shareData));
    setShareCode(compressed);
    toast.success("Código de compartilhamento gerado!");
  };

  const copyShareCode = async () => {
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Código copiado!");
    } catch (error) {
      toast.error("Erro ao copiar código");
    }
  };

  const importFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsImporting(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          processImportData(data);
        } catch (error) {
          toast.error("Arquivo inválido. Verifique o formato.");
        } finally {
          setIsImporting(false);
          event.target.value = '';
        }
      };
      reader.readAsText(file);
    }
  };

  const importFromCode = () => {
    if (!importText.trim()) {
      toast.error("Cole o código de importação");
      return;
    }

    try {
      let data;
      
      // Tentar decodificar se for um código compartilhado
      if (!importText.startsWith('{')) {
        const decoded = atob(importText);
        const shareData = JSON.parse(decoded);
        
        // Converter formato compartilhado para formato completo
        data = {
          version: shareData.v || "1.0",
          characters: shareData.chars.map((char: any) => ({
            name: char.n,
            avatar: char.a,
            personality: char.p,
            background: char.b,
            interests: char.i,
            conversationStyle: char.s,
            customInstructions: char.ci,
            temperature: char.temp || 0.8,
            maxTokens: char.tokens || 1000,
            age: 25,
            memoryContext: "",
            aiModel: "openrouter/auto",
            systemPrompt: ""
          }))
        };
      } else {
        data = JSON.parse(importText);
      }

      processImportData(data);
      setImportText("");
    } catch (error) {
      toast.error("Código inválido. Verifique o formato.");
    }
  };

  const processImportData = (data: any) => {
    if (!data.characters || !Array.isArray(data.characters)) {
      toast.error("Formato de dados inválido");
      return;
    }

    const importedChars: Character[] = data.characters.map((char: any) => ({
      id: crypto.randomUUID(),
      name: char.name || "Personagem Importado",
      avatar: char.avatar || "",
      age: char.age || 25,
      personality: char.personality || "",
      background: char.background || "",
      interests: char.interests || [],
      conversationStyle: char.conversationStyle || 'friendly',
      memoryContext: char.memoryContext || "",
      customInstructions: char.customInstructions || "",
      aiModel: char.aiModel || "openrouter/auto",
      temperature: char.temperature || 0.8,
      maxTokens: char.maxTokens || 1000,
      systemPrompt: char.systemPrompt || "",
      createdAt: new Date(),
      totalMessages: 0
    }));

    onImportCharacters(importedChars);
    toast.success(`${importedChars.length} personagens importados!`);
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
              <Package className="w-5 h-5" />
              Importar / Exportar Personagens
            </CardTitle>
          </div>
        </CardHeader>
      </Card>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exportar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="w-5 h-5" />
                Exportar Personagens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Selecionar Personagens
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedCharacters.length === characters.length ? 'Desmarcar' : 'Selecionar'} Todos
                </Button>
              </div>

              <ScrollArea className="h-64 border rounded-lg p-3">
                <div className="space-y-3">
                  {characters.map(character => (
                    <div key={character.id} className="flex items-center gap-3">
                      <Checkbox
                        id={character.id}
                        checked={selectedCharacters.includes(character.id)}
                        onCheckedChange={(checked) => handleCharacterSelect(character.id, !!checked)}
                      />
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={character.avatar} />
                        <AvatarFallback className="text-xs">
                          {character.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{character.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {character.conversationStyle}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {characters.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum personagem para exportar
                    </p>
                  )}
                </div>
              </ScrollArea>

              <div className="space-y-2">
                <Button
                  onClick={exportSelected}
                  disabled={selectedCharacters.length === 0}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar como Arquivo ({selectedCharacters.length})
                </Button>

                <Button
                  variant="outline"
                  onClick={generateShareCode}
                  disabled={selectedCharacters.length === 0}
                  className="w-full"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Gerar Código de Compartilhamento
                </Button>

                {shareCode && (
                  <div className="space-y-2">
                    <Label>Código de Compartilhamento:</Label>
                    <div className="flex gap-2">
                      <Input
                        value={shareCode}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyShareCode}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Compartilhe este código para outros importarem seus personagens
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Importar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Importar Personagens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" />
                  Importar de Arquivo
                </Label>
                <input
                  type="file"
                  accept=".json"
                  onChange={importFromFile}
                  className="hidden"
                  id="import-file"
                  disabled={isImporting}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('import-file')?.click()}
                  disabled={isImporting}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isImporting ? 'Importando...' : 'Selecionar Arquivo'}
                </Button>
              </div>

              <Separator />

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Share className="w-4 h-4" />
                  Importar de Código
                </Label>
                <div className="space-y-2">
                  <Textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Cole aqui o código de compartilhamento ou dados JSON..."
                    rows={4}
                    className="font-mono text-xs"
                  />
                  <Button
                    onClick={importFromCode}
                    disabled={!importText.trim()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importar Personagens
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                <p className="font-medium mb-1">ℹ️ Formatos Suportados:</p>
                <ul className="space-y-1">
                  <li>• Arquivos JSON exportados pelo app</li>
                  <li>• Códigos de compartilhamento gerados</li>
                  <li>• Personagens importados recebem novos IDs</li>
                  <li>• Histórico de conversas não é importado</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}