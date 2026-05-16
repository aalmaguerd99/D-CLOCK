# D-CLOCK — Instrucciones de Desarrollo

## Estructura del Proyecto

```
CHECADOR D99-TECH/
├── app escritorio/      → App Electron (Windows .exe) — SQLite local
├── pagina web/          → Next.js 16 en Railway — landing/marketing
├── panel licencias/     → Express.js — gestión de licencias (PostgreSQL)
├── app celulares/       → App móvil (futura)
└── instrucciones.md     → este archivo
```

---

## Base de Datos — Railway PostgreSQL

**Connection String (usar en DATABASE_URL):**
```
postgresql://postgres:eIOLVjETJIbDIugeNetuhpsQBfPVLKEI@hopper.proxy.rlwy.net:45516/railway
```

- **Host:** `hopper.proxy.rlwy.net`
- **Puerto:** `45516`
- **DB:** `railway`
- **Usuario:** `postgres`
- **Contraseña:** `eIOLVjETJIbDIugeNetuhpsQBfPVLKEI`

Usada por: **panel licencias** y **pagina web** (Next.js).

Conectar con psql:
```bash
psql "postgresql://postgres:eIOLVjETJIbDIugeNetuhpsQBfPVLKEI@hopper.proxy.rlwy.net:45516/railway"
```

---

## GitHub — Repositorio de Releases

- **Repo:** `https://github.com/aalmaguerd99/D-CLOCK`
- **Release actual:** `v1.0.0` (ID: `322186477`)
- **Token de acceso:** `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`

### Cómo subir código a GitHub

Si el repo **no tiene git inicializado** todavía:
```bash
cd "c:\Users\HP Z2 Mini G4\Desktop\CHECADOR D99-TECH"
git init
git remote add origin https://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@github.com/aalmaguerd99/D-CLOCK.git
```

Crear `.gitignore` en la raíz:
```
node_modules/
dist/
.env
.env.local
*.exe
*.blockmap
pagina web/.next/
```

Primer push:
```bash
git add .
git commit -m "initial commit"
git branch -M main
git push -u origin main
```

Pushes siguientes:
```bash
git add .
git commit -m "descripción del cambio"
git push
```

---

## App Escritorio (Electron)

**Directorio:** `app escritorio/`

### Variables de entorno — `app escritorio/.env`
```
DCLOCK_API_URL=https://d-clock-production.up.railway.app
LOCAL_PORT=7474
```

### Comandos
```bash
cd "app escritorio"
npm install          # solo la primera vez
npm start            # ejecutar en dev (sin empaquetar)
npm run dist         # compilar instalador + portable → dist/
```

### Archivos compilados
```
dist/D-CLOCK Setup 1.0.0.exe   → instalador NSIS
dist/D-CLOCK 1.0.0.exe         → portable (sin instalar)
```

### Subir nueva versión a GitHub Releases

1. Compilar: `npm run dist`
2. Borrar assets viejos y subir con PowerShell:

```powershell
$token = "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"
$headers = @{Authorization="token $token"; "Content-Type"="application/octet-stream"}
$base = "https://uploads.github.com/repos/aalmaguerd99/D-CLOCK/releases/322186477/assets"
$dist = ".\dist"

# Borrar assets existentes primero (obtener IDs)
$assets = Invoke-RestMethod -Uri "https://api.github.com/repos/aalmaguerd99/D-CLOCK/releases/322186477/assets" -Headers @{Authorization="token $token"}
foreach ($a in $assets) {
  Invoke-WebRequest -Method Delete -Uri "https://api.github.com/repos/aalmaguerd99/D-CLOCK/releases/assets/$($a.id)" -Headers @{Authorization="token $token"}
}

# Subir nuevos (4 variantes de nombre para no romper links)
Invoke-WebRequest -Method Post -Uri "$base?name=D-CLOCK.Setup.1.0.0.exe"    -Headers $headers -InFile "$dist\D-CLOCK Setup 1.0.0.exe"
Invoke-WebRequest -Method Post -Uri "$base?name=D-CLOCK-Setup-1.0.0.exe"    -Headers $headers -InFile "$dist\D-CLOCK Setup 1.0.0.exe"
Invoke-WebRequest -Method Post -Uri "$base?name=D-CLOCK.1.0.0.exe"          -Headers $headers -InFile "$dist\D-CLOCK 1.0.0.exe"
Invoke-WebRequest -Method Post -Uri "$base?name=D-CLOCK-Portable-1.0.0.exe" -Headers $headers -InFile "$dist\D-CLOCK 1.0.0.exe"
```

**Links de descarga:**
- Instalador: `https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.0.0/D-CLOCK.Setup.1.0.0.exe`
- Portable: `https://github.com/aalmaguerd99/D-CLOCK/releases/download/v1.0.0/D-CLOCK-Portable-1.0.0.exe`

### DB local (SQLite)
La base de datos del app escritorio se guarda en:
```
C:\Users\[Usuario]\AppData\Roaming\dclock-desktop\dclock.db
```
Sobrevive desinstalaciones. Para resetear: borrar ese archivo.

---

## Panel de Licencias (Express.js)

**Directorio:** `panel licencias/`

### Variables de entorno — `panel licencias/.env`
```
DATABASE_URL=postgresql://postgres:eIOLVjETJIbDIugeNetuhpsQBfPVLKEI@hopper.proxy.rlwy.net:45516/railway
PORT=4000
PANEL_PASSWORD=d99tech2024

# Email (opcional) — activar "Contraseñas de aplicación" en Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=tucorreo@gmail.com
EMAIL_PASS=                       # pegar clave de app de 16 chars
EMAIL_FROM=D-CLOCK <tucorreo@gmail.com>
```

### Comandos
```bash
cd "panel licencias"
npm install
node server.js    # puerto 4000
```

Panel admin en: `http://localhost:4000`
Contraseña: `d99tech2024`

---

## Página Web (Next.js en Railway)

**Directorio:** `pagina web/`

### Variables de entorno — `pagina web/.env.local`
```
DATABASE_URL=postgresql://postgres:eIOLVjETJIbDIugeNetuhpsQBfPVLKEI@hopper.proxy.rlwy.net:45516/railway
```

### Comandos
```bash
cd "pagina web"
npm install
npm run dev      # dev en localhost:3000
npm run build    # build para producción
npm start        # producción local
```

**URL de producción:** `https://d-clock-production.up.railway.app`

### Deploy a Railway
Railway hace deploy automático desde el repo de GitHub cuando hay push a `main`.
El branch conectado es `main` → directorio `pagina web/`.

---

## VPS (IONOS)

- **IP:** `108.175.4.106`
- Usado para hospedar el panel de licencias en producción (acceso externo desde la app)
- El ISP en México usa CGNAT, no tiene IP pública directa

---

## Flujo de trabajo típico

### Modificar el web panel de la app escritorio
1. Editar `app escritorio/server/public/index.html`
2. `cd "app escritorio" && npm run dist`
3. Subir los 4 assets a GitHub (script PowerShell de arriba)

### Modificar la página web / API de licencias
1. Editar archivos en `pagina web/`
2. `git add . && git commit -m "..." && git push`
3. Railway hace el re-deploy automáticamente

### Modificar el panel de licencias
1. Editar `panel licencias/server.js` o `panel licencias/public/`
2. Reiniciar el servidor: `node server.js`
3. Para producción: copiar al VPS y reiniciar con PM2

---

## Notas importantes

- Los `.env` **NUNCA** se suben a GitHub (están en `.gitignore`)
- El `node_modules/` tampoco se sube — se regenera con `npm install`
- El `dist/` de la app Electron no se sube — los `.exe` van a GitHub Releases
- La carpeta `.next/` de Next.js tampoco se sube
