# 🚀 Otimizações para GitHub Pages

## 📊 Performance Básica

### 1. Minificação de Arquivos
```html
<!-- Antes: arquivos separados -->
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="schedule.css">

<!-- Depois: arquivo único minificado -->
<link rel="stylesheet" href="styles.min.css">
```

### 2. Otimização de Imagens
```html
<!-- Usar WebP quando possível -->
<picture>
    <source srcset="image.webp" type="image/webp">
    <img src="image.jpg" alt="Description">
</picture>
```

### 3. Lazy Loading
```html
<img src="placeholder.jpg" data-src="real-image.jpg" loading="lazy" alt="Description">
```

---

## 🔧 Configurações .nojekyll

```bash
# Criar arquivo .nojekyll na raiz para bypass Jekyll
echo. > .nojekyll
```

**Quando usar:**
- ✅ Sites puramente HTML/CSS/JS
- ✅ Builds customizados
- ✅ Frameworks SPA (React, Vue, etc.)

---

## 📱 PWA (Progressive Web App)

### 1. Criar manifest.json
```json
{
    "name": "Cronograma IA/ML",
    "short_name": "CronogramaIA",
    "description": "Planejamento de estudos IA/ML - 6 meses",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#667eea",
    "theme_color": "#667eea",
    "icons": [
        {
            "src": "icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        }
    ]
}
```

### 2. Service Worker Básico
```javascript
// sw.js
const CACHE_NAME = 'cronograma-v1';
const urlsToCache = [
    '/',
    '/styles.css',
    '/script.js',
    '/schedule.html'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});
```

---

## 🔍 SEO Essencial

### Meta Tags Básicas
```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cronograma IA/ML - 6 Meses de Estudos</title>
    <meta name="description" content="Cronograma completo de 6 meses para aprender IA e Machine Learning. 600h de estudos estruturados.">
    <meta name="keywords" content="IA, Machine Learning, Cronograma, Estudos, Python, TensorFlow">
    
    <!-- Open Graph -->
    <meta property="og:title" content="Cronograma IA/ML - 6 Meses">
    <meta property="og:description" content="Cronograma estruturado para dominar IA e ML em 6 meses">
    <meta property="og:image" content="https://username.github.io/preview.jpg">
    <meta property="og:url" content="https://username.github.io">
    
    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Cronograma IA/ML - 6 Meses">
    <meta name="twitter:description" content="600h de estudos estruturados em IA e Machine Learning">
</head>
```

---

## 📊 Analytics Gratuito

### Google Analytics 4
```html
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Alternativa: Plausible (Privacy-Friendly)
```html
<script defer data-domain="username.github.io" src="https://plausible.io/js/script.js"></script>
```

---

## 🎨 Otimizações CSS

### 1. Critical CSS Inline
```html
<style>
    /* CSS crítico inline para primeira renderização */
    body { font-family: system-ui; margin: 0; }
    .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
</style>
```

### 2. CSS Loading Assíncrono
```html
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

---

## ⚡ Otimizações JavaScript

### 1. Defer Scripts
```html
<script src="script.js" defer></script>
<script src="dataManager.js" defer></script>
```

### 2. Module Loading
```html
<script type="module" src="app.js"></script>
```

---

## 🔐 Headers de Segurança

### Criar _headers file
```
/*
    X-Frame-Options: DENY
    X-Content-Type-Options: nosniff
    Referrer-Policy: strict-origin-when-cross-origin
    Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 📈 Monitoramento

### 1. Lighthouse CI
```yml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Audit URLs using Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://username.github.io
            https://username.github.io/schedule.html
```

### 2. Web Vitals
```javascript
// Monitorar Core Web Vitals
import {getCLS, getFID, getFCP, getLCP, getTTFB} from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## 🎯 Checklist de Otimização

### Performance
- [ ] CSS/JS minificados
- [ ] Imagens otimizadas (WebP)
- [ ] Lazy loading implementado
- [ ] Critical CSS inline
- [ ] Scripts carregados com defer

### SEO
- [ ] Meta tags configuradas
- [ ] Open Graph implementado
- [ ] Sitemap.xml criado
- [ ] robots.txt configurado

### PWA
- [ ] Manifest.json criado
- [ ] Service Worker implementado
- [ ] Ícones PWA adicionados
- [ ] Tema colors configurados

### Segurança
- [ ] Headers de segurança
- [ ] HTTPS verificado
- [ ] CSP configurado (Content Security Policy)

### Analytics
- [ ] Google Analytics configurado
- [ ] Search Console verificado
- [ ] Lighthouse CI executando

---

## 🚀 Deploy Automatizado

### GitHub Actions para Build
```yml
# .github/workflows/deploy.yml
name: Build and Deploy
on:
  push:
    branches: [ main ]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install and Build
        run: |
          npm install
          npm run build
          
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 💡 Dicas Avançadas

### 1. Preconnect para Recursos Externos
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

### 2. Resource Hints
```html
<link rel="dns-prefetch" href="//google-analytics.com">
<link rel="prefetch" href="/next-page.html">
```

### 3. Service Worker para Cache
```javascript
// Cache first strategy para assets estáticos
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

self.addEventListener('fetch', event => {
    if (event.request.url.includes('.css') || event.request.url.includes('.js')) {
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request);
            })
        );
    }
});
```

**🎯 Resultado:** Site ultrarrápido, SEO otimizado e experiência profissional! 