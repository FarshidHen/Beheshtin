Deployment guide

Local development
- docker-compose up -d
- Open http://localhost

Production (on server)
1) Ensure certbot folders exist and certificates are issued for beheshtin.com
   - /etc/letsencrypt (certs)
   - /var/www/certbot (ACME challenge)
2) Copy project to server at /opt/beheshtin and run:
   docker compose -f docker-compose.yml up -d --build
3) Services:
   - app: Next.js standalone, port 3000 internal
   - nginx: TLS termination on 80/443, proxies to app
   - db: Postgres 15, port 5432
4) Update NEXTAUTH_URL to https://beheshtin.com in docker-compose.yml

Renew TLS
- certbot certonly --webroot -w /var/www/certbot -d beheshtin.com -d www.beheshtin.com
- docker compose restart nginx

