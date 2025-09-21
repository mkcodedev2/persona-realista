import { useState, useEffect } from "react";
import { AIConfig } from "@/types/character";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button-custom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Key, Zap, Shield, ShieldOff, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AIConfigPanelProps {
  config: AIConfig;
  onConfigUpdate: (config: AIConfig) => void;
  onClose: () => void;
}

export function AIConfigPanel({ config, onConfigUpdate, onClose }: AIConfigPanelProps) {
  const [formData, setFormData] = useState<AIConfig>(config);
  const [showKeys, setShowKeys] = useState(false);

  const aiProviders = [
    {
      name: "OpenAI",
      models: [
        { id: "gpt-4", name: "GPT-4", censorship: "alta", speed: "média", quality: "excelente", uncensored: false },
        { id: "gpt-4-turbo", name: "GPT-4 Turbo", censorship: "alta", speed: "rápida", quality: "excelente", uncensored: false },
        { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", censorship: "alta", speed: "muito rápida", quality: "boa", uncensored: false }
      ],
      keyField: "openaiApiKey",
      website: "https://platform.openai.com/api-keys"
    },
    {
      name: "Anthropic",
      models: [
        { id: "claude-3-opus", name: "Claude 3 Opus", censorship: "média", speed: "média", quality: "excelente", uncensored: false },
        { id: "claude-3-sonnet", name: "Claude 3 Sonnet", censorship: "média", speed: "rápida", quality: "muito boa", uncensored: false },
        { id: "claude-3-haiku", name: "Claude 3 Haiku", censorship: "média", speed: "muito rápida", quality: "boa", uncensored: false }
      ],
      keyField: "anthropicApiKey",
      website: "https://console.anthropic.com/"
    },
    {
      name: "OpenRouter",
      models: [
        { id: "openrouter/auto", name: "Auto (Melhor disponível)", censorship: "baixa", speed: "variável", quality: "excelente", uncensored: true },
        { id: "anthropic/claude-3-opus", name: "Claude 3 Opus", censorship: "média", speed: "média", quality: "excelente", uncensored: false },
        { id: "meta-llama/llama-3-70b-instruct", name: "Llama 3 70B", censorship: "baixa", speed: "rápida", quality: "muito boa", uncensored: true },
        { id: "mistralai/mixtral-8x7b-instruct", name: "Mixtral 8x7B", censorship: "baixa", speed: "rápida", quality: "boa", uncensored: true },
        { id: "nousresearch/nous-hermes-2-mixtral-8x7b-dpo", name: "Nous Hermes 2 Mixtral", censorship: "muito baixa", speed: "rápida", quality: "muito boa", uncensored: true }
      ],
      keyField: "openRouterApiKey",
      website: "https://openrouter.ai/keys"
    },
    {
      name: "Cohere",
      models: [
        { id: "command-r-plus", name: "Command R+", censorship: "baixa", speed: "rápida", quality: "muito boa", uncensored: true },
        { id: "command-r", name: "Command R", censorship: "baixa", speed: "muito rápida", quality: "boa", uncensored: true }
      ],
      keyField: "cohereApiKey",
      website: "https://dashboard.cohere.com/api-keys"
    },
    {
      name: "Groq",
      models: [
        { id: "llama3-70b-8192", name: "Llama 3 70B", censorship: "baixa", speed: "ultra rápida", quality: "muito boa", uncensored: true },
        { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", censorship: "baixa", speed: "ultra rápida", quality: "boa", uncensored: true }
      ],
      keyField: "groqApiKey",
      website: "https://console.groq.com/keys"
    }
  ];

  const getCensorshipColor = (level: string) => {
    const colors = {
      "alta": "text-red-500",
      "média": "text-yellow-500",
      "baixa": "text-green-500",
      "muito baixa": "text-emerald-500"
    };
    return colors[level as keyof typeof colors] || "text-gray-500";
  };

  const getCensorshipIcon = (uncensored: boolean) => {
    return uncensored ? (
      <ShieldOff className="w-4 h-4 text-emerald-500" />
    ) : (
      <Shield className="w-4 h-4 text-red-500" />
    );
  };

  const handleSave = () => {
    onConfigUpdate(formData);
    onClose();
    toast.success("Configuração salva!");
  };

  const isKeyConfigured = (keyField: string) => {
    return !!formData[keyField as keyof AIConfig];
  };

  const maskApiKey = (key: string | undefined) => {
    if (!key) return "";
    if (showKeys) return key;
    return key.slice(0, 8) + "...";
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gradient">
          <Settings className="w-6 h-6" />
          Configurações de IA
          <Zap className="w-6 h-6" />
        </CardTitle>
        <p className="text-muted-foreground">
          Configure as APIs de IA para roleplay sem censura ou com mínima censura
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="models" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="models">Modelos</TabsTrigger>
            <TabsTrigger value="keys">Chaves API</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Modelo Atual</Label>
                <Badge variant="secondary">{formData.selectedModel}</Badge>
              </div>
              
              {aiProviders.map(provider => (
                <Card key={provider.name} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      {provider.name}
                      {isKeyConfigured(provider.keyField) ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                    </h3>
                    <Badge variant={isKeyConfigured(provider.keyField) ? "default" : "secondary"}>
                      {isKeyConfigured(provider.keyField) ? "Configurado" : "Não configurado"}
                    </Badge>
                  </div>

                  <div className="grid gap-3">
                    {provider.models.map(model => (
                      <div
                        key={model.id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all",
                          formData.selectedModel === model.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => setFormData(prev => ({ ...prev, selectedModel: model.id }))}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{model.name}</h4>
                          <div className="flex items-center gap-2">
                            {getCensorshipIcon(model.uncensored)}
                            <Badge variant={model.uncensored ? "default" : "secondary"} className="text-xs">
                              {model.uncensored ? "Sem censura" : "Com censura"}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                          <div>
                            <span className="block font-medium">Censura</span>
                            <span className={getCensorshipColor(model.censorship)}>
                              {model.censorship}
                            </span>
                          </div>
                          <div>
                            <span className="block font-medium">Velocidade</span>
                            <span>{model.speed}</span>
                          </div>
                          <div>
                            <span className="block font-medium">Qualidade</span>
                            <span>{model.quality}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="keys" className="space-y-6">
            <div className="flex items-center justify-between">
              <Label>Mostrar chaves completas</Label>
              <Switch checked={showKeys} onCheckedChange={setShowKeys} />
            </div>

            <div className="space-y-4">
              {aiProviders.map(provider => (
                <Card key={provider.name} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{provider.name} API Key</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(provider.website, '_blank')}
                      >
                        <Key className="w-3 h-3 mr-1" />
                        Obter chave
                      </Button>
                    </div>
                    <Input
                      type={showKeys ? "text" : "password"}
                      value={maskApiKey(formData[provider.keyField as keyof AIConfig] as string)}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        [provider.keyField]: e.target.value 
                      }))}
                      placeholder={`Cole sua chave da API ${provider.name}`}
                    />
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-200">
                    Recomendações para Roleplay
                  </h4>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1">
                    <li>• <strong>OpenRouter</strong>: Melhor opção para roleplay sem censura</li>
                    <li>• <strong>Groq</strong>: Mais rápido, boa qualidade, baixa censura</li>
                    <li>• <strong>Cohere</strong>: Boa alternativa com menos restrições</li>
                    <li>• <strong>Anthropic</strong>: Balanceado, censura moderada</li>
                    <li>• <strong>OpenAI</strong>: Mais censurado, mas alta qualidade</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Temperatura: {formData.temperature}</Label>
                <div className="px-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      temperature: parseFloat(e.target.value) 
                    }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Consistente</span>
                    <span>Criativo</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Máximo de Tokens: {formData.maxTokens}</Label>
                <div className="px-3">
                  <input
                    type="range"
                    min="100"
                    max="4000"
                    step="100"
                    value={formData.maxTokens}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      maxTokens: parseInt(e.target.value) 
                    }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>100</span>
                    <span>4000</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                💡 Dicas para Melhor Experiência
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Temperatura alta (0.8-1.0) = Respostas mais criativas e variadas</li>
                <li>• Temperatura baixa (0.1-0.4) = Respostas mais consistentes e previsíveis</li>
                <li>• Mais tokens = Respostas mais longas e detalhadas</li>
                <li>• Para roleplay romântico, use temperatura média (0.6-0.8)</li>
              </ul>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 mt-6">
          <Button variant="hero" onClick={handleSave} className="flex-1">
            Salvar Configurações
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}