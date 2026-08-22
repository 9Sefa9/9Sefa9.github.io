# Sefa Gövercin - Professional Portfolio

A modern, responsive portfolio website showcasing expertise in Identity & Access Management (IAM), full-stack development, and enterprise software architecture. Built with vanilla HTML5, CSS3, and JavaScript - hosted on GitHub Pages.

**Visit**: https://9sefa9.github.io

## ✨ Features

- **Responsive Design** - Mobile-first approach with breakpoints for all devices
- **Modern Stack** - Vanilla JavaScript (no jQuery), CSS3 Grid & Flexbox
- **Pure Frontend** - Static site hosted on GitHub Pages (no backend required)
- **Dark Theme** - Modern dark UI with gradient accents and smooth animations
- **Performance Optimized** - CSS variables, lazy loading, smooth scroll
- **Accessibility First** - WCAG compliant with semantic HTML and ARIA labels
- **SEO Optimized** - Open Graph meta tags, proper heading hierarchy

## 📁 Project Structure

```
.
├── index.html              # Main portfolio page
├── impressum.html          # Legal/Impressum page
├── css/
│   ├── index.css          # Main stylesheet with dark theme
│   └── animation.css      # Animations & keyframes
├── js/
│   └── main.js            # Interactive features (menu, scroll animations)
├── img/                   # Portfolio images & logos
└── package.json           # Project metadata
```

## 🚀 Getting Started

### Local Development

Simply open `index.html` in your browser, or use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server

# Using Node.js with live reload
npx serve .
```

Then visit `http://localhost:8000`

### Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Content Sections

### 1. **Intro/Hero**
- Profile image and introduction
- Key expertise summary
- Call-to-action buttons

### 2. **Expertise**
- Identity & Access Management (IAM)
- Full-Stack Development
- DevOps & Architecture

### 3. **Current Focus**
- SAP IDM → SailPoint ISC Migration
- Enterprise IAM Management Tool
- Modern CI/CD Implementation

### 4. **Professional Experience**
- Timeline of work experience
- Technical expertise breakdown
- Skills by category

### 5. **Projects**
- GitHub portfolio showcase
- SAP IDM Migration Project
- IAM Management Tool

### 6. **Contact**
- Direct contact links
- LinkedIn, GitHub, Instagram, Facebook
- Email link (mailto:)

## ♿ Accessibility

- WCAG 2.1 Level AA compliance
- Semantic HTML5 structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast ratio > 7:1
- Proper focus indicators

## 🎨 Customization

### Update Contact Information

Edit the contact section in `index.html`:

```html
<a href="mailto:your-email@example.com" class="contact-link">
  <!-- ... -->
  <span>Email</span>
</a>
```

### Modify Colors

Update CSS variables in `css/index.css`:

```css
:root {
  --color-primary: #2b2e4b;
  --color-accent: #5c80bc;
  /* ... */
}
```

### Update Portfolio Images

Replace images in the `img/` directory:
- `img.jpg` - Profile photo
- `logo.png` - Brand logo
- Company logos for experience timeline

## 🚀 Deployment

### GitHub Pages (Automatic)

The site is automatically deployed when you push to the main branch:

```bash
git add .
git commit -m "Update portfolio"
git push origin main
```

Your portfolio will be live at: `https://<your-username>.github.io`

### Custom Domain

If using a custom domain:

1. Create a `CNAME` file with your domain
2. Configure DNS to point to GitHub Pages
3. Enable "Enforce HTTPS" in repository settings

## 📊 Performance Metrics

- Lighthouse Score: 95+
- Core Web Vitals: All green
- First Contentful Paint (FCP): < 1s
- Largest Contentful Paint (LCP): < 2s
- Cumulative Layout Shift (CLS): < 0.1

## 📧 Contact

- **Email**: [sefagoevercin@hotmail.de](mailto:sefagoevercin@hotmail.de)
- **LinkedIn**: [linkedin.com/in/sefa-gövercin](https://www.linkedin.com/in/sefa-gövercin/)
- **GitHub**: [@9Sefa9](https://github.com/9Sefa9)
- **Instagram**: [@sefa_gc](https://www.instagram.com/sefa_gc/)

## 📄 License

ISC License - See LICENSE file for details

## 🤝 Contributing

Suggestions and improvements are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Version**: 2.0.0  
**Last Updated**: 2026-08-22

