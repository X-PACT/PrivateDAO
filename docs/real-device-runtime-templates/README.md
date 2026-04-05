# Real-Device Capture Templates

Use these templates when collecting real wallet and device evidence on Devnet:

- `phantom-desktop.json`
- `solflare-desktop.json`
- `backpack-desktop.json`
- `glow-desktop.json`
- `android-runtime.json`

Fast path:

```bash
bash scripts/real-device-capture.sh phantom-desktop \
  --wallet-version "24.11.0" \
  --os "Windows 11" \
  --client "Chrome 135" \
  --tx "<REAL_DEVNET_SIGNATURE>"
```

Template only:

```bash
bash scripts/real-device-capture.sh android-runtime --template-only
```
