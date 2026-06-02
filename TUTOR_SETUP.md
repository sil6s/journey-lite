# Open edX (Tutor) Setup Guide
> JourneyLite Patient Education Portal

This document covers everything needed to deploy, configure, and import courses
into the Open edX instance that powers the JourneyLite patient education portal.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Local Development Setup](#2-local-development-setup)
3. [Connect the Next.js App](#3-connect-the-nextjs-app)
4. [Import Bariatric Courses](#4-import-bariatric-courses)
5. [Set Up OAuth2 SSO](#5-set-up-oauth2-sso)
6. [Enroll Patients](#6-enroll-patients)
7. [Production Deployment](#7-production-deployment)
8. [Upgrading Tutor](#8-upgrading-tutor)
9. [Useful Commands](#9-useful-commands)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Docker | ≥ 24 | Docker Desktop on Mac/Windows |
| Docker Compose | ≥ 2.0 | Bundled with Docker Desktop |
| Python | ≥ 3.8 | For Tutor CLI |
| pip | latest | `pip install --upgrade pip` |

---

## 2. Local Development Setup

### 2a. Install Tutor

```bash
pip install "tutor[full]"
# Verify
tutor --version
```

Or download the pre-compiled binary:
```bash
sudo curl -L "https://github.com/overhangio/tutor/releases/download/v21.0.6/tutor-$(uname -s)_$(uname -m)" \
  -o /usr/local/bin/tutor
sudo chmod 0755 /usr/local/bin/tutor
```

### 2b. One-click launch

```bash
tutor local launch
```

You'll be asked:
- **LMS hostname**: `local.edly.io` (default for local dev — leave as-is)
- **CMS hostname**: `studio.local.edly.io`
- **Platform name**: `JourneyLite`
- **Admin email**: your email
- **Admin password**: choose a secure password

This downloads Docker images and boots the full platform (~5–10 min first run).

### 2c. Access the platform

| URL | Purpose |
|---|---|
| http://local.edly.io:8000 | LMS (learner-facing) |
| http://studio.local.edly.io:8001 | Studio (course authoring) |
| http://local.edly.io:8000/admin/ | Django admin |

> **Note:** Add `127.0.0.1 local.edly.io studio.local.edly.io` to `/etc/hosts` if
> the hostnames don't resolve automatically on your machine.

---

## 3. Connect the Next.js App

Add these to `.env.local`:

```bash
# Local dev
NEXT_PUBLIC_OPENEDX_LMS_URL=http://local.edly.io:8000
NEXT_PUBLIC_OPENEDX_CMS_URL=http://studio.local.edly.io:8001
```

The `lib/openedx/config.ts` file reads these and exposes helper functions used
throughout the portal (`edxCourseCatalogUrl()`, `edxDashboardUrl()`, etc.).

---

## 4. Import Bariatric Courses

The existing bariatric course content (exported from Sanity) has been
pre-converted to Open edX OLX format:

```
exports/olx/
├── surgical-pre-op-course-dietary-module.tar.gz  (9 sections, 26 lessons)
└── surgical-pre-op-course-medical-module.tar.gz  (14 sections, 64 lessons)
```

### 4a. Import via Studio (easiest)

1. Log into Studio: http://studio.local.edly.io:8001
2. Click **New Course** to create a placeholder (use any slug — you'll overwrite it)
3. Go to **Tools → Import**
4. Upload `surgical-pre-op-course-dietary-module.tar.gz`
5. Click **Replace my course's content**
6. Repeat for the medical module

### 4b. Import via CLI (faster for bulk)

```bash
# Copy the archives into the Tutor container
docker cp exports/olx/surgical-pre-op-course-dietary-module.tar.gz \
  "$(tutor local dc exec -T cms hostname):/tmp/"

# Run the import management command
tutor local exec cms bash -c \
  "python manage.py cms import /tmp/ /tmp/surgical-pre-op-course-dietary-module.tar.gz"
```

### 4c. Re-generate OLX from Sanity export

If you need to regenerate the OLX packages (e.g., after updating the export):

```bash
python3 scripts/generate-openedx-olx.py --org JourneyLite --run 2026
```

Options:
```
--org    Open edX organization name (default: JourneyLite)
--run    Course run identifier     (default: 2026)
--input  Path to JSON export       (default: exports/education-course-details.json)
--output Output directory          (default: exports/olx/)
```

---

## 5. Set Up OAuth2 SSO

SSO lets users registered in Open edX also access other JourneyLite portal
features without a second login.

### 5a. Create an OAuth2 application in Open edX

1. Go to http://local.edly.io:8000/admin/
2. **OAuth2 → Applications → Add Application**
3. Fill in:
   - **Client type**: Confidential
   - **Authorization grant type**: Authorization code
   - **Name**: `JourneyLite Portal`
   - **Redirect uris**: `http://localhost:3000/api/auth/openedx/callback`
4. Save and copy the **Client ID** and **Client Secret**

### 5b. Add to `.env.local`

```bash
OPENEDX_CLIENT_ID=<client-id-from-step-5a>
OPENEDX_CLIENT_SECRET=<client-secret-from-step-5a>
```

### 5c. Test the callback

Visit `http://localhost:3000/api/auth/openedx/callback?code=test` — you should
get a JSON error (not a 500), which confirms the route is live.

---

## 6. Enroll Patients

### Via Instructor Dashboard (recommended for individual patients)

1. Open the course in Studio
2. Go to **Instructor → Membership → Batch Enrollment**
3. Paste patient email addresses (one per line)
4. Click **Enroll**

### Via REST API (for programmatic enrollment)

```bash
# Enroll a user via the Open edX Enrollment API
curl -X POST http://local.edly.io:8000/api/enrollment/v1/enrollment \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "course_details": {"course_id": "course-v1:JourneyLite+SURGICAL_PRE_OP_COURSE_DIETARY_M+2026"},
    "email_opt_in": true,
    "is_active": true,
    "mode": "audit",
    "user": "patient@email.com"
  }'
```

### Get an admin JWT token

```bash
tutor local exec lms bash -c \
  "python manage.py lms generate_jwt_signing_key 2>/dev/null ; \
   python -c \"
from openedx.core.djangoapps.oauth_dispatch.jwt import create_jwt_for_user
from django.contrib.auth import get_user_model
u = get_user_model().objects.get(username='admin')
print(create_jwt_for_user(u))
\""
```

---

## 7. Production Deployment

### 7a. Server requirements

- Ubuntu 22.04 LTS (recommended)
- 4 vCPU, 8 GB RAM minimum (16 GB recommended)
- 50 GB SSD storage
- Open ports: 80, 443
- Domain names: `learn.journeylite.com`, `studio.journeylite.com`

### 7b. Install Tutor on the server

```bash
pip install "tutor[full]"
```

### 7c. Configure

```bash
tutor config save \
  --set LMS_HOST=learn.journeylite.com \
  --set CMS_HOST=studio.journeylite.com \
  --set PLATFORM_NAME="JourneyLite" \
  --set ENABLE_HTTPS=true
```

### 7d. Launch

```bash
tutor local launch
```

Tutor automatically obtains Let's Encrypt TLS certificates.

### 7e. Update Next.js production environment

```bash
# .env.production (on your server / Vercel env vars)
NEXT_PUBLIC_OPENEDX_LMS_URL=https://learn.journeylite.com
NEXT_PUBLIC_OPENEDX_CMS_URL=https://studio.journeylite.com
OPENEDX_CLIENT_ID=<production-client-id>
OPENEDX_CLIENT_SECRET=<production-client-secret>
```

---

## 8. Upgrading Tutor

```bash
pip install --upgrade "tutor[full]"
tutor local stop
tutor local upgrade
tutor local start
```

Always test upgrades in local dev first.

---

## 9. Useful Commands

```bash
# Start/stop Open edX
tutor local start
tutor local stop
tutor local restart

# View logs
tutor local logs --follow lms
tutor local logs --follow cms

# Create a staff/admin user
tutor local createuser --superuser admin admin@journeylite.com

# Open a shell in the LMS container
tutor local exec lms bash

# Run Django management commands
tutor local exec lms python manage.py lms <command>
tutor local exec cms python manage.py cms <command>

# Import a course from CLI
tutor local exec cms python manage.py cms import /tmp/ /tmp/<course>.tar.gz

# Export a course from CLI
tutor local exec cms python manage.py cms export \
  course-v1:JourneyLite+COURSE_ID+2026 /tmp/
```

---

## 10. Troubleshooting

### Hostnames don't resolve
Add to `/etc/hosts`:
```
127.0.0.1 local.edly.io studio.local.edly.io
```

### "Address already in use" on port 8000/8001
```bash
tutor local stop
# Check for conflicting processes:
sudo lsof -i :8000
```

### Course import fails
- Make sure the `.tar.gz` contains the correct OLX directory at the top level
- Regenerate with `python3 scripts/generate-openedx-olx.py` and retry

### OAuth2 callback returns 401
- Verify `OPENEDX_CLIENT_ID` / `OPENEDX_CLIENT_SECRET` match what's in Django Admin
- Check the redirect URI exactly matches (including trailing slash)

### Database migrations pending
```bash
tutor local exec lms python manage.py lms migrate
tutor local exec cms python manage.py cms migrate
```

---

## Architecture Reference

```
journeylite.com (Next.js on Vercel)
│
├── /blog, /about, /shop, etc.  ← Sanity CMS + Shopify
│
├── /dashboard                  ← Supabase auth + Open edX links
│
└── /courses → 302 redirect ──→ learn.journeylite.com (Open edX / Tutor)
                                  ├── Course catalog
                                  ├── Lesson viewer
                                  ├── Progress tracking
                                  ├── Quizzes
                                  ├── Certificates
                                  └── Instructor dashboard
```

**Code locations:**
- `lib/openedx/config.ts` — URL config + helpers
- `lib/openedx/client.ts` — REST API client (catalog, enrollment, OAuth2)
- `lib/openedx/types.ts`  — TypeScript types for Open edX API responses
- `app/api/auth/openedx/callback/route.ts` — OAuth2 callback handler
- `scripts/generate-openedx-olx.py` — OLX course importer
- `exports/olx/` — Pre-built course archives ready for Studio import
