# Pollz Frontend (React)

A modern React application for the BITS Pilani unified voting platform featuring elections, course ratings, and department/club voting.

#### Hosted Url: https://pollz.bits-acm.in/

![alt text](src/assets/website.png)

## Prerequisites
- Node.js 19+
- npm or yarn
- For Frontend Windows works fine but if you aim for full stack, Linux or macOS (preferred). On Windows, use **WSL** or dual boot.


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
