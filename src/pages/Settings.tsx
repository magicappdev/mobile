/**
 * Settings Screen - App settings and user preferences
 */

import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import {
  moon,
  sunny,
  logOut,
  documentText,
  person,
  build,
} from "ionicons/icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { IonTitle } from "@ionic/react";
import React from "react";

export default function Settings() {
  const { user, logout } = useAuth();
  const { mode, setMode, isDark } = useTheme();
  const history = useHistory();

  const handleThemeToggle = async () => {
    const newMode = mode === "light" ? "dark" : "light";
    await setMode(newMode);
  };

  const handleLogout = async () => {
    await logout();
    history.push("/login");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {user && (
          <IonList>
            <IonListHeader>
              <IonLabel>Account</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonIcon icon={person} slot="start" />
              <IonLabel>
                <h3>{user.name || "User"}</h3>
                <p>{user.email}</p>
              </IonLabel>
            </IonItem>
          </IonList>
        )}

        <IonList>
          <IonListHeader>
            <IonLabel>Appearance</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonIcon icon={isDark ? moon : sunny} slot="start" />
            <IonLabel>Dark Mode</IonLabel>
            <IonToggle
              slot="end"
              checked={isDark}
              onIonChange={handleThemeToggle}
            />
          </IonItem>
        </IonList>

        <IonList>
          <IonListHeader>
            <IonLabel>More</IonLabel>
          </IonListHeader>
          <IonItem href="/docs" detail>
            <IonIcon icon={documentText} slot="start" />
            <IonLabel>Documentation</IonLabel>
          </IonItem>
          <IonItem href="/changelog" detail>
            <IonIcon icon={build} slot="start" />
            <IonLabel>Changelog</IonLabel>
          </IonItem>
        </IonList>

        <IonList>
          <IonItem button onClick={handleLogout} detail={false}>
            <IonIcon icon={logOut} slot="start" color="danger" />
            <IonLabel color="danger">Sign Out</IonLabel>
          </IonItem>
        </IonList>

        <div
          style={{
            padding: "16px",
            textAlign: "center",
            color: "var(--ion-color-medium)",
          }}
        >
          <p>MagicAppDev v1.0.0</p>
          <p>Built with Ionic & React</p>
        </div>
      </IonContent>
    </IonPage>
  );
}
