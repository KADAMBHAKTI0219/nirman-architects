import api, { isMockSession } from './auth';
import {
  mockGetProjects,
  mockGetProjectById,
  mockCreateProject,
  mockUpdateProject,
  mockAssignTeamMember,
  mockRemoveTeamMember,
  mockAddResponsibilityMatrix,
  mockGetProgressBreakdown,
  mockCreateProjectCategory,
  mockGetActiveProjectCategories,
  mockCreateDepartment,
  mockGetActiveDepartments
} from './mockApi';

/**
 * ERP Module 1 - Project Management API Services
 */

export const createProject = async (projectData) => {
  if (isMockSession()) {
    return await mockCreateProject(projectData);
  }
  const response = await api.post('/projects/create', projectData);
  return response.data;
};

export const getProjects = async (params = {}) => {
  if (isMockSession()) {
    return await mockGetProjects(params);
  }
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
    return await mockGetProjects(params);
  }
};

export const getProjectById = async (id) => {
  if (isMockSession()) {
    return await mockGetProjectById(id);
  }
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
    return await mockGetProjectById(id);
  }
};

export const updateProject = async (id, projectData) => {
  if (isMockSession()) {
    return await mockUpdateProject(id, projectData);
  }
  const response = await api.put(`/projects/${id}`, projectData);
  return response.data;
};

export const updateProjectStatus = async (id, newStatus, notes = '') => {
  if (isMockSession()) {
    return await mockUpdateProject(id, { status: newStatus });
  }
  const response = await api.put(`/projects/${id}/update-status`, { newStatus, notes });
  return response.data;
};

export const getProjectStatusHistory = async (id) => {
  if (isMockSession()) {
    return { success: true, history: [] };
  }
  try {
    const response = await api.get(`/projects/${id}/status-history`);
    return response.data;
  } catch (err) {
    return { success: false, history: [], message: err.response?.data?.message || err.message };
  }
};

export const addMilestone = async (id, milestoneData) => {
  if (isMockSession()) {
    const projRes = await mockGetProjectById(id);
    const proj = projRes.project;
    if (!proj.milestones) proj.milestones = [];
    const newM = {
      _id: `m-${Math.random().toString(36).substring(2, 9)}`,
      ...milestoneData,
      isCompleted: false
    };
    proj.milestones.push(newM);
    await mockUpdateProject(id, proj);
    return { success: true, milestone: newM };
  }
  const response = await api.post(`/projects/${id}/milestones/add`, milestoneData);
  return response.data;
};

export const completeMilestone = async (id, milestoneId) => {
  if (isMockSession()) {
    const projRes = await mockGetProjectById(id);
    const proj = projRes.project;
    if (proj.milestones) {
      const idx = proj.milestones.findIndex(m => String(m._id) === String(milestoneId));
      if (idx > -1) {
        proj.milestones[idx].isCompleted = true;
        await mockUpdateProject(id, proj);
      }
    }
    return { success: true };
  }
  const response = await api.put(`/projects/${id}/milestones/${milestoneId}/complete`);
  return response.data;
};

export const updateMilestone = async (id, milestoneId, milestoneData) => {
  if (isMockSession()) {
    const projRes = await mockGetProjectById(id);
    const proj = projRes.project;
    if (proj.milestones) {
      const idx = proj.milestones.findIndex(m => String(m._id) === String(milestoneId));
      if (idx > -1) {
        proj.milestones[idx] = { ...proj.milestones[idx], ...milestoneData };
        await mockUpdateProject(id, proj);
      }
    }
    return { success: true };
  }
  const response = await api.put(`/projects/${id}/milestones/${milestoneId}`, milestoneData);
  return response.data;
};

export const deleteMilestone = async (id, milestoneId) => {
  if (isMockSession()) {
    const projRes = await mockGetProjectById(id);
    const proj = projRes.project;
    if (proj.milestones) {
      proj.milestones = proj.milestones.filter(m => String(m._id) !== String(milestoneId));
      await mockUpdateProject(id, proj);
    }
    return { success: true };
  }
  const response = await api.delete(`/projects/${id}/milestones/${milestoneId}`);
  return response.data;
};

export const updateProjectProgress = async (id, progressData) => {
  if (isMockSession()) {
    return await mockUpdateProject(id, { progressPercentage: progressData.progressPercentage || progressData.progress });
  }
  const response = await api.put(`/projects/${id}/progress`, progressData);
  return response.data;
};

export const assignTeamMember = async (id, teamData) => {
  if (isMockSession()) {
    return await mockAssignTeamMember(id, teamData);
  }
  try {
    const response = await api.post(`/projects/${id}/team/assign`, teamData);
    return response.data;
  } catch (err) {
    return await mockAssignTeamMember(id, teamData);
  }
};

export const removeTeamMember = async (id, userId) => {
  if (isMockSession()) {
    return await mockRemoveTeamMember(id, userId);
  }
  try {
    const response = await api.delete(`/projects/${id}/team/${userId}/remove`);
    return response.data;
  } catch (err) {
    return await mockRemoveTeamMember(id, userId);
  }
};

export const updateTeamRole = async (id, userId, roleData) => {
  if (isMockSession()) {
    const projRes = await mockGetProjectById(id);
    const proj = projRes.project;
    if (proj.team) {
      const idx = proj.team.findIndex(m => String(m.userId) === String(userId));
      if (idx > -1) {
        proj.team[idx].role = roleData.projectRole || roleData.role;
        await mockUpdateProject(id, proj);
      }
    }
    return { success: true };
  }
  const response = await api.put(`/projects/${id}/team/${userId}/role`, roleData);
  return response.data;
};

export const getTeamMembers = async (id) => {
  if (isMockSession()) {
    const projRes = await mockGetProjectById(id);
    return { success: true, team: projRes.project?.team || [] };
  }
  try {
    const response = await api.get(`/projects/${id}/team`);
    return response.data;
  } catch (err) {
    const projRes = await mockGetProjectById(id);
    return { success: true, team: projRes.project?.team || [] };
  }
};

export const addResponsibilityMatrix = async (id, matrixData) => {
  if (isMockSession()) {
    return await mockAddResponsibilityMatrix(id, matrixData);
  }
  try {
    const response = await api.post(`/projects/${id}/responsibility-matrix/add`, matrixData);
    return response.data;
  } catch (err) {
    return await mockAddResponsibilityMatrix(id, matrixData);
  }
};

export const getResponsibilityMatrix = async (id) => {
  if (isMockSession()) {
    const projRes = await mockGetProjectById(id);
    return { success: true, matrix: projRes.project?.responsibilityMatrix || [] };
  }
  try {
    const response = await api.get(`/projects/${id}/responsibility-matrix`);
    return response.data;
  } catch (err) {
    const projRes = await mockGetProjectById(id);
    return { success: true, matrix: projRes.project?.responsibilityMatrix || [] };
  }
};

export const getProgressBreakdown = async (id) => {
  if (isMockSession()) {
    return await mockGetProgressBreakdown(id);
  }
  try {
    const response = await api.get(`/projects/${id}/progress-breakdown`);
    return response.data;
  } catch (err) {
    return await mockGetProgressBreakdown(id);
  }
};

export const createProjectCategory = async (catData) => {
  if (isMockSession()) {
    return await mockCreateProjectCategory(catData);
  }
  try {
    const response = await api.post('/project-category/create', catData);
    return response.data;
  } catch (err) {
    return await mockCreateProjectCategory(catData);
  }
};

export const getActiveProjectCategories = async () => {
  if (isMockSession()) {
    return await mockGetActiveProjectCategories();
  }
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
    return await mockGetActiveProjectCategories();
  }
};

export const createDepartment = async (deptData) => {
  if (isMockSession()) {
    return await mockCreateDepartment(deptData);
  }
  try {
    const response = await api.post('/department/create', deptData);
    return response.data;
  } catch (err) {
    return await mockCreateDepartment(deptData);
  }
};

export const getActiveDepartments = async () => {
  if (isMockSession()) {
    return await mockGetActiveDepartments();
  }
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
    return await mockGetActiveDepartments();
  }
};
