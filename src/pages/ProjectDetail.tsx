/**
 * Project Detail Screen - View and manage a single project
 */

import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonToolbar,
  IonTitle,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonAlert,
  IonSpinner,
} from "@ionic/react";
import {
  calendarOutline,
  timeOutline,
  codeOutline,
  rocketOutline,
  trashOutline,
  settingsOutline,
  eyeOutline,
} from "ionicons/icons";
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import type { Project } from "../types";
import { api } from "../lib/api";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProject = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const projects = await api.getProjects();
      const found = projects.find(p => p.id === id);
      if (found) {
        setProject(found);
      } else {
        setError("Project not found");
      }
    } catch (error) {
      console.error("Failed to load project:", error);
      setError("Failed to load project");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadProject();
    event.detail.complete();
  };

  const handleDelete = async () => {
    if (!project || isDeleting) return;
    setShowDeleteAlert(false);
    setIsDeleting(true);
    try {
      await api.deleteProject(project.id);
      window.location.href = "/tabs/projects";
    } catch (error) {
      console.error("Failed to delete project:", error);
      setIsDeleting(false);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tabs/projects" />
            </IonButtons>
            <IonTitle>Loading...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <IonSpinner name="crescent" />
            <p style={{ marginTop: "16px", color: "var(--ion-color-medium)" }}>
              Loading project details...
            </p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error || !project) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tabs/projects" />
            </IonButtons>
            <IonTitle>Error</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <IonIcon
              icon={codeOutline}
              style={{
                fontSize: "64px",
                color: "var(--ion-color-danger)",
                marginBottom: "16px",
              }}
            />
            <h2>{error || "Project not found"}</h2>
            <IonButton fill="outline" href="/tabs/projects">
              Back to Projects
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/projects" />
          </IonButtons>
          <IonTitle>{project.name}</IonTitle>
          <IonButtons slot="end">
            <IonButton href={`/tabs/projects/${project.id}/settings`}>
              <IonIcon slot="icon-only" icon={settingsOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Status Card */}
        <IonCard>
          <IonCardContent>
            <h2 style={{ marginBottom: "8px" }}>{project.name}</h2>
            <p
              style={{ color: "var(--ion-color-medium)", marginBottom: "16px" }}
            >
              {project.description || "No description provided."}
            </p>
            <div
              style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "16px",
                backgroundColor: getStatusColor(project.status),
                color: "white",
                fontWeight: "600",
                textTransform: "uppercase",
                fontSize: "12px",
              }}
            >
              {project.status}
            </div>
          </IonCardContent>
        </IonCard>

        {/* Details */}
        <IonCard>
          <IonList>
            <IonItem>
              <IonIcon icon={calendarOutline} slot="start" color="medium" />
              <IonLabel>
                <h3>Created</h3>
                <p>{formatDate(project.createdAt)}</p>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonIcon icon={timeOutline} slot="start" color="medium" />
              <IonLabel>
                <h3>Last Updated</h3>
                <p>{formatDate(project.updatedAt)}</p>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonIcon icon={codeOutline} slot="start" color="medium" />
              <IonLabel>
                <h3>Project ID</h3>
                <p style={{ fontFamily: "monospace", fontSize: "12px" }}>
                  {project.id}
                </p>
              </IonLabel>
            </IonItem>
          </IonList>
        </IonCard>

        {/* Actions */}
        <IonCard>
          <IonList>
            <IonItem button href={`/tabs/projects/${project.id}/preview`}>
              <IonIcon icon={eyeOutline} slot="start" color="primary" />
              <IonLabel>
                <h3>Open Preview</h3>
                <p>View live preview of your project</p>
              </IonLabel>
            </IonItem>
            <IonItem button href={`/tabs/projects/${project.id}/settings`}>
              <IonIcon icon={settingsOutline} slot="start" color="medium" />
              <IonLabel>
                <h3>Settings</h3>
                <p>Configure project settings</p>
              </IonLabel>
            </IonItem>
            {project.githubUrl && (
              <IonItem
                button
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IonIcon icon={codeOutline} slot="start" color="dark" />
                <IonLabel>
                  <h3>GitHub Repository</h3>
                  <p>View source code</p>
                </IonLabel>
              </IonItem>
            )}
            {project.deploymentUrl && (
              <IonItem
                button
                href={project.deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IonIcon icon={rocketOutline} slot="start" color="success" />
                <IonLabel>
                  <h3>Live Deployment</h3>
                  <p>Open deployed application</p>
                </IonLabel>
              </IonItem>
            )}
          </IonList>
        </IonCard>

        {/* Danger Zone */}
        <IonCard>
          <IonCardContent>
            <IonButton
              expand="block"
              fill="outline"
              color="danger"
              onClick={() => setShowDeleteAlert(true)}
            >
              <IonIcon slot="start" icon={trashOutline} />
              Delete Project
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* Delete Confirmation Alert */}
        <IonAlert
          isOpen={showDeleteAlert && !isDeleting}
          onDidDismiss={() => !isDeleting && setShowDeleteAlert(false)}
          header="Delete Project?"
          message="Are you sure you want to delete this project? This action cannot be undone."
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
            },
            {
              text: "Delete",
              role: "destructive",
              handler: handleDelete,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
}
