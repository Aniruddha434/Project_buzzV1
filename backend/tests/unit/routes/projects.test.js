/**
 * Unit Test: Projects Routes
 * Tests the project-related API endpoints
 */

import request from 'supertest';
import express from 'express';
import { vi } from 'vitest';

// Mock the Project model
const mockProject = {
  find: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  findByIdAndDelete: vi.fn()
};

vi.mock('../../models/Project.js', () => ({
  default: mockProject
}));

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  req.user = { _id: 'user123', role: 'seller' };
  next();
};

vi.mock('../../middleware/auth.js', () => ({
  default: mockAuth
}));

// Import routes after mocking
import projectRoutes from '../../routes/projects.js';

const app = express();
app.use(express.json());
app.use('/api/projects', projectRoutes);

describe('Projects Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/projects', () => {
    test('should return all projects', async () => {
      const mockProjects = [
        { _id: '1', title: 'Project 1', price: 99 },
        { _id: '2', title: 'Project 2', price: 149 }
      ];

      mockProject.find.mockResolvedValue(mockProjects);

      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProjects);
      expect(mockProject.find).toHaveBeenCalledWith({ status: 'approved' });
    });

    test('should handle database errors', async () => {
      mockProject.find.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/projects')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('error');
    });
  });

  describe('GET /api/projects/:id', () => {
    test('should return specific project', async () => {
      const mockProjectData = {
        _id: '1',
        title: 'Test Project',
        description: 'Test description',
        price: 99
      };

      mockProject.findById.mockResolvedValue(mockProjectData);

      const response = await request(app)
        .get('/api/projects/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProjectData);
      expect(mockProject.findById).toHaveBeenCalledWith('1');
    });

    test('should return 404 for non-existent project', async () => {
      mockProject.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/projects/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('POST /api/projects', () => {
    test('should create new project', async () => {
      const newProject = {
        title: 'New Project',
        description: 'New project description',
        price: 199,
        category: 'web'
      };

      const createdProject = { _id: 'new123', ...newProject, seller: 'user123' };
      mockProject.create.mockResolvedValue(createdProject);

      const response = await request(app)
        .post('/api/projects')
        .send(newProject)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newProject.title);
      expect(mockProject.create).toHaveBeenCalledWith({
        ...newProject,
        seller: 'user123'
      });
    });

    test('should validate required fields', async () => {
      const invalidProject = {
        description: 'Missing title and price'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(invalidProject)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });

  describe('PUT /api/projects/:id', () => {
    test('should update existing project', async () => {
      const updateData = {
        title: 'Updated Project',
        price: 299
      };

      const updatedProject = { _id: '1', ...updateData };
      mockProject.findByIdAndUpdate.mockResolvedValue(updatedProject);

      const response = await request(app)
        .put('/api/projects/1')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(mockProject.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        updateData,
        { new: true }
      );
    });
  });

  describe('DELETE /api/projects/:id', () => {
    test('should delete project', async () => {
      mockProject.findByIdAndDelete.mockResolvedValue({ _id: '1' });

      const response = await request(app)
        .delete('/api/projects/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
      expect(mockProject.findByIdAndDelete).toHaveBeenCalledWith('1');
    });

    test('should return 404 for non-existent project', async () => {
      mockProject.findByIdAndDelete.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/projects/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
