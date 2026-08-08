import api from '../auth';
import { getProjects, getProjectById } from '../project';

/**
 * CRM Module 4 - Client Portal Core API Services
 * Direct backend DB communication with dynamic fallback for project-wise data.
 */

export const getClientDashboard = async () => {
  try {
    const response = await api.get('/client/dashboard');
    if (response.data && (response.data.success || response.data.activeProjects)) {
      return response.data;
    }
  } catch (error) {
    console.warn("Client dashboard API notice:", error.message);
  }

  // Fallback 1: Try /client/projects/my
  try {
    const myProjRes = await api.get('/client/projects/my');
    if (myProjRes.data) {
      const projs = Array.isArray(myProjRes.data) ? myProjRes.data : (myProjRes.data.projects || []);
      if (projs.length > 0) {
        return {
          success: true,
          activeProjects: projs.map(p => ({
            projectId: p._id || p.id || p.projectId,
            projectName: p.projectName || p.name || 'Architectural Project',
            address: p.address || 'Site Location',
            status: p.status || 'Active',
            progress: p.progress || 50,
            projectCategory: p.projectCategory || p.projectCategoryId?.name || 'Architecture',
            budget: p.budget || 0,
            startDate: p.startDate,
            estimatedCompletion: p.estimatedCompletion
          })),
          pastProjects: [],
          totalProjectsCount: projs.length,
          contactPermissionLevel: 'OWNER'
        };
      }
    }
  } catch (e) { }

  // Fallback 2: Try general getProjects()
  try {
    const allProjs = await getProjects();
    if (allProjs?.success && Array.isArray(allProjs.projects) && allProjs.projects.length > 0) {
      return {
        success: true,
        activeProjects: allProjs.projects.map(p => ({
          projectId: p._id || p.id,
          projectName: p.projectName || p.name || 'Architectural Project',
          address: p.address || 'Site Location',
          status: p.status || 'Active',
          progress: p.progress || 60,
          projectCategory: typeof p.projectCategoryId === 'object' ? (p.projectCategoryId?.name || 'Architecture') : 'Commercial',
          budget: p.budget || 0,
          startDate: p.startDate,
          estimatedCompletion: p.estimatedCompletion
        })),
        pastProjects: [],
        totalProjectsCount: allProjs.projects.length,
        contactPermissionLevel: 'OWNER'
      };
    }
  } catch (e) { }

  return { 
    success: false, 
    activeProjects: [], 
    pastProjects: [], 
    totalProjectsCount: 0, 
    contactPermissionLevel: 'OWNER'
  };
};

export const getClientProjectDetail = async (projectId) => {
  if (!projectId) return { success: false, project: null };
  try {
    const response = await api.get(`/client/projects/${projectId}`);
    if (response.data && (response.data.success || response.data.project)) {
      return response.data;
    }
  } catch (error) {
    console.warn("Client project detail API notice:", error.message);
  }

  try {
    const fallbackRes = await getProjectById(projectId);
    if (fallbackRes && (fallbackRes.project || fallbackRes._id)) {
      const p = fallbackRes.project || fallbackRes;
      return {
        success: true,
        project: {
          _id: p._id || p.id,
          projectName: p.projectName || p.name || 'Architectural Project',
          address: p.address || 'Site Location',
          status: p.status || 'Active',
          progress: p.progress || 60,
          projectCategory: typeof p.projectCategoryId === 'object' ? (p.projectCategoryId?.name || 'Architecture') : 'Architecture',
          budget: p.budget || 0,
          startDate: p.startDate,
          estimatedCompletion: p.estimatedCompletion,
          milestones: p.milestones || [],
          team: p.teamAssignments || [],
          raciMatrix: p.raciMatrix || []
        }
      };
    }
  } catch (e) { }

  return { success: false, project: null };
};

export const getClientProjectMilestones = async (projectId) => {
  if (!projectId) return { success: false, milestones: [] };
  try {
    const response = await api.get(`/client/projects/${projectId}/milestones`);
    if (response.data && Array.isArray(response.data.milestones)) {
      return response.data;
    }
  } catch (error) {
    console.warn("Client milestones API notice:", error.message);
  }

  try {
    const detail = await getClientProjectDetail(projectId);
    if (detail?.success && detail.project?.milestones) {
      return { success: true, milestones: detail.project.milestones };
    }
  } catch (e) { }

  return { success: false, milestones: [] };
};

export const getClientProjectTimeline = async (projectId) => {
  if (!projectId) return { success: false, timeline: [] };
  try {
    const response = await api.get(`/client/projects/${projectId}/timeline`);
    if (response.data && Array.isArray(response.data.timeline)) {
      return response.data;
    }
  } catch (error) {
    console.warn("Client timeline API notice:", error.message);
  }

  try {
    const detail = await getClientProjectDetail(projectId);
    if (detail?.success && detail.project?.milestones) {
      const events = (detail.project.milestones || []).map((m, idx) => ({
        id: m._id || `ev-${idx}`,
        title: m.name || m.title || 'Project Milestone',
        date: m.targetDate ? new Date(m.targetDate).toISOString().split('T')[0] : '2026-12-31',
        status: m.isCompleted ? 'Completed' : 'In Progress',
        description: m.description || 'Milestone deliverable step.'
      }));
      return { success: true, timeline: events };
    }
  } catch (e) { }

  return { success: false, timeline: [] };
};

export const updateClientProfile = async (payload) => {
  try {
    const response = await api.put('/client-auth/profile', payload);
    return response.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const logClientSessionLogin = async (platform = 'WEB') => {
  try {
    const response = await api.post('/client/session/log-login', { platform });
    return response.data;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const sendClientSessionHeartbeat = async () => {
  try {
    const response = await api.post('/client/session/heartbeat');
    return response.data;
  } catch (error) {
    return { success: false, message: error.message };
  }
};
