# Pollz Frontend (React)

A modern React application for the BITS Pilani unified voting platform featuring elections, course ratings, and department/club voting.

## Prerequisites
- Node.js 16+
- npm or yarn
- Linux or macOS (preferred). On Windows, use **WSL** or dual boot.

---

## Setup Instructions

### Option 1: Clone All Repositories (recommended for full-stack setup)

1. **Fork** the repositories on GitHub (backend, frontend, websocket) from the original organization:  

   * Backend: [bitsacm/pollz-backend](https://github.com/bitsacm/pollz-backend)  
   * Frontend: [bitsacm/pollz-frontend](https://github.com/bitsacm/pollz-frontend)  
   * Websocket: [bitsacm/pollz-websocket](https://github.com/bitsacm/pollz-websocket)  

2. **Clone your forks** into a single `pollz` folder (replace `<your-github-username>` with yours):

   ```bash
   # Create a parent folder to keep all Pollz repos together
   mkdir pollz
   cd pollz

   # Clone backend
   git clone https://github.com/<your-github-username>/pollz-backend.git

   # Clone frontend
   git clone https://github.com/<your-github-username>/pollz-frontend.git

   # Clone websocket
   git clone https://github.com/<your-github-username>/pollz-websocket.git

3. **Add upstream remotes** to fetch updates from the official repos:

   ```bash
   cd pollz-backend
   git remote add upstream https://github.com/bitsacm/pollz-backend.git
   cd ..

   cd pollz-frontend
   git remote add upstream https://github.com/bitsacm/pollz-frontend.git
   cd ..

   cd pollz-websocket
   git remote add upstream https://github.com/bitsacm/pollz-websocket.git
   cd ..
   ```

---

### Option 2: Clone Frontend Only

1. **Fork** the repository on GitHub.

2. **Clone your fork** (replace `<your-github-username>`):

   ```bash
   git clone https://github.com/<your-github-username>/pollz-frontend.git
   cd pollz-frontend
   ```

3. *(Optional but recommended for contributors)* Add the original repo as upstream:

   ```bash
   git remote add upstream https://github.com/bitsacm/pollz-frontend.git
   git fetch upstream
   ```
---

### Running the Frontend Locally

> **Note:** Make sure you are inside the `pollz-frontend/` directory before running the following commands.


1. **Install dependencies**
```bash
npm install
```

2. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your API endpoints
```

3. **Run development server**
```bash
npm start
```

Application will open at `http://localhost:3000`

## Available Scripts
- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests

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
REACT_APP_API_URL=http://localhost:6969/api
REACT_APP_WEBSOCKET_URL=ws://localhost:1401
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