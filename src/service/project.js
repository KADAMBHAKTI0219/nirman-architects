import api from './auth';

/**
 * ERP Module 1 - Project Management API Services
 */

export const createProject = async (projectData) => {
  const response = await api.post('/projects/create', projectData);
  return response.data;
};

export const getProjects = async (params = {}) => {
  try {
    const response = await api.get('/projects', { params });
    if (response.data) {
      if (Array.isArray(response.data)) {
        return { success: true, projects: response.data };
      }
      if (response.data.data && Array.isArray(response.data.data.projects)) {
        return { success: true, projects: response.data.data.projects };
      }
      if (Array.isArray(response.data.projects)) {
        return { success: true, projects: response.data.projects };
      }
      if (Array.isArray(response.data.data)) {
        return { success: true, projects: response.data.data };
      }
      const projectsArray = [];
      Object.keys(response.data).forEach((key) => {
        if (!isNaN(key) && response.data[key] && typeof response.data[key] === 'object') {
          projectsArray.push(response.data[key]);
        }
      });
      if (projectsArray.length > 0) {
        return { success: true, projects: projectsArray };
      }
      return { success: true, projects: response.data.projects || [] };
    }
    return { success: true, projects: [] };
  } catch (err) {
    console.error("Error fetching projects from backend:", err);
    return { success: false, projects: [], message: err.response?.data?.message || err.message };
  }
};

export const getProjectById = async (id) => {
  try {
    const response = await api.get(`/projects/${id}`);
    if (response.data) {
      if (response.data.data && response.data.data.project) {
        return { success: true, project: response.data.data.project };
      }
      if (response.data.project) {
        return { success: true, project: response.data.project };
      }
    }
    return response.data;
  } catch (err) {
    return { success: false, project: null, message: err.response?.data?.message || err.message };
  }
};

export const updateProject = async (id, projectData) => {
  const response = await api.put(`/projects/${id}`, projectData);
  return response.data;
};

export const updateProjectStatus = async (id, newStatus, notes = '') => {
  const response = await api.put(`/projects/${id}/update-status`, { newStatus, notes });
  return response.data;
};

export const getProjectStatusHistory = async (id) => {
  try {
    const response = await api.get(`/projects/${id}/status-history`);
    return response.data;
  } catch (err) {
    return { success: false, history: [], message: err.response?.data?.message || err.message };
  }
};

export const addMilestone = async (id, milestoneData) => {
  const response = await api.post(`/projects/${id}/milestones/add`, milestoneData);
  return response.data;
};

export const completeMilestone = async (id, milestoneId) => {
  const response = await api.put(`/projects/${id}/milestones/${milestoneId}/complete`);
  return response.data;
};

export const updateMilestone = async (id, milestoneId, milestoneData) => {
  const response = await api.put(`/projects/${id}/milestones/${milestoneId}`, milestoneData);
  return response.data;
};

export const deleteMilestone = async (id, milestoneId) => {
  const response = await api.delete(`/projects/${id}/milestones/${milestoneId}`);
  return response.data;
};

export const updateProjectProgress = async (id, progressData) => {
  const response = await api.put(`/projects/${id}/progress`, progressData);
  return response.data;
};

export const assignTeamMember = async (id, teamData) => {
  const response = await api.post(`/projects/${id}/team/assign`, teamData);
  return response.data;
};

export const removeTeamMember = async (id, userId) => {
  const response = await api.delete(`/projects/${id}/team/${userId}/remove`);
  return response.data;
};

export const updateTeamRole = async (id, userId, roleData) => {
  const response = await api.put(`/projects/${id}/team/${userId}/role`, roleData);
  return response.data;
};

export const getTeamMembers = async (id) => {
  try {
    const response = await api.get(`/projects/${id}/team`);
    return response.data;
  } catch (err) {
    return { success: false, team: [], message: err.response?.data?.message || err.message };
  }
};

export const addResponsibilityMatrix = async (id, matrixData) => {
  const response = await api.post(`/projects/${id}/responsibility-matrix/add`, matrixData);
  return response.data;
};

export const getResponsibilityMatrix = async (id) => {
  try {
    const response = await api.get(`/projects/${id}/responsibility-matrix`);
    return response.data;
  } catch (err) {
    return { success: false, matrix: [], message: err.response?.data?.message || err.message };
  }
};

export const getProgressBreakdown = async (id) => {
  try {
    const response = await api.get(`/projects/${id}/progress-breakdown`);
    return response.data;
  } catch (err) {
    return { success: false, breakdown: null, message: err.response?.data?.message || err.message };
  }
};

export const createProjectCategory = async (catData) => {
  const response = await api.post('/project-category/create', catData);
  return response.data;
};

export const getActiveProjectCategories = async () => {
  try {
    const response = await api.get('/project-category/active');
    if (response.data) {
      if (Array.isArray(response.data)) {
        return { success: true, categories: response.data };
      }
      return response.data;
    }
    return { success: true, categories: [] };
  } catch (err) {
    return { success: false, categories: [], message: err.response?.data?.message || err.message };
  }
};

export const createDepartment = async (deptData) => {
  const response = await api.post('/department/create', deptData);
  return response.data;
};

export const getActiveDepartments = async () => {
  try {
    const response = await api.get('/department/active');
    if (response.data) {
      if (Array.isArray(response.data)) {
        return { success: true, departments: response.data };
      }
      return response.data;
    }
    return { success: true, departments: [] };
  } catch (err) {
    return { success: false, departments: [], message: err.response?.data?.message || err.message };
  }
};

