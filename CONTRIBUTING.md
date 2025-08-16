# Contributing to Pollz Frontend

## Setup
1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Create `.env` from `.env.example`
4. Install dependencies: `npm install`
5. Start dev server: `npm start`

## Development Workflow
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Test on multiple screen sizes
4. Test functionality with backend running
5. Commit with clear message
6. Push and create PR (see PR Guidelines below)

## Code Standards
- Use functional components with hooks
- Follow JSX best practices
- Use Tailwind CSS for styling
- Keep components small and focused
- Use meaningful component and variable names
- Add PropTypes or TypeScript types

## Before Submitting PR
- [ ] No console errors
- [ ] Responsive design works
- [ ] No hardcoded URLs/credentials
- [ ] Components are reusable
- [ ] Authentication flows work
- [ ] Package.json updated if needed

## GitHub PR Guidelines

### PR Title Format
Use conventional commit format: `type(scope): description`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
- `feat(ui): add dark mode toggle`
- `fix(auth): resolve login redirect issue`
- `style(components): update button styling`
- `refactor(hooks): optimize useWebSocket performance`

### PR Description
- Clearly describe what changes were made
- Include screenshots for UI changes (required for frontend)
- Reference related issues using `Fixes #123`
- List any breaking changes
- Mention if new dependencies were added

### Branch Naming
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation
- `style/ui-improvements` - Styling changes
- `refactor/component-name` - Refactoring

### UI/UX Changes
- Always include before/after screenshots
- Test on mobile, tablet, and desktop
- Verify accessibility standards
- Ensure consistent with design system

## Project Structure
- `src/components/` - Reusable UI components
- `src/pages/` - Main page components
- `src/context/` - React Context providers
- `src/services/` - API calls and utilities
- `src/hooks/` - Custom React hooks