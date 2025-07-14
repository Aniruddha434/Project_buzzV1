import api from '../api.js';

// Project API service functions
export const projectService = {
  // Get all approved projects (public)
  async getProjects(params = {}) {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  // Get current user's projects
  async getMyProjects() {
    const response = await api.get('/projects/my');
    return response.data;
  },

  // Get single project by ID
  async getProject(id) {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Create new project
  async createProject(projectData) {
    const formData = new FormData();

    // Append text fields
    Object.keys(projectData).forEach(key => {
      if (key !== 'image' && key !== 'images' && key !== 'documentationFiles' && key !== 'projectZipFile' && key !== 'projectDetails' && projectData[key] !== undefined) {
        if (Array.isArray(projectData[key])) {
          // For arrays like tags, send as JSON string
          formData.append(key, JSON.stringify(projectData[key]));
        } else {
          formData.append(key, projectData[key]);
        }
      }
    });

    // Handle projectDetails separately with flattened field names
    if (projectData.projectDetails) {
      Object.keys(projectData.projectDetails).forEach(detailKey => {
        const value = projectData.projectDetails[detailKey];
        if (value !== undefined && value !== null && value !== '') {
          formData.append(`projectDetails.${detailKey}`, value);
        }
      });
    }

    // Append project details as individual fields
    if (projectData.projectDetails) {
      Object.keys(projectData.projectDetails).forEach(key => {
        if (projectData.projectDetails[key] !== undefined) {
          formData.append(`projectDetails.${key}`, projectData.projectDetails[key]);
        }
      });
    }

    // Append image files (support multiple images)
    if (projectData.images && Array.isArray(projectData.images)) {
      projectData.images.forEach(image => {
        formData.append('images', image);
      });
    } else if (projectData.image) {
      // Backward compatibility for single image
      formData.append('images', projectData.image);
    }

    // Append documentation files
    if (projectData.documentationFiles && Array.isArray(projectData.documentationFiles)) {
      projectData.documentationFiles.forEach((file, index) => {
        formData.append('documentationFiles', file);
        // Add metadata for each documentation file
        formData.append(`docType_${index}`, 'technical'); // Default type
        formData.append(`docDescription_${index}`, file.name); // Use filename as description
      });
    }

    // Append project ZIP file
    if (projectData.projectZipFile) {
      formData.append('projectZipFile', projectData.projectZipFile);
      // Add description for ZIP file
      if (projectData.zipDescription) {
        formData.append('zipDescription', projectData.zipDescription);
      }
    }

    const response = await api.post('/projects', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update project
  async updateProject(id, projectData) {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  // Delete project
  async deleteProject(id) {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  // Purchase project (DEPRECATED - Use payment service)
  async purchaseProject(id, paymentData = {}) {
    console.warn('purchaseProject is deprecated. Use paymentService.createOrder instead.');
    const response = await api.post(`/projects/${id}/purchase`, paymentData);
    return response.data;
  },

  // Get access info for purchased project (GitHub access)
  async getProjectAccess(id) {
    const response = await api.get(`/projects/${id}/access`);
    return response.data;
  },

  // Download ZIP file for purchased project
  async downloadProjectZip(projectId) {
    try {
      console.log('🔽 Starting download for project:', projectId);

      // First get the project details to find the ZIP file
      const projectResponse = await this.getProject(projectId);
      console.log('📦 Project response:', projectResponse);

      if (!projectResponse.success) {
        console.error('❌ Failed to fetch project:', projectResponse);
        throw new Error('Failed to fetch project details');
      }

      if (!projectResponse.data.projectZipFile) {
        console.error('❌ Project ZIP file not available. Project data:', {
          title: projectResponse.data.title,
          hasZipFile: !!projectResponse.data.projectZipFile,
          projectId: projectId
        });
        throw new Error('This project does not have a downloadable ZIP file. Please contact the seller for access to the source code.');
      }

      const zipFilename = projectResponse.data.projectZipFile.filename;
      const downloadUrl = `/projects/download/${zipFilename}`;

      console.log('🔗 Download URL:', `${api.defaults.baseURL}${downloadUrl}`);

      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = `${api.defaults.baseURL}${downloadUrl}`;
      link.download = projectResponse.data.projectZipFile.originalName;
      link.style.display = 'none';

      // Add authorization header by creating a fetch request instead
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('🔐 Making authenticated request...');
      const response = await fetch(`${api.defaults.baseURL}${downloadUrl}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Download failed:', response.status, errorData);
        throw new Error(errorData.message || 'Download failed');
      }

      console.log('✅ Download response OK, creating blob...');

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('🎉 Download completed successfully!');
      return { success: true, message: 'Download started' };
    } catch (error) {
      console.error('Error downloading ZIP file:', error);
      throw error;
    }
  },

  // Download documentation file for purchased project
  async downloadDocumentationFile(filename, originalName) {
    try {
      console.log('📄 Starting documentation download:', filename);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const downloadUrl = `/projects/docs/${filename}`;
      console.log('🔗 Documentation download URL:', `${api.defaults.baseURL}${downloadUrl}`);

      const response = await fetch(`${api.defaults.baseURL}${downloadUrl}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Documentation response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Documentation download failed:', response.status, errorData);
        throw new Error(errorData.message || 'Documentation download failed');
      }

      console.log('✅ Documentation download response OK, creating blob...');

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName || filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('🎉 Documentation download completed successfully!');
      return { success: true, message: 'Documentation download started' };
    } catch (error) {
      console.error('Error downloading documentation file:', error);
      throw error;
    }
  },

  // Legacy method for backward compatibility
  async getDownloadLink(id) {
    return this.getProjectAccess(id);
  },

  // Search projects
  async searchProjects(query, filters = {}) {
    const params = { search: query, ...filters };
    const response = await api.get('/projects', { params });
    return response.data;
  },

  // Get projects by category
  async getProjectsByCategory(category, params = {}) {
    const response = await api.get('/projects', {
      params: { category, ...params }
    });
    return response.data;
  },

  // Get approved projects (public)
  async getApprovedProjects() {
    const response = await api.get('/projects');
    return response.data;
  },

  // Get featured projects
  async getFeaturedProjects() {
    const response = await api.get('/projects', {
      params: { featured: true, limit: 6 }
    });
    return response.data;
  },

  // Image management methods

  // Add images to existing project
  async addProjectImages(projectId, images) {
    const formData = new FormData();

    images.forEach(image => {
      formData.append('images', image);
    });

    const response = await api.post(`/projects/${projectId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Remove image from project
  async removeProjectImage(projectId, imageId) {
    const response = await api.delete(`/projects/${projectId}/images/${imageId}`);
    return response.data;
  },

  // Set image as primary
  async setPrimaryImage(projectId, imageId) {
    const response = await api.put(`/projects/${projectId}/images/${imageId}/primary`);
    return response.data;
  },

  // Reorder project images
  async reorderProjectImages(projectId, imageOrders) {
    const response = await api.put(`/projects/${projectId}/images/reorder`, {
      imageOrders
    });
    return response.data;
  }
};

export default projectService;
