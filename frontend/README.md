# Marketplace — React Frontend

Single-page application (SPA) client for the Marketplace e-commerce platform.

## Overview
- **Framework**: React 19 with React Router v7
- **Styling**: Modern custom CSS design system (`src/index.css`) with responsive utilities, CSS custom properties, and accessible contrast ratios
- **State Management**: React Context API (`AuthContext`, `CartContext`)
- **API Client**: Axios instance in `src/services/api.js` configured with JWT Bearer token authentication

## Quick Start
From the project root:
```bash
npm run client
```

Or from within the `frontend/` directory:
```bash
npm start
```

Runs the development app at [http://localhost:3000](http://localhost:3000).

## Scripts
- `npm start`: Runs the development server
- `npm test`: Runs React Testing Library test suites
- `npm run build`: Compiles production build to `build/`
- `npm run lint`: Runs ESLint
