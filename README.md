# MentorBridge

<div align="center">
  <h3>Connect. Learn. Grow.</h3>
  <p>A modern platform that bridges the gap between mentors and mentees, creating meaningful connections for professional growth.</p>
</div>

## ✨ Overview

MentorBridge is designed to democratize access to mentorship by connecting experienced professionals with those seeking guidance. Our platform facilitates structured knowledge sharing, skill development, and career advancement through a user-friendly interface and powerful matching algorithms.

Whether you're looking to share your expertise or seeking guidance in your professional journey, MentorBridge provides the tools and environment to make mentorship relationships thrive.

## 🌟 Features

### Core Features
- **Smart Mentor Matching** - AI-powered algorithm finds the perfect mentor based on skills, experience, and learning goals
- **Real-Time Messaging** - Seamless communication between mentors and mentees with read receipts and typing indicators
- **Session Scheduling** - Built-in calendar integration with automated reminders
- **Video Conferencing** - Integrated video calls with screen sharing capabilities
- **Progress Tracking** - Set goals and track development over time

### User Experience
- **Intuitive Dashboards** - Separate interfaces for mentors and mentees with relevant insights
- **Comprehensive Profiles** - Showcase skills, experience, testimonials, and availability
- **Notification System** - Stay updated with platform activities and important reminders
- **Resource Library** - Access to guides, templates, and educational materials

### Security & Administration
- **Secure Authentication** - Multi-factor authentication and role-based access control
- **Privacy Controls** - Granular settings for sharing information and availability
- **Reporting Tools** - Generate insights on mentorship progress and platform usage
- **Moderation System** - Ensure quality interactions and community standards

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Shadcn UI components
- **State Management:** React Context API, Zustand
- **Forms:** React Hook Form with Zod validation

### Backend
- **API:** Next.js API Routes, tRPC
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Websockets:** Socket.io for real-time features

### DevOps
- **CI/CD:** GitHub Actions
- **Hosting:** Vercel
- **Monitoring:** Sentry
- **Analytics:** Plausible

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.17.0 or higher)
- npm (v9.6.0 or higher) or yarn (v1.22.0 or higher)
- PostgreSQL (v14 or higher)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/mentorbridge.git
cd mentorbridge
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mentorbridge"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Optional: OAuth Providers (if you want to enable social login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Optional: For file uploads
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Optional: For email notifications
RESEND_API_KEY="your-resend-api-key"
```

4. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to set up your database schema
npx prisma migrate dev

# Seed the database with initial data
npx prisma db seed
```

5. **Start the development server**

```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000

## 🎮 User Guide

### For Mentees

<details>
<summary>Click to expand</summary>

#### Getting Started
1. **Register & Complete Profile**
   - Sign up with email or social accounts
   - Add your skills, learning goals, and preferred mentorship areas
   - Upload a profile photo and set your availability

2. **Find Your Mentor**
   - Use the discover page to browse recommended mentors
   - Filter by industry, skills, experience level, and availability
   - View detailed mentor profiles with ratings and testimonials

3. **Connect & Communicate**
   - Send personalized connection requests to potential mentors
   - Once accepted, use the messaging system to introduce yourself
   - Schedule an initial meeting to discuss goals and expectations

4. **Mentorship Journey**
   - Track progress through the mentorship dashboard
   - Schedule regular sessions using the integrated calendar
   - Access shared resources and complete assigned activities
   - Provide feedback after completing mentorship milestones

</details>

### For Mentors

<details>
<summary>Click to expand</summary>

#### Getting Started
1. **Create Your Mentor Profile**
   - Sign up and select the "Mentor" role
   - Detail your expertise, experience, and mentorship style
   - Set your availability and mentorship capacity

2. **Manage Mentee Requests**
   - Review incoming connection requests
   - Accept mentees that align with your expertise
   - Set expectations and boundaries early

3. **Conduct Mentorship**
   - Use the calendar to schedule and manage sessions
   - Leverage video conferencing for remote mentoring
   - Share resources and assign activities through the platform
   - Track mentee progress and provide structured feedback

4. **Growth & Recognition**
   - Receive testimonials from successful mentorships
   - Earn badges and recognition for your contributions
   - Access mentor-specific resources to improve your mentorship skills

</details>

## 📱 Mobile Support

MentorBridge is fully responsive and offers a progressive web app (PWA) experience:

- **Responsive Design:** Works seamlessly across devices of all sizes
- **PWA Features:** Install on home screen, offline functionality, push notifications
- **Mobile Optimized:** Touch-friendly interfaces and mobile-specific enhancements

## 🔄 API Reference

Our API follows RESTful principles with the following main endpoints:

| Endpoint | Description | Methods |
|----------|-------------|---------|
| `/api/auth/*` | Authentication and authorization | `GET`, `POST` |
| `/api/profiles` | User profile management | `GET`, `POST`, `PUT` |
| `/api/matching` | Mentor discovery and recommendations | `GET`, `POST` |
| `/api/connections` | Manage mentor-mentee relationships | `GET`, `POST`, `PUT`, `DELETE` |
| `/api/messages` | Real-time messaging system | `GET`, `POST` |
| `/api/sessions` | Schedule and manage mentoring sessions | `GET`, `POST`, `PUT`, `DELETE` |
| `/api/resources` | Educational content and shared materials | `GET`, `POST`, `PUT` |
| `/api/notifications` | User alerts and updates | `GET`, `POST`, `PUT` |

For detailed API documentation, run the development server and visit `/api-docs`.

## 🧪 Testing

We use Jest for unit tests and Cypress for end-to-end testing.

```bash
# Run unit tests
npm run test

# Run end-to-end tests
npm run cypress

# Check test coverage
npm run test:coverage
```

## 🔧 Troubleshooting

<details>
<summary>Common Issues</summary>

### Database Connection Problems
- Ensure PostgreSQL is running
- Verify your DATABASE_URL is correctly formatted
- Check network permissions if using a remote database

### Authentication Errors
- Make sure NEXTAUTH_SECRET is set correctly
- Confirm NEXTAUTH_URL matches your development URL
- For social logins, verify callback URLs in provider dashboards

### Prisma Issues
- Try running `npx prisma generate` after schema changes
- Use `npx prisma db push` to sync schema without migrations
- Check Prisma logs with `npx prisma --version`

</details>

## 👥 Contributing

Contributions make the open source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests locally to ensure everything works
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request with a detailed description

## 📊 Project Roadmap

- [x] Core platform functionality
- [x] Real-time messaging system
- [ ] Advanced matching algorithm
- [ ] Mobile applications
- [ ] Group mentorship sessions
- [ ] Skill assessment tools
- [ ] Integration with professional development platforms
- [ ] Organizations/Enterprise features

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) - The React framework for production
- [Prisma](https://www.prisma.io/) - Next-generation ORM for Node.js and TypeScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com/) - Re-usable components built with Radix UI and Tailwind
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
- [React Hook Form](https://react-hook-form.com/) - Performant forms with easy validation
- [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- All contributors who have helped shape this project

---

<div align="center">
  <p>Developed by Bela Mitali</p>
  <p>
    <a href="https://linkedin.com/in/mitali-bela">LinkedIn</a> •
    <a href="https://yourwebsite.com">Website</a>
  </p>
</div>