# AI Chatbot with Subscription System

A full-stack AI chatbot application built with Next.js, TypeScript, Prisma, and PostgreSQL. Features a subscription-based quota system with free tier and paid plans.

## Features

### Core Functionality
- **AI Chat Interface** - Interactive chat with mocked OpenAI responses
- **Free Tier** - 3 free messages per month for every user
- **Subscription Plans** - Basic, Pro, and Enterprise tiers with different message limits
- **Auto-Renewal** - Configurable auto-renewal for subscriptions
- **Monthly Quota Reset** - Automatic quota reset on 1st of every month

### Subscription Plans
| Plan | Messages/Month | Price | Features |
|------|---------------|-------|----------|
| Basic | 10 | $9.99/month | Standard AI model, Email support |
| Pro | 100 | $19.99/month | Fast AI model, Priority support |
| Enterprise | Unlimited | $99.99/month | Custom AI models, Dedicated support |

### Technical Features
- **Clean Architecture** - Domain-Driven Design (DDD) with separated layers
- **Type Safety** - Full TypeScript implementation
- **Database** - PostgreSQL with Prisma ORM
- **RESTful API** - Proper API design with structured responses
- **Error Handling** - Comprehensive error handling and user feedback

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Cookie-based session management

## Key Components

- **ChatInterface**: Main chat UI with quota display
- **SubscriptionPlan**: Subscription modal with plan selection
- **AutoRenewToggle**: Auto-renewal toggle component
- **Header**: App header with subscription status

## Chat API

- POST /api/chat - Process chat message with quota checking

## Subscription APIs

- GET /api/subscription - Get user's subscriptions
- POST /api/subscription - Create new subscription
- PATCH /api/subscriptions/[id] - Update subscription (auto-renew)
- POST /api/subscriptions/[id]/cancel - Cancel subscription
- POST /api/subscriptions/[id]/failed - Failed subscription

### Usage Flow

- **New User**: Starts with 3 free messages
- **Free Usage**: Uses free messages with real-time quota display
- **Quota Exceeded**: Subscription modal appears automatically
- **Subscription**: User selects plan and continues chatting
- **Monthly Reset**: Quotas reset automatically on 1st of each month

## Testing Subscription Flow

- Send 3 Free Messages to AI
- When the user reach its limit the Plans Modal Appear
- Subscribe to Basic Blan(or whatever you want)
- The user can toggle auto renew toggle on or off whenever he wants.
- Cancel the Subscription by the Cancel Button on the header

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/MahnoorKhushbakht/MahnnoorKhushbakht.git
   cd my-app