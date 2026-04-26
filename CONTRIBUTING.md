# Contributing to JAHIZIA

Thank you for your interest in contributing to the JAHIZIA GRC platform!

## Getting Started

1. Fork the repository
2. Follow the setup instructions in [README.md](./README.md)
3. Create a feature branch: `git checkout -b feature/your-feature`
4. Make your changes
5. Submit a pull request

## Development Workflow

### Branch Naming

- `feature/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation changes
- `refactor/` — Code refactoring
- `security/` — Security fixes (discuss privately first)

### Commit Messages

Use conventional commits:
```
feat: add risk export to CSV
fix: correct residual score validation
docs: update API reference
refactor: split AddRiskModal into sub-components
```

### Code Style

- **JavaScript/JSX**: Follow ESLint configuration
- **Indentation**: 2 spaces
- **Strings**: Single quotes
- **Semicolons**: Required
- **Line length**: 100 chars max

### Translation Requirements

All user-facing strings **must** go through the translation system:

```jsx
// ✅ Correct
import { useApp } from '../context/AppContext';
const { t } = useApp();
<span>{t('risk.addNew')}</span>

// ❌ Wrong
<span>Add New Risk</span>
```

Add keys to `src/data/translations.js` with both `ar` and `en` values.

### API Development

- Follow existing patterns in `server/routes/`
- Add Swagger JSDoc annotations to all new endpoints
- Use `authenticate` and `authorize` middleware
- Validate inputs with descriptive error messages (bilingual)
- Log important actions via `audit_log`

## Testing

```bash
# Backend tests
cd server && npm test

# Frontend tests
npm test
```

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add translation keys for new UI strings
4. Request review from a maintainer
5. PRs require 1 approval before merge

## Code of Conduct

Be respectful, inclusive, and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).

## Questions?

Open a discussion or reach out to the maintainers.
