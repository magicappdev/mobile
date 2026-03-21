/**
 * Projects Screen - List and manage projects
 */

import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  RefresherEventDetail,
} from "@ionic/react";
import { getProjectStatusMeta } from "../lib/project-status";
import { add, build, chevronForward } from "ionicons/icons";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { IonTitle } from "@ionic/react";
import type { Project } from "../types";
import { api } from "../lib/api";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();
  const createProjectRoute = `/tabs/chat?prompt=${encodeURIComponent("Help me create a new app and outline the first screen.")}`;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Projects</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink={createProjectRoute}>
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="app-page-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="app-page-stack">
          <section className="app-card app-hero-card">
            <div className="app-eyebrow">Projects</div>
            <h1 className="app-hero-title app-hero-title--compact">
              Keep every build in one place
            </h1>
            <p className="app-hero-copy">
              Review active work, revisit shipped apps, or jump back into the AI
              builder to start something new.
            </p>
            <div className="app-chip-row">
              <IonButton routerLink={createProjectRoute}>
                <IonIcon slot="start" icon={add} />
                Create with AI
              </IonButton>
            </div>
          </section>

          {isLoading ? (
            <section className="app-card app-empty-state">
              <div className="app-empty-icon">
                <IonSpinner name="crescent" />
              </div>
              <h2 className="app-section-title">Loading projects...</h2>
              <p className="app-subtle-text">
                Pulling your latest workspaces into view.
              </p>
            </section>
          ) : projects.length === 0 ? (
            <section className="app-card app-empty-state">
              <div className="app-empty-icon">
                <IonIcon icon={build} />
              </div>
              <h2 className="app-section-title">No projects yet</h2>
              <p className="app-subtle-text">
                Start a new build in chat and it will show up here as soon as it
                is created.
              </p>
              <div
                className="app-chip-row"
                style={{ justifyContent: "center" }}
              >
                <IonButton fill="outline" routerLink={createProjectRoute}>
                  <IonIcon slot="start" icon={add} />
                  Open AI Builder
                </IonButton>
              </div>
            </section>
          ) : (
            <section className="app-project-list">
              {projects.map(project => {
                const statusMeta = getProjectStatusMeta(project.status);

                return (
                  <button
                    key={project.id}
                    type="button"
                    className="app-project-card"
                    onClick={() => history.push(`/tabs/projects/${project.id}`)}
                  >
                    <div className="app-project-card-header">
                      <div>
                        <h2 className="app-project-card-title">
                          {project.name}
                        </h2>
                        <p className="app-project-card-copy">
                          {project.description || "No description yet."}
                        </p>
                      </div>
                      <span
                        className="app-status-pill"
                        style={{
                          background: statusMeta.background,
                          color: statusMeta.color,
                        }}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                    <div className="app-project-card-meta">
                      <span>Updated {formatDate(project.updatedAt)}</span>
                      <span>
                        Open details <IonIcon icon={chevronForward} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </section>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
