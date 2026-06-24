# World Runner 🏃‍♂️

**World Runner** es un endless runner arcade para [World App](https://world.org/world-app), construido con el template oficial Next.js 15 + MiniKit-JS + HTML5 Canvas.

Corre automáticamente, salta bots, agáchate de deepfakes y recolecta orbes reales. Verifica tu humanidad con World ID para desbloquear bonus y compra boosts con USDC/WLD vía MiniKit Pay.

## Stack

- **Next.js 15** + TypeScript + Tailwind CSS 4
- **MiniKit-JS 2.x** — wallet auth, pay
- **IDKit** — World ID verification
- **HTML5 Canvas** — motor de juego propio (sin Phaser, bundle ligero)
- **Mini Apps UI Kit** — componentes nativos de World App

## Estructura del proyecto

```
src/
├── game/
│   ├── GameEngine.ts      # Loop, física, spawn, render
│   ├── constants.ts
│   └── types.ts
├── hooks/
│   └── useGame.ts         # Conecta Canvas ↔ React
├── components/world-runner/
│   ├── GameCanvas.tsx     # Pantalla de juego + controles táctiles
│   ├── HomeMenu.tsx
│   ├── ShopPanel.tsx      # MiniKit Pay
│   └── VerifyHuman.tsx    # World ID
├── context/
│   └── PlayerProgressContext.tsx
└── lib/
    ├── gameStorage.ts     # localStorage (scores, inventario)
    └── shopCatalog.ts
```

## Desarrollo local

### 1. Clonar e instalar

```bash
git clone https://github.com/TU_USUARIO/world-runner.git
cd world-runner
cp .env.sample .env.local
npm install
```

### 2. Configurar variables de entorno

Edita `.env.local`:

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_APP_ID` | App ID del [Developer Portal](https://developer.worldcoin.org/) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | URL pública (ngrok en dev, Vercel en prod) |
| `HMAC_SECRET_KEY` | `openssl rand -base64 32` |
| `RP_ID` / `RP_SIGNING_KEY` | Relying Party para World ID (portal → IDKit) |
| `NEXT_PUBLIC_TREASURY_ADDRESS` | Wallet tesorería (recibe WLD y $RCOL) — misma que Vuela RCOl |
| `NEXT_PUBLIC_RCOL_TOKEN` | Contrato $RCOL en World Chain (`0x82bF…308a`) |
| `NEXT_PUBLIC_PAYMENT_ADDRESS` | Alias opcional de tesorería (legacy) |
| `DEV_PORTAL_API_KEY` / `WORLD_API_KEY` | Verificación on-chain de pagos en producción |

### 3. Configurar World ID en el portal

1. Ve a [developer.worldcoin.org](https://developer.worldcoin.org/)
2. Crea una **Incognito Action** llamada `world-runner-verify` (debe coincidir con `WORLD_ID_ACTION` en el código)
3. Configura RP signing key y RP ID en `.env.local`

### 4. Ejecutar en local

```bash
npm run dev
```

Abre `http://localhost:3000` — verás la pantalla de login con wallet auth.

## Probar dentro de World App (tunneling)

World App solo puede cargar mini apps vía **HTTPS público**. Usa ngrok o Cloudflare Tunnel:

```bash
# Terminal 1
npm run dev

# Terminal 2
ngrok http 3000
```

1. Copia la URL HTTPS de ngrok (ej. `https://abc123.ngrok-free.app`)
2. Ponla en `AUTH_URL` dentro de `.env.local`
3. Reinicia `npm run dev`
4. En el [Developer Portal](https://developer.worldcoin.org/) → tu app → **Mini App URL** → pega la URL de ngrok
5. Abre World App en tu teléfono → Developer Mode → preview de tu mini app

> **Tip:** Activa Eruda (ya incluido en dev) para ver la consola dentro del webview de World App.

## Subir a GitHub

```bash
git init
git add .
git commit -m "feat: World Runner endless runner mini app"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/world-runner.git
git push -u origin main
```

## Desplegar en Vercel (gratis)

1. Ve a [vercel.com](https://vercel.com) → **Import Project** → selecciona tu repo de GitHub
2. Framework: **Next.js** (auto-detectado)
3. Añade todas las variables de `.env.local` en **Settings → Environment Variables**
4. Deploy → obtendrás una URL tipo `https://world-runner.vercel.app`
5. Actualiza `AUTH_URL` en Vercel con esa URL
6. En el Developer Portal de World, cambia **Mini App URL** a tu dominio de Vercel

## Configurar como Mini App en World

1. [developer.worldcoin.org](https://developer.worldcoin.org/) → **Create App**
2. Copia el `APP_ID` → `NEXT_PUBLIC_APP_ID`
3. **Mini App URL:** tu URL de Vercel (o ngrok en dev)
4. **Actions:** crea `world-runner-verify` para World ID
5. **Payments:** habilita USDC y WLD si quieres usar la tienda
6. Sube icono 512×512 y screenshots para el listing

## Mecánicas del juego

| Control | Acción |
|---------|--------|
| Tap / swipe arriba | Saltar (esquivar bots en el suelo) |
| Tap / swipe abajo | Agacharse (esquivar deepfakes flotantes) |
| Espacio / ↑ | Saltar (teclado) |
| ↓ | Agacharse (teclado) |

**Obstáculos:** bots (salta), deepfakes (agáchate), orbes falsos (evita — parecen reales pero tienen ✕).

**Verificado con World ID:**
- Skin dorada
- Multiplicador x1.5
- Daily Challenge (15 orbes en una carrera)

**Tienda (MiniKit Pay) — cosméticos con WLD o $RCOL:**
- Neon Runner Skin, Wonder Trail, Spirit Aura (solo visual)
- Tesorería: `NEXT_PUBLIC_TREASURY_ADDRESS` + `NEXT_PUBLIC_RCOL_TOKEN` (mismo ecosistema Vuela RCOl)

**Recompensas ganadas jugando (no se venden):**
- Continue — daily challenge o hitos
- Score Rush — carreras fuertes / daily
- Orb Magnet — cada 25 orbes totales

## Scripts

```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run start    # Servir build
npm run lint     # Prettier check
```

## Licencia

MIT
