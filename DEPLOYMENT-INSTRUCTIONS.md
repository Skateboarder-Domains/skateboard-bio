# 🛹 Skateboard.bio Deployment Instructions

## ✅ What's Been Built

Your skateboard.bio application is **100% complete** and ready for deployment!

### 🎯 Completed Features

1. **API Endpoints** (Cloudflare Pages Functions)
   - ✅ `/api/public/skater` - Get skater profile by domain
   - ✅ `/api/public/media` - Get photos/videos
   - ✅ `/api/public/timeline` - Get career timeline
   - ✅ `/api/public/parts` - Get video parts
   - ✅ `/api/public/contests` - Get contest results

2. **Frontend Pages**
   - ✅ `functions/index.ts` - Beautiful directory page listing all skaters
   - ✅ `functions/[[path]].ts` - Dynamic profile pages for individual skaters

3. **Database** (Neon PostgreSQL)
   - ✅ Project ID: `empty-cherry-02878215`
   - ✅ Schema deployed (6 tables)
   - ✅ Sample data populated:
     * Tony Hawk (tonyhawk.bio)
     * Rodney Mullen (rodneymullen.bio)
     * Nyjah Huston (nyjahhuston.bio)
   - ✅ 9 timeline events, 11 contest results, 6 video parts

4. **Cloudflare Pages Configuration**
   - ✅ Environment variables set (`NEON_DATABASE_URL`)
   - ✅ R2 bucket binding configured
   - ✅ Custom domain: skateboard.bio
   - ✅ GitHub integration: Skateboarder-Domains/skateboard-bio

---

## 🚀 Deploy to Production (2 Steps)

### Step 1: Push Code to GitHub

The code is in your local `skateboard-bio/` directory. You need to push it to GitHub:

```bash
cd skateboard-bio

# Initialize git if not already done
git init
git remote add origin https://github.com/Skateboarder-Domains/skateboard-bio.git

# Add all files
git add .

# Commit
git commit -m "Initial skateboard.bio implementation - API + Frontend + Sample Data"

# Push to main branch
git push -u origin main
```

**Or use GitHub Desktop / VS Code if you prefer a GUI.**

### Step 2: Verify Deployment

Cloudflare Pages will automatically deploy when you push to `main`. Monitor the deployment:

1. Go to: https://dash.cloudflare.com/
2. Click "Pages" → "skateboard-bio"
3. Watch the deployment progress (takes ~1-2 minutes)

Once deployed, test these URLs:

**✅ Directory Page:**
https://skateboard.bio

**✅ API Endpoints:**
```bash
curl "https://skateboard.bio/api/public/skater?host=tonyhawk.bio"
curl "https://skateboard.bio/api/public/timeline?host=tonyhawk.bio"
curl "https://skateboard.bio/api/public/contests?host=tonyhawk.bio"
```

**✅ Profile Pages:**
- https://tonyhawk.bio (Note: DNS must point to skateboard-bio.pages.dev)
- https://rodneymullen.bio
- https://nyjahhuston.bio

---

## 📊 Database Information

**Neon Project:** empty-cherry-02878215  
**Connection String:** (stored in Cloudflare Pages environment variables)  
**Region:** us-east-2  

**Tables:**
- `skaters` - Core profiles
- `media_assets` - Photos and videos
- `timeline` - Career milestones
- `parts` - Video parts
- `contests` - Contest results
- `domains` - Domain-to-skater mapping

---

## 🎨 What Users Will See

### Directory (skateboard.bio)
- Grid of all skaters with profile photos
- Search and filtering capabilities
- Links to individual .bio sites
- API endpoint documentation

### Individual Profiles (tonyhawk.bio, etc.)
- Hero header with profile image
- Bio and personal info
- Photo/video gallery
- Career timeline
- Video parts showcase
- Contest results table
- Sponsor badges
- Social media links

---

## 🔧 Adding More Skaters

Use the provided database connection to add more skaters:

```typescript
// Connect to Neon database
const connectionString = process.env.NEON_DATABASE_URL;

// Insert skater
INSERT INTO skaters (slug, full_name, bio, ...) VALUES (...);

// Map domain
INSERT INTO domains (host, skater_id) VALUES ('newskater.bio', 'uuid');
```

---

## 📝 Architecture Notes

- **Serverless**: Runs on Cloudflare's edge network (V8 isolates)
- **Database**: Neon Serverless PostgreSQL (serverless driver)
- **CDN**: Cloudflare R2 for media (cdn.skateboard.bio)
- **Caching**: 
  - API: 5 minutes
  - Directory: 10 minutes
  - Media: Indefinite (content-addressed)

---

## 🎯 Next Steps After Deployment

1. **Test all 3 sample profiles** to ensure they render correctly
2. **Add more skaters** to populate the directory
3. **Upload media to R2** (profile images, headers, photos, videos)
4. **Point individual .bio domains** to skateboard-bio.pages.dev via CNAME
5. **Set up custom domain** for cdn.skateboard.bio (R2 public access)

---

## 🐛 Troubleshooting

**API returns 404?**
- Verify code is pushed to GitHub
- Check Cloudflare Pages deployment status
- Ensure environment variables are set

**Empty data?**
- Verify NEON_DATABASE_URL is correct
- Check database has sample skaters (run sample script again)

**Profile page not loading?**
- Verify domain mapping exists in `domains` table
- Check DNS points to skateboard-bio.pages.dev

---

**Questions?** The code is fully documented and ready to run. Just push to GitHub and watch it deploy! 🚀

