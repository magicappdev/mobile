/**
 * Home Screen - Main landing screen
 */

import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useTheme } from "../contexts/ThemeContext";
import { flash } from "ionicons/icons";
import React from "react";

export default function Home() {
  const { theme } = useTheme();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            backgroundColor: theme.colors.card,
            margin: "16px",
            borderRadius: "12px",
          }}
        >
          <IonIcon
            icon={flash}
            style={{
              fontSize: "64px",
              color: theme.colors.primary,
              marginBottom: "16px",
            }}
          />
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "800",
              color: theme.colors.text,
              marginBottom: "8px",
            }}
          >
            MagicAppDev
          </h1>
          <p style={{ color: theme.colors.textSecondary, fontSize: "18px" }}>
            Build apps like magic
          </p>
        </div>

        <IonCard style={{ margin: "16px" }}>
          <IonCardHeader>
            <IonCardTitle>AI Project Assistant</IonCardTitle>
            <IonCardSubtitle>
              Describe your app idea and let AI help you build it
            </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            <p
              style={{
                color: theme.colors.textSecondary,
                marginBottom: "16px",
              }}
            >
              Our AI-powered platform helps you generate code, create
              components, and deploy applications faster than ever before.
            </p>
            <IonButton expand="block" fill="outline" href="/tabs/chat">
              Start Chatting
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
}
