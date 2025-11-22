# Anime Tracker

A community-driven anime tracking platform where users can share their anime watching journey, write reviews at different stages (start, update, complete), and discover what others are watching.

## Features

### For Users
- **Track Anime Progress**: Start tracking an anime with your initial thoughts
- **Timeline Updates**: Add updates as you progress through the series
- **Complete with Reviews**: Mark anime as complete with final thoughts
- **Profile Links**: Share your anime/manga profiles from other platforms
- **Public Feed**: Discover what the community is watching

### For Admins
- **Entry Moderation**: Approve or reject user submissions
- **Platform Stats**: View user counts, pending entries, and completion rates
- **Community Management**: Maintain quality content through approval system

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Wouter for routing
- TanStack Query for data fetching
- Radix UI components
- React Hook Form with Zod validation

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT authentication with bcryptjs
- CORS-enabled for Vercel frontend

### Database
- MongoDB Atlas (cloud-hosted)

### Deployment
- Backend: Render
- Frontend: Vercel
- Database: MongoDB Atlas

## Project Structure

```
anime-tracker/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ui/       # Shadcn UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── StartAnimeDialog.tsx
│   │   │   ├── AddUpdateDialog.tsx
│   │   │   ├── CompleteAnimeDialog.tsx
│   │   │   └── ManageProfileLinksDialog.tsx
│   │   ├── context/      # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── pages/        # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── PublicFeed.tsx
│   │   │   ├── AnimeGroup.tsx
│   │   │   ├── UserProfile.tsx
│   │   │   └── AdminPanel.tsx
│   │   ├── utils/        # Utility functions
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   └── index.html
├── server/                # Backend Express application
│   ├── config/
│   │   └── database.ts   # MongoDB connection
│   ├── models/
│   │   ├── User.ts       # User model
│   │   └── AnimeGroup.ts # AnimeGroup model
│   ├── middleware/
│   │   └── auth.ts       # Authentication & authorization
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── animeRoutes.ts
│   │   ├── userRoutes.ts
│   │   └── adminRoutes.ts
│   ├── app.ts
│   ├── index-dev.ts
│   ├── index-prod.ts
│   └── routes.ts
├── shared/               # Shared TypeScript types
│   └── schema.ts
├── .env.example         # Environment variables template
├── DEPLOYMENT.md        # Deployment guide
├── render.yaml          # Render deployment config
├── vercel.json          # Vercel deployment config
└── README.md
```

## Getting Started (Development)

### Prerequisites
- Node.js 20+ installed
- MongoDB Atlas account (free tier works)
- Git installed

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd anime-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://your-connection-string
   JWT_SECRET=your-secret-key-here
   FRONTEND_URL=http://localhost:5000
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open [http://localhost:5000](http://localhost:5000)
   - Register a new account
   - To make yourself an admin, manually update your user's `role` field to `"admin"` in MongoDB

## Environment Variables

### Required Variables

#### MongoDB Connection
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>
```
Get this from your MongoDB Atlas dashboard.

#### JWT Secret
```env
JWT_SECRET=your-very-secret-random-string
```
Generate a secure random string for production. You can use:
```bash
openssl rand -base64 32
```

#### Frontend URL
```env
FRONTEND_URL=http://localhost:5000  # Development
FRONTEND_URL=https://your-app.vercel.app  # Production
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Anime Tracking
- `GET /api/anime/my-anime` - Get user's anime list
- `GET /api/anime/feed` - Get public feed (approved entries only)
- `GET /api/anime/:id` - Get single anime group
- `POST /api/anime` - Start new anime
- `POST /api/anime/:id/update` - Add update entry
- `POST /api/anime/:id/complete` - Complete anime

### User Profile
- `PUT /api/users/profile-links` - Update profile links

### Admin (Admin only)
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/pending-entries` - Get pending entries
- `POST /api/admin/approve-entry/:groupId/:entryIndex` - Approve entry
- `POST /api/admin/reject-entry/:groupId/:entryIndex` - Reject entry

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deployment Steps

1. **Deploy Backend to Render**
   - Connect GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm run build && npm start`
   - Add environment variables (MONGODB_URI, JWT_SECRET, FRONTEND_URL)

2. **Deploy Frontend to Vercel**
   - Connect GitHub repository
   - Set environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
   - Deploy

3. **Create Admin User**
   - Register through the frontend
   - Update user's `role` to `"admin"` in MongoDB Atlas

## Database Schema

### User Collection
```typescript
{
  _id: ObjectId,
  username: string,
  email: string,
  password: string (hashed),
  role: "admin" | "normal",
  profileLinks: {
    animeSites: [{ name: string, url: string }],
    mangaSites: [{ name: string, url: string }]
  },
  createdAt: Date
}
```

### AnimeGroup Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  animeName: string,
  genre: string,
  totalEpisodes: number,
  links: [{ label: string, url: string }],
  entries: [{
    type: "start" | "update" | "complete",
    thoughts: string,
    date: Date,
    startTime?: string,
    endTime?: string,
    adminApproved: boolean
  }],
  createdAt: Date
}
```

## Features in Detail

### User Journey Flow

1. **Registration/Login**
   - Create account with email and password
   - Secure JWT authentication

2. **Start Tracking Anime**
   - Add anime name, genre, episode count
   - Add multiple watch links
   - Write initial thoughts
   - Set start date and time

3. **Add Updates**
   - Share progress and thoughts
   - Entries await admin approval

4. **Complete Anime**
   - Write final review
   - Set completion date and time
   - Awaits admin approval

5. **Share Profile**
   - Add links to other anime platforms
   - Visible to community in feed

### Admin Workflow

1. **Review Pending Entries**
   - View all submissions awaiting approval
   - See user details and entry content

2. **Approve/Reject**
   - Approve: Entry appears in public feed
   - Reject: Entry is removed

3. **Monitor Stats**
   - Total users
   - Pending entries count
   - Total anime groups
   - Completion rate

## Design Guidelines

The application follows a modern, clean design inspired by MyAnimeList's content density, Discord's community feel, and Linear's information hierarchy.

- **Typography**: Inter (body), Poppins (headings), JetBrains Mono (metadata)
- **Color Scheme**: Purple primary (#a855f7), responsive light/dark mode
- **Components**: Shadcn UI with Tailwind CSS
- **Interactions**: Subtle hover effects, smooth transitions

## Security

- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens for authentication
- Protected routes with middleware
- Role-based access control
- CORS configuration for frontend access
- Environment variables for sensitive data

## Development Best Practices

- TypeScript for type safety
- Zod for runtime validation
- React Hook Form for form management
- TanStack Query for server state
- Modular component architecture
- Centralized API client

## Troubleshooting

### "Cannot connect to database"
- Verify MongoDB connection string
- Check IP whitelist in MongoDB Atlas
- Ensure network access is configured

### CORS Errors
- Verify FRONTEND_URL environment variable
- Check that backend is running
- Confirm Vercel URL matches

### Build Failures
- Run `npm install` to update dependencies
- Check TypeScript errors with `npm run check`
- Verify all environment variables are set

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for learning or production!

## Support

For issues or questions:
- Open an issue on GitHub
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Review API documentation above

---

Built with ❤️ for the anime community
