/**
 * Admin Dashboard Screen
 */

import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import { IonTitle } from "@ionic/react";
import React from "react";

export default function AdminDashboard() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Admin Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Welcome, Admin</IonCardTitle>
            <IonCardSubtitle>Manage your platform</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            <p>Admin dashboard content goes here...</p>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
}
