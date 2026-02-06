/**
 * Admin Config Screen
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

export default function AdminConfig() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Configuration</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel>Configuration management coming soon...</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
}
