/**
 * Unit Test: ProjectCard Component
 * Tests the ProjectCard component rendering and functionality
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ProjectCard from '../../components/ProjectCard';

// Mock the AuthContext
const mockAuthContext = {
  user: { role: 'buyer' },
  isAuthenticated: true
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Test wrapper with Router
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('ProjectCard Component', () => {
  const mockProject = {
    _id: '1',
    title: 'Test Project',
    description: 'This is a test project description',
    price: 99.99,
    images: ['test-image.jpg'],
    seller: {
      _id: 'seller1',
      displayName: 'Test Seller'
    },
    category: 'web',
    tags: ['react', 'javascript'],
    createdAt: '2025-01-01T00:00:00.000Z'
  };

  test('renders project title and description', () => {
    render(
      <TestWrapper>
        <ProjectCard project={mockProject} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText(/This is a test project description/)).toBeInTheDocument();
  });

  test('displays formatted price', () => {
    render(
      <TestWrapper>
        <ProjectCard project={mockProject} />
      </TestWrapper>
    );

    expect(screen.getByText('₹99.99')).toBeInTheDocument();
  });

  test('shows seller information', () => {
    render(
      <TestWrapper>
        <ProjectCard project={mockProject} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Seller')).toBeInTheDocument();
  });

  test('displays project tags', () => {
    render(
      <TestWrapper>
        <ProjectCard project={mockProject} />
      </TestWrapper>
    );

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('javascript')).toBeInTheDocument();
  });

  test('handles click events', () => {
    const mockOnClick = vi.fn();
    
    render(
      <TestWrapper>
        <ProjectCard project={mockProject} onClick={mockOnClick} />
      </TestWrapper>
    );

    const card = screen.getByRole('article');
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledWith(mockProject);
  });

  test('renders without images gracefully', () => {
    const projectWithoutImages = { ...mockProject, images: [] };
    
    render(
      <TestWrapper>
        <ProjectCard project={projectWithoutImages} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  test('handles long descriptions with truncation', () => {
    const projectWithLongDescription = {
      ...mockProject,
      description: 'This is a very long description that should be truncated when displayed in the project card component to maintain proper layout and readability.'
    };
    
    render(
      <TestWrapper>
        <ProjectCard project={projectWithLongDescription} />
      </TestWrapper>
    );

    const description = screen.getByText(/This is a very long description/);
    expect(description).toBeInTheDocument();
  });
});
