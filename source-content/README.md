# Website Content - Ready for Next.js Docs Site

This folder contains all content ready to be dropped into your Next.js documentation website.

## 📋 Quick Overview

**Scope:** Solo part-time developer
**Pages:** 3 core docs + 3 legal pages
**Videos:** 2 main videos (~20-25 min total)
**Tech Stack:** Next.js + MDX + Tailwind
**Strategy:** Video-first approach (people don't want to read much)

## 🎥 Video-First Strategy

**Key principle: People don't want to read much.**

Each page has:
1. ✅ **Video embed at the very top** (primary content delivery)
2. ✅ **"Prefer to read? Scroll down"** (optional text for those who want details)
3. ✅ **Section-specific video embeds** (with timestamps) for deep dives

**Why this works:**
- Visual learners get video immediately
- Text readers can scroll past video
- Videos increase engagement and trust
- Reduces bounce rate

**Video placement:**
- **Top of page** = Full tutorial (all content)
- **Within sections** = Same video, but jumps to specific timestamp
  - Example: Response Strategies section embeds same video with `?start=130` to jump to 2:10
  - One video per page, multiple embeds with different timestamps
  - Each major heading = one timestamp section

---

## 📄 Documentation Pages (3 MD files)

### Core Documentation (VIDEO-FIRST APPROACH)

1. **01-QUICK-START.md**
   - **Video embed at top** (10–12 min "Get Started & Core Features")
   - Installation (Package Manager & Asset Store)
   - Run Demo Scene
   - Create first endpoint
   - **Core features deep dive:**
     - Response Strategies (Sequential, Random, Weighted) ⭐
     - Offline Mode
     - Environments & Variables
     - Collections & Folders
     - Session Management basics ⭐
     - OpenAPI overview
     - Error Simulation
   - Target: `/docs/quick-start`
   - **Format:** Video first, then written guide + feature sections

2. **03-GUIDES.md**
   - **Video embed at top** (10-min advanced use cases)
   - Development workflows
   - Testing & QA
   - Prototyping APIs
   - Debugging with sessions
   - Team collaboration
   - Extending Demo Scene
   - Target: `/docs/guides`
   - **Format:** Video first, then step-by-step written guides

**Note:** Currently uses Unity's UnityWebRequest. For other HTTP libraries (RestSharp, HttpClient, etc.), users can extend ApiInterceptor class or use mocked responses directly in their code.

3. **04-API-REFERENCE.md**
   - Quick reference cheat sheet
   - ApiClient methods
   - ApiGlobalConfig
   - EnvironmentManager
   - SessionManager
   - Configuration options
   - Troubleshooting FAQ
   - Target: `/docs/api-reference`

**Note:** Focus on `ApiClient` class - most users only need to know how to use `ApiClient.GetAsync()`, `ApiClient.PostAsync()`, etc. Internal classes (SessionManager, EndpointCollection) are for advanced users extending the tool.

---

## 🎥 Video Scripts (2 detailed scripts)

### Video Production Guides

1. **VIDEO-01-OVERVIEW-QUICK-START.md**
   - Duration: 10–12 minutes
   - Shot-by-shot script
   - Voiceover transcript
   - Installation → Demo → First endpoint
   - Core features tour (Response Strategies, Offline Mode, Environments, Collections, basic Sessions, OpenAPI, Error Simulation)
   - **Note:** Demo scene already has 2 buttons (Get Users, Get Posts). Video uses existing demo - no code changes needed. To add a 3rd button, use another JSONPlaceholder endpoint like `/comments` - minimal code: copy existing button handler, change URL.
   - YouTube description template included
   - Target: YouTube + embedded in `/videos`

2. **VIDEO-03-ADVANCED-USE-CASES.md**
   - Duration: 8-10 minutes
   - Testing workflows
   - Session replay debugging
   - OpenAPI integration
   - Team collaboration
   - Target: YouTube + embedded in `/videos`

**📌 After recording and uploading videos to YouTube:**
- Replace `YOUR_VIDEO_ID` in `01-QUICK-START.md` → actual YouTube ID
- Replace `YOUR_VIDEO_ID_3` in `03-GUIDES.md` → actual YouTube ID
- Example: `https://www.youtube.com/embed/dQw4w9WgXcQ`

---

## 📋 How to Use These Files

### For Next.js Documentation Site

1. **Copy MD files to Next.js content folder:**
   ```bash
   cp 01-QUICK-START.md /path/to/nextjs/content/docs/quick-start.md
   cp 03-GUIDES.md       /path/to/nextjs/content/docs/guides.md
   cp 04-API-REFERENCE.md /path/to/nextjs/content/docs/api-reference.md
   ```

2. **Add frontmatter if needed:**
   ```yaml
   ---
   title: "Quick Start"
   description: "Get your first mock API working in 5 minutes"
   ---
   ```

3. **Update internal links:**
   - All files link to each other with relative paths
   - May need to adjust based on your routing setup

### For Video Production

1. **Print video scripts** or display on second monitor

2. **Prepare assets beforehand:**
   - OpenAPI spec files
   - Test collections
   - Code examples
   - Diagrams/animations

3. **Follow shot-by-shot guide** for consistent quality

4. **Use YouTube description templates** included in each script

---

## ✅ Content Quality Checklist

**Documentation Pages:**
- [x] Code examples are syntax-highlighted
- [x] All code is copy-pasteable
- [x] Screenshots/diagrams referenced (need to be created)
- [x] Internal links between pages
- [x] Clear headings and structure
- [x] Table of contents in each page
- [x] Real-world examples
- [x] Troubleshooting sections

**Video Scripts:**
- [x] Timestamps for YouTube
- [x] Shot-by-shot breakdown
- [x] Voiceover transcripts
- [x] Code examples prepared
- [x] B-roll ideas included
- [x] YouTube description templates
- [x] Hashtags and SEO keywords

---

## 🎨 Next Steps

### Before Deploying Docs:

1. **Create screenshots:**
   - Unity Editor with API Mocking Toolkit window
   - Demo Scene running
   - Inspector views of endpoints
   - Console output examples

2. **Create diagrams:**
   - Architecture flow (Request → ApiClient → Mock/Real)
   - Response Strategies visual comparison
   - Environment variable scope diagram
   - Session replay workflow

3. **Test all code examples:**
   - Copy each code snippet
   - Run in Unity
   - Verify it works
   - Fix any typos

4. **Add meta information:**
   - Page titles
   - Descriptions for SEO
   - Open Graph images
   - Twitter Card tags

### Before Recording Videos:

1. **Set up recording environment:**
   - Clean Unity project
   - Clear console


---

## 📄 Legal Pages (Need to Create)

### **5. Privacy Policy** (REQUIRED)

Even if you don't collect data, you need this page.

**Simple Template:**
```markdown
API Mocking Toolkit does not collect, store, or transmit any personal data.
The Unity asset runs entirely locally on your device.

This documentation website uses:
- Vercel for hosting (see Vercel Privacy Policy)
- YouTube embeds for video tutorials (see YouTube Privacy Policy)

We do not use cookies or track users.

Last updated: [DATE]
Contact: [EMAIL]
```

### **6. Terms of Service / EULA** (REQUIRED)

**Key Points:**
```markdown
- Single developer license (clarify your terms)
- Cannot redistribute the asset
- Cannot resell or sublicense
- Provided "as is" without warranty
- Not liable for any damages
- Support provided via [email/Discord] on best-effort basis
```

### **7. Contact / Support** (RECOMMENDED)

**Content:**
- Email: support@backendsimulator.dev (or your email)
- Discord: [link] (if you have one)
- GitHub Issues: [link] (if applicable)
- Response time: "We aim to respond within 2-3 business days"
- FAQ / Known Issues
- How to report bugs

---

## 🚀 Launch Timeline (Solo Developer)

**Week 1-2:** Write documentation (DONE ✅)
**Week 3-4:** Record & edit videos
**Week 5-6:** Build Next.js site
**Week 7:** Deploy & launch

**Total:** ~7 weeks part-time

---

## 🎯 Site Structure

```
apimockingtoolkit.codecarnage.com
├── / (Home - marketing)
├── /docs/
│   ├── quick-start
│   ├── guides
│   └── api-reference
├── /videos/ (optional - or embed on each page)
├── /changelog/
├── /privacy/ (Privacy Policy - REQUIRED)
├── /terms/ (Terms of Service - REQUIRED)
└── /contact/ (Contact/Support - RECOMMENDED)
```

**Footer Links (every page):**
- Privacy Policy
- Terms of Service
- Contact
- Asset Store
- Changelog

---

## 💡 Tech Stack Recommendations

- **Framework:** Next.js 14 (App Router)
- **Content:** MDX (Markdown + React)
- **Styling:** Tailwind CSS
- **Highlighting:** Shiki
- **Search:** Simple text search (start basic, add Algolia later if needed)
- **Deployment:** Vercel (free tier)
- **No CMS needed** - Docs in git repo

**Keep it simple!** Ship fast, iterate based on user feedback.

   - Zoom Editor for visibility
   - Good microphone

2. **Prepare demo assets:**
   - Collections pre-configured
   - Endpoints ready to demo
   - Test scripts prepared
   - Bug scenario setup

3. **Practice first:**
   - Rehearse voiceover
   - Test screen recording quality
   - Verify cursor is visible
   - Check audio levels

---

## 📦 File Structure for Next.js

Suggested Next.js app structure:

```
nextjs-docs/
├── app/
│   ├── docs/
│   │   ├── quick-start/
│   │   │   └── page.mdx (from 01-QUICK-START.md)
│   │   ├── guides/
│   │   │   └── page.mdx (from 03-GUIDES.md)
│   │   └── api-reference/
│   │       └── page.mdx (from 04-API-REFERENCE.md)
│   ├── videos/
│   │   └── page.tsx (embed YouTube videos)
│   ├── privacy/
│   │   └── page.mdx
│   ├── terms/
│   │   └── page.mdx
│   └── contact/
│       └── page.mdx
├── public/
│   └── images/
│       └── screenshots/ (add Unity screenshots here)
└── components/
    └── CodeBlock.tsx (syntax highlighting)
```

---

## 🔗 Internal Link Structure

All pages link to each other:

- Quick Start → Guides (see workflows)
- Guides → API Reference (code examples)
- API Reference → Quick Start (get started)

**Circular navigation ensures users can explore naturally.**

---

## 📊 Content Statistics

- **Total pages:** 4 core docs + 3 legal pages = 7 pages
- **Total videos:** 3 videos (~30 minutes total)
- **Code examples:** 50+ copy-pasteable snippets
- **Screenshots needed:** ~20-30
- **Diagrams needed:** ~5-7

**Manageable for solo developer!**

---

## 🚀 Ready to Ship

These files are production-ready. Copy to your Next.js repo and deploy!

**Need to create:**
- Legal pages (Privacy, Terms, Contact)
- Screenshots
- Diagrams
- Record videos

**Everything else is done!**
