# Wallet Compatibility Matrix

- diagnostics page: `https://privatedao.org/diagnostics/`
- program id: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`

## Matrix

### Auto Detect

- detection: Auto resolution across Phantom, Solflare, Backpack, Glow, and compatible injected providers.
- connect path: connect -> request({ method: 'connect' }) -> enable fallback
- transaction path: sendTransaction -> signAndSendTransaction -> signTransaction fallback
- diagnostics visible: yes
- selector visible: yes
- status: `devnet-review-ready`
- note: Acts as the default browser path when reviewers connect without choosing a wallet explicitly.

### Phantom

- detection: window.phantom?.solana and compatible window.solana fallbacks
- connect path: Direct provider connect with request and enable fallback
- transaction path: sendTransaction preferred, then signAndSendTransaction, then signTransaction
- diagnostics visible: yes
- selector visible: yes
- status: `devnet-review-ready`
- note: Primary reviewer path on desktop browser; still requires live wallet QA before any mainnet cutover claim.

### Solflare

- detection: window.solflare and window.solflare?.solflare resolution
- connect path: Provider connect with request/enable fallback
- transaction path: sendTransaction and signAndSendTransaction fallback path
- diagnostics visible: yes
- selector visible: yes
- status: `devnet-review-ready`
- note: Explicit selector path is present in the wallet panel and diagnostics surface.

### Backpack

- detection: window.backpack?.solana resolution
- connect path: Provider connect with explicit provider selection from wallet panel
- transaction path: sendTransaction with normalized signature handling
- diagnostics visible: yes
- selector visible: yes
- status: `devnet-review-ready`
- note: Included as a first-class selector option rather than relying on generic injected-provider handling.

### Glow

- detection: Compatible injected provider path through wallet selector and fallback provider discovery
- connect path: Provider connect with generic request/enable fallback
- transaction path: Normalized transaction path through generic injected-provider compatibility layer
- diagnostics visible: yes
- selector visible: yes
- status: `manual-runtime-qa-required`
- note: Frontend support is explicit, but live release QA remains a real-browser runtime task.


## Interpretation

This matrix makes wallet compatibility reviewer-visible instead of implicit. It documents how each supported wallet class is detected, how connection fallback works, how transaction signing fallback works, and where real runtime QA is still required before mainnet claims should be made.
