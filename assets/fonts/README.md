# Self-hosted fonts

Both families are licensed under the **SIL Open Font License 1.1**, which permits
redistribution with the licence included. Full text: `OFL.txt`.

| File | Family | Weight | Upstream |
|---|---|---|---|
| `space-grotesk-500.woff2` | Space Grotesk | 500 | https://github.com/floriankarsten/space-grotesk |
| `space-grotesk-700.woff2` | Space Grotesk | 700 | https://github.com/floriankarsten/space-grotesk |
| `jetbrains-mono-400.woff2` | JetBrains Mono | 400 | https://github.com/JetBrains/JetBrainsMono |

Latin subsets only, 47 KB total. They are self-hosted rather than loaded from a
font CDN so the site keeps working offline through the service worker and makes
no third-party request. Body copy deliberately stays on the system sans stack —
it costs nothing and renders natively.

`font-display: swap` is set on all three, so text is readable before the font
arrives and the layout does not block on it.
