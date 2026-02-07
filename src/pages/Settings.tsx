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
  IonButton,
  IonAlert,
  IonSpinner,
} from "@ionic/react";
import {
  moon,
  sunny,
  logOut,
  documentText,
  person,
  build,
  logoGithub,
  logoDiscord,
  trash,
} from "ionicons/icons";
import { useTheme } from "../contexts/ThemeContext";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { IonTitle } from "@ionic/react";
import { api } from "../lib/api";

interface LinkedAccount {
  id: string;
  provider: string;
  providerAccountId: string;
  createdAt: string;
}

export default function Settings() {
  const { user, logout } = useAuth();
  const { mode, setMode, isDark } = useTheme();
  const history = useHistory();
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  useEffect(() => {
    if (user) {
      loadLinkedAccounts();
    }
  }, [user]);

  const loadLinkedAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const response = (await api.request("/auth/accounts")) as {
        success: boolean;
        data: LinkedAccount[];
      };
      if (response.success) {
        setLinkedAccounts(response.data);
      }
    } catch (error) {
      console.error("Failed to load linked accounts:", error);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handleThemeToggle = async () => {
    const newMode = mode === "light" ? "dark" : "light";
    await setMode(newMode);
  };

  const handleLogout = async () => {
    await logout();
    history.push("/login");
  };

  const handleDeleteAccount = async () => {
    try {
      await api.request("/auth/account", { method: "DELETE" });
      await logout();
      history.push("/login");
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again.");
    }
  };

  const isProviderLinked = (provider: string) => {
    return linkedAccounts.some(acc => acc.provider === provider);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {user ? (
          <>
            <IonList>
              <IonListHeader>
                <IonLabel>Profile</IonLabel>
              </IonListHeader>
              <IonItem lines="full">
                <IonIcon icon={person} slot="start" />
                <IonLabel>
                  <h2 style={{ fontWeight: "bold" }}>{user.name || "User"}</h2>
                  <p>{user.email}</p>
                  <p style={{ fontSize: "12px", opacity: 0.7 }}>
                    Role: {user.role || "User"}
                  </p>
                </IonLabel>
              </IonItem>
            </IonList>

            <IonList>
              <IonListHeader>
                <IonLabel>Linked Accounts</IonLabel>
              </IonListHeader>
              {isLoadingAccounts ? (
                <IonItem>
                  <IonSpinner name="crescent" slot="start" />
                  <IonLabel>Loading accounts...</IonLabel>
                </IonItem>
              ) : (
                <>
                  <IonItem>
                    <IonIcon icon={logoGithub} slot="start" />
                    <IonLabel>GitHub</IonLabel>
                    <IonLabel
                      slot="end"
                      color={isProviderLinked("github") ? "success" : "medium"}
                    >
                      {isProviderLinked("github") ? "Linked" : "Not Linked"}
                    </IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonIcon icon={logoDiscord} slot="start" />
                    <IonLabel>Discord</IonLabel>
                    <IonLabel
                      slot="end"
                      color={isProviderLinked("discord") ? "success" : "medium"}
                    >
                      {isProviderLinked("discord") ? "Linked" : "Not Linked"}
                    </IonLabel>
                  </IonItem>
                </>
              )}
            </IonList>
          </>
        ) : (
          <IonList>
            <IonItem>
              <IonLabel>Not signed in</IonLabel>
              <IonButton slot="end" onClick={() => history.push("/login")}>
                Login
              </IonButton>
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

        <IonListHeader>
          <IonLabel>App</IonLabel>
        </IonListHeader>
        <IonList>
          <IonItem href="/docs" detail>
            <IonIcon icon={documentText} slot="start" />
            <IonLabel>Documentation</IonLabel>
          </IonItem>
          <IonItem href="/changelog" detail>
            <IonIcon icon={build} slot="start" />
            <IonLabel>Changelog</IonLabel>
          </IonItem>
        </IonList>

        <IonListHeader>
          <IonLabel>Session</IonLabel>
        </IonListHeader>
        <IonList>
          <IonItem button onClick={handleLogout} detail={false}>
            <IonIcon icon={logOut} slot="start" color="danger" />
            <IonLabel color="danger">Sign Out</IonLabel>
          </IonItem>
          {user && (
            <IonItem
              button
              onClick={() => setShowDeleteAlert(true)}
              detail={false}
            >
              <IonIcon icon={trash} slot="start" color="danger" />
              <IonLabel color="danger">Delete Account</IonLabel>
            </IonItem>
          )}
        </IonList>

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Delete Account?"
          message="This action is permanent and cannot be undone. All your projects and data will be lost."
          buttons={[
            { text: "Cancel", role: "cancel" },
            {
              text: "Delete",
              role: "destructive",
              handler: handleDeleteAccount,
            },
          ]}
        />

        <div
          style={{
            padding: "32px 16px",
            textAlign: "center",
            color: "var(--ion-color-medium)",
            fontSize: "14px",
          }}
        >
          <p style={{ marginBottom: "4px" }}>MagicAppDev v1.0.0</p>
          <p>Built with ❤️ using Ionic & React</p>
        </div>
      </IonContent>
    </IonPage>
  );
}
