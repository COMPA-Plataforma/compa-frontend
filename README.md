# COMPA Frontend

> COMPA - Acompañamiento estudiantil: interfaz web para el sistema de gestión de orientadores y estudiantes

**React 18 | TypeScript | Vite | Tailwind CSS | Vercel**

---

## Descripción del Proyecto

COMPA es una aplicación web diseñada para orientadores que necesitan gestionar la información clínica de sus estudiantes, hacer seguimiento de su estado de salud y asignarles planes de hábitos diarios. Los estudiantes pueden realizar un registro diario (check-in) de su estado emocional y el cumplimiento de sus tareas en menos de 30 segundos.

El sistema garantiza que el historial clínico nunca se elimina físicamente, mantiene trazabilidad de todos los cambios de estado con justificación, y genera rachas de cumplimiento para motivar al estudiante.

---
## Equipo de Desarrollo

| Nombre | Rol |
|--------|-----|
| Andrea Marin Diaz | Desarrolladora FullStack | 
| Mariana  Carvajal Rueda | Desarrolladora FullStack |

---
---

## Arquitectura del Proyecto

El proyecto sigue una estructura modular orientada a funcionalidades:

```
src/
├── components/
│   ├── dialogs/        → Modales: crear estudiante, ficha clínica, plan de hábitos, acudiente
│   └── ui/             → Componentes de diseño base (shadcn/ui)
├── pages/              → Vistas principales por ruta
├── services/           → Llamadas a la API REST del backend (axios)
├── hooks/              → Hooks reutilizables
├── types/              → Tipos e interfaces TypeScript
└── lib/
    ├── axiosConfig.ts  → Configuración base de axios e interceptores
    └── utils.ts        → Utilidades generales
```

---

## Cómo Correr el Proyecto Localmente

### Requisitos Previos

- Node.js 18+
- npm o bun
- Backend de COMPA corriendo en `http://localhost:8080`

### Pasos

**1. Clonar el repositorio:**
```bash
git clone 
cd lifetracker-WellnesFront-main
```

**2. Instalar dependencias:**
```bash
npm install
```

**3. Configurar la variable de entorno:**

Crea un archivo `.env` en la raíz del proyecto:
```env
VITE_API_URL=http://localhost:8080
```

**4. Correr en modo desarrollo:**
```bash
npm run dev
```

**5. Abrir en el navegador:**
```
http://localhost:5173
```

---

## Despliegue

El frontend está desplegado en **Vercel** de forma automática desde la rama `main`.

### Pasos para desplegar
