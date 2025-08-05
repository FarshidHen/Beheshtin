# Voice Content Platform (Beheshtin)

A comprehensive web application for content creators to upload, transcribe, and manage voice content with role-based access control.

## 🌟 Features

- **User Management**: Sign up, sign in, role-based access (Admin, Publisher, Editor, User)
- **Content Management**: Upload voice files, automatic transcription, metadata management
- **Admin Panel**: User management, account activation, system overview
- **Public Frontend**: Content discovery, like & comment features
- **Secure Authentication**: JWT tokens with bcrypt password hashing

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **UI**: Radix UI components
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Docker & Docker Compose

## 🚀 Quick Start

### Local Development

```bash
# Clone repository
git clone https://github.com/FarshidHen/Beheshtin.git
cd Beheshtin

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your settings

# Set up database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

### Docker Deployment

```bash
# Build and start
docker-compose up -d --build

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

## 👤 User Roles

- **Admin**: Full system access, user management
- **Publisher**: Upload and publish content
- **Editor**: Upload and edit content
- **User**: Basic content creation

## 🔌 API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/users` - Get all users (Admin)
- `POST /api/content/upload` - Upload voice content
- `GET /api/content` - Get user's content
- `GET /api/content?public=true` - Get public content

## 🐳 Production Deployment

For detailed deployment instructions on DigitalOcean, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/db_name"
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://your-domain.com"
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
├── components/            # UI components
├── lib/                  # Utilities & helpers
└── prisma/               # Database schema
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License

---

Made with ❤️ by [FarshidHen](https://github.com/FarshidHen)
