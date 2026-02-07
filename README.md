# Demo AdServer

**Полнофункциональный рекламный сервер для российского рынка с Web SDK, Backend API и двумя порталами управления.**

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## Обзор

Demo AdServer — это демонстрационный рекламный сервер, предназначенный для малого бизнеса и маркетологов в России. Проект включает три основных компонента:

| Компонент | Технологии | Описание |
|-----------|------------|-----------|
| **Web SDK** | Vanilla JS, TypeScript | Лёгкий SDK (<5KB) для показа рекламы на сайтах издателей |
| **Backend API** | Go, PostgreSQL, Redis | Delivery API, Tracking API, Management API |
| **Publisher Portal** | Next.js 14, TypeScript | Портал для издателей — управление сайтами и статистика доходов |
| **Advertiser Portal** | Next.js 14, TypeScript | Портал для рекламодателей — создание кампаний и управление бюджетом |

---

## Архитектура

```
┌─────────────────┐     ┌─────────────────┐
│  Advertiser     │     │   Publisher     │
│  Portal         │     │   Portal        │
│  (Next.js)      │     │   (Next.js)     │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │    Management API    │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │   Backend API (Go)    │
         │                       │
         │  • Delivery API       │
         │  • Tracking API       │
         │  • Management API     │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │  PostgreSQL + Redis   │
         └───────────────────────┘
                     │
         ┌───────────▼───────────┐
         │   Publisher Sites     │
         │   (с Web SDK)         │
         └───────────────────────┘
```

---

## Возможности

### Для Рекламодателей
- **Мастер создания кампаний** — 4-шаговый wizard с валидацией
- **Загрузка баннеров** — Drag & drop, HTML5, AMPHTML поддержка
- **Таргетинг** — География, устройства, время, категории сайтов
- **Контроль бюджета** — Hard caps, дневные лимиты, уведомления
- **Статистика в реальном времени** — Показы, клики, CTR, eCPM

### Для Издателей
- **Управление сайтами** — Добавление сайтов, создание рекламных мест
- **Генерация кода** — Готовый JavaScript код для интеграции
- **Статистика доходов** — Доходы по сайтам и периодам
- **Real-time updates** — Live счётчик показов и доходов

### Technical Features
- **Clean Architecture** — Domain → Application → Infrastructure → Presentation
- **Auto-moderation** — Автоматическая проверка баннеров
- **Graceful degradation** — Работа при fallback на кэш
- **Rate limiting** — 100 req/min per IP (Redis)

---

## Быстрый старт

### Требования
- Go 1.21+
- Node.js 20+
- PostgreSQL 14+
- Redis 7+

### 1. Запуск Backend

```bash
cd backend

# Настройка БД
createdb adserver
psql adserver < migrations/schema.sql

# Конфигурация
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_NAME=adserver

export REDIS_HOST=localhost
export REDIS_PORT=6379

# Запуск
go run cmd/server/main.go
```

Backend запустится на `http://localhost:8080`

### 2. Запуск Publisher Portal

```bash
cd publisher-portal
npm install
npm run dev
```

Доступен на `http://localhost:3001`

### 3. Запуск Advertiser Portal

```bash
cd advertiser-portal
npm install
npm run dev
```

Доступен на `http://localhost:3002`

---

## API Endpoints

### Delivery API
```
GET /api/v1/delivery/{slot_id}
```
Возвращает рекламный креатив для показа на сайте издателя.

### Tracking API
```
POST /api/v1/track/impression
POST /api/v1/track/click
```
Отслеживание показов и кликов.

### Management API
```
GET    /api/v1/campaigns
POST   /api/v1/campaigns
GET    /api/v1/campaigns/{id}
PUT    /api/v1/campaigns/{id}
DELETE /api/v1/campaigns/{id}
```

---

## Структура проекта

```
demo-adserver/
├── backend/              # Go Backend API
│   ├── cmd/              # EntryPoint
│   ├── src/
│   │   ├── domain/       # Entities (Campaign, Banner, ...)
│   │   ├── application/  # Use cases, DTOs
│   │   ├── infrastructure/ # PostgreSQL, Redis
│   │   └── presentation/ # HTTP handlers
│   └── migrations/       # SQL миграции
│
├── publisher-portal/    # Next.js портал издателей
│   ├── app/             # App Router
│   ├── components/      # UI компоненты
│   └── lib/             # API клиенты, hooks
│
├── advertiser-portal/   # Next.js портал рекламодателей
│   ├── app/             # App Router
│   ├── components/      # UI компоненты
│   └── lib/             # API клиенты, hooks
│
└── docs/                # Документация
```

---

## Тесты

### Backend
```bash
cd backend
go test ./...
```

### Publisher Portal
```bash
cd publisher-portal
npm test              # Unit tests (Vitest)
npm run test:e2e      # E2E tests (Playwright)
```

### Advertiser Portal
```bash
cd advertiser-portal
npm test              # Unit tests (Vitest)
npm run test:e2e      # E2E tests (Playwright)
```

**Покрытие:**
- Backend: ~88% (domain + application)
- Publisher Portal: 81%+
- Advertiser Portal: 73/73 tests passing

---

## Docker

### Полный стек

```bash
docker-compose up -d
```

Запустит:
- PostgreSQL на порту 5432
- Redis на порту 6379
- Backend на порту 8080
- Publisher Portal на порту 3001
- Advertiser Portal на порту 3002

---

## Лицензия

MIT License — см. [LICENSE](LICENSE)

---

## Ссылки

- **GitHub:** https://github.com/fall-out-bug/sdp-adserver-demo

---

*Demo AdServer для российского рынка*
