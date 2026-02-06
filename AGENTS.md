# Mobile Application Agent Documentation

## Overview

This document provides comprehensive technical documentation for the MagicAppDev mobile application, covering architecture, development workflows, coding standards, and deployment strategies specifically designed for the Ionic Framework and Capacitor stack. This guide serves as the primary reference for AI agents and developers contributing to the mobile application.

## Project Architecture

### Technology Stack

The mobile application is built on a modern, cross-platform technology stack optimized for performance and developer experience:

- **Framework**: Ionic React 8.5.0 - UI component library providing native-like experience
- **Runtime**: React 19.0.0 - Latest React with concurrent features
- **Build System**: Vite 5.0.0 - Fast, modern bundler with HMR
- **Native Bridge**: Capacitor 8.0.2 - Cross-platform native runtime
- **Language**: TypeScript 5.9.0 - Type-safe JavaScript
- **Routing**: React Router DOM 5.3.4 - Client-side routing
- **Styling**: Ionic CSS Variables with custom theming system
- **State Management**: React Context API - Built-in state management
- **Testing**: Vitest 0.34.6 (unit), Cypress 13.5.0 (E2E)

### Application Structure

The application follows a modular architecture organized by concern:

```
src/
├── components/          # Reusable UI components
│   └── ExploreContainer.tsx
├── constants/           # Configuration and constants
│   └── theme.ts         # Theme definitions
├── contexts/            # Global state providers
│   ├── AuthContext.tsx  # Authentication state
│   └── ThemeContext.tsx # Theme management
├── lib/                 # Core libraries
│   ├── api.ts           # API client
│   └── storage.ts       # Local storage utilities
├── pages/               # Route components
│   ├── admin/          # Administrative pages
│   ├── Chat.tsx        # AI chat interface
│   ├── Projects.tsx    # Project management
│   ├── Settings.tsx    # User settings
│   ├── Login.tsx       # Authentication
│   └── Register.tsx
├── theme/              # Styling
│   └── variables.css   # Ionic CSS variables
├── types/              # TypeScript types
│   └── index.ts
├── App.tsx             # Main application with routing
└── main.tsx            # Application entry point
```

### Component Hierarchy

The application follows a hierarchical component structure:

```
IonApp (root)
└── ThemeProvider
    └── AuthProvider
        └── IonReactRouter
            └── AppRoutes
                └── IonTabs
                    ├── IonRouterOutlet
                    └── IonTabBar
```

### Core Architectural Patterns

#### 1. Page-Based Routing

The application uses React Router with Ionic's navigation primitives:

```typescript
<Route exact path="/tabs/home">
  <Home />
</Route>
<Route exact path="/tabs/chat">
  <Chat />
</Route>
```

**Rules**:

- Route paths should follow the pattern `/tabs/{page}` for main navigation
- Admin routes use `/admin/{feature}` pattern
- All routes are wrapped in [`AppRoutes`](src/App.tsx:72) component
- Authentication state controls route visibility

#### 2. Context-Based State Management

Global state is managed through React Context:

**AuthContext** ([`src/contexts/AuthContext.tsx`](src/contexts/AuthContext.tsx)):

- Manages user authentication state
- Provides JWT token management
- Exposes user data and loading states
- Handles login/logout operations

**ThemeContext** ([`src/contexts/ThemeContext.tsx`](src/contexts/ThemeContext.tsx)):

- Manages theme preferences (Light/Dark/Auto)
- Persists theme choice to local storage
- Provides theme toggle functionality

**Usage Pattern**:

```typescript
const { user, isLoading } = useAuth();
const { theme, setTheme } = useTheme();
```

#### 3. Tab-Based Navigation

Authenticated users navigate through a bottom tab bar:

- **Home**: Dashboard and overview
- **Chat**: AI-powered conversation interface
- **Projects**: Project listing and management
- **Settings**: User preferences and configuration

The tab bar is conditionally rendered based on authentication state ([`App.tsx`](src/App.tsx:131)).

#### 4. Protected Routes

Routes are protected by authentication state:

- Auth pages (`/login`, `/register`) are only accessible when not authenticated
- Main tabs require authentication
- Admin routes require admin role
- Root redirects based on auth state

## Development Workflow

### Environment Setup

#### Prerequisites

Ensure all dependencies are installed:

```bash
pnpm install
```

#### Development Modes

**Web Development** (fastest iteration):

```bash
pnpm dev
```

- Starts Vite dev server at `http://localhost:5173`
- Enables hot module replacement
- Best for UI/UX development without native features

**Android Development**:

```bash
pnpm android
```

- Runs app on connected Android device/emulator
- Enables live reload with external access
- Requires Android SDK and connected device

**iOS Development**:

```bash
npx ionic capacitor open ios
```

- Opens project in Xcode
- Requires macOS with Xcode installed
- Build and run from Xcode

### Code Changes Workflow

1. **Make changes to source code**
2. **Type check**: `pnpm typecheck`
3. **Lint**: `pnpm lint`
4. **Build**: `pnpm build`
5. **Sync to native**: `pnpm ionic:sync`
6. **Test on platform**: Use appropriate development mode

### Testing Workflow

#### Unit Tests

Run unit tests using Vitest:

```bash
pnpm test.unit
```

**Test Structure**:

- Place test files alongside source files using `.test.tsx` extension
- Use global test variables (enabled in config)
- Mock external dependencies (API, Capacitor plugins)

#### E2E Tests

Run E2E tests using Cypress:

```bash
pnpm test.e2e
```

**Test Location**: [`cypress/e2e/`](cypress/e2e/)

- Write tests for critical user flows
- Test across different platforms when possible
- Mock backend responses for reliability

## Coding Standards

### TypeScript Guidelines

#### Strict Mode Compliance

The project uses TypeScript strict mode. Follow these rules:

1. **Type Inference**: Use type inference for local variables

   ```typescript
   // Good
   const count = 0;
   const name = "user";

   // Avoid
   const count: number = 0;
   ```

2. **Explicit Types for Public APIs**: Define types for exports

   ```typescript
   export interface User {
     id: string;
     name: string;
   }
   ```

3. **Avoid `any`**: Use proper types or `unknown` for dynamic data

   ```typescript
   // Good
   function processData(data: unknown) {
     if (typeof data === "string") {
       return data.toUpperCase();
     }
   }

   // Avoid
   function processData(data: any) {
     return data.toUpperCase();
   }
   ```

4. **Type Imports**: Import types using `import type`
   ```typescript
   import type { User } from "./types";
   ```

#### Component Typing

Define clear prop types for all components:

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};
```

#### Event Handling

Use proper event types:

```typescript
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value);
};

const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // Submit logic
};
```

### React Patterns

#### Functional Components

All components must be functional with hooks:

```typescript
// Good
const UserProfile: React.FC = () => {
  const { user } = useAuth();

  return <div>{user?.name}</div>;
};

// Avoid - No class components
class UserProfile extends React.Component {
  // ...
}
```

#### Custom Hooks

Extract reusable logic into custom hooks:

```typescript
// hooks/useLocalStorage.ts
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      setValue(JSON.parse(stored));
    }
  }, [key]);

  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, setStoredValue] as const;
};
```

#### Ref Forwarding

Use `forwardRef` for interactive components:

```typescript
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, onClick, disabled = false }, ref) => {
    return (
      <button ref={ref} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    );
  }
);
```

#### Effect Dependencies

Always include all dependencies in useEffect:

```typescript
// Good
useEffect(() => {
  fetchData(userId, token);
}, [userId, token]);

// Bad - Missing dependencies
useEffect(() => {
  fetchData(userId, token);
}, []); // Missing userId and token
```

### Ionic Component Usage

#### Component Imports

Import Ionic components from `@ionic/react`:

```typescript
import {
  IonButton,
  IonCard,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
```

#### Page Structure

All pages must follow the Ionic page structure:

```typescript
const HomePage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Home</IonTitle>
          </IonToolbar>
        </IonHeader>
        {/* Page content */}
      </IonContent>
    </IonPage>
  );
};
```

#### Icon Usage

Import icons from `ionicons/icons`:

```typescript
import { home, settings, chatbubbleEllipses } from "ionicons/icons";

<IonIcon icon={home} />
```

#### Modal Presentation

Use Ionic's modal system for overlays:

```typescript
const [isOpen, setIsOpen] = useState(false);

return (
  <>
    <IonButton onClick={() => setIsOpen(true)}>Open Modal</IonButton>
    <IonModal isOpen={isOpen} onDidDismiss={() => setIsOpen(false)}>
      <p>Modal content</p>
      <IonButton onClick={() => setIsOpen(false)}>Close</IonButton>
    </IonModal>
  </>
);
```

### Styling Guidelines

#### CSS Variables

Use Ionic CSS variables for theming:

```css
:root {
  --ion-color-primary: #3880ff;
  --ion-color-primary-rgb: 56, 128, 255;
  --ion-color-primary-contrast: #ffffff;
}
```

#### Custom Styles

Avoid inline styles. Use CSS modules or styled components:

```typescript
// Good - CSS module
import styles from "./HomePage.module.css";

<div className={styles.container}>...</div>

// Avoid - Inline styles
<div style={{ padding: "16px" }}>...</div>
```

#### Responsive Design

Use Ionic's grid system and responsive utilities:

```html
<IonGrid>
  <IonRow>
    <IonCol size="12" sizeMd="6" sizeLg="4">
      <IonCard>Content</IonCard>
    </IonCol>
  </IonRow>
</IonGrid>
```

### File Naming Conventions

- **Components**: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- **Pages**: `PascalCase.tsx` (e.g., `HomePage.tsx`)
- **Utilities**: `kebab-case.ts` (e.g., `api-client.ts`)
- **Types**: `kebab-case.ts` or `index.ts` (e.g., `user-types.ts`)
- **Styles**: `PascalCase.module.css` or `kebab-case.css`

### Code Organization

#### Import Order

Organize imports in this order:

1. External libraries
2. Internal workspace packages
3. Relative imports
4. Styles

```typescript
import type { User } from "@magicappdev/shared";
import { IonButton } from "@ionic/react";
import React from "react";

import { useAuth } from "../contexts/AuthContext";

import "./HomePage.css";
```

#### Component Organization

Structure components in this order:

1. Imports
2. Types/interfaces
3. Component definition
4. Hooks
5. Render

```typescript
import React from "react";
import { IonButton } from "@ionic/react";

interface ButtonProps {
  label: string;
  onClick: () => void;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  const handleClick = () => {
    onClick();
  };

  return <IonButton onClick={handleClick}>{label}</IonButton>;
};
```

## Capacitor Integration

### Plugin Usage

#### Preferences API

Use `@capacitor/preferences` for persistent storage:

```typescript
import { Preferences } from "@capacitor/preferences";

export const setPreference = async (key: string, value: string) => {
  await Preferences.set({ key, value });
};

export const getPreference = async (key: string) => {
  const { value } = await Preferences.get({ key });
  return value;
};
```

#### Browser Plugin

Use `@capacitor/browser` for in-app browsing:

```typescript
import { Browser } from "@capacitor/browser";

export const openUrl = async (url: string) => {
  await Browser.open({ url });
};
```

#### Keyboard Plugin

Use `@capacitor/keyboard` for keyboard management:

```typescript
import { Keyboard } from "@capacitor/keyboard";

// Show keyboard
await Keyboard.show();

// Hide keyboard
await Keyboard.hide();
```

### Native Platform Detection

Detect the platform using Capacitor:

```typescript
import { Capacitor } from "@capacitor/core";

const isNative = Capacitor.isNativePlatform();
const isAndroid = Capacitor.getPlatform() === "android";
const isIOS = Capacitor.getPlatform() === "ios";
const isWeb = Capacitor.getPlatform() === "web";
```

### Platform-Specific Code

Handle platform differences:

```typescript
import { Capacitor } from "@capacitor/core";

const handlePlatformAction = async () => {
  if (Capacitor.isNativePlatform()) {
    // Native-specific code
    await NativePlugin.doSomething();
  } else {
    // Web fallback
    window.open(url, "_blank");
  }
};
```

## Authentication Flow

### GitHub OAuth Integration

The application uses GitHub OAuth with JWT session management:

1. User initiates login from [`Login.tsx`](src/pages/Login.tsx)
2. Redirects to GitHub OAuth authorization
3. GitHub redirects back with authorization code
4. Backend exchanges code for JWT tokens
5. Tokens stored securely via Capacitor Preferences
6. AuthContext maintains session state

### Token Management

#### Token Storage

```typescript
import { Preferences } from "@capacitor/preferences";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const setAuthToken = async (token: string) => {
  await Preferences.set({ key: TOKEN_KEY, value: token });
};

export const getAuthToken = async () => {
  const { value } = await Preferences.get({ key: TOKEN_KEY });
  return value;
};
```

#### Token Refreshing

Implement automatic token refresh:

```typescript
import { ApiClient } from "@magicappdev/shared";

const api = new ApiClient();

api.setTokenRefreshCallback(async () => {
  const newToken = await refreshToken();
  await setAuthToken(newToken);
  return newToken;
});
```

### Protected Routes

Wrap authenticated routes:

```typescript
const ProtectedRoute: React.FC<{ path: string; component: React.FC }> = ({
  path,
  component: Component,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <IonSpinner />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
};
```

## API Integration

### API Client

The application uses the shared `ApiClient` from `@magicappdev/shared`:

```typescript
import { ApiClient } from "@magicappdev/shared";

const api = new ApiClient({
  baseURL: process.env.REACT_APP_API_URL || "https://api.magicappdev.com",
});
```

### API Calls

#### Authenticated Requests

```typescript
const fetchProjects = async () => {
  const response = await api.get("/projects");
  return response.data;
};
```

#### Streaming Responses

Use streaming for AI chat responses:

```typescript
const streamChatResponse = async (message: string) => {
  const stream = await api.stream("/chat", { message });

  for await (const chunk of stream) {
    // Process streaming chunk
  }
};
```

#### Error Handling

Always handle API errors properly:

```typescript
const fetchData = async () => {
  try {
    const response = await api.get("/endpoint");
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle API error
      console.error("API Error:", error.message);
      showToast(error.message);
    } else {
      // Handle unexpected error
      console.error("Unexpected error:", error);
      showToast("An unexpected error occurred");
    }
  }
};
```

## Theme System

### Theme Architecture

The application supports three theme modes:

1. **Light**: Always light theme
2. **Dark**: Always dark theme
3. **Auto**: Follow system preference (default)

### Theme Implementation

#### Theme Context

The [`ThemeContext`](src/contexts/ThemeContext.tsx) manages theme state:

```typescript
interface ThemeContextValue {
  theme: "light" | "dark" | "auto";
  setTheme: (theme: "light" | "dark" | "auto") => void;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeMode>("auto");

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    await Preferences.set({ key: "theme", value: newTheme });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

#### Ionic Dark Mode

Ionic's system-based dark mode is enabled in [`App.tsx`](src/App.tsx:41):

```typescript
import "@ionic/react/css/palettes/dark.system.css";
```

#### Custom Theme Variables

Define theme variables in [`src/theme/variables.css`](src/theme/variables.css):

```css
:root {
  --ion-color-primary: #3880ff;
  --ion-color-primary-rgb: 56, 128, 255;
  --ion-color-primary-contrast: #ffffff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --ion-color-primary: #5dc9ff;
  }
}
```

### Theme Usage in Components

Access theme in components:

```typescript
import { useTheme } from "../contexts/ThemeContext";

const MyComponent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={theme === "dark" ? "dark-theme" : "light-theme"}>
      Content
    </div>
  );
};
```

## Deployment Strategies

### Build Process

#### Production Build

```bash
# Build web assets
pnpm build

# Sync to native platforms
pnpm ionic:sync

# Open in native IDE
npx ionic capacitor open android  # or ios
```

#### Build Artifacts

- **Web**: `dist/` directory contains optimized web assets
- **Android**: Gradle builds generate APK/AAB in `android/app/build/outputs/`
- **iOS**: Xcode builds generate IPA in derived data directory

### Environment Configuration

#### Environment Variables

Create `.env` files for different environments:

```bash
# .env.development
REACT_APP_API_URL=http://localhost:3000
REACT_APP_ENVIRONMENT=development

# .env.production
REACT_APP_API_URL=https://api.magicappdev.com
REACT_APP_ENVIRONMENT=production
```

#### Capacitor Configuration

Update [`capacitor.config.ts`](capacitor.config.ts) for production:

```typescript
const config: CapacitorConfig = {
  appId: "com.magicappdev",
  appName: "MagicAppDev",
  webDir: "dist",
  server: {
    // Remove URL for production to use local assets
    cleartext: false, // Disable for production
  },
};
```

### Android Deployment

#### Build Configuration

Update `android/app/build.gradle`:

```gradle
android {
  defaultConfig {
    applicationId "com.magicappdev"
    minSdkVersion 24
    targetSdkVersion 34
    versionCode 1
    versionName "0.0.1"
  }

  buildTypes {
    release {
      minifyEnabled true
      proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
  }
}
```

#### Building Release APK

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

#### Building Release Bundle (AAB)

```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### iOS Deployment

#### Build Configuration

Update project settings in Xcode:

- **Bundle Identifier**: `com.magicappdev`
- **Version**: `0.0.1`
- **Build**: `1`

#### Building Archive

From Xcode:

1. Product > Archive
2. Wait for archive to complete
3. Distribute App from organizer window

#### App Store Submission

1. Create app listing in App Store Connect
2. Upload archive from Xcode
3. Complete app metadata
4. Submit for review

### App Store Optimization

#### Version Management

Follow semantic versioning in [`package.json`](package.json:3):

```json
{
  "version": "0.0.1"
}
```

Sync version with native platforms:

**Android**: Update `android/app/build.gradle`

**iOS**: Update version in Xcode project settings

#### Release Notes

Maintain a `CHANGELOG.md` in the project root:

```markdown
## [0.0.1] - 2024-01-01

### Added

- Initial release
- AI chat functionality
- Project management
- GitHub authentication
```

## Performance Optimization

### Code Splitting

Use React.lazy for route-based code splitting:

```typescript
const ChatPage = React.lazy(() => import("./pages/Chat"));
const ProjectsPage = React.lazy(() => import("./pages/Projects"));

<Suspense fallback={<IonSpinner />}>
  <ChatPage />
</Suspense>
```

### Image Optimization

- Use WebP format where possible
- Implement lazy loading for images
- Provide multiple sizes for responsive images

### Bundle Size Reduction

- Analyze bundle size: `pnpm build -- --mode production --report`
- Remove unused dependencies
- Use tree-shaking
- Enable production optimizations in Vite

### Rendering Performance

- Use `React.memo` for expensive components
- Implement virtualization for long lists
- Debounce expensive operations
- Use `useCallback` and `useMemo` appropriately

## Security Guidelines

### Data Storage

#### Sensitive Data

Store sensitive data securely:

```typescript
import { Preferences } from "@capacitor/preferences";

// Good - Encrypted storage (platform-dependent)
await Preferences.set({ key: "token", value: token });

// Bad - LocalStorage (not secure)
localStorage.setItem("token", token);
```

#### Authentication Tokens

- Never store tokens in plain text
- Use Capacitor Preferences for secure storage
- Implement token rotation
- Clear tokens on logout

### Network Security

#### HTTPS Only

Enforce HTTPS in production:

```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  server: {
    cleartext: false, // Disable HTTP in production
  },
};
```

#### Certificate Pinning

Implement certificate pinning for API calls (requires native plugin)

### Input Validation

#### User Inputs

Always validate user inputs:

```typescript
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const validateLogin = (data: unknown) => {
  return loginSchema.parse(data);
};
```

#### API Responses

Validate API responses:

```typescript
const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
});

const validateUser = (data: unknown) => {
  return userSchema.parse(data);
};
```

## Testing Guidelines

### Unit Testing

#### Test Structure

```typescript
describe("UserProfile", () => {
  it("renders user name when provided", () => {
    const user = { name: "John Doe" };
    render(<UserProfile user={user} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("shows loading state when isLoading is true", () => {
    render(<UserProfile isLoading />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });
});
```

#### Mocking

Mock external dependencies:

```typescript
import { Preferences } from "@capacitor/preferences";

vi.mock("@capacitor/preferences", () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));
```

### E2E Testing

#### Test Flows

Test critical user journeys:

1. Authentication flow (login, logout)
2. Chat interface (send message, receive response)
3. Project management (create, edit, delete)
4. Settings (theme change, preferences)

#### Test Configuration

Configure Cypress in [`cypress.config.ts`](cypress.config.ts):

```typescript
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    supportFile: false,
  },
});
```

## Troubleshooting

### Common Issues

#### Capacitor Sync Issues

**Problem**: `ionic cap sync` fails to update native platforms

**Solution**:

```bash
# Clean build
rm -rf dist
pnpm build

# Force sync
npx ionic cap sync --force
```

#### Android Build Errors

**Problem**: Gradle build fails with path length error

**Solution**: This has been resolved in the current configuration. If it persists:

- Move project to shorter path
- Use `gradle.properties` to enable long paths

#### iOS Build Errors

**Problem**: Xcode build fails with provisioning errors

**Solution**:

- Update signing certificates in Xcode
- Clean build folder: `Product > Clean Build Folder`
- Re-derive data

#### TypeScript Errors

**Problem**: Type errors after dependency updates

**Solution**:

```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Update types
pnpm typecheck
```

### Debugging

#### React DevTools

Use React DevTools browser extension for web development

#### Native Debugging

**Android**:

```bash
adb logcat | grep Capacitor
```

**iOS**:
Use Xcode console output

#### Vite Dev Server

Access Vite debug features at `http://localhost:5173/__devtools/`

## Best Practices Summary

### Development

1. Use TypeScript strict mode
2. Write tests for critical functionality
3. Follow the established component patterns
4. Use functional components with hooks
5. Implement proper error handling
6. Use the shared API client for all API calls

### Code Quality

1. Run `pnpm lint` before committing
2. Run `pnpm typecheck` to catch type errors
3. Write self-documenting code
4. Keep components small and focused
5. Use consistent naming conventions
6. Extract reusable logic into hooks

### Performance

1. Use code splitting for routes
2. Implement virtualization for long lists
3. Use React.memo for expensive components
4. Optimize images and assets
5. Minimize re-renders with proper dependency arrays

### Security

1. Validate all user inputs
2. Use secure storage for sensitive data
3. Implement proper authentication flows
4. Use HTTPS in production
5. Clear sensitive data on logout

## Contributing Guidelines

### Before Contributing

1. Read this documentation thoroughly
2. Set up local development environment
3. Run the full test suite: `pnpm test.unit`
4. Ensure code passes linting: `pnpm lint`
5. Verify type checking: `pnpm typecheck`

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes following coding standards
3. Add tests for new functionality
4. Update documentation as needed
5. Run full quality checks
6. Submit pull request with clear description

### Code Review Checklist

- [ ] Code follows TypeScript strict mode
- [ ] Components use functional patterns
- [ ] Tests cover critical paths
- [ ] Documentation is updated
- [ ] No linting errors
- [ ] No type errors
- [ ] No security vulnerabilities

## Additional Resources

### Official Documentation

- [Ionic Framework](https://ionicframework.com/docs)
- [Capacitor](https://capacitorjs.com/docs)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Vite](https://vitejs.dev)

### Project Documentation

- [Shared Package Documentation](../../../packages/shared/README.md)
- [API Documentation](../../../packages/api/README.md)
- [Main Project README](../../../README.md)

### Internal Tools

- [CLI Documentation](../../../packages/cli/README.md)
- [Template System](../../../packages/templates/README.md)

## Version History

### Version 0.0.1 (Current)

- Initial release of mobile application
- Ionic React 8.5.0 with Capacitor 8.0.2
- GitHub OAuth authentication
- AI chat interface with streaming
- Project management functionality
- Admin dashboard
- Theme system (Light/Dark/Auto)
- Unit and E2E testing setup
