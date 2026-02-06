/**
 * Admin API Keys Screen
 */

import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import { IonTitle } from "@ionic/react";
import React from "react";

export default function AdminApiKeys() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>API Keys</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel>API key management coming soon...</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
}
