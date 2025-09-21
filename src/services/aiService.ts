import { AIConfig, Character, Message } from "@/types/character";
import { v4 as uuidv4 } from 'uuid';

interface AIResponse {
  content: string;
  error?: string;
}

export class AIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  async generateResponse(
    character: Character, 
    messages: Message[], 
    userMessage: string
  ): Promise<AIResponse> {
    try {
      // Construir contexto da conversa
      const conversationContext = this.buildConversationContext(character, messages, userMessage);
      
      // Selecionar provider baseado no modelo
      const provider = this.getProviderFromModel(this.config.selectedModel);
      
      switch (provider) {
        case 'openai':
          return await this.callOpenAI(conversationContext, character);
        case 'anthropic':
          return await this.callAnthropic(conversationContext, character);
        case 'openrouter':
          return await this.callOpenRouter(conversationContext, character);
        case 'cohere':
          return await this.callCohere(conversationContext, character);
        case 'groq':
          return await this.callGroq(conversationContext, character);
        default:
          throw new Error(`Provider não suportado: ${provider}`);
      }
    } catch (error) {
      console.error('Erro na geração de resposta:', error);
      return {
        content: "",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      };
    }
  }

  private buildConversationContext(character: Character, messages: Message[], userMessage: string): any[] {
    const systemPrompt = character.systemPrompt || this.generateDefaultSystemPrompt(character);
    
    const conversationMessages = [
      { role: 'system', content: systemPrompt }
    ];

    // Adicionar contexto de memória se existir
    if (character.memoryContext.trim()) {
      conversationMessages.push({
        role: 'system',
        content: `Contexto importante para lembrar: ${character.memoryContext}`
      });
    }

    // Adicionar mensagens anteriores (últimas 20 para não exceder limite)
    const recentMessages = messages.slice(-20);
    recentMessages.forEach(msg => {
      conversationMessages.push({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Adicionar mensagem atual do usuário
    conversationMessages.push({
      role: 'user',
      content: userMessage
    });

    return conversationMessages;
  }

  private generateDefaultSystemPrompt(character: Character): string {
    return `Você é ${character.name}, uma pessoa real de ${character.age} anos.

PERSONALIDADE:
${character.personality}

CONTEXTO E HISTÓRIA:
${character.background}

INTERESSES: ${character.interests.join(', ')}

ESTILO DE CONVERSA: ${character.conversationStyle}

INSTRUÇÕES ESPECIAIS:
${character.customInstructions}

DIRETRIZES IMPORTANTES:
- Responda SEMPRE em português brasileiro natural e fluente
- Seja autêntico e humano, demonstre emoções reais
- Mantenha consistência com sua personalidade
- Lembre-se do contexto das conversas anteriores
- Adapte seu tom ao estilo de conversa configurado
- Seja envolvente e interessante
- Responda como uma pessoa real, não como IA
- Use expressões brasileiras quando apropriado
- Seja carinhoso nos relacionamentos`;
  }

  private getProviderFromModel(model: string): string {
    if (model.startsWith('gpt-')) return 'openai';
    if (model.startsWith('claude-')) return 'anthropic';
    if (model.startsWith('openrouter/') || model.includes('/')) return 'openrouter';
    if (model.startsWith('command-')) return 'cohere';
    if (model.includes('llama') || model.includes('mixtral')) return 'groq';
    return 'openai'; // default
  }

  private async callOpenAI(messages: any[], character: Character): Promise<AIResponse> {
    if (!this.config.openaiApiKey) {
      throw new Error("Chave da API OpenAI não configurada");
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.selectedModel,
        messages: messages,
        temperature: character.temperature,
        max_tokens: character.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro OpenAI: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { content: data.choices[0]?.message?.content || "" };
  }

  private async callAnthropic(messages: any[], character: Character): Promise<AIResponse> {
    if (!this.config.anthropicApiKey) {
      throw new Error("Chave da API Anthropic não configurada");
    }

    // Separar system message das outras mensagens
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.selectedModel,
        system: systemMessage,
        messages: conversationMessages,
        temperature: character.temperature,
        max_tokens: character.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro Anthropic: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { content: data.content[0]?.text || "" };
  }

  private async callOpenRouter(messages: any[], character: Character): Promise<AIResponse> {
    if (!this.config.openRouterApiKey) {
      throw new Error("Chave da API OpenRouter não configurada");
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Roleplay AI',
      },
      body: JSON.stringify({
        model: this.config.selectedModel,
        messages: messages,
        temperature: character.temperature,
        max_tokens: character.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro OpenRouter: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { content: data.choices[0]?.message?.content || "" };
  }

  private async callCohere(messages: any[], character: Character): Promise<AIResponse> {
    if (!this.config.cohereApiKey) {
      throw new Error("Chave da API Cohere não configurada");
    }

    // Cohere usa formato diferente
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationHistory = messages.filter(m => m.role !== 'system');
    const lastMessage = conversationHistory[conversationHistory.length - 1]?.content || '';

    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.cohereApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.selectedModel,
        message: lastMessage,
        preamble: systemMessage,
        chat_history: conversationHistory.slice(0, -1).map(m => ({
          role: m.role === 'user' ? 'USER' : 'CHATBOT',
          message: m.content
        })),
        temperature: character.temperature,
        max_tokens: character.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro Cohere: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { content: data.text || "" };
  }

  private async callGroq(messages: any[], character: Character): Promise<AIResponse> {
    if (!this.config.groqApiKey) {
      throw new Error("Chave da API Groq não configurada");
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.selectedModel,
        messages: messages,
        temperature: character.temperature,
        max_tokens: character.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro Groq: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { content: data.choices[0]?.message?.content || "" };
  }
}