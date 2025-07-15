# 🧪 ProjectBuzz Testing Suite

## 📁 Test Structure

```
tests/
├── integration/          # End-to-end integration tests
│   ├── project-creation.test.js
│   └── backend-connection.test.js
├── unit/                 # Unit tests for individual components
│   ├── frontend/         # Frontend unit tests
│   └── backend/          # Backend unit tests
└── e2e/                  # End-to-end user workflow tests
    └── user-workflows.test.js
```

## 🚀 Running Tests

### **All Tests**
```bash
npm test                  # Run all tests
npm run test:frontend     # Frontend tests only
npm run test:backend      # Backend tests only
```

### **Specific Test Types**
```bash
# Integration tests
npm run test:integration

# Unit tests
npm run test:unit

# End-to-end tests
npm run test:e2e

# With coverage
npm run test:coverage
```

## 🎯 Test Categories

### **Integration Tests**
- **Project Creation**: Complete project creation workflow
- **Backend Connection**: API endpoint health checks
- **Payment Flow**: Razorpay integration testing
- **Authentication**: JWT token validation

### **Unit Tests**
- **Frontend Components**: React component testing
- **Backend Routes**: API endpoint logic
- **Services**: Business logic validation
- **Utilities**: Helper function testing

### **E2E Tests**
- **User Registration**: Complete signup flow
- **Project Purchase**: Buy and download workflow
- **Seller Dashboard**: Project management flow
- **Admin Operations**: Administrative functions

## 🔧 Test Configuration

### **Frontend (Vitest)**
- **Framework**: Vitest with React Testing Library
- **Coverage**: Istanbul coverage reports
- **Mocking**: MSW for API mocking

### **Backend (Node.js)**
- **Framework**: Jest with Supertest
- **Database**: MongoDB Memory Server for testing
- **Mocking**: Sinon for service mocking

## 📊 Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical workflows covered
- **E2E Tests**: Main user journeys validated

## 🛠️ Writing Tests

### **Frontend Component Test Example**
```javascript
import { render, screen } from '@testing-library/react';
import { ProjectCard } from '../components/ProjectCard';

test('renders project card with title', () => {
  const project = { title: 'Test Project', price: 99 };
  render(<ProjectCard project={project} />);
  expect(screen.getByText('Test Project')).toBeInTheDocument();
});
```

### **Backend Route Test Example**
```javascript
import request from 'supertest';
import app from '../server.js';

test('GET /api/projects returns projects list', async () => {
  const response = await request(app)
    .get('/api/projects')
    .expect(200);
  
  expect(response.body.success).toBe(true);
  expect(Array.isArray(response.body.data)).toBe(true);
});
```

## 🔍 Test Best Practices

1. **Descriptive Names**: Clear test descriptions
2. **Isolated Tests**: No dependencies between tests
3. **Mock External Services**: Use mocks for APIs
4. **Clean Setup/Teardown**: Proper test lifecycle
5. **Meaningful Assertions**: Test actual behavior

## 📈 Continuous Integration

Tests run automatically on:
- **Pull Requests**: All tests must pass
- **Main Branch**: Full test suite execution
- **Deployment**: Integration tests before deploy

---

**Maintained by**: ProjectBuzz Development Team
**Last Updated**: January 2025
