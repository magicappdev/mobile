import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { chatbubbleEllipses, folder, home, settings } from "ionicons/icons";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";
import React from "react";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/typography.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/normalize.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";

/* Context Providers */
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

/* Pages */
import Settings from "./pages/Settings";
import Register from "./pages/Register";
import Projects from "./pages/Projects";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Chat from "./pages/Chat";

/* Admin Pages */
import AdminChangePassword from "./pages/admin/ChangePassword";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminApiKeys from "./pages/admin/ApiKeys";
import AdminConfig from "./pages/admin/Config";
import AdminUsers from "./pages/admin/Users";
import AdminLogs from "./pages/admin/Logs";

setupIonicReact();

/**
 * App Routes Component
 * Handles routing based on authentication state
 */
const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <IonTabs>
      <IonRouterOutlet>
        {/* Auth Routes */}
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/register">
          <Register />
        </Route>

        {/* Main Tab Routes */}
        <Route exact path="/tabs/home">
          <Home />
        </Route>
        <Route exact path="/tabs/chat">
          <Chat />
        </Route>
        <Route exact path="/tabs/projects">
          <Projects />
        </Route>
        <Route exact path="/tabs/settings">
          <Settings />
        </Route>

        {/* Admin Routes */}
        <Route exact path="/admin/dashboard">
          <AdminDashboard />
        </Route>
        <Route exact path="/admin/users">
          <AdminUsers />
        </Route>
        <Route exact path="/admin/logs">
          <AdminLogs />
        </Route>
        <Route exact path="/admin/api-keys">
          <AdminApiKeys />
        </Route>
        <Route exact path="/admin/config">
          <AdminConfig />
        </Route>
        <Route exact path="/admin/change-password">
          <AdminChangePassword />
        </Route>

        {/* Redirect */}
        <Route exact path="/">
          <Redirect to={user ? "/tabs/home" : "/login"} />
        </Route>
      </IonRouterOutlet>

      {/* Tab Bar - only show when authenticated */}
      {user && (
        <IonTabBar slot="bottom">
          <IonTabButton tab="home" href="/tabs/home">
            <IonIcon aria-hidden="true" icon={home} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>
          <IonTabButton tab="chat" href="/tabs/chat">
            <IonIcon aria-hidden="true" icon={chatbubbleEllipses} />
            <IonLabel>Chat</IonLabel>
          </IonTabButton>
          <IonTabButton tab="projects" href="/tabs/projects">
            <IonIcon aria-hidden="true" icon={folder} />
            <IonLabel>Projects</IonLabel>
          </IonTabButton>
          <IonTabButton tab="settings" href="/tabs/settings">
            <IonIcon aria-hidden="true" icon={settings} />
            <IonLabel>Settings</IonLabel>
          </IonTabButton>
        </IonTabBar>
      )}
    </IonTabs>
  );
};

const App: React.FC = () => (
  <IonApp>
    <ThemeProvider>
      <AuthProvider>
        <IonReactRouter>
          <AppRoutes />
        </IonReactRouter>
      </AuthProvider>
    </ThemeProvider>
  </IonApp>
);

export default App;
