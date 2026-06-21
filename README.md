# Young & Talented (YAT)

A full-featured talent discovery and networking platform for young people in sports, arts, entertainment, and professional fields. YAT combines social networking, talent showcasing, job matching, learning, and community features into a single progressive web app.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui + Radix UI |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| State | TanStack React Query |
| Routing | React Router DOM v6 |
| Forms | React Hook Form + Zod |
| Maps | Mapbox GL |
| i18n | Custom context (EN / FR / RU) |
| PWA | Service Worker + Web Manifest |

## Features

### For Talents
- Public profile with portfolio, resume, skills, and achievements
- YAT Score — ranking system based on activity and endorsements
- Aptitude testing to validate skills
- Feed of posts and social activity
- Media hub (photos, videos, music player)
- Shorts video content feed
- Experience and education history

### Discovery & Opportunities
- YAT Karta — geographic talent map powered by Mapbox
- Job marketplace with AI-powered matching (`suggest-jobs`)
- Work opportunities board
- Contract management
- Agent/representative system

### Organizations
- Organization profiles and marketplace
- Job postings manager
- Team management
- Community groups

### Learning & Events
- Learning hub with course recommendations
- Event discovery and management
- Live broadcasting and streaming
- YAT TV — curated video content

### Platform Economy
- YAT Coin — rewards and talent economy system
- YAT Marketplace — buy/sell services
- YAT Database — searchable talent directory

### AI & Automation
- AI Assistant for search and recommendations (`ai-assistant`, `ai-search`)
- AI Agent (`ai-agent`)
- Auto-sync from external social sources
- Content moderation (`moderate-content`)
- Profile scraping and enrichment
- Scheduled post publishing

### Auth & Verification
- Supabase Auth with email/password
- OAuth: Telegram, VK
- Verification badge system
- Admin panel and moderation tools

## Project Structure

```
young-talent-network/
├── src/
│   ├── components/          # Feature-scoped UI components
│   │   ├── admin/           # Admin dashboard
│   │   ├── agent/           # Agent/representative features
│   │   ├── ai/              # AI assistant & search
│   │   ├── aptitude-test/   # Skill testing
│   │   ├── auth/            # Auth flows
│   │   ├── karta/           # Geographic map
│   │   ├── live/            # Live streaming
│   │   ├── music/           # Music player
│   │   ├── organizations/   # Org management
│   │   ├── profile/         # User profile
│   │   ├── talent-dashboard/
│   │   └── ui/              # shadcn/ui base components
│   ├── pages/               # 45+ route pages
│   ├── hooks/               # Custom React hooks
│   ├── contexts/            # MusicPlayer, Language providers
│   ├── integrations/
│   │   └── supabase/        # DB client and generated types
│   ├── i18n/                # Translations (en, fr, ru)
│   ├── data/                # Static data (countries, categories)
│   └── lib/                 # Utilities
├── supabase/
│   ├── functions/           # 20+ Deno edge functions
│   └── migrations/          # Database schema history
└── public/                  # Static assets, PWA manifest, service worker
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- (Optional) A [Mapbox](https://mapbox.com) API token for YAT Karta

### Environment Variables

Create a `.env` file at the project root:

```env
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
VITE_SUPABASE_PROJECT_ID=<project-id>
```

### Install and Run

```bash
npm install
npm run dev        # Development server on http://localhost:8080
npm run build      # Production build
npm run preview    # Preview the production build
```

### Supabase Setup

Apply database migrations:

```bash
supabase db push
```

Deploy edge functions:

```bash
supabase functions deploy
```

## Supabase Edge Functions

| Function | Purpose |
|---|---|
| `ai-agent` | Autonomous AI agent |
| `ai-assistant` | Conversational assistant |
| `ai-search` | AI-powered search |
| `auto-sync-sources` | Sync external social feeds |
| `extract-sport-profile` | Extract sports data from profiles |
| `import-social-feed` | Import external feed content |
| `match-candidates` | Match talents to job offers |
| `moderate-content` | Automated content moderation |
| `post-from-link` | Parse and post from a URL |
| `publish-scheduled` | Publish scheduled posts |
| `scrape-event` | Scrape event data |
| `scrape-profile` | Enrich user profiles |
| `search-self-online` | Find online presence |
| `seed-test-accounts` | Generate test data |
| `suggest-categories` | Recommend categories |
| `suggest-jobs` | AI job recommendations |
| `telegram-auth` | Telegram OAuth handler |
| `translate` | Translation service |
| `vk-auth` | VK OAuth handler |
| `yat-score` | Compute YAT Score |

## Internationalization

The app ships with translations for English, French, and Russian. Language is selected at runtime via the `LanguageContext` provider in `src/contexts/`.

To add a language, create a new translation file in `src/i18n/` and register it in the language context.

## PWA

The app includes a service worker (`public/service-worker.js`) and a web manifest (`public/manifest.json`), enabling installation on mobile devices and limited offline functionality.

## Scripts

```bash
npm run dev        # Start Vite dev server
npm run build      # TypeScript check + Vite production build
npm run build:dev  # Development build
npm run lint       # ESLint
npm run preview    # Serve production build locally
```

## License

Private — all rights reserved.
