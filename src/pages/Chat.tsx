/**
 * Chat Screen - AI Chat Interface
 *
 * Stream-based AI chat for project assistance
 */

import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import React, { useState, useRef, useEffect } from "react";
import { send, sparkles } from "ionicons/icons";
import type { AiMessage } from "../types";
import { IonTitle } from "@ionic/react";
import { api } from "../lib/api";

export default function Chat() {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      role: "assistant",
      content: "Hello! How can I help you build your app today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const contentRef = useRef<HTMLIonContentElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (contentRef.current) {
      contentRef.current.scrollToBottom();
    }
  }, [messages, streamedResponse]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: AiMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setStreamedResponse("");

    try {
      let fullResponse = "";
      for await (const chunk of api.streamMessage(newMessages)) {
        fullResponse += chunk;
        setStreamedResponse(fullResponse);
      }

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: fullResponse,
          timestamp: new Date().toISOString(),
        },
      ]);
      setStreamedResponse("");
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>AI Assistant</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef} className="ion-padding">
        {messages.map((message, index) => (
          <IonCard
            key={index}
            style={{
              marginLeft: message.role === "user" ? "auto" : "0",
              marginRight: message.role === "user" ? "0" : "auto",
              maxWidth: "80%",
              marginBottom: "12px",
              backgroundColor:
                message.role === "user"
                  ? "var(--ion-color-primary)"
                  : "var(--ion-background-color)",
            }}
          >
            <IonCardContent
              style={{
                color:
                  message.role === "user" ? "white" : "var(--ion-text-color)",
              }}
            >
              {message.content}
            </IonCardContent>
          </IonCard>
        ))}
        {streamedResponse && (
          <IonCard
            style={{
              marginLeft: "0",
              marginRight: "0",
              maxWidth: "80%",
              marginBottom: "12px",
            }}
          >
            <IonCardContent>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <IonIcon icon={sparkles} className="ion-spin" />
                <span>{streamedResponse}</span>
              </div>
            </IonCardContent>
          </IonCard>
        )}
        {isLoading && !streamedResponse && (
          <IonCard style={{ marginLeft: "0", maxWidth: "80%" }}>
            <IonCardContent>
              <IonIcon icon={sparkles} className="ion-spin" />
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
      <IonToolbar style={{ padding: "8px" }}>
        <IonInput
          value={input}
          onIonInput={e => setInput(e.detail.value || "")}
          onKeyPress={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type your message..."
          style={{ flex: 1, marginRight: "8px", marginLeft: "8px" }}
        />
        <IonButton onClick={handleSend} disabled={isLoading || !input.trim()}>
          <IonIcon slot="icon-only" icon={send} />
        </IonButton>
      </IonToolbar>
    </IonPage>
  );
}
