# Voice Content Platform

A comprehensive web application for content creators to upload, transcribe, and manage voice content with role-based access control.

## Features

### User Management
- **Sign Up**: Create accounts with different roles (Publisher, Editor, User)
- **Sign In**: Secure authentication with JWT tokens
- **Role-based Access**: Different permissions for different user types
- **Profile Management**: Update personal information and settings

### Content Management
- **Voice File Upload**: Support for various audio formats
- **Automatic Transcription**: Generate transcripts from audio files
- **Content Metadata**: Titles, descriptions, keywords, and subjects
- **Content Publishing**: Control visibility and publication status

### Admin Features
- **User Management**: View all users and manage their accounts
- **Account Activation**: Activate or deactivate user accounts
- **System Overview**: Dashboard with user statistics

### Public Features
- **Content Discovery**: Browse published content from publishers
- **Like & Comment**: Social features for content interaction
- **Public Frontend**: Accessible to all visitors

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **UI Components**: Radix UI with custom styling
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd voice-content-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Update the `.env` file with your configuration:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── (public)/          # Public pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   └── ui/               # Base UI components
├── lib/                  # Utility functions
│   ├── auth.ts           # Authentication utilities
│   ├── db.ts             # Database connection
│   ├── utils.ts          # General utilities
│   ├── validations.ts    # Form validation schemas
│   └── middleware.ts     # API middleware
└── prisma/               # Database schema and migrations
    └── schema.prisma     # Prisma schema
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login

### User Management (Admin)
- `GET /api/users` - Get all users
- `PATCH /api/users/[id]/toggle-status` - Toggle user activation

### Content Management
- `POST /api/content/upload` - Upload voice content
- `GET /api/content` - Get user's content
- `GET /api/content?public=true` - Get public content

## User Roles

### System Administrator
- View all users
- Activate/deactivate user accounts
- Full system access

### Publisher
- Upload and manage voice content
- Publish content for public viewing
- Access to content analytics

### Editor
- Upload and edit content
- Limited publishing capabilities
- Content management tools

### User
- Basic content creation
- Personal content management
- View published content

## Development

### Database Migrations

To create a new migration:
```bash
npx prisma migrate dev --name migration_name
```

To apply migrations:
```bash
npx prisma migrate deploy
```

### Adding New Features

1. Update the Prisma schema if needed
2. Create API routes in `src/app/api/`
3. Build UI components in `src/components/`
4. Add pages in the appropriate route group

## Deployment

### Environment Variables

Make sure to set the following environment variables in production:

- `DATABASE_URL`: Your production database URL
- `NEXTAUTH_SECRET`: A secure random string
- `NEXTAUTH_URL`: Your production domain

### Database

For production, consider using a more robust database like PostgreSQL:

1. Update the Prisma schema:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Run migrations:
```bash
npx prisma migrate deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
