/**
 * Admin Logs Screen
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

export default function AdminLogs() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Logs</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel>System logs coming soon...</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
}
