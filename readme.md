# MercadoFácil IA (Frontend App)

App móvil para automatizar la creación de publicaciones en Mercado Libre con IA

[English Version](#project-overview)

---

## Ver la demo

[![Video demo](images/readme/demo-thumbnail-spanish.jpg)](https://youtu.be/h2vEqL_I9pU?si=0lVIruNuDzCA_ObJ)

## Características

- **Captura y Selección de Fotos**: Usa la cámara del dispositivo o la galería para capturar imágenes de productos
- **Análisis Potenciado por IA**: El backend analiza imágenes usando la API de Claude Sonnet 4
- **Publicaciones Automatizadas**: Crea publicaciones de productos en Mercado Libre automáticamente
- **Actualizaciones de Estado en Tiempo Real**: Servicio de sondeo monitorea el progreso de creación de publicaciones
- **UI Moderna**: Interfaz limpia construida con NativeWind (Tailwind CSS para React Native)

## Arquitectura

### Stack Frontend
- **React Native** con framework Expo
- **TypeScript** para seguridad de tipos
- **NativeWind** para estilos (variante Tailwind CSS)
- **expo-image-picker** para captura y selección de fotos

### Integración Backend
- Carga directa de imágenes a la API backend
- Sondeo de estado en tiempo real con patrón Observer
- Protección de defensa en profundidad contra "race conditions"

### Flujo de Procesamiento de Imágenes
1. Usuario captura/selecciona fotos de productos
2. Imágenes redimensionadas a 1500px (dimensión mayor) para optimización de ancho de banda
3. Carga directa al servicio backend
4. Backend analiza imágenes con API de Claude Sonnet 4
5. Creación automatizada de listado en Mercado Libre
6. Notificaciones de estado al frontend
7. Mostrar enlace permanente del listado o mensajes de error

## Estructura del Proyecto

```
src/
├── App.tsx                     # Punto de entrada principal de la aplicación
├── components/
│   ├── Container.tsx           # Contenedor SafeAreaView con estilos consistentes
│   └── PhotoUploadScreen.tsx       # Componente de diseño de pantalla principal
└── services/
    └── productStatusService.ts # Servicio de sondeo con patrón Observer
```

## Desarrollo

### Requisitos Previos
- Node.js (con gestor de paquetes pnpm)
- Expo CLI
- Entorno de desarrollo React Native

### Instalación

```bash
# Instalar dependencias
pnpm install

# Crear archivo de entorno
cp .env.example .env
# Editar .env con tus credenciales de la API backend
```

### Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
pnpm start

# Desarrollo específico por plataforma
pnpm run ios      # Simulador iOS
pnpm run android  # Emulador Android
pnpm run web      # Navegador web

# Calidad de código
pnpm run lint     # Ejecutar verificaciones ESLint y Prettier
pnpm run format   # Auto-corregir problemas de ESLint y formatear código

# Compilación
pnpm run prebuild # Generar código nativo
```

## Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# URL del Backend
BACKEND_API_URL=

# Para validación de carga de imágenes
FRONTEND_API_KEY=
```

### Alias de Rutas

El proyecto usa alias de rutas para importaciones más limpias:
- `@/*` apunta a `src/*`

## Convención de Estilos

La aplicación usa clases NativeWind en objetos de estilo para consistencia:

```typescript
const styles = {
  container: 'flex flex-1 m-6',
  title: 'text-xl font-bold',
  button: 'bg-blue-500 px-4 py-2 rounded'
};
```

## Servicio de Sondeo de Estado

La aplicación implementa un servicio de sondeo sofisticado con patrón Observer:

### Características Clave
- **API tipo Pub/Sub**: Interfaz de suscripción/desuscripción para actualizaciones de estado
- **Sondeo cada 5 segundos**: Verificaciones regulares al endpoint de estado del backend
- **Auto-limpieza**: Desuscripción automática al completar
- **Resiliencia ante errores**: Manejo robusto de errores con degradación elegante

### Ejemplo de Uso
```typescript
import { subscribeToProduct, unsubscribeFromProduct } from '@/services/productStatusService';

// Suscribirse a actualizaciones de producto
subscribeToProduct(productId, (payload) => {
  setProduct(payload.product);
  setStatus(payload.status);
  setMessage(payload.message);
});

// Limpieza manual (usualmente no necesaria debido a auto-desuscripción)
unsubscribeFromProduct(productId);
```

### Flujo de Estados
- `processing` → Backend está analizando imágenes y creando el listado
- `completed` → Listado creado exitosamente (muestra enlace permanente)
- `failed` → Ocurrió un error durante el procesamiento

## Manejo de Errores y Protección

La aplicación implementa múltiples capas de protección:

### Protección a Nivel de UI
- Botones deshabilitados durante el procesamiento para prevenir envíos duplicados
- Botón de reinicio solo aparece después de completar
- Flujo de producto único previene operaciones concurrentes

### Protección a Nivel de Aplicación
- Validación de ID de producto previene contaminación cruzada
- Protecciones contra condiciones de carrera y respuestas retrasadas del backend

### Protección a Nivel de Servicio
- Limpieza automática previene fugas de memoria
- Manejo integral de errores con degradación elegante
- Recuperación ante fallas de red

## Integración Backend

### Endpoints de API

#### Carga de Imágenes
```
POST ${BACKEND_API_URL}/api/image/uploads
```

#### Sondeo de Estado
```
GET ${BACKEND_API_URL}/webhook/{productId}/status
```

### Formato de Respuesta

```typescript
interface PollingPayload {
  productId: string;
  status: 'processing' | 'completed' | 'failed';
  message?: string;
  product?: {
    mercado_libre_listing?: {
      permalink: string;
    };
  };
}
```

---

## Project Overview

A React Native mobile application built with Expo that enables users to capture or select product photos and automatically create Mercado Libre listings through AI-powered image analysis.

## Watch the demo

[![Demo video](images/readme/demo-thumbnail-english.jpg)](https://youtu.be/cE6Fz6G4dP0?si=IcW5nnk49CJxh4ba)

## Features

- **Photo Capture & Selection**: Use device camera or photo library to capture product images
- **Intelligent Image Processing**: Automatic image resizing to 1500px for optimal bandwidth usage
- **AI-Powered Analysis**: Backend service analyzes images using Claude API
- **Automated Listings**: Creates Mercado Libre product listings automatically
- **Real-time Status Updates**: Polling service monitors listing creation progress
- **Modern UI**: Clean interface built with NativeWind (Tailwind CSS for React Native)

## Architecture

### Frontend Stack
- **React Native** with Expo framework
- **TypeScript** for type safety
- **NativeWind** for styling (Tailwind CSS variant)
- **expo-image-picker** for photo capture and selection

### Backend Integration
- Direct image upload to backend API
- Real-time status polling with Observer pattern
- Defense-in-depth protection against race conditions

### Image Processing Workflow
1. User captures/selects product photos
2. Images resized to 1500px (larger dimension) for bandwidth optimization
3. Direct upload to backend service
4. Backend analyzes images with Claude API
5. Automated Mercado Libre listing creation
6. Status notifications back to frontend
7. Display listing permalink or error messages

## Project Structure

```
src/
├── App.tsx                     # Main application entry point
├── components/
│   ├── Container.tsx           # SafeAreaView wrapper with consistent styling
│   └── PhotoUploadScreen.tsx       # Main screen layout component
└── services/
    └── productStatusService.ts # Polling service with Observer pattern
```

## Development

### Prerequisites
- Node.js (with pnpm package manager)
- Expo CLI
- React Native development environment

### Installation

```bash
# Install dependencies
pnpm install

# Create environment file
cp .env.example .env
# Edit .env with your backend API credentials
```

### Available Scripts

```bash
# Start development server
pnpm start

# Platform-specific development
pnpm run ios      # iOS simulator
pnpm run android  # Android emulator
pnpm run web      # Web browser

# Code quality
pnpm run lint     # Run ESLint and Prettier checks
pnpm run format   # Auto-fix ESLint issues and format code

# Build
pnpm run prebuild # Generate native code
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Backend URL
BACKEND_API_URL=

# For image upload validation
FRONTEND_API_KEY=
```

### Path Aliases

The project uses path aliases for cleaner imports:
- `@/*` points to `src/*`

## Styling Convention

The app uses NativeWind classes in style objects for consistency:

```typescript
const styles = {
  container: 'flex flex-1 m-6',
  title: 'text-xl font-bold',
  button: 'bg-blue-500 px-4 py-2 rounded'
};
```

## Status Polling Service

The app implements a sophisticated polling service with Observer pattern:

### Key Features
- **Pub/Sub-like API**: Subscribe/unsubscribe interface for status updates
- **5-second polling**: Regular checks to backend status endpoint
- **Auto-cleanup**: Automatic unsubscription on completion
- **Error resilience**: Robust error handling with graceful degradation

### Usage Example
```typescript
import { subscribeToProduct, unsubscribeFromProduct } from '@/services/productStatusService';

// Subscribe to product updates
subscribeToProduct(productId, (payload) => {
  setProduct(payload.product);
  setStatus(payload.status);
  setMessage(payload.message);
});

// Manual cleanup (usually not needed due to auto-unsubscribe)
unsubscribeFromProduct(productId);
```

### Status Flow
- `processing` → Backend is analyzing images and creating listing
- `completed` → Listing successfully created (displays permalink)
- `failed` → Error occurred during processing

## Error Handling & Protection

The app implements multiple layers of protection:

### UI-Level Protection
- Disabled buttons during processing to prevent duplicate submissions
- Reset button only appears after completion
- Single product workflow prevents concurrent operations

### Application-Level Protection
- Product ID validation prevents cross-contamination
- Guards against backend race conditions and delayed responses

### Service-Level Protection
- Automatic cleanup prevents memory leaks
- Comprehensive error handling with graceful degradation
- Network failure recovery

## Backend Integration

### API Endpoints

#### Image Upload
```
POST ${BACKEND_API_URL}/api/image/uploads
```

#### Status Polling
```
GET ${BACKEND_API_URL}/webhook/{productId}/status
```

### Response Format

```typescript
interface PollingPayload {
  productId: string;
  status: 'processing' | 'completed' | 'failed';
  message?: string;
  product?: {
    mercado_libre_listing?: {
      permalink: string;
    };
  };
}
```
