# Pull Request Template for Pollz Frontend

## ✏️ Summary of Changes

Describe the changes you have made, including any refactoring or feature additions. Attach any relevant screenshots or videos.

## 📦 Dependencies

**Core Actions**

`actions/checkout@v4` - For code checkout
`actions/setup-node@v4` - For Node.js environment setup
`actions/upload-artifact@v4` - For build artifact storage

**Runtime Dependencies**

`Node.js: 20.x` (specified in workflow)
`npm`: Used for package management and caching
`Ubuntu`: ubuntu-latest runner environment

**Project Dependencies**

Required npm Scripts (from package.json):

`npm run lint:check` - ESLint code quality checks
`npm run test:ci `- Jest test execution with CI configuration
`npm run build` - React production build

**Environment Variables**

`CI=true` - For test execution
`CI=false` - For build process
`REACT_APP_API_URL` - API endpoint configuration (uses secret or default)

## 🐛 Related Issues

The issue is related to: Add GitHub Actions CI/CD pipeline #5, 
[github issue link]("https://github.com/bitsacm/pollz-frontend/issues/5")

## 📋 Checklist

- [X] I have tested my changes locally
- [X] I have updated documentation if necessary
- [X] My code follows the project's coding standards
- [X] I have tested on multiple screen sizes (responsive design)
- [X] I have updated package.json if new dependencies were added
- [X] Environment variables are properly configured
- [X] All components are properly styled with Tailwind CSS
- [X] Authentication flows work correctly
- [X] All tests pass locally (`npm test`)
- [X] Code passes linting (`npm run lint:check`)
- [X] Build succeeds (`npm run build`)

## 🚀 CI/CD Status

- [X] All GitHub Actions checks pass
- [X] Build artifacts are generated successfully
- [X] No security vulnerabilities detected

## 📝 Additional Notes

**Dependency chain for demonstration of the gihub action workflow.**
```
graph LR
    A[Push/PR] --> B[CI Workflow]
    B --> C[Install Dependencies]
    C --> D[Lint Code]
    D --> E[Run Tests]
    E --> F[Build App]
    F --> G[Upload Artifacts]
    G --> H[Deploy Workflow]
```