# Revitalize Web — SEO Workflow Manager

A purpose-built internal tool for managing the full SEO content workflow at Revitalize Web.

## Features

### Step 1 — Copy & SEO
- Rich text editor with H2/H3 heading controls (marked for web developer handoff)
- SEO Metadata: keywords, meta title (60 char), meta description (160 char)
- External links tracker (minimum 2 required)
- Internal links tracker (minimum 2 required)
- Live SEO checklist sidebar

### Step 2 — Photos
- Add unlimited photos per post
- Per-photo fields: URL, caption, alt text, attribution, attribution URL
- Optional SEO & geo fields: image title, keywords, latitude, longitude, meta description

### Step 3 — Post Summary
- Full SEO audit with issue detection
- Google SERP preview
- One-click "Copy Dev Handoff" — formatted plain text with everything the web developer needs
- Mark as Published status

## Getting Started

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Data Storage

All posts are saved to `localStorage` — no backend required. Posts persist across sessions in the same browser.

## SEO Requirements Enforced

| Requirement | Rule |
|---|---|
| Keywords | At least 1 |
| Meta Title | Present, ≤60 characters |
| Meta Description | 120–160 characters |
| H2/H3 Headings | At least 1 in copy |
| External Links | Minimum 2 |
| Internal Links | Minimum 2 |
| Photos | At least 1 with caption, alt text, attribution |

## Tech Stack

- React 18
- React Router 6
- Lucide React (icons)
- localStorage (persistence)
- No backend required
