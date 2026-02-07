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
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import { logoDiscord, logoGithub } from "ionicons/icons";
import { Redirect, useHistory } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, loginWithGitHub, loginWithDiscord, user } = useAuth();
  const history = useHistory();

  console.log("Login: rendering, user authenticated:", !!user);

  // Ionic specific lifecycle hook for redirection
  useIonViewWillEnter(() => {
    if (user) {
      console.log("Login: useIonViewWillEnter - User detected, redirecting...");
      history.replace("/tabs/home");
    }
  });

  // If user is already authenticated, redirect to home
  useEffect(() => {
    if (user) {
      console.log(
        "Login: User detected in useEffect, navigating to /tabs/home...",
      );
      history.replace("/tabs/home");
    }
  }, [user, history]);

  if (user) {
    console.log("Login: Rendering Redirect to /tabs/home");
    return <Redirect to="/tabs/home" />;
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      // Navigation is handled by AuthContext when user state updates
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials.";
      setError(message);
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
          <IonImg
            src="./favicon.png"
            alt="MagicAppDev Logo"
            style={{ width: "32px", height: "32px" }}
          />
          <IonTitle
            style={{
              fontSize: "16px",
              fontWeight: "800",
              marginLeft: "25px",
              marginTop: "-24px",
            }}
          >
            Sign In
          </IonTitle>
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
              {error && (
                <div
                  style={{
                    color: "var(--ion-color-danger)",
                    marginTop: "12px",
                    textAlign: "center",
                    fontSize: "14px",
                  }}
                >
                  {error}
                </div>
              )}
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
              <IonIcon slot="start" icon={logoDiscord} />
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
