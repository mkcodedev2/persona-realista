import { useState, useRef, useEffect } from "react";
import { Character, Message } from "@/types/character";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button-custom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Heart, Settings, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
  character: Character;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  onBack: () => void;
  onSettingsOpen: () => void;
  isTyping: boolean;
}

export function ChatInterface({ 
  character, 
  messages, 
  onSendMessage, 
  onBack, 
  onSettingsOpen,
  isTyping 
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!inputMessage.trim() || isSending) return;

    const messageContent = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    try {
      await onSendMessage(messageContent);
    } catch (error) {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
      setInputMessage(messageContent); // Restaura a mensagem
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getConversationStyleGradient = (style: Character['conversationStyle']) => {
    const gradients = {
      romantic: "gradient-romantic",
      friendly: "gradient-tech",
      flirty: "gradient-primary",
      mysterious: "bg-muted",
      caring: "bg-accent/20",
      playful: "gradient-tech"
    };
    return gradients[style] || "gradient-primary";
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background">
      {/* Header */}
      <Card className="rounded-b-none border-b">
        <CardHeader className="p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <Avatar className="w-10 h-10">
              <AvatarImage src={character.avatar} />
              <AvatarFallback className="text-sm">
                {character.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{character.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {isTyping ? "Digitando..." : "Online"}
              </p>
            </div>

            <Button variant="ghost" size="sm" onClick={onSettingsOpen}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pb-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 mx-auto mb-4 text-primary animate-heartbeat" />
              <h3 className="text-lg font-semibold mb-2">
                Olá! Sou {character.name} 💕
              </h3>
              <p className="text-muted-foreground">
                Comece nossa conversa mandando uma mensagem!
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 max-w-[85%]",
                message.isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {!message.isUser && (
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarImage src={character.avatar} />
                  <AvatarFallback className="text-xs">
                    {character.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 max-w-full break-words",
                  message.isUser
                    ? `${getConversationStyleGradient(character.conversationStyle)} text-white`
                    : "bg-muted text-foreground"
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <p className={cn(
                  "text-xs mt-1 opacity-70",
                  message.isUser ? "text-white/80" : "text-muted-foreground"
                )}>
                  {formatMessageTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <Avatar className="w-8 h-8 mt-1">
                <AvatarImage src={character.avatar} />
                <AvatarFallback className="text-xs">
                  {character.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted text-foreground rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-typing" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-typing" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-typing" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <Card className="rounded-t-none border-t">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Mande uma mensagem para ${character.name}...`}
              disabled={isSending || isTyping}
              className="flex-1"
            />
            <Button
              variant="hero"
              size="sm"
              onClick={handleSend}
              disabled={!inputMessage.trim() || isSending || isTyping}
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}