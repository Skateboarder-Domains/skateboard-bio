# Skateboard.bio

**Central API and Directory for the Skateboard.bio Network**

This repository powers [skateboard.bio](https://skateboard.bio) - the centralized API and directory that serves data to 150+ individual skateboarder .bio domains.

## 🏗️ Architecture

- **Platform**: Cloudflare Pages Functions (Edge runtime)
- **Database**: Neon Serverless PostgreSQL
- **CDN**: Cloudflare R2 (cdn.skateboard.bio)
- **Domains**: 150+ individual .bio sites pulling from this API

## 📂 Project Structure

```
skateboard.bio/
├── functions/
│   ├── index.ts                  # Server-rendered directory page
│   └── api/
│       └── public/
│           ├── skater.ts         # GET skater profile by domain
│           ├── media.ts          # GET media assets (photos/videos)
│           ├── timeline.ts       # GET career timeline events
│           ├── parts.ts          # GET video parts
│           └── contests.ts       # GET contest results
├── public/                       # Static assets
├── database-schema.sql           # Database schema
├── package.json
├── wrangler.toml
└── README.md
```

## 🚀 API Endpoints

All endpoints support CORS and are cached for 5 minutes.

### GET `/api/public/skater`

Get skater profile information.

**Query Parameters:**
- `host` (optional) - Domain name (e.g., `tonyhawk.bio`). Falls back to request host header.

**Example:**
```bash
curl "https://skateboard.bio/api/public/skater?host=tonyhawk.bio"
```

**Response:**
```json
{
  "id": "uuid",
  "slug": "tonyhawk",
  "full_name": "Tony Hawk",
  "nickname": "The Birdman",
  "bio": "Professional skateboarder...",
  "birth_date": "1968-05-12",
  "hometown": "San Diego, California",
  "stance": "goofy",
  "sponsors": ["Birdhouse", "Vans", "Independent"],
  "profile_image_url": "https://cdn.skateboard.bio/tonyhawk/profile.webp"
}
```

### GET `/api/public/media`

Get media assets (photos and videos) for a skater.

**Query Parameters:**
- `host` (required) - Domain name
- `type` (optional) - Filter by type: `image`, `video`, or `gif`

**Example:**
```bash
curl "https://skateboard.bio/api/public/media?host=tonyhawk.bio&type=video"
```

### GET `/api/public/timeline`

Get career timeline events for a skater.

**Query Parameters:**
- `host` (required) - Domain name
- `year` (optional) - Filter by year (e.g., `2020`)

### GET `/api/public/parts`

Get video parts for a skater.

**Query Parameters:**
- `host` (required) - Domain name

### GET `/api/public/contests`

Get contest results for a skater.

**Query Parameters:**
- `host` (required) - Domain name
- `year` (optional) - Filter by year

## 🗄️ Database Schema

The database includes the following tables:

- **skaters** - Core skateboarder profiles
- **media_assets** - Photos and videos
- **timeline** - Career milestones and events
- **parts** - Video parts
- **contests** - Contest results and placements
- **domains** - Domain-to-skater mapping (extends existing Domain Steward schema)

See `database-schema.sql` for the complete schema.

## ⚙️ Environment Variables

Set these in Cloudflare Pages Dashboard → Settings → Environment Variables:

### Required

- `NEON_DATABASE_URL` - PostgreSQL connection string
  ```
  postgresql://username:password@ep-xxx.neon.tech/neondb
  ```

### R2 Configuration

The R2 bucket is bound via `wrangler.toml`:
- Bucket name: `skateboarders`
- Custom domain: `cdn.skateboard.bio`
- All media URLs use: `https://cdn.skateboard.bio/{slug}/{filename}`

## 🔧 Development

### Prerequisites

```bash
npm install
```

### Local Development

```bash
# Run locally with Wrangler
npm run dev

# Test API endpoints
curl "http://localhost:8788/api/public/skater?host=tonyhawk.bio"
```

### Database Setup

The schema requires the `pgcrypto` extension for UUID generation.

Run the schema against your Neon database:

```bash
psql $NEON_DATABASE_URL < database-schema.sql
```

Or use the Neon SQL Editor in the dashboard and paste the contents of `database-schema.sql`.

**Note**: The schema automatically creates the `pgcrypto` extension if it doesn't exist. This extension is required for the `gen_random_uuid()` function used in all primary keys.

## 🚢 Deployment

### Automatic (Recommended)

Connected to GitHub - automatically deploys on push to `main` branch.

### Manual

```bash
npm run deploy
```

## 📊 How Individual .bio Sites Use This API

Each skateboarder's .bio site (e.g., tonyhawk.bio) is a static frontend that:

1. Automatically passes its domain in the `Host` header
2. Fetches profile data from `/api/public/skater`
3. Fetches media from `/api/public/media`
4. Fetches timeline from `/api/public/timeline`
5. Fetches video parts from `/api/public/parts`
6. Fetches contest results from `/api/public/contests`

**Example frontend code:**
```javascript
// Automatically uses the current domain's host header
const response = await fetch('https://skateboard.bio/api/public/skater');
const skater = await response.json();
```

## 🎯 Directory Page

The root URL [skateboard.bio](https://skateboard.bio) serves a server-rendered directory page listing all skateboarders with:

- Profile photos
- Links to individual .bio sites
- Search and filtering (future)
- Stats and metrics

## 📦 R2 Storage Structure

Media assets are stored in the `skateboarders` R2 bucket:

```
skateboarders/
  tonyhawk/
    profile.webp
    header.webp
    videos/
      trick1.mp4
  rodneymullen/
    profile.webp
    ...
```

Access via: `https://cdn.skateboard.bio/{path}`

## 🔄 Cache Strategy

- **API Endpoints**: Cached for 5 minutes (`max-age=300`)
- **Directory Page**: Cached for 10 minutes (`max-age=600`)
- **R2 Assets**: Cached indefinitely (content-addressed via filename)

Purge cache when adding new skaters via Cloudflare API.

## 🛠️ Tech Stack

- **Runtime**: Cloudflare Pages Functions (V8 isolates)
- **Database**: Neon Serverless PostgreSQL
- **ORM**: @neondatabase/serverless (native Neon driver)
- **CDN**: Cloudflare R2
- **DNS**: Cloudflare
- **Deployment**: Cloudflare Pages (automatic via GitHub)

## 📝 License

MIT

## 🤝 Contributing

This is a centralized system managing 150+ domains. Contact the maintainer before making changes.

---

**Powered by Cloudflare Pages + Neon PostgreSQL + R2 CDN**

Built with ❤️ for the skateboarding community
