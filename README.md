# Pollz Frontend (React)

A modern React application for the BITS Pilani unified voting platform featuring elections, course ratings, and department/club voting.

## Prerequisites
- Node.js 16+
- npm or yarn

## Setup

1. **Clone and navigate to frontend**
```bash
cd pollz-frontend/
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your API endpoints
```

### Razorpay Integration (For SuperChat payments)

1. **Get Razorpay Public Key:**
   - Visit [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Go to **Account & Settings** → **API Keys**
   - Copy the **Key ID** (public key - safe to use in frontend)
   - **Note:** Never put the Key Secret in frontend code!

2. **Configure Frontend Environment:**
```bash
# Add to your .env file
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

3. **Testing Payments Locally:**
   - Ensure your backend is running with proper Razorpay configuration
   - Use ngrok to expose your backend (see backend README)
   - Use Razorpay test cards for testing:
     - **Success:** `4111 1111 1111 1111`
     - **Failure:** `4000 0000 0000 0002`
   - Test SuperChat feature in the live chat section

4. **Run development server**
```bash
npm start
```

Application will open at `http://localhost:3000`

## Available Scripts
- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Environment Variables
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:8000/api)
- `REACT_APP_WEBSOCKET_URL` - WebSocket URL (default: ws://localhost:1401/ws/chat/live)
- `REACT_APP_GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `REACT_APP_RAZORPAY_KEY_ID` - Razorpay public key for payments

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Navbar.js        # Navigation bar with auth
│   └── GoogleAuthButton.js # Google login component
├── pages/               # Main page components
│   ├── LandingPage.js   # Home page with timeline
│   ├── SUElection.js    # Student Union elections
│   ├── HuelVoting.js    # Course rating system
│   └── DepartmentClubs.js # Department/club voting
├── context/             # React Context providers
│   └── AuthContext.js   # Authentication state
├── App.js              # Main app component
├── index.js            # App entry point
└── index.css           # Global styles and Tailwind
```

## Pages Overview

### 🏠 Landing Page
- Hero section with BITS Pilani campus image
- Interactive election timeline (2024/2025)
- Shows previous election results with candidate photos
- Features overview cards

### 🗳️ SU Elections
- Candidate profiles with manifestos
- Real-time vote counts and percentages
- Position-based voting (President, General Secretary)
- Voting statistics dashboard

### 📚 Huel Voting
- Course rating system with multiple parameters:
  - **Grading** (fairness and transparency)
  - **Toughness** (difficulty level)
  - **Overall** (average rating)
- Search and filter by department
- Anonymous comments and reviews
- Upvote/downvote system

### 🏆 Departments/Clubs
- Ranked voting for departments and clubs
- Real-time leaderboards
- Achievement highlights
- Community comments
- Separate tabs for departments vs clubs

## Authentication

- **Google OAuth** integration for secure login
- User profile display in navbar
- Protected voting actions (login required)
- Anonymous comments for privacy

## Environment Variables

Create a `.env` file:

```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WEBSOCKET_URL=ws://localhost:1401/ws/chat/live
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

## Styling Features

- **BITS Pilani Brand Colors**:
  - Primary Blue: `#003d7a`
  - Gold: `#ffc107`
- **Custom Animations**:
  - Fade-in effects
  - Slide-up transitions
  - Hover animations
- **Responsive Design**:
  - Mobile-first approach
  - Tablet and desktop optimized
  - Flexible grid layouts

## Key Components

### Navbar
- Responsive navigation with mobile menu
- Google authentication integration
- Active route highlighting
- User profile display

### Election Timeline
- Year selector (2024/2025)
- Animated vote percentage bars
- Candidate photo display
- Results visualization

### Voting Cards
- Interactive vote buttons
- Real-time vote counts
- Progress bars and percentages
- Comment systems

## Development Notes

- All voting actions require authentication
- Comments are anonymous for honest feedback
- Vote counts are simulated (connect to backend API)
- Images should be placed in `public/images/` directory
- Responsive breakpoints: sm (640px), md (768px), lg (1024px)

## Deployment

```bash
# Build production bundle
npm run build

# Deploy build/ directory to your hosting platform
```

## Contributing

1. Follow React best practices
2. Use Tailwind CSS for styling
3. Implement responsive design
4. Add error handling for API calls
5. Test on multiple screen sizes

---

**Built for BITS Pilani students, by students** 🎓