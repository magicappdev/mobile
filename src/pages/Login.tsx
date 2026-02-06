/**
 * Login Screen
 *
 * Email/password and OAuth login (GitHub, Discord)
 */

import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { logoGithub } from "ionicons/icons";
import React, { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGitHub, loginWithDiscord } = useAuth();
  const history = useHistory();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      history.push("/tabs/home");
    } catch (error) {
      console.error("Login failed:", error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      await loginWithGitHub();
    } catch (error) {
      console.error("GitHub login failed:", error);
    }
  };

  const handleDiscordLogin = async () => {
    try {
      await loginWithDiscord();
    } catch (error) {
      console.error("Discord login failed:", error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Sign In</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div
          style={{
            textAlign: "center",
            marginTop: "40px",
            marginBottom: "20px",
          }}
        >
          <h1
            style={{ fontSize: "32px", fontWeight: "800", marginBottom: "8px" }}
          >
            MagicAppDev
          </h1>
          <p style={{ color: "var(--ion-color-medium)" }}>
            Build apps like magic
          </p>
        </div>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Sign In</IonCardTitle>
            <IonCardSubtitle>
              Enter your credentials to continue
            </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            <form onSubmit={handleEmailLogin}>
              <IonList>
                <IonItem>
                  <IonLabel position="stacked">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={email}
                    onIonInput={e => setEmail(e.detail.value || "")}
                    required
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Password</IonLabel>
                  <IonInput
                    type="password"
                    value={password}
                    onIonInput={e => setPassword(e.detail.value || "")}
                    required
                  />
                </IonItem>
              </IonList>
              <div style={{ marginTop: "16px" }}>
                <IonButton expand="block" type="submit" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </IonButton>
              </div>
            </form>
          </IonCardContent>
        </IonCard>

        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <p>Or continue with</p>
          <IonButtons style={{ justifyContent: "center", gap: "8px" }}>
            <IonButton onClick={handleGitHubLogin} fill="outline">
              <IonIcon slot="start" icon={logoGithub} />
              GitHub
            </IonButton>
            <IonButton onClick={handleDiscordLogin} fill="outline">
              Discord
            </IonButton>
          </IonButtons>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p>
            Don't have an account? <a href="/register">Sign Up</a>
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
}
