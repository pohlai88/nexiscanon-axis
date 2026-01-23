# Vercel Firewall Configuration

> Firewall rules for protecting the application from bad bots and attacks.

## Quick Start

### Deploy Bad Bot Rule

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Firewall**
3. Click **Add Rule**
4. Copy the configuration from `bad-bot-rule.json`
5. Set action to `log` initially
6. Monitor for 1-2 weeks
7. Change action to `deny` after validation

Or use the Vercel template directly:
https://vercel.com/new/vercel-support/templates/template/block-bad-bots-firewall-rule

---

## Rules

### bad-bot-rule.json

**Purpose**: Block known bad bots, scrapers, and vulnerability scanners.

**How it works**: Matches User-Agent header against a regex pattern of known bad actors.

**Action modes**:
| Action | Behavior |
|--------|----------|
| `log` | Log matched requests (monitoring) |
| `deny` | Block with 403 Forbidden |
| `challenge` | Show CAPTCHA |

**Bots blocked** (partial list):
- Scrapers: AhrefsBot, SemrushBot, MJ12bot, DotBot
- Spam bots: EmailCollector, EmailSiphon, EmailWolf
- Vulnerability scanners: Acunetix, Nmap, sqlmap, ZmEu
- Download tools: HTTrack, wget, curl (malicious patterns)

**Bots NOT blocked** (legitimate):
- Googlebot, Bingbot, DuckDuckBot
- Slackbot, Twitterbot, FacebookBot
- UptimeRobot, Pingdom, BetterStack

---

## Security Headers

The following headers are configured in `vercel.json`:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-XSS-Protection` | `1; mode=block` | XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer info |
| `Permissions-Policy` | `camera=(), ...` | Disable unused APIs |
| `Content-Security-Policy` | See below | Control resource loading |

### CSP Breakdown

```
default-src 'self';                           # Default: same origin only
script-src 'self' 'unsafe-inline' 'unsafe-eval' 
           https://js.stripe.com 
           https://challenges.cloudflare.com;  # Scripts: self + Stripe + CF
style-src 'self' 'unsafe-inline';             # Styles: allow inline (Tailwind)
img-src 'self' data: blob: https:;            # Images: any HTTPS
font-src 'self' data:;                        # Fonts: self + data URIs
connect-src 'self' 
            https://api.stripe.com 
            https://*.neon.tech 
            https://*.r2.cloudflarestorage.com; # APIs: self + services
frame-src https://js.stripe.com 
          https://challenges.cloudflare.com;   # Frames: Stripe + CF
object-src 'none';                            # No plugins
base-uri 'self';                              # Base tag: self only
form-action 'self';                           # Forms: self only
frame-ancestors 'none';                       # Can't be embedded
upgrade-insecure-requests                     # Force HTTPS
```

---

## Monitoring

### Check Firewall Logs

1. Go to Vercel Dashboard → **Firewall**
2. View **Logs** tab
3. Filter by rule name or action

### Metrics to Watch

- **Matched requests**: How many hit the rule
- **Top User-Agents**: Which bots are most active
- **Geographic distribution**: Where requests come from
- **Time patterns**: When attacks peak

---

## Customization

### Add a Bot Pattern

Edit `bad-bot-rule.json` and add to the regex:

```json
"value": "(...|YourNewBot|AnotherBot)"
```

### Allowlist a Bot

If a legitimate bot is being blocked, either:
1. Remove it from the pattern
2. Add a separate rule with `action: "allow"` that runs before the block rule

### Rate Limiting

For more granular control, see the application-level rate limiting in:
- `apps/web/src/lib/rate-limit.ts`

---

## References

- [Vercel Firewall Docs](https://vercel.com/docs/security/firewall)
- [Firewall Templates](https://github.com/vercel/firewall-templates)
- [Nginx Bad Bot Blocker](https://github.com/mitchellkrogza/nginx-ultimate-bad-bot-blocker)
- [CSP Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
