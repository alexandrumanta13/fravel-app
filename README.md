# Fravel App - Flight Booking Platform

Modern flight booking platform with Angular frontend and NestJS backend.

## 🏗️ Project Structure

```
fravel-app/
├── frontend/          # Angular Frontend (Port 4200)
├── backend/           # NestJS Backend (Port 3000)  
├── shared/            # Shared types between FE/BE
├── docker-compose.yml # Development environment
└── README.md
```

## 🚀 Quick Start

### Development Environment (Docker)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services  
docker-compose down
```

### Local Development
```bash
# Backend
cd backend
npm run start:dev

# Frontend  
cd frontend
npm start
```

## 🛠️ Tech Stack

**Frontend:**
- Angular 17
- TypeScript
- SCSS
- Angular Material

**Backend:** 
- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- JWT Authentication

**DevOps:**
- Docker & Docker Compose
- Railway (Production)

## 📋 Features

- ✅ Flight search (TravelFusion API)
- ✅ Flight booking
- ✅ User authentication
- ✅ Booking management
- ✅ Multi-language support (EN/RO)

## 🌐 Deployment

Production deployment on Railway:
- **Frontend**: Static site deployment
- **Backend**: Container deployment
- **Database**: PostgreSQL managed service

---
Created with ❤️ using Angular + NestJS