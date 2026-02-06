/**
 * Admin Change Password Screen
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

export default function AdminChangePassword() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Change Password</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel>Password change coming soon...</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
}
