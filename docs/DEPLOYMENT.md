# Kickstarter App - Deployment Guide

This guide covers deploying the Kickstarter app to various hosting platforms.

## Prerequisites

- App must be accessible via HTTPS in production
- CORS headers must be configured to allow the Frontier Wallet PWA to fetch metadata

## Allowed Origins

The following Frontier Wallet domains need access to your app:

- `http://localhost:5173` (development)
- `https://sandbox.os.frontiertower.io` (sandbox environment)
- `https://alpha.os.frontiertower.io` (production, early access, there will be dragons, design preview, use at your own risk)
- `https://beta.os.frontiertower.io` (production, internally QA'd and tested, no external audit, use at your own risk)
- `https://os.frontiertower.io` (production ready)

---

## Development

Already configured in `vite.config.ts`:

```bash
npm install
npm run dev
```

Runs on `http://localhost:5174`

---

## Deployment Options

### Option 1: Vercel (Recommended)

**1. Install Vercel CLI:**
```bash
npm i -g vercel
```

**2. Create `vercel.json`:**

A `vercel.json` is already included in this repo with CORS and security headers pre-configured. If you need to customize it, here's what each header does:

- **Access-Control-Allow-Origin**: Allows the Frontier Wallet PWA to fetch your app's metadata. Note: Vercel only supports a single origin per header value — use environment-based configuration or middleware for multiple origins.
- **Content-Security-Policy**: Restricts which resources your app can load. The included policy allows framing by all Frontier Wallet environments via `frame-ancestors`.
- **X-Content-Type-Options**: Prevents MIME-type sniffing.
- **Referrer-Policy**: Controls how much referrer information is sent.
- **Permissions-Policy**: Disables unnecessary browser APIs.

**3. Deploy:**
```bash
vercel --prod
```

**4. Configure Domain:**
Set custom domain to `kickstarter.appstore.frontiertower.io` in Vercel dashboard.

---

### Option 2: Netlify

**1. Install Netlify CLI:**
```bash
npm i -g netlify-cli
```

**2. Create `netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "https://os.frontiertower.io, https://alpha.os.frontiertower.io, https://beta.os.frontiertower.io, https://sandbox.os.frontiertower.io"
    Access-Control-Allow-Methods = "GET, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type"
```

**3. Deploy:**
```bash
netlify deploy --prod
```

**4. Configure Domain:**
Set custom domain to `kickstarter.appstore.frontiertower.io` in Netlify dashboard.

---

### Option 3: Nginx

**1. Build the app:**
```bash
npm run build
```

**2. Configure Nginx:**
```nginx
server {
    listen 443 ssl http2;
    server_name kickstarter.appstore.frontiertower.io;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/kickstarter/dist;
    index index.html;

    # CORS headers
    add_header Access-Control-Allow-Origin "https://os.frontiertower.io, https://alpha.os.frontiertower.io, https://beta.os.frontiertower.io, https://sandbox.os.frontiertower.io" always;
    add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type" always;

    # Handle OPTIONS preflight
    if ($request_method = OPTIONS) {
        return 204;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**3. Reload Nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### Option 4: Apache

**1. Build the app:**
```bash
npm run build
```

**2. Create `.htaccess` in `dist/`:**
```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "https://os.frontiertower.io, https://alpha.os.frontiertower.io, https://beta.os.frontiertower.io, https://sandbox.os.frontiertower.io"
    Header set Access-Control-Allow-Methods "GET, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type"
</IfModule>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

**3. Upload `dist/` contents to server**

---

### Option 5: Cloudflare Pages

**1. Create `_headers` file in `public/`:**
```
/*
  Access-Control-Allow-Origin: https://os.frontiertower.io, https://alpha.os.frontiertower.io, https://beta.os.frontiertower.io, https://sandbox.os.frontiertower.io
  Access-Control-Allow-Methods: GET, OPTIONS
  Access-Control-Allow-Headers: Content-Type
```

**2. Connect repository to Cloudflare Pages**

**3. Configure build:**
- Build command: `npm run build`
- Build output: `dist`

**4. Set custom domain:** `kickstarter.appstore.frontiertower.io`

---

## Testing Deployment

After deploying, test that CORS is working:

```bash
# Test CORS headers
curl -I https://kickstarter.appstore.frontiertower.io \
  -H "Origin: https://os.frontiertower.io"

# Should see:
# Access-Control-Allow-Origin: https://os.frontiertower.io
```

Or test in browser console:
```javascript
fetch('https://kickstarter.appstore.frontiertower.io')
  .then(r => console.log('CORS OK'))
  .catch(e => console.error('CORS Error:', e));
```

---

## Updating the Registry

After deploying, update the PWA's app registry:

**In `pwa/src/lib/apps/registry.ts`:**
```typescript
const APP_REGISTRY: AppMetadata[] = [
  {
    id: 'kickstarter',
    url: 'https://kickstarter.appstore.frontiertower.io',
    origin: 'https://kickstarter.appstore.frontiertower.io',
    version: '1.0.0',
    developer: {
      name: 'Frontier Tower',
      verified: true,
    },
    permissions: {
      wallet: true,
      storage: true,
      notifications: false,
    },
  } as AppMetadata,
];
```

---

## Troubleshooting

### CORS Error
**Problem:** Browser console shows CORS error when loading app.

**Solution:** 
1. Check that CORS headers are present: `curl -I https://your-app.com`
2. Verify origin matches exactly (no trailing slash)
3. Ensure HTTPS in production

### App Not Loading
**Problem:** App shows blank screen or error.

**Solution:**
1. Check browser console for errors
2. Verify app is accessible directly at its URL
3. Check CSP headers in PWA allow the app domain

### Metadata Not Fetching
**Problem:** App doesn't appear in store or shows default icon.

**Solution:**
1. Verify `index.html` has proper meta tags:
   - `<title>Your App Name</title>`
   - `<meta name="description" content="...">`
   - `<link rel="icon" href="/favicon.svg">`
2. Test metadata fetch: `curl https://your-app.com`

---

## Security Notes

- Always use HTTPS in production
- Never use `Access-Control-Allow-Origin: *` in production
- Keep the allowed origins list minimal
- Regularly update dependencies: `npm audit fix`
- Always include a `Content-Security-Policy` header with `frame-ancestors` set to the Frontier Wallet domains — this prevents your app from being embedded by unauthorized sites
- Include `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin` on all deployment targets
