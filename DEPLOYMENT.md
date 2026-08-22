# Portfolio Deployment Guide

## Quick Start

This portfolio is designed for easy deployment on GitHub Pages (default) or any PHP-enabled web server.

## GitHub Pages Deployment

### Automatic (CI/CD)

The portfolio is automatically deployed to GitHub Pages when you push to the main branch.

```bash
git add .
git commit -m "Update portfolio"
git push origin main
```

Visit: `https://9sefa9.github.io`

**Note:** Contact form via email requires PHP backend, which GitHub Pages doesn't support. For full contact form functionality, deploy to a PHP-enabled server.

## Self-Hosted Deployment (PHP Server)

### Requirements

- PHP 7.4 or higher
- Web server (Apache, Nginx, etc.)
- Mail server configured on the hosting provider

### Step 1: Upload Files

Upload all project files to your web server's public directory:

```
/public_html/
├── index.html
├── impressum.html
├── mail.php
├── mail-script.js
├── includes/
│   ├── config.php
│   └── error-handler.php
├── css/
├── js/
├── img/
└── logs/
```

### Step 2: Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your configuration:
   ```bash
   ENV=production
   RECIPIENT_EMAIL=your-email@example.com
   ```

### Step 3: Set Permissions

```bash
# Make scripts executable
chmod 755 mail.php

# Make logs directory writable
mkdir -p logs
chmod 755 logs
chmod 777 logs
```

### Step 4: Configure PHP

Ensure the following in your `php.ini`:

```ini
; Enable mail function
mail.function = On

; Configure SMTP if needed
SMTP = "localhost"
smtp_port = 25
```

### Step 5: Verify Configuration

Test the mail function:

```php
<?php
if (mail("test@example.com", "Test", "Hello")) {
    echo "Mail configured correctly";
} else {
    echo "Mail configuration error";
}
?>
```

## Security Checklist

- [ ] Email address configured in `.env`
- [ ] `.env` file is **NOT** committed to git (add to `.gitignore`)
- [ ] `logs/` directory has proper permissions (755)
- [ ] PHP mail function is enabled
- [ ] HTTPS is enabled (if self-hosted)
- [ ] Security headers are properly set in `includes/config.php`
- [ ] Rate limiting is enabled

## Troubleshooting

### Contact Form Not Working

1. **Check PHP Error Logs**
   ```bash
   tail -f /var/log/php-fpm/error.log  # or equivalent
   ```

2. **Verify Mail Configuration**
   ```bash
   php -r "echo ini_get('sendmail_path');"
   ```

3. **Check Form Logs**
   ```bash
   cat logs/portfolio-*.log
   ```

### Email Not Received

1. Check spam folder
2. Verify recipient email in `.env`
3. Check mail server configuration
4. Review PHP mail logs
5. Test with a simple mail script

### Rate Limiting Issues

- Rate limit logs are stored in `/tmp/contact_form_*.json`
- To reset, delete the temp files
- Adjust `RATE_LIMIT_MAX_ATTEMPTS` in `.env`

## Performance Optimization

### Production Deployment

1. **Minify Assets** (Optional)
   ```bash
   npm install
   npm run build
   ```

2. **Enable Gzip Compression**
   
   **Apache** (.htaccess):
   ```apache
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/html text/plain text/xml
     AddOutputFilterByType DEFLATE text/css
     AddOutputFilterByType DEFLATE text/javascript
     AddOutputFilterByType DEFLATE application/javascript
   </IfModule>
   ```

   **Nginx** (nginx.conf):
   ```nginx
   gzip on;
   gzip_types text/plain text/css text/javascript application/json;
   gzip_disable "msie6";
   ```

3. **Add Caching Headers**
   
   **Apache** (.htaccess):
   ```apache
   <IfModule mod_expires.c>
     ExpiresActive On
     ExpiresByType image/jpeg "access plus 1 year"
     ExpiresByType image/gif "access plus 1 year"
     ExpiresByType image/png "access plus 1 year"
     ExpiresByType text/css "access plus 1 month"
     ExpiresByType text/javascript "access plus 1 month"
   </IfModule>
   ```

## Monitoring

### Check Form Submissions

```bash
# View today's logs
cat logs/portfolio-$(date +%Y-%m-%d).log

# Monitor in real-time
tail -f logs/portfolio-$(date +%Y-%m-%d).log

# Search for errors
grep ERROR logs/portfolio-*.log

# Count submissions
grep "info" logs/portfolio-*.log | wc -l
```

### Performance Monitoring

- Use Lighthouse: `npm run analyze`
- Monitor Core Web Vitals
- Check error rates in logs

## Update Deployment

```bash
# Pull latest changes
git pull origin main

# Run build (if needed)
npm run build

# Restart PHP services (if applicable)
sudo systemctl restart php-fpm
```

## Support

For issues or questions:
- Check logs in `/logs/`
- Review `.env` configuration
- Verify server requirements
- Contact: sefagoevercin@hotmail.de

---

**Last Updated**: 2026-08-22
