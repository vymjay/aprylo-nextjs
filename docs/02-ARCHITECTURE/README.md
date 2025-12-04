# Architecture

This section covers the technical architecture, system design, and component relationships of the VB Cart application.

## 📋 Contents

### Core Architecture
- **STATE_MANAGEMENT_GUIDE.md**: Application state management patterns and implementation

### API Layer
- **API/**: Complete API documentation
  - Authentication endpoints
  - Product management APIs
  - Cart operations
  - User management

### Database Layer  
- **DB/**: Database documentation
  - Schema definitions
  - Migration guides
  - RLS (Row Level Security) configuration

### UI Layer
- **UI/**: User interface documentation
  - Component library
  - Design system
  - Styling guidelines

## 🏗️ System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (Supabase)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **State Management**: Zustand + React Query
- **Deployment**: Vercel

## 📐 Design Patterns

- **Component-based architecture**: Reusable UI components
- **API-first design**: RESTful API endpoints
- **Server-side rendering**: SSR with Next.js
- **Real-time updates**: Supabase real-time subscriptions
- **Type safety**: Full TypeScript implementation

## 🔗 Key Relationships

- Components use custom hooks for data fetching
- API routes handle business logic and database operations
- Supabase provides authentication and real-time features
- State management handles client-side application state
