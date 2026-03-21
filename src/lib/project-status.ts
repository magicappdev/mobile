import type { Project } from "../types";

interface ProjectStatusMeta {
  label: string;
  color: string;
  background: string;
}

export function getProjectStatusMeta(
  status: Project["status"],
): ProjectStatusMeta {
  switch (status) {
    case "active":
      return {
        label: "Active",
        color: "var(--ion-color-success)",
        background: "var(--app-success-soft)",
      };
    case "deployed":
      return {
        label: "Deployed",
        color: "var(--ion-color-primary)",
        background: "var(--app-primary-soft)",
      };
    case "archived":
      return {
        label: "Archived",
        color: "var(--app-text-secondary-color)",
        background: "var(--app-card-muted-color)",
      };
    default:
      return {
        label: "Draft",
        color: "var(--ion-color-warning)",
        background: "var(--app-warning-soft)",
      };
  }
}
