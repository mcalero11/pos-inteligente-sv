# POS Inteligente El Salvador 🚀

Sistema de punto de venta (POS) offline-first diseñado específicamente para el mercado salvadoreño. Arquitectura multi-cliente con sincronización inteligente usando tecnologías modernas.

## 🎯 Visión del Producto

Crear una solución POS resiliente que funcione sin internet, sincronice automáticamente cuando hay conexión, y democratice el acceso a tecnología avanzada para comercios de todos los tamaños en El Salvador.

## 🏗️ Arquitectura Multi-Cliente

El sistema consta de tres aplicaciones especializadas:

### 1. **Desktop POS (Tauri)** - Operación Offline-First
- Cliente principal para punto de venta
- SQLite para almacenamiento local rápido
- Sincronización automática con polling inteligente
- Acceso directo a hardware (impresoras, lectores)

### 2. **Web Admin (React)** - Gestión Centralizada
- Panel de administración y configuración
- Reportes y análisis de datos en tiempo real
- Gestión de usuarios y permisos
- Configuración de productos y precios

### 3. **Backend API (Go)** - Núcleo del Sistema
- PostgreSQL con change log para sincronización
- Integración con Ministerio de Hacienda (DTE)
- Autenticación passwordless (WhatsApp/Email/Google)
- API REST con polling adaptativo

## ✨ Características Principales

- **100% Offline-First**: Vende sin internet, sincroniza cuando hay conexión
- **Sincronización Inteligente**: Change log pattern con resolución de conflictos
- **Facturación Electrónica**: Integración completa con el sistema DTE
- **UI Moderna**: Sistema de temas con personalización de colores
- **Multi-sucursal**: Sincronización entre terminales y con la nube
- **Hardware Nativo**: Soporte para impresoras, cajones, lectores
- **Autenticación Segura**: Sin contraseñas, usa WhatsApp o email

## 🚀 Tecnologías Clave

### Cliente Desktop (Tauri)
- **Tauri + Rust**: Framework nativo multiplataforma
- **React + TypeScript**: Interfaz de usuario moderna
- **SQLite**: Base de datos local ultrarrápida
- **Tailwind CSS**: Diseño responsive y temas

### Cliente Web Admin
- **React 18 + TypeScript**: UI moderna y type-safe
- **Vite**: Build tool ultra-rápido
- **TanStack Query**: Gestión de estado del servidor
- **Tailwind CSS**: Diseño consistente

### Backend
- **Go**: Alto rendimiento y concurrencia
- **PostgreSQL**: Base de datos principal con change log
- **Redis**: Cache y gestión de sesiones
- **JWT**: Autenticación stateless

## 📋 Estado del Desarrollo

### ✅ Completado
- Arquitectura de 3 clientes establecida
- Investigación completa de DTE
- Sistema de tipos compartidos
- Endpoint de firmado DTE
- Componentes UI principales (diálogos, temas)
- Decisión de arquitectura SQLite + PostgreSQL

### 🚧 En Progreso (Sprint 2: 40%)
- Flujo completo de ventas
- Integración SQLite local
- Servicio de sincronización
- Generación de facturas (FCF)

### 📅 Próximamente
- Soporte para todos los tipos de DTE
- Integración con hardware POS
- Sincronización en tiempo real
- Panel de analytics avanzado

## 🚀 Comenzando

### Prerequisitos
- Node.js 18+
- Go 1.21+
- Rust 1.70+
- PostgreSQL 14+
- Docker & Docker Compose

### Instalación Rápida

```bash
# Clonar el repositorio
git clone git@github.com:mcalero11/pos-inteligente-sv.git
cd pos-inteligente-sv

# Copiar variables de entorno
cp .env.example .env

# Iniciar servicios con Docker
docker-compose up

# En otra terminal, iniciar el cliente Tauri
cd desktop
pnpm install
pnpm tauri dev
```

### Acceso a las Aplicaciones

- **Desktop POS**: Se abre automáticamente con `pnpm tauri dev`
- **Web Admin**: http://localhost:5173
- **API Backend**: http://localhost:8080
- **API Docs**: http://localhost:8080/swagger

## 📖 Documentación

- [Arquitectura del Sistema](./docs/ARCHITECTURE.md)
- [Estado del Proyecto](./PROJECT_STATUS.md)
- [Decisiones Técnicas](./docs/decisions/)
- [API Reference](./docs/API.md)
- [Guía de Desarrollo](./docs/DEVELOPMENT.md)

## 🛠️ Desarrollo

### Estructura del Monorepo

```
pos-inteligente-sv/
├── backend/          # API en Go
├── desktop/          # Cliente Tauri (POS)
├── web/              # Cliente React (Admin)
├── shared/           # Tipos TypeScript compartidos
├── docs/             # Documentación
└── docker/           # Configuraciones Docker
```

### Comandos Útiles

```bash
# Backend
cd backend && go run server.go

# Desktop (Tauri)
cd desktop && pnpm tauri dev

# Web Admin
cd web && pnpm dev

# Todos con Docker
docker-compose up
```

## 📊 Estado del Proyecto

Para información detallada sobre el progreso actual del desarrollo, consulta [PROJECT_STATUS.md](PROJECT_STATUS.md).

## 📝 Licencia

Este proyecto está licenciado bajo la Elastic License 2.0 - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **Marvin Calero** - *Desarrollador Principal* - [@mcalero11](https://github.com/mcalero11)

---

**Estado del Proyecto**: 🟢 En Desarrollo Activo | **Sprint 2**: 40% Completo
