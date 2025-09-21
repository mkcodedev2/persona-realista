import { useState } from "react";
import { UserSettings as UserSettingsType } from "@/types/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button-custom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Settings, 
  Palette, 
  Volume2, 
  Database,
  Download,
  Upload,
  Trash2,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface UserSettingsProps {
  settings: UserSettingsType;
  onSettingsUpdate: (settings: UserSettingsType) => void;
  onBack: () => void;
  onClearAllData: () => void;
  onExportData: () => void;
  onImportData: (data: any) => void;
}

export function UserSettings({
  settings,
  onSettingsUpdate,
  onBack,
  onClearAllData,
  onExportData,
  onImportData
}: UserSettingsProps) {
  const [formData, setFormData] = useState<UserSettingsType>(settings);
  const [isImporting, setIsImporting] = useState(false);

  const handleSave = () => {
    onSettingsUpdate(formData);
    onBack();
    toast.success("Configurações salvas!");
  };

  const handleReset = () => {
    const defaultSettings: UserSettingsType = {
      theme: 'system',
      autoSave: true,
      maxMessagesInMemory: 50,
      defaultTemperature: 0.8,
      defaultMaxTokens: 1000,
      showTypingIndicator: true,
      soundEnabled: false,
      compactMode: false,
      language: 'pt-BR'
    };
    setFormData(defaultSettings);
    toast.success("Configurações resetadas!");
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsImporting(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          onImportData(data);
          toast.success("Dados importados com sucesso!");
        } catch (error) {
          toast.error("Erro ao importar dados. Verifique o arquivo.");
        } finally {
          setIsImporting(false);
          event.target.value = '';
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearData = () => {
    if (window.confirm("Tem certeza que deseja deletar TODOS os dados? Esta ação não pode ser desfeita!")) {
      onClearAllData();
      toast.success("Todos os dados foram deletados");
    }
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
              <Settings className="w-5 h-5" />
              Configurações
            </CardTitle>
          </div>
        </CardHeader>
      </Card>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="ai">IA</TabsTrigger>
            <TabsTrigger value="data">Dados</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configurações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select 
                    value={formData.language} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Salvamento Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Salvar conversas automaticamente
                    </p>
                  </div>
                  <Switch
                    checked={formData.autoSave}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoSave: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Indicador de Digitação</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar quando a IA está digitando
                    </p>
                  </div>
                  <Switch
                    checked={formData.showTypingIndicator}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showTypingIndicator: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sons</Label>
                    <p className="text-sm text-muted-foreground">
                      Reproduzir sons de notificação
                    </p>
                  </div>
                  <Switch
                    checked={formData.soundEnabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, soundEnabled: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Aparência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select 
                    value={formData.theme} 
                    onValueChange={(value: 'light' | 'dark' | 'system') => setFormData(prev => ({ ...prev, theme: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Compacto</Label>
                    <p className="text-sm text-muted-foreground">
                      Interface mais compacta
                    </p>
                  </div>
                  <Switch
                    checked={formData.compactMode}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, compactMode: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configurações de IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Mensagens na Memória: {formData.maxMessagesInMemory}</Label>
                  <Slider
                    value={[formData.maxMessagesInMemory]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, maxMessagesInMemory: value }))}
                    min={10}
                    max={200}
                    step={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    Quantas mensagens manter no contexto da IA
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Criatividade Padrão: {formData.defaultTemperature}</Label>
                  <Slider
                    value={[formData.defaultTemperature]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, defaultTemperature: value }))}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Nível padrão de criatividade para novos personagens
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Tokens Padrão: {formData.defaultMaxTokens}</Label>
                  <Slider
                    value={[formData.defaultMaxTokens]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, defaultMaxTokens: value }))}
                    min={100}
                    max={4000}
                    step={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    Limite padrão de tokens para novos personagens
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Gerenciamento de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={onExportData}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Todos os Dados
                  </Button>

                  <div className="w-full">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                      id="import-file"
                      disabled={isImporting}
                    />
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => document.getElementById('import-file')?.click()}
                      disabled={isImporting}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isImporting ? 'Importando...' : 'Importar Dados'}
                    </Button>
                  </div>

                  <Separator />

                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleClearData}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar Todos os Dados
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                  <p className="font-medium mb-1">⚠️ Importante:</p>
                  <ul className="space-y-1">
                    <li>• Faça backup regular dos seus dados</li>
                    <li>• A exclusão de dados é irreversível</li>
                    <li>• Os dados são salvos apenas localmente</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 mt-8">
          <Button onClick={handleSave} className="flex-1">
            Salvar Configurações
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
        </div>
      </div>
    </div>
  );
}