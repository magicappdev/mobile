/**
 * Projects Screen - List and manage projects
 */

import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from "@ionic/react";
import React, { useState, useEffect } from "react";
import { add, build } from "ionicons/icons";
import { IonTitle } from "@ionic/react";
import type { Project } from "../types";
import { api } from "../lib/api";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadProjects();
    event.detail.complete();
  };

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "var(--ion-color-success)";
      case "deployed":
        return "var(--ion-color-primary)";
      case "archived":
        return "var(--ion-color-medium)";
      default:
        return "var(--ion-color-warning)";
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Projects</IonTitle>
          <IonButtons slot="end">
            <IonButton href="/tabs/projects/new">
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {!isLoading && projects.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <IonIcon
              icon={build}
              style={{
                fontSize: "64px",
                color: "var(--ion-color-medium)",
                marginBottom: "16px",
              }}
            />
            <h2>No Projects Yet</h2>
            <p style={{ color: "var(--ion-color-medium)" }}>
              Create your first project to get started
            </p>
            <IonButton fill="outline" href="/tabs/projects/new">
              <IonIcon slot="start" icon={add} />
              Create Project
            </IonButton>
          </div>
        )}

        <IonList>
          {projects.map(project => (
            <IonItem
              key={project.id}
              href={`/tabs/projects/${project.id}`}
              detail
            >
              <IonLabel>
                <h2>{project.name}</h2>
                <p>{project.description || "No description"}</p>
                <p
                  style={{
                    color: getStatusColor(project.status),
                    textTransform: "capitalize",
                    fontWeight: "600",
                  }}
                >
                  {project.status}
                </p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
}
