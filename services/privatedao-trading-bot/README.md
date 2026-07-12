# PrivateDAO Trading Bot 🤖

Telegram trading bot على Solana — DCA, Grid, Momentum.

## Unified repository boundary

This directory contains the deployable bot source and its local Groth16 artifacts. Runtime secrets are intentionally
excluded from the unified repository: Telegram tokens, Supabase keys, RPC keys, wallet encryption keys, private keys,
wallet backups, logs, and runtime data must be supplied through a deployment-only `.env` file or a secret manager.

The bot currently has local Groth16 proof generation and verification artifacts. A successful local proof/readiness check
does not by itself prove that a funded production Telegram process is running or that a live swap has been executed.

## الملفات

```
trading-bot/
├── bot.js                    # Entry point
├── handlers/
│   ├── general.js            # /start, /help
│   ├── wallet.js             # /deposit, /balance, /withdraw
│   ├── walletConnect.js      # /connect
│   └── trading.js            # /strategy, /start_trade, /stop, /status
├── strategies/
│   ├── dca.js                # DCA Strategy
│   ├── grid.js               # Grid Strategy
│   └── momentum.js           # Momentum Strategy
├── trading/
│   ├── jupiter.js            # Jupiter swap engine
│   ├── wallet.js             # Keypair + encryption
│   └── engine.js             # Strategy manager
├── middleware/
│   └── session.js            # Session loader
├── db/
│   ├── supabase.js           # DB client
│   └── schema.sql            # Run this in Supabase SQL Editor
├── .env.example
└── package.json
```

## Setup

### 1. Install
```bash
npm install
```

### 2. Environment
```bash
cp .env.example .env
# عدل الـ .env بقيمك
```

لإنشاء WALLET_ENCRYPTION_KEY:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Supabase
- افتح Supabase SQL Editor
- نفذ محتوى `db/schema.sql`

### 4. Telegram Bot
- كلم @BotFather وعمل bot جديد
- احفظ الـ token في .env

### 5. Run
```bash
npm start
# أو للـ development
npm run dev
```

## أوامر البوت

| الأمر | الوظيفة |
|-------|---------|
| `/start` | البداية |
| `/deposit` | عنوان المحفظة / إنشاء جديدة |
| `/connect` | ربط محفظة خارجية |
| `/balance` | الرصيد |
| `/withdraw <address>` | استرداد الأموال |
| `/rescue` | وضع فحص الاسترداد الإداري |
| `/recover_key <value>` | فحص مرشح محلي داخل البوت بدون طباعته |
| `/rescue_withdraw [address]` | سحب إداري فقط عند ربط signer يفتح محفظة الاسترداد المستهدفة |
| `/strategy` | اختيار الاستراتيجية |
| `/start_trade` | بدء التداول |
| `/stop` | إيقاف |
| `/status` | الحالة الحالية |

## الاستراتيجيات

### DCA
شراء دوري بمبالغ ثابتة على فترات زمنية.
- `amountPerBuy`: SOL per buy (default: 0.1)
- `intervalMs`: milliseconds between buys (default: 10 min)
- `maxBuys`: max number of buys (default: 10)

### Grid
تداول بين نطاق سعري بمستويات متعددة.
- `lowerPrice` / `upperPrice`: نطاق السعر بالـ SOL
- `gridLevels`: عدد المستويات (default: 5)
- `amountPerGrid`: SOL per level (default: 0.05)

### Momentum
ركوب الترند مع Take Profit و Stop Loss.
- `buyThreshold`: % ارتفاع للشراء (default: 5%)
- `sellThreshold`: % ربح للبيع (default: 8%)
- `stopLoss`: % خسارة للوقف (default: 5%)

## الأمان
- المفاتيح الخاصة مشفرة بـ AES-256-CBC
- `/withdraw` متاح دايماً حتى لو البوت شغال
- البوت مش بيطلب private key من المستخدم أبداً
- كل الصفقات متسجلة في Supabase
- `/deposit` لا يستبدل محفظة موجودة؛ يعيد العنوان المخزن أولاً
- `saveBotWallet` يمنع تغيير public key المخزن إلا بسبب إداري صريح
- النسخة المحلية المشفرة تكتب قبل إرسال عنوان جديد للمستخدم
- تقرير الاسترداد المحلي موجود في `RECOVERY_AUDIT.md`

## فحوص التشغيل

```bash
node --check bot.js
node --check handlers/wallet.js
node --check db/supabase.js
npm run console -- recovery
npm run console -- health
npm run console -- errors
```
