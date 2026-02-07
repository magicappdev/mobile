import {
  IonApp,
  IonContent,
  IonIcon,
  IonLabel,
  IonPage,
  IonRouterOutlet,
  IonSpinner,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { chatbubbleEllipses, folder, home, settings } from "ionicons/icons";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";
import React from "react";

import { appHistory } from "./lib/history";

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
import { NavigationProvider } from "./contexts/NavigationContext";
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
 * Tabs Component
 * Separated to ensure clean routing within the tab system
 */
const Tabs: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/tabs/home" component={Home} />
        <Route exact path="/tabs/chat" component={Chat} />
        <Route exact path="/tabs/projects" component={Projects} />
        <Route exact path="/tabs/settings" component={Settings} />
        <Route exact path="/tabs" render={() => <Redirect to="/tabs/home" />} />
      </IonRouterOutlet>

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
    </IonTabs>
  );
};

/**
 * App Routes Component
 * Handles routing based on authentication state
 */
const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  console.log(
    `[ROUTER] Render: user=${!!user}, isLoading=${isLoading}, path=${window.location.pathname}`,
  );

  if (isLoading) {
    return (
      <IonPage>
        <IonContent>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonRouterOutlet>
      {/* Auth Routes - only accessible when logged out */}
      <Route exact path="/login">
        {!user ? <Login /> : <Redirect to="/tabs/home" />}
      </Route>
      <Route exact path="/register">
        {user ? <Redirect to="/tabs/home" /> : <Register />}
      </Route>

      {/* Main Tab Routes - only accessible when logged in */}
      <Route
        path="/tabs"
        render={() => (user ? <Tabs /> : <Redirect to="/login" />)}
      />

      {/* Admin Routes - only accessible when logged in */}
      <Route
        path="/admin"
        render={() =>
          user ? (
            <IonRouterOutlet>
              <Route exact path="/admin/dashboard" component={AdminDashboard} />
              <Route exact path="/admin/users" component={AdminUsers} />
              <Route exact path="/admin/logs" component={AdminLogs} />
              <Route exact path="/admin/api-keys" component={AdminApiKeys} />
              <Route exact path="/admin/config" component={AdminConfig} />
              <Route
                exact
                path="/admin/change-password"
                component={AdminChangePassword}
              />
            </IonRouterOutlet>
          ) : (
            <Redirect to="/login" />
          )
        }
      />

      {/* Root Redirect */}
      <Route
        exact
        path="/"
        render={() =>
          user ? <Redirect to="/tabs/home" /> : <Redirect to="/login" />
        }
      />

      {/* Fallback */}
      <Route render={() => <Redirect to={user ? "/tabs/home" : "/login"} />} />
    </IonRouterOutlet>
  );
};

const App: React.FC = () => (
  <IonApp>
    <ThemeProvider>
      <NavigationProvider>
        <AuthProvider>
          <IonReactRouter history={appHistory}>
            <AppRoutes />
          </IonReactRouter>
        </AuthProvider>
      </NavigationProvider>
    </ThemeProvider>
  </IonApp>
);

export default App;
