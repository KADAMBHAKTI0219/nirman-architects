/**
 * Centralized Role-Based Access Control (RBAC) Helper
 * Standardized across Nirman Architects ERP
 */

export const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
};

export const getUserRoleCode = (user) => {
  const u = user || getUserFromStorage();
  if (!u) return 'EMPLOYEE';
  
  if (typeof u.roleCode === 'string' && u.roleCode) return u.roleCode.toUpperCase();
  if (typeof u.role === 'string' && u.role) return u.role.toUpperCase();
  if (u.role && typeof u.role === 'object' && u.role.roleCode) return u.role.roleCode.toUpperCase();
  if (u.roleId && typeof u.roleId === 'object' && u.roleId.roleCode) return u.roleId.roleCode.toUpperCase();

  return 'EMPLOYEE';
};

export const isTaskManagementRole = (user) => {
  const code = getUserRoleCode(user);
  return ['SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER', 'PM'].includes(code);
};

export const isEmployeeTaskRole = (user) => {
  return !isTaskManagementRole(user);
};

export const canManageTasks = (user) => {
  return isTaskManagementRole(user);
};
