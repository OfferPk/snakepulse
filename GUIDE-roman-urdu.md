# SnakePulse — Istemaal Guide (Roman Urdu)

> Factory rule: har published project mein yeh file `GUIDE-roman-urdu.md` ke naam se zaroori hai.
> Brief + step-by-step; download, install, run, aur har feature cover karo.

## 1. Yeh project kya hai?

SnakePulse ek **offline neon endless-snake** game hai (PWA). Aap pellet kha kar grow karte ho, local AI bots se bachate ho, aur skins unlock karte ho. Internet ke baghair chal sakta hai (pehli load ke baad). Yeh online multiplayer nahi hai.

## 2. Kahan se download karein?

- GitHub: publish ke baad `OfferPk/snakepulse` (factory release)
- Local / ZIP: `/workspace/factory/projects/snakepulse` se clone ya folder copy
- Live demo: GitHub Pages par deploy hone ke baad `/snakepulse/` path

## 3. Pehle kya chahiye? (requirements)

- **Node.js** 20+ (dev / build ke liye)
- Modern browser: Chrome / Edge / Firefox / Safari (mobile OK)
- Play ke liye sirf browser — koi account nahi

## 4. Install + Run (step-by-step)

1. Terminal kholo aur project folder mein jao:
   ```bash
   cd /workspace/factory/projects/snakepulse
   ```
2. Dependencies install:
   ```bash
   npm install
   ```
3. Dev server:
   ```bash
   npm run dev
   ```
4. Browser mein jo URL dikhe (base `/snakepulse/`) open karo.
5. Production build check:
   ```bash
   npm test
   npm run build
   npm run preview
   ```
6. Phone par: browser menu → **Add to Home Screen** (PWA install).

## 5. Demo login (agar ho)

Login nahi hai — koi email/password zaroori nahi.

| Role | Email | Password |
|------|-------|----------|
| — | — | — |

## 6. Features — har ek kya karta hai

### Play / Arena
- **Kahan milega:** Home → **Play**
- **Kaise use karein:** Swipe (canvas), arrow keys, ya ◀ / ▶ turn buttons
- **Result:** Snake move karti hai; wall / apna body / bot body = run khatam

### Pellets + Pulse
- **Kahan milega:** Arena ke andar cyan / gold dots
- **Kaise use karein:** Unke upar se guzro
- **Result:** Cyan = grow + score; Gold pulse = thodi der tez speed

### Local AI bots
- **Kahan milega:** Arena mein dusre rang ki snakes
- **Kaise use karein:** Unse takrao mat; yeh offline AI hain
- **Result:** Bot mar kar respawn ho sakta hai; aapki death par Retry / Continue

### Death overlay + Share
- **Kahan milega:** Marne ke baad
- **Kaise use karein:** Pehle short **Ad placeholder (stub)** → **Continue**; phir death panel: **Retry**, **Share**, **Watch to continue (stub)**, ya **Home**. Agar Settings mein remove-ads stub on ho to interstitial skip.
- **Share:** Device share sheet (`navigator.share`) jab available ho; warna clipboard pe text copy + short toast. Text: `SnakePulse — score N · best B · {skin}`. Fully offline — koi network nahi.
- **Result:** Naya run; continue ek dafa stub reward se (koi real ad / network nahi); score friends ko share

### How to play (pehli dafa)
- **Kahan milega:** Pehli launch par auto howto screen; baad mein Home → **How to play**
- **Kaise use karein:** Padho → **Got it** (flag `snakepulse:howto` save). Manual button hamesha kaam karta hai.
- **Result:** Onboarding ek dafa; Play CTA dismiss ke baad free — block nahi

### Skins
- **Kahan milega:** Home → **Skins**
- **Kaise use karein:** Equipped card pe **Equipped** dikhta hai. Locked card: `Best {best}/{score}` + `Buy {cost} (you have {coins})` — jab coins kaafi hon to Buy highlight. Score milestone poora ho lekin unlock na hua ho to **Claim** dabao. Warna coins se buy.
- **Result:** Neon trail/head color change; sab localStorage (`snakepulse_save`) mein

### Settings / Ads stubs
- **Kahan milega:** Home → **Settings**
- **Kaise use karein:** Mute toggle; **Remove ads (stub)**
- **Result:** Sound flag + adsRemoved flag save; real AdMob/billing nahi

### HUD
- **Kahan milega:** Play screen top
- **Kaise use karein:** Score / Best / Length dekho; pause / home
- **Result:** Progress track; best local save

## 7. Common masail (troubleshooting)

- **Blank screen:** `npm install` dubara; base path `/snakepulse/` check karo
- **Controls kaam nahi:** Play screen active ho; pause overlay band karo
- **PWA offline nahi:** pehle online load karo taake service worker cache ho
- **Skins unlock nahi:** Best line pe progress dekho; Claim (score) ya Buy (coins enough) use karo
- **Tests fail:** Node 20+; `npm test` project root se chalao

## 8. Security / privacy tips

- Koi account / server nahi — data browser `localStorage` mein (`snakepulse_*`)
- Real payment / AdMob keys is MVP mein nahi
- Personal data collect nahi hota
- Sirf trusted GitHub / factory build se install karo

## 9. Agla update

- Capacitor / Play Store APK wrap
- Real rewarded / interstitial wiring (keys alag)
- Zyada skins / optional daily seed challenge
- Sound FX toggle ke sath beeps
