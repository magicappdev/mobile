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
  IonList,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { IonTitle } from "@ionic/react";
import React, { useState } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      // TODO: Show error toast
      return;
    }
    setIsLoading(true);
    try {
      // TODO: Call register API
      history.push("/tabs/home");
    } catch (error) {
      console.error("Registration failed:", error);
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
            <IonCardTitle>Create Account</IonCardTitle>
            <IonCardSubtitle>
              Join MagicAppDev to start building
            </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            <form onSubmit={handleRegister}>
              <IonList>
                <IonItem>
                  <IonLabel position="stacked">Name</IonLabel>
                  <IonInput
                    type="text"
                    value={name}
                    onIonInput={e => setName(e.detail.value || "")}
                    required
                  />
                </IonItem>
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
                <IonItem>
                  <IonLabel position="stacked">Confirm Password</IonLabel>
                  <IonInput
                    type="password"
                    value={confirmPassword}
                    onIonInput={e => setConfirmPassword(e.detail.value || "")}
                    required
                  />
                </IonItem>
              </IonList>
              <div style={{ marginTop: "16px" }}>
                <IonButton expand="block" type="submit" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </IonButton>
              </div>
            </form>
          </IonCardContent>
        </IonCard>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p>
            Already have an account? <a href="/login">Sign In</a>
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
}
