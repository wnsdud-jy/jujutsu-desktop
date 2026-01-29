# Jujutsu Desktop

> [!CAUTION]
> **Under Active Development.**  
A modern desktop client for [jj-vcs](https://github.com/martinvonz/jj) built with Tauri v2 and React.

## ✨ Features

- 🔐 **GitHub OAuth Authentication** - Secure login flow with deep linking
- 🌍 **Internationalization** - English and Korean language support
- 🌓 **Theme System** - Light/Dark mode with system preference detection
- 📱 **Responsive Design** - Adapts from mobile to desktop layouts
- 🎨 **Modern UI** - Built with Shadcn UI and Tailwind CSS
- ✨ **Smooth Animations** - Powered by Framer Motion
- 🚀 **Fast & Lightweight** - Native performance with Tauri

## 🛠 Tech Stack

### Frontend (`apps/gui`)
- **Framework**: React 19 + Vite
- **Desktop**: Tauri v2 (Rust)
- **Styling**: Tailwind CSS + Shadcn UI
- **State**: Zustand
- **i18n**: react-i18next
- **Animations**: Framer Motion
- **Theme**: next-themes

### Backend (`apps/auth-server`)
- **Framework**: ElysiaJS
- **Auth**: Lucia Auth + Arctic (OAuth)
- **Database**: Drizzle ORM + SQLite
- **Runtime**: Bun

### Monorepo
- **Tool**: Turborepo
- **Package Manager**: Bun

## 📁 Project Structure

```
jujutsu-desktop/
├── apps/
│   ├── gui/                    # Tauri + React frontend
│   │   ├── src/
│   │   │   ├── components/     # UI components
│   │   │   │   ├── auth/       # Login page
│   │   │   │   ├── common/     # Reusable components
│   │   │   │   ├── features/   # Feature-specific components
│   │   │   │   ├── layout/     # Layout components
│   │   │   │   ├── providers/  # Context providers
│   │   │   │   └── ui/         # Shadcn UI components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── i18n/           # Internationalization
│   │   │   │   ├── config.ts
│   │   │   │   └── locales/    # Translation files
│   │   │   └── lib/            # Utilities
│   │   └── src-tauri/          # Rust backend
│   │
│   └── auth-server/            # OAuth server
│       ├── src/
│       │   ├── db/             # Database schemas
│       │   ├── templates/      # HTML templates
│       │   ├── auth.ts         # Auth configuration
│       │   └── index.ts        # Server entry
│       └── .env.example        # Environment template
│
└── packages/
    ├── ui/                     # Shared UI components
    └── types/                  # Shared TypeScript types
```

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.3.7
- [Rust](https://www.rust-lang.org/) >= 1.70
- [Node.js](https://nodejs.org/) >= 18 (for some dependencies)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jujutsu-desktop
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   
   Create `.env` file in `apps/auth-server/`:
   ```bash
   cd apps/auth-server
   cp .env.example .env
   ```
   
   Edit `.env` and add your GitHub OAuth credentials:
   ```env
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

   > **How to get GitHub OAuth credentials:**
   > 1. Go to GitHub Settings > Developer settings > OAuth Apps
   > 2. Click "New OAuth App"
   > 3. Set **Authorization callback URL** to: `http://localhost:3000/auth/github/callback`
   > 4. Copy the Client ID and generate a Client Secret

4. **Initialize the database**
   ```bash
   cd apps/auth-server
   bun run db:push
   ```

### Development

Start the development servers (auth server + Tauri app):
```bash
bun dev
```

This will:
- Start the auth server on `http://localhost:3000`
- Start the Vite dev server on `http://localhost:1420`
- Launch the Tauri desktop app

### Build

Build for production:
```bash
bun run build
```

The compiled app will be in `apps/gui/src-tauri/target/release/`.

## 🔐 Authentication Flow

1. User clicks "Login with GitHub" in the app
2. Opens browser to GitHub OAuth page
3. User authorizes the app
4. Redirects to auth server callback (`/auth/github/callback`)
5. Server creates session and redirects to success page (`/auth/success`)
6. Success page shows countdown and auto-redirects to deep link (`jujutsu://auth?token=...`)
7. Tauri app catches deep link and logs user in

## 🌐 Internationalization

To add a new language:

1. Create a new translation file in `apps/gui/src/i18n/locales/`:
   ```json
   // locales/fr.json
   {
     "login": {
       "title": "Bienvenue sur Jujutsu Desktop",
       ...
     }
   }
   ```

2. Import and add to `apps/gui/src/i18n/config.ts`:
   ```typescript
   import fr from './locales/fr.json';
   
   i18n.init({
     resources: {
       en: { translation: en },
       ko: { translation: ko },
       fr: { translation: fr }, // Add here
     },
     ...
   });
   ```

3. Update `LanguageToggle.tsx` to include the new language option.

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start development servers (Turbo) |
| `bun run build` | Build all packages |
| `bun run lint` | Lint all packages |
| `bun run format` | Format code with Prettier |

### Per-package Scripts

#### `apps/gui`
- `bun run dev` - Start Tauri dev mode
- `bun run build` - Build Tauri app
- `bun run lint` - ESLint check

#### `apps/auth-server`
- `bun run dev` - Start auth server with hot reload
- `bun run start` - Start production server
- `bun run build` - TypeScript type check
- `bun run db:push` - Push database schema
- `bun run db:studio` - Open Drizzle Studio

## 🎨 Theming

The app uses a custom theme system with Tailwind CSS:

- **Light/Dark modes** configured in `apps/gui/tailwind.config.ts`
- **CSS variables** in `apps/gui/src/index.css`
- **Theme provider** wraps the app in `RootLayout.tsx`
- **Toggle component** in top-right corner for manual switching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **Formatting**: Prettier (automated)
- **Linting**: ESLint with TypeScript rules
- **Commits**: Use conventional commits format

## 📄 License

[Add your license here]

## 🙏 Acknowledgments

- [jj-vcs](https://github.com/martinvonz/jj) - The amazing version control system
- [Tauri](https://tauri.app/) - Build smaller, faster, and more secure desktop apps
- [Shadcn UI](https://ui.shadcn.com/) - Beautiful UI components

---

**Made with ❤️ for the jj-vcs community**
