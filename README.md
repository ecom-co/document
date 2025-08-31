# Template Docs

A complete Docusaurus template configured according to the Vietnamese configuration checklist.

## 📝 Features Included

### ✅ 1. Thông tin cơ bản (Basic Information)
- **title**: My Project (configurable)
- **tagline**: Docs powered by Docusaurus
- **favicon**: img/favicon.ico

### ✅ 2. Thông tin deploy (Deploy Information) 
- **url**: https://example.com (configurable)
- **baseUrl**: /
- **organizationName**: my-org (configurable)
- **projectName**: my-docs (configurable)

### ✅ 3. Ngôn ngữ (Internationalization)
- **defaultLocale**: en
- **locales**: ['en', 'vi'] - English and Vietnamese support

### ✅ 4. Presets
- **Docs**: 
  - sidebarPath pointing to sidebars.ts
  - routeBasePath set to /docs
- **Blog**: Fully configured with reading time, RSS feeds
- **Theme**: Custom CSS support (src/css/custom.css)

### ✅ 5. Navbar
- **title**: My Project
- **logo**: img/logo.svg
- **items**: Docs, Blog, GitHub links + language dropdown

### ✅ 6. Footer
- **style**: dark
- **links**: Three sections - Docs, Community, Resources
- **copyright**: Copyright notice with current year

### ✅ 7. Search (Optional)
- Algolia search configuration placeholder included
- Commented out - ready to be configured with your credentials

### ✅ 8. Sidebar (sidebars.ts)
- Configured with Getting Started category
- Manual sidebar structure defined

### ✅ 9. Docs & Blog Content
- **docs/intro.md**: Introduction documentation page
- **blog/hello.md**: Sample blog post

## 🚀 Quick Start

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## ⚙️ Customization Guide

### Basic Configuration
Edit `docusaurus.config.ts` to customize:

```typescript
const config: Config = {
  title: 'Your Project Name',
  tagline: 'Your tagline here',
  url: 'https://yourdomain.com',
  baseUrl: '/',
  organizationName: 'your-org',
  projectName: 'your-repo-name',
  // ... other settings
}
```

### Enable Algolia Search
Uncomment and configure the Algolia section in `docusaurus.config.ts`:

```typescript
algolia: {
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_SEARCH_API_KEY', 
  indexName: 'YOUR_INDEX_NAME',
  contextualSearch: true,
},
```

### Add New Languages
1. Add locale to the `i18n.locales` array in `docusaurus.config.ts`
2. Run `npm run write-translations -- --locale [locale]`
3. Translate the generated files

### Customize Sidebar
Edit `sidebars.ts` to modify the documentation structure:

```typescript
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category', 
      label: 'Your Category',
      items: ['doc1', 'doc2'],
    },
  ],
};
```

## 📁 Project Structure

```
├── blog/                   # Blog posts
├── docs/                   # Documentation files  
├── src/
│   ├── components/         # React components
│   ├── css/                # Custom CSS
│   └── pages/              # Custom pages
├── static/                 # Static assets (images, etc.)
├── docusaurus.config.ts    # Main configuration
├── sidebars.ts             # Sidebar configuration
└── package.json
```

## 🛠️ Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production  
- `npm run serve` - Serve built site locally
- `npm run deploy` - Deploy to GitHub Pages
- `npm run clear` - Clear cache
- `npm run write-translations` - Generate translation files
- `npm run typecheck` - Run TypeScript checks

## 📝 Content Management

### Adding Documentation
1. Create `.md` files in the `docs/` directory
2. Add frontmatter for metadata:
   ```yaml
   ---
   sidebar_position: 1
   title: Page Title
   ---
   ```

### Adding Blog Posts  
1. Create `.md` files in the `blog/` directory
2. Use frontmatter for post metadata:
   ```yaml
   ---
   title: Post Title
   authors: [author-key]
   tags: [tag1, tag2]
   ---
   ```

## 🌍 Internationalization

This template supports English (en) and Vietnamese (vi) by default. To add content in Vietnamese:

1. Create `i18n/vi/` directories for translations
2. Add translated content files
3. Use the language switcher in the navbar

## 📦 Deployment

### GitHub Pages
1. Set repository settings in `docusaurus.config.ts`
2. Run `npm run deploy`

### Other Platforms
1. Run `npm run build`  
2. Deploy the `build/` directory to your hosting platform

## 🔧 Development Tips

- Use `npm run start` for live development with hot reload
- Edit `src/css/custom.css` for custom styling
- Add React components in `src/components/` 
- Test builds locally with `npm run build && npm run serve`

## 📚 Documentation

- [Docusaurus Documentation](https://docusaurus.io/)
- [Markdown Features](https://docusaurus.io/docs/markdown-features)
- [Internationalization](https://docusaurus.io/docs/i18n/introduction)

Built with ❤️ using Docusaurus
