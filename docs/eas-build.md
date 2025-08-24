# EAS Build Process

This document outlines the complete process for creating builds using Expo Application Services (EAS).

## Prerequisites

- Node.js and pnpm installed
- Expo account
- Project configured with EAS

## Step 1: Install EAS CLI

Install the EAS CLI globally:

```bash
npm install -g @expo/eas-cli
```

Verify installation:
```bash
eas --version
```

## Step 2: Login to EAS

Authenticate with your Expo account:

```bash
eas login
```

This will open a browser window for authentication or prompt for credentials in the terminal.

## Step 3: Setup Environment Variables

Before building, you need to configure environment variables for your target environment.

### Using the Custom Script

Run the environment variables setup script:

```bash
# For preview builds (default)
./scripts/setup-eas-env-vars.sh

# For production builds
./scripts/setup-eas-env-vars.sh production

# For development builds
./scripts/setup-eas-env-vars.sh development
```

### Manual Setup (Alternative)

You can also set environment variables manually:

```bash
eas env:create --name CLOUDINARY_CLOUD_NAME --value your_value --visibility sensitive --environment preview
eas env:create --name CLOUDINARY_UPLOAD_PRESET --value your_value --visibility sensitive --environment preview
# ... repeat for all variables
```

### Verify Environment Variables

Check that all variables were created:

```bash
eas env:list
```

## Step 4: Run EAS Build

Create your build for the desired platform and profile:

### All Platforms
```bash
eas build --platform all --profile preview
```

### Android Only
```bash
eas build --platform android --profile preview
```

### iOS Only
```bash
eas build --platform ios --profile preview
```

### Production Build
```bash
eas build --platform all --profile production
```

## Build Profiles

The project uses these build profiles (defined in `eas.json`):

- **`preview`** - For testing and preview builds
- **`production`** - For app store releases
- **`development`** - For development builds with dev tools

## Required Environment Variables

Make sure these environment variables are configured before building:

- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_FOLDER` - Folder for storing images (usually "app-images")  
- `CLOUDINARY_UPLOAD_PRESET` - Cloudinary upload preset
- `BACKEND_API_URL` - URL of your backend service
- `FRONTEND_WEBHOOK_SECRET` - Secret for webhook authentication

## Troubleshooting

### Build Fails Due to Missing Environment Variables

1. Check if variables exist: `eas env:list`
2. Re-run the setup script: `./scripts/setup-eas-env-vars.sh`
3. Verify your `.env` file has all required values

### Authentication Issues

1. Re-login: `eas login`
2. Check account access: `eas whoami`

### Build Queue Issues

- Check build status: `eas build:list`
- Cancel stuck builds: `eas build:cancel [build-id]`

## Build Artifacts

After successful build:

- **Android**: `.apk` or `.aab` file
- **iOS**: `.ipa` file
- Builds are available in EAS dashboard
- Download links provided in terminal output

## Next Steps

After build completion:

1. **Preview builds**: Install via QR code or download link
2. **Production builds**: Submit to app stores using `eas submit`
3. **Testing**: Share with team or testers

## Useful Commands

```bash
# View build history
eas build:list

# Check build details
eas build:view [build-id]

# Cancel a build
eas build:cancel [build-id]

# View project info
eas project:info

# List all environment variables
eas env:list

# Delete an environment variable
eas env:delete --name VARIABLE_NAME
```