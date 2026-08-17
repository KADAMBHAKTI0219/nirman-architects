import api from '../auth';
import { getProjects, getProjectById } from '../project';

const isValidMongoId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

const isClientUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    const u = JSON.parse(userStr);
    const role = String(u.role || u.roleCode || u.userType || '').toLowerCase();
    return u.isClientPortal || role.includes('customer') || role.includes('client');
  } catch (e) {
    return false;
  }
};

const getMockClientProject = (projId = 'proj-1') => ({
  _id: projId,
  id: projId,
  projectName: 'Apex Villa Architectural Execution',
  name: 'Apex Villa Architectural Execution',
  address: 'Plot 42, Green Valley Estate, Mumbai',
  status: 'Active',
  progress: 65,
  projectCategory: 'Residential Architecture',
  budget: 15000000,
  startDate: '2026-01-15',
  estimatedCompletion: '2026-11-30',
  milestones: [
    { _id: 'm-1', name: 'Concept Design & 3D Renderings', isCompleted: true, targetDate: '2026-02-28' },
    { _id: 'm-2', name: 'GFC Structural Drawings Approval', isCompleted: true, targetDate: '2026-04-15' },
    { _id: 'm-3', name: 'Foundation & Plinth Execution', isCompleted: false, targetDate: '2026-07-30' },
    { _id: 'm-4', name: 'Superstructure & Interior Finishing', isCompleted: false, targetDate: '2026-11-30' }
  ],
  team: [
    { name: 'Sarah Connor', role: 'Project Manager' },
    { name: 'Alice Smith', role: 'Lead Architect' },
    { name: 'Bob Johnson', role: 'Site Engineer' }
  ]
});

export const getClientDashboard = async () => {
  let userObj = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) userObj = JSON.parse(userStr);
  } catch (e) {}

  const clientId = userObj?.clientId || userObj?.id || userObj?._id;

  // 1. Try GET /client/dashboard
  try {
    const response = await api.get('/client/dashboard', { validateStatus: status => status === 200 });
    if (response?.status === 200 && response.data && (response.data.success || response.data.activeProjects)) {
      const data = response.data;
      if (Array.isArray(data.activeProjects) && data.activeProjects.length > 0) {
        data.activeProjects = data.activeProjects.map(p => ({
          ...p,
          projectId: p.projectId || p._id || p.id,
          name: p.name || p.projectName || 'Architectural Project',
          projectName: p.projectName || p.name || 'Architectural Project',
          code: p.code || 'PRJ'
        }));
        return data;
      }
    }
  } catch (error) {}

  // 2. Try GET /client/projects/my
  try {
    const myProjRes = await api.get('/client/projects/my', { validateStatus: status => status === 200 });
    if (myProjRes?.status === 200 && myProjRes.data) {
      const projs = Array.isArray(myProjRes.data) ? myProjRes.data : (myProjRes.data.projects || myProjRes.data.data || []);
      if (projs.length > 0) {
        return {
          success: true,
          activeProjects: projs.map(p => ({
            projectId: p._id || p.id || p.projectId,
            projectName: p.projectName || p.name || 'Architectural Project',
            name: p.name || p.projectName || 'Architectural Project',
            code: p.code || 'PRJ',
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

  // 3. Try GET /client/projects
  try {
    const clientProjRes = await api.get('/client/projects', { validateStatus: status => status === 200 });
    if (clientProjRes?.status === 200 && clientProjRes.data) {
      const projs = Array.isArray(clientProjRes.data) ? clientProjRes.data : (clientProjRes.data.projects || clientProjRes.data.data || []);
      if (projs.length > 0) {
        return {
          success: true,
          activeProjects: projs.map(p => ({
            projectId: p._id || p.id || p.projectId,
            projectName: p.projectName || p.name || 'Architectural Project',
            name: p.name || p.projectName || 'Architectural Project',
            code: p.code || 'PRJ',
            address: p.address || 'Site Location',
            status: p.status || 'Active',
            progress: p.progress || 50,
            projectCategory: p.projectCategory || 'Architecture',
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

  // 4. Try GET /client-project-links/by-client/:clientId if clientId is Mongo ObjectId
  if (clientId && isValidMongoId(clientId)) {
    try {
      const linkRes = await api.get(`/client-project-links/by-client/${clientId}`, { validateStatus: status => status === 200 });
      if (linkRes?.status === 200 && linkRes.data) {
        const links = Array.isArray(linkRes.data) ? linkRes.data : (linkRes.data.links || linkRes.data.data || []);
        const projs = links.map(l => l.projectId || l.project || l).filter(Boolean);
        if (projs.length > 0) {
          return {
            success: true,
            activeProjects: projs.map(p => ({
              projectId: p._id || p.id || p.projectId,
              projectName: p.projectName || p.name || 'Architectural Project',
              name: p.name || p.projectName || 'Architectural Project',
              code: p.code || 'PRJ',
              address: p.address || 'Site Location',
              status: p.status || 'Active',
              progress: p.progress || 60,
              projectCategory: 'Architecture'
            })),
            pastProjects: [],
            totalProjectsCount: projs.length,
            contactPermissionLevel: 'OWNER'
          };
        }
      }
    } catch (e) { }
  }

  // Fallback 5: Try staff getProjects() ONLY if staff user (NOT Client/Customer)
  if (!isClientUser()) {
    try {
      const allProjs = await getProjects();
      if (allProjs?.success && Array.isArray(allProjs.projects) && allProjs.projects.length > 0) {
        return {
          success: true,
          activeProjects: allProjs.projects.map(p => ({
            projectId: p._id || p.id,
            projectName: p.projectName || p.name || 'Architectural Project',
            name: p.name || p.projectName || 'Architectural Project',
            code: p.code || 'PRJ',
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
  }

  // Return empty list if no active projects exist for client in backend DB
  return { 
    success: true, 
    activeProjects: [], 
    pastProjects: [], 
    totalProjectsCount: 0, 
    contactPermissionLevel: 'OWNER'
  };
};

export const getClientProjectDetail = async (projectId) => {
  if (!projectId || !isValidMongoId(projectId)) return { success: false, project: null, message: 'Invalid project ID format' };

  try {
    const response = await api.get(`/client/projects/${projectId}`, { validateStatus: () => true });
    if (response?.status === 200 && response.data && (response.data.success || response.data.project)) {
      const data = response.data;
      if (data.project) {
        data.project.name = data.project.name || data.project.projectName || 'Architectural Project';
        data.project.projectName = data.project.projectName || data.project.name || 'Architectural Project';
      }
      return data;
    }
  } catch (error) {}

  // Fallback ONLY if staff user (NOT Client/Customer)
  if (!isClientUser() && isValidMongoId(projectId)) {
    try {
      const fallbackRes = await getProjectById(projectId);
      if (fallbackRes && (fallbackRes.project || fallbackRes._id)) {
        const p = fallbackRes.project || fallbackRes;
        return {
          success: true,
          project: {
            _id: p._id || p.id,
            projectName: p.projectName || p.name || 'Architectural Project',
            name: p.name || p.projectName || 'Architectural Project',
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
  }

  return { success: false, project: null, message: 'Project not found' };
};

export const getClientProjectMilestones = async (projectId) => {
  if (!projectId || !isValidMongoId(projectId)) return { success: true, milestones: [] };

  try {
    const response = await api.get(`/client/projects/${projectId}/milestones`, { validateStatus: () => true });
    if (response?.status === 200 && response.data && Array.isArray(response.data.milestones)) {
      return response.data;
    }
  } catch (error) {}

  try {
    const detail = await getClientProjectDetail(projectId);
    if (detail?.success && detail.project?.milestones) {
      return { success: true, milestones: detail.project.milestones };
    }
  } catch (e) { }

  return { success: true, milestones: [] };
};

export const getClientProjectTimeline = async (projectId) => {
  if (!projectId || !isValidMongoId(projectId)) return { success: true, timeline: [] };

  try {
    const response = await api.get(`/client/projects/${projectId}/timeline`, { validateStatus: () => true });
    if (response?.status === 200 && response.data && Array.isArray(response.data.timeline)) {
      return response.data;
    }
  } catch (error) {}

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

  return { success: true, timeline: [] };
};

export const updateClientProfile = async (payload) => {
  try {
    const response = await api.put('/client-auth/profile', payload, { validateStatus: status => status === 200 });
    return response.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const logClientSessionLogin = async (platform = 'WEB') => {
  try {
    const response = await api.post('/client/session/log-login', { platform }, { validateStatus: status => status === 200 });
    return response.data;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const sendClientSessionHeartbeat = async () => {
  try {
    const response = await api.post('/client/session/heartbeat', {}, { validateStatus: status => status === 200 });
    return response.data;
  } catch (error) {
    return { success: false, message: error.message };
  }
};
