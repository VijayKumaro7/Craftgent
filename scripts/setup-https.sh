#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# CraftAgent — First-time HTTPS setup with Let's Encrypt
#
# Usage:
#   chmod +x scripts/setup-https.sh
#   ./scripts/setup-https.sh yourdomain.com you@example.com
#
# What it does:
#   1. Starts Nginx on HTTP only (no cert yet)
#   2. Runs Certbot to issue a real certificate via ACME webroot challenge
#   3. Swaps in the HTTPS Nginx config
#   4. Reloads Nginx
#   5. Verifies HTTPS is working
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${2:-}"

if [[ -z "$DOMAIN" || -z "$EMAIL" ]]; then
  echo "Usage: $0 <domain> <email>"
  echo "  e.g: $0 craftgent.example.com you@example.com"
  exit 1
fi

echo ""
echo "⛏  CraftAgent HTTPS Setup"
echo "   Domain : $DOMAIN"
echo "   Email  : $EMAIL"
echo ""

# ── Step 1: Start with HTTP-only Nginx ───────────────────────────────────────
echo "▶ Step 1 — starting HTTP-only Nginx..."
docker compose -f docker-compose.prod.yml up -d web db redis chromadb api worker
sleep 5

# ── Step 2: Issue certificate ─────────────────────────────────────────────────
echo "▶ Step 2 — requesting certificate from Let's Encrypt..."
docker compose -f docker-compose.prod.yml run --rm certbot \
  certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

echo "✅ Certificate issued."

# ── Step 3: Swap in HTTPS config ─────────────────────────────────────────────
echo "▶ Step 3 — installing HTTPS Nginx config..."

# Replace domain placeholder in the HTTPS config
sed "s/yourdomain.com/$DOMAIN/g" nginx/craftgent-https.conf > nginx/craftgent.conf

echo "✅ Nginx config updated for $DOMAIN."

# ── Step 4: Reload Nginx ─────────────────────────────────────────────────────
echo "▶ Step 4 — reloading Nginx..."
docker compose -f docker-compose.prod.yml restart web
sleep 3

# ── Step 5: Verify ───────────────────────────────────────────────────────────
echo "▶ Step 5 — verifying HTTPS..."
if curl -sf "https://$DOMAIN/health" > /dev/null; then
  echo ""
  echo "════════════════════════════════════════════"
  echo "  ✅ HTTPS is live!"
  echo "  🌐 https://$DOMAIN"
  echo "════════════════════════════════════════════"
  echo ""
  echo "  Certbot auto-renews every 12 hours."
  echo "  Certs expire in 90 days — renewal is automatic."
  echo ""
else
  echo ""
  echo "⚠️  HTTPS check failed. Check:"
  echo "   1. DNS A record for $DOMAIN points to this server"
  echo "   2. Port 80 and 443 are open in your firewall"
  echo "   3. docker compose logs web"
  echo ""
  exit 1
fi
