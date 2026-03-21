/**
 * Register Screen
 *
 * User registration with email/password
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
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import { TurnstileWidget } from "../components/ui/TurnstileWidget";
import { Redirect, useHistory } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const TURNSTILE_ENABLED = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>();
  const [turnstileWidgetKey, setTurnstileWidgetKey] = useState(0);
  const history = useHistory();
  const { register, user } = useAuth();

  useIonViewWillEnter(() => {
    if (user) {
      history.replace("/tabs/home");
    }
  });

  useEffect(() => {
    if (user) {
      history.replace("/tabs/home");
    }
  }, [history, user]);

  if (user) {
    return <Redirect to="/tabs/home" />;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email,
        password,
        turnstileToken,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      setError(message);
      setTurnstileToken(undefined);
      setTurnstileWidgetKey(currentKey => currentKey + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Sign Up</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="app-auth-content">
        <div className="app-auth-shell">
          <section className="app-auth-hero">
            <div className="app-eyebrow">MagicAppDev</div>
            <h1 className="app-hero-title">Create your workspace</h1>
            <p className="app-hero-copy">
              Start building new products, prototypes, and internal tools from
              one mobile workspace.
            </p>
          </section>

          <IonCard className="app-card app-auth-card">
            <IonCardHeader>
              <IonCardTitle>Create Account</IonCardTitle>
              <IonCardSubtitle>
                Join MagicAppDev to start building
              </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <form onSubmit={handleRegister} className="app-form-stack">
                <IonItem lines="none" className="app-form-item">
                  <IonLabel position="stacked">Name</IonLabel>
                  <IonInput
                    type="text"
                    value={name}
                    onIonInput={e => setName(e.detail.value || "")}
                    required
                  />
                </IonItem>
                <IonItem lines="none" className="app-form-item">
                  <IonLabel position="stacked">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={email}
                    onIonInput={e => setEmail(e.detail.value || "")}
                    required
                  />
                </IonItem>
                <IonItem lines="none" className="app-form-item">
                  <IonLabel position="stacked">Password</IonLabel>
                  <IonInput
                    type="password"
                    value={password}
                    onIonInput={e => setPassword(e.detail.value || "")}
                    required
                  />
                </IonItem>
                <IonItem lines="none" className="app-form-item">
                  <IonLabel position="stacked">Confirm Password</IonLabel>
                  <IonInput
                    type="password"
                    value={confirmPassword}
                    onIonInput={e => setConfirmPassword(e.detail.value || "")}
                    required
                  />
                </IonItem>
                {TURNSTILE_ENABLED && (
                  <TurnstileWidget
                    key={turnstileWidgetKey}
                    onSuccess={token => setTurnstileToken(token)}
                    onError={() => {
                      setTurnstileToken(undefined);
                      setTurnstileWidgetKey(currentKey => currentKey + 1);
                    }}
                    onExpire={() => {
                      setTurnstileToken(undefined);
                      setTurnstileWidgetKey(currentKey => currentKey + 1);
                    }}
                  />
                )}
                {error && <div className="app-error-banner">{error}</div>}
                <IonButton
                  expand="block"
                  type="submit"
                  disabled={
                    isLoading ||
                    !name.trim() ||
                    !email.trim() ||
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword ||
                    (TURNSTILE_ENABLED && !turnstileToken)
                  }
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>
          <div className="app-link-copy">
            Already have an account? <a href="/login">Sign In</a>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
