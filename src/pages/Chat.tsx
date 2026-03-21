/**
 * Chat Screen - AI Chat Interface
 *
 * Stream-based AI chat for project assistance
 */

import {
  IonButton,
  IonChip,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonLabel,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import React, { useState, useRef, useEffect } from "react";
import { send, sparkles } from "ionicons/icons";
import { useLocation } from "react-router-dom";
import type { AiMessage } from "../types";
import { IonTitle } from "@ionic/react";
import { api } from "../lib/api";

const STARTER_PROMPTS = [
  "Build a modern landing page for my product launch",
  "Create a mini game with a score tracker and leaderboard",
  "Design a client portal with invoices and notes",
  "Prototype a habit tracker with streaks and reminders",
];

export default function Chat() {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      role: "assistant",
      content: "Hello! How can I help you build your app today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const contentRef = useRef<HTMLIonContentElement>(null);
  const location = useLocation();

  const hasStartedConversation = messages.some(
    message => message.role === "user",
  );

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (contentRef.current) {
      void contentRef.current.scrollToBottom(300);
    }
  }, [messages, streamedResponse]);

  useEffect(() => {
    const prompt = new URLSearchParams(location.search).get("prompt");
    if (prompt) {
      setInput(currentInput => currentInput || prompt);
    }
  }, [location.search]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: AiMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
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
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "Just now";

    return new Date(timestamp).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>AI Assistant</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef} fullscreen className="app-page-content">
        <div className="app-page-stack">
          {!hasStartedConversation && (
            <section className="app-card app-hero-card">
              <div className="app-eyebrow">MagicAppDev AI</div>
              <h1 className="app-hero-title">What do you want to build?</h1>
              <p className="app-hero-copy">
                Describe the app, workflow, or screen you want and I&apos;ll
                help you shape it into a real project.
              </p>
              <div className="app-chip-row">
                {STARTER_PROMPTS.map(prompt => (
                  <IonChip
                    key={prompt}
                    className="app-suggestion-chip"
                    onClick={() => setInput(prompt)}
                  >
                    <IonLabel>{prompt}</IonLabel>
                  </IonChip>
                ))}
              </div>
            </section>
          )}

          <section className="app-chat-thread">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${message.timestamp ?? index}-${index}`}
                className={`app-message-row ${message.role === "user" ? "app-message-row--user" : ""}`}
              >
                <div
                  className={`app-chat-bubble ${message.role === "user" ? "app-chat-bubble--user" : "app-chat-bubble--assistant"}`}
                >
                  <div>{message.content}</div>
                  <div className="app-chat-meta">
                    <span>
                      {message.role === "user" ? "You" : "MagicAppDev"}
                    </span>
                    <span>{formatTimestamp(message.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}

            {streamedResponse && (
              <div className="app-message-row">
                <div className="app-chat-bubble app-chat-bubble--assistant">
                  <div className="app-streaming-row">
                    <IonIcon icon={sparkles} className="ion-spin" />
                    <span>{streamedResponse}</span>
                  </div>
                  <div className="app-chat-meta">
                    <span>MagicAppDev</span>
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {isLoading && !streamedResponse && (
              <div className="app-message-row">
                <div className="app-chat-bubble app-chat-bubble--assistant">
                  <div className="app-streaming-row">
                    <IonIcon icon={sparkles} className="ion-spin" />
                    <span>Preparing your next step...</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </IonContent>
      <IonFooter translucent>
        <IonToolbar className="app-composer-toolbar">
          <div className="app-composer">
            <IonInput
              className="app-composer-input"
              value={input}
              clearInput
              onIonInput={e => setInput(e.detail.value || "")}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder={
                hasStartedConversation
                  ? "Ask for a refinement, feature, or bug fix..."
                  : "Describe the app or screen you want to create..."
              }
            />
            <IonButton
              className="app-composer-send"
              onClick={() => void handleSend()}
              disabled={isLoading || !input.trim()}
            >
              <IonIcon slot="icon-only" icon={send} />
            </IonButton>
          </div>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
}
