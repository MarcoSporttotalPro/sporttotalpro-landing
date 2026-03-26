# SPORTTOTAL PRO -- Landing Page (sporttotalpro.com)

## Project Overview

Static "Coming Soon" landing page for SPORTTOTAL PRO AG. Features an interactive particle animation background with mouse interaction, glassmorphism header, and responsive design.

**Domain:** sporttotalpro.com
**Stack:** Static HTML/CSS/JS (no build step)
**Font:** Outfit (Google Fonts)

---

## Infrastructure

| Service | Detail |
|---------|--------|
| **GitHub Repo** | MarcoSporttotalPro/sporttotalpro-landing |
| **Hosting** | Netlify (project: sporttotalpro-landing) |
| **Netlify Site ID** | 00e76bc5-75f6-4461-9889-80c7158f13a9 |
| **Netlify URL** | sporttotalpro-landing.netlify.app |
| **Custom Domain** | sporttotalpro.com |
| **DNS Provider** | Hetzner (ns1.your-server.de) |
| **Auto-Deploy** | Enabled -- push to `master` triggers deploy |
| **SSL** | Automatic via Netlify (Let's Encrypt) |

---

## DNS Changes at Hetzner (2026-03-26)

The domain sporttotalpro.com was previously pointing to a Hetzner server (78.47.73.212). The following DNS changes were made to redirect traffic to Netlify:

### Records Changed

| Type | Name | Old Value | New Value |
|------|------|-----------|-----------|
| A | @ | 78.47.73.212 | 75.2.60.5 |
| A | www | 78.47.73.212 | 75.2.60.5 |

### Records Deleted

| Type | Name | Value | Reason |
|------|------|-------|--------|
| AAAA | @ | 2a01:4f8:d0a:52d0::2 | Netlify does not use IPv6 for custom domains |
| AAAA | www | 2a01:4f8:d0a:52d0::2 | Same reason |

### Records Unchanged

All other records were kept as-is:

- **MX** (@ -> www412.your-server.de) -- mail delivery
- **SRV** (_autodiscover, _imaps, _pop3s, _submission) -- mail service discovery
- **TXT** (SPF, DKIM) -- mail authentication
- **CNAME** (autoconfig -> mail.your-server.de) -- mail client autoconfiguration
- **CNAME** (fcp -> fcp-control-center.netlify.app) -- FCP subdomain (separate Netlify project)
- **NS, SOA** -- DNS authority records

---

## File Structure

```
NEXUS/
  index.html          Main landing page
  style.css           Styles (CSS variables, animations, responsive)
  script.js           Particle animation with mouse interaction
  netlify.toml        Netlify config (headers, publish dir)
  robots.txt          Search engine crawler rules
  assets/
    STPro_icon_bg.png         Favicon / OG image
    STPro_icon_bg_white.png   White variant
    icon_bright.svg/png       Header icon (bright)
    icon_dark.svg/png         Dark variant
    icon_pink.svg/png         Main logo (pink)
```

---

## Deployment

Auto-deploy is enabled. Every push to `master` triggers a Netlify build.

Manual deploy (if needed):
```bash
npx netlify deploy --dir=. --prod
```

---

## Previous Server (for reference)

The Hetzner server at 78.47.73.212 (IPv6: 2a01:4f8:d0a:52d0::2) previously hosted the site. It still handles mail for sporttotalpro.com via the MX/SRV/TXT records.
