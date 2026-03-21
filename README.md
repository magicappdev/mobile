# MagicAppDev Mobile Application

A modern cross-platform mobile application built with Ionic Framework and Capacitor, providing on-the-go access to the MagicAppDev platform. The application features AI-powered chat, project management, and no-code app generation capabilities, mirroring the web interface functionality.

## Overview

MagicAppDev Mobile enables users to interact with AI agents, manage projects, and generate applications from anywhere. Built on a React foundation with Ionic's UI components and Capacitor's native bridging, the app delivers a native-like experience while maintaining code sharing with the web platform.

## Tech Stack

- **Framework**: Ionic React 8.5.0
- **Runtime**: React 19.0.0
- **Build Tool**: Vite 5.0.0
- **Native Bridge**: Capacitor 8.0.2
- **Language**: TypeScript 5.9.0
- **Styling**: Ionic CSS Variables with custom theme
- **State Management**: React Context API
- **Routing**: React Router DOM 5.3.4
- **Testing**: Vitest 0.34.6, Cypress 13.5.0

## Features

- **AI Chat Interface**: Real-time streaming AI conversations with code generation
- **Project Management**: View and manage projects on mobile devices
- **Theme Support**: Light, Dark, and Auto (system-preference) themes
- **GitHub Authentication**: Secure OAuth integration with JWT session management
- **Admin Dashboard**: Full administrative interface for system management
- **Responsive Design**: Optimized for mobile screens with native navigation patterns
- **Offline Support**: Capacitor plugins for local preferences and storage

## Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **bun** 1.3.10
- **Android Studio** (for Android development)
- **Xcode** 15.x or higher (for iOS development, macOS only)

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd apps/mobile
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Sync Capacitor platforms**

   ```bash
   bun ionic:sync
   ```

4. **Configure environment variables**
   Create a `.env` file in the project root with required API endpoints and keys.

## Development Scripts

The following npm scripts are available for local development and production builds:

### Development

- **`bun dev`**: Start the Vite development server for web-based development
- **`bun android`**: Run the app on an Android device/emulator with live reload and external access
- **`bun preview`**: Preview the production build locally

### Building

- **`bun build`**: Compile TypeScript and build for production using Vite
- **`bun prebuild`**: Run TypeScript type checking before build (automatically runs with build)
- **`bun ionic:build`**: Build the Ionic application (alias for build)

### Capacitor Operations

- **`bun ionic:sync`**: Sync web assets to native platforms (required after code changes)

### Code Quality

- **`bun lint`**: Run ESLint to check code quality
- **`bun typecheck`**: Run TypeScript compiler to verify type correctness without emitting files

### Testing

- **`bun test.unit`**: Run unit tests using Vitest
- **`bun test.e2e`**: Run end-to-end tests using Cypress

### Ionic-Specific Commands

Additional Ionic CLI commands can be executed using bunx:

```bash
bunx ionic capacitor add ios          # Add iOS platform
bunx ionic capacitor add android     # Add Android platform
bunx ionic capacitor open ios         # Open iOS project in Xcode
bunx ionic capacitor open android     # Open Android project in Android Studio
bunx ionic capacitor build ios        # Build iOS app
bunx ionic capacitor build android    # Build Android app
```

## Project Structure

```
apps/mobile/
├── src/
│   ├── components/          # Reusable UI components
│   ├── constants/           # Application constants and theme definitions
│   ├── contexts/            # React Context providers (Auth, Theme)
│   ├── lib/                 # Utility libraries (API client, storage)
│   ├── pages/               # Page components and screens
│   │   ├── admin/          # Administrative interface pages
│   │   ├── Chat.tsx        # AI chat interface
│   │   ├── Projects.tsx    # Project management
│   │   ├── Settings.tsx    # User settings
│   │   ├── Login.tsx       # Authentication pages
│   │   └── ...
│   ├── theme/              # Ionic CSS variables and custom styling
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main application component with routing
│   └── main.tsx            # Application entry point
├── android/                 # Android native project
├── public/                  # Static assets
├── capacitor.config.ts     # Capacitor configuration
├── ionic.config.json        # Ionic framework configuration
├── vite.config.ts           # Vite build configuration
├── tsconfig.json            # TypeScript compiler configuration
└── package.json             # Project dependencies and scripts
```

## Key Dependencies

### Runtime Dependencies

- **@ionic/react (^8.5.0)**: Core Ionic React framework components
- **@ionic/react-router (^8.5.0)**: Ionic integration with React Router
- **react (19.0.0)**: React library for building user interfaces
- **react-dom (19.0.0)**: React DOM rendering library
- **react-router-dom (^5.3.4)**: Declarative routing for React applications
- **ionicons (^7.4.0)**: Premium icon pack for Ionic applications

### Capacitor Plugins

- **@capacitor/android (8.0.2)**: Android platform support
- **@capacitor/app (8.0.0)**: App lifecycle and information
- **@capacitor/browser (^8.0.0)**: In-app browser capabilities
- **@capacitor/core (8.0.2)**: Core Capacitor runtime
- **@capacitor/haptics (8.0.0)**: Haptic feedback engine
- **@capacitor/keyboard (8.0.0)**: Keyboard management
- **@capacitor/preferences (^8.0.0)**: Local data storage
- **@capacitor/status-bar (8.0.0)**: Status bar styling and control

### Development Dependencies

- **@capacitor/cli (8.0.2)**: Capacitor command-line interface
- **typescript (~5.9.0)**: TypeScript compiler
- **vite (^5.0.0)**: Next-generation build tool
- **@vitejs/plugin-react (^4.0.1)**: Vite plugin for React
- **@vitejs/plugin-legacy (^5.0.0)**: Support for older browsers
- **vitest (0.34.6)**: Fast unit testing framework
- **cypress (^13.5.0)**: End-to-end testing framework
- **eslint (^9.20.1)**: Code linting and quality checks
- **prettier (^3.8.1)**: Code formatting

## Configuration Files

### Capacitor Configuration

The [`capacitor.config.ts`](capacitor.config.ts) file defines app metadata and platform settings:

```typescript
{
  appId: "com.magicappdev",
  appName: "MagicAppDev",
  webDir: "dist"
}
```

### Ionic Configuration

The [`ionic.config.json`](ionic.config.json) file configures the Ionic framework:

```json
{
	"name": "Magic App Dev",
	"type": "react-vite",
	"integrations": {"capacitor": {}}
}
```

### Vite Configuration

The [`vite.config.ts`](vite.config.ts) file configures the build tool with React and legacy browser support.

## Development Workflow

### Local Development with Browser

For rapid development without native platforms:

```bash
bun dev
```

This starts the Vite dev server at `http://localhost:5173`.

### Native Platform Development

For testing on actual devices or emulators:

**Android:**

```bash
# Ensure Android device/emulator is connected
bun android
```

**iOS:**

```bash
# Add iOS platform (first time only)
bunx ionic capacitor add ios

# Sync and open in Xcode
bun ionic:sync
bunx ionic capacitor open ios
```

### Building for Production

1. **Build the web application**

   ```bash
   bun build
   ```

2. **Sync to native platforms**

   ```bash
   bun ionic:sync
   ```

3. **Open in native IDE and build**

   ```bash
   bunx ionic capacitor open android  # or ios
   ```

## Architecture

### Component Architecture

The application follows a modular component architecture:

- **Pages**: Top-level route components ([`pages/`](src/pages/))
- **Components**: Reusable UI elements ([`components/`](src/components/))
- **Contexts**: Global state management ([`contexts/`](src/contexts/))
- **Libraries**: API clients and utilities ([`lib/`](src/lib/))

### State Management

State is managed through React Context API:

- **AuthContext**: Authentication state and user session management
- **ThemeProvider**: Theme preferences (Light/Dark/Auto) with persistence

### Routing

The app uses React Router with Ionic's navigation components:

- Tab-based navigation for authenticated users
- Protected routes for authenticated and admin sections
- Redirect logic based on authentication state

### Theme System

The application supports three theme modes:

1. **Light**: Always use light theme
2. **Dark**: Always use dark theme
3. **Auto**: Follow system preferences (default)

Theme values are defined in [`src/constants/theme.ts`](src/constants/theme.ts) and applied via Ionic CSS variables.

## Platform-Specific Notes

### Android

- Minimum SDK: Defined in `android/app/build.gradle`
- Target SDK: Configured for latest stable release
- Cleartext traffic enabled for development (see [`capacitor.config.ts`](capacitor.config.ts))

### iOS

- Requires macOS with Xcode 15.x or higher
- Minimum iOS version: Defined in Xcode project settings
- Auto-signing configured for development builds

## Testing

### Unit Tests

Run unit tests with Vitest:

```bash
bun test.unit
```

Tests are configured to use jsdom environment with global test variables.

### End-to-End Tests

Run E2E tests with Cypress:

```bash
bun test.e2e
```

Cypress configuration is defined in [`cypress.config.ts`](cypress.config.ts).

## Troubleshooting

### Common Issues

**Capacitor sync fails**

- Ensure the native platform is added: `bunx ionic capacitor add android` or `bunx ionic capacitor add ios`
- Check that the build output exists: `bun build` before running `bun ionic:sync`

**Android build errors on Windows**

- Path length issues have been resolved in this configuration
- Ensure `JAVA_HOME` is set correctly
- Verify Android SDK is installed and accessible

**TypeScript errors during build**

- Run `bun typecheck` to identify type issues
- Ensure all dependencies are installed: `bun install`

**Hot module replacement not working**

- Use `bun dev` for web development
- For native, use `bun android` which enables live reload

## Contributing

When contributing to this project:

1. Run the full quality check before committing: `bun lint && bun typecheck`
2. Follow the existing code style and patterns
3. Add tests for new features
4. Update documentation as needed

## License

This project is part of the MagicAppDev monorepo. Refer to the main project license for details.

## Support

For issues, questions, or contributions, refer to the main MagicAppDev project documentation.
