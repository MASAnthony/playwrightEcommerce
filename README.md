# Playwright Automation Framework

A production-ready, scalable automation framework built with Playwright and TypeScript.

## 🚀 Features
- **TypeScript**: Type-safe test development.
- **Page Object Model (POM)**: Maintainable and reusable page abstractions.
- **Ortoni Report**: Beautiful and detailed test reporting.
- **Environment Handling**: Environment-based configuration using `dotenv`.
- **Modular Architecture**: Scalable folder structure.
- **Custom Fixtures**: Simplified test setup (e.g., `loggedInPage`).
- **Mixed Testing**: Support for both UI and API testing.

## 📁 Folder Structure
```text
playwright-automation-framework/
│
├── playwright.config.ts    # Playwright configuration
├── package.json            # Scripts and dependencies
├── tsconfig.json          # TypeScript configuration
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
│
├── tests/                  # Test specifications
│   ├── auth/              # Auth related tests
│   ├── dashboard/         # Dashboard tests
│   └── api/               # API tests
│
├── pages/                  # Page Object Models
│   ├── base/              # Base page abstraction
│   ├── auth/              # Auth page objects
│   └── dashboard/         # Dashboard page objects
│
├── fixtures/               # Test fixtures
├── utils/                  # Helper utilities
├── config/                 # Configurations & Routes
└── ortoni-report/          # Generated reports
```

## 🛠️ Setup
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd playwright-automation-framework
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update values in `.env` as needed.

4. **Install Playwright Browsers**:
   ```bash
   npx playwright install
   ```

## 🧪 Running Tests
- **All tests**: `npm test`
- **Headed mode**: `npm run test:headed`
- **UI mode**: `npm run test:ui`
- **Specific test file**: `npx playwright test tests/auth/login.spec.ts`

## 📊 Reports
To view the Ortoni Report:
```bash
npm run report
```

## 📐 Coding Guidelines
- **AAA Pattern**: Follow Arrange-Act-Assert.
- **No Hardcoded Waits**: Use Playwright's auto-waiting or explicit `waitFor` methods.
- **CamelCase**: Use for methods and variables.
- **UPPER_CASE**: Use for constants.
- **POM**: Always define locators and actions within Page Objects.

## 🤝 Collaboration
- **Branch Naming**: `feature/feature-name`, `bugfix/issue-description`.
- **Commit Messages**: Follow conventional commits (e.g., `feat: add login test`).
- **PR Process**: Create a pull request, ensure CI/CD passes, and get at least one review.

## 🚀 Advanced Improvements (Placeholder)
- [ ] Docker support
- [ ] GitHub Actions CI workflow
- [ ] Slack notifications integration
- [ ] Data-driven testing with external data sources
