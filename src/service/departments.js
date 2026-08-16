import api from './auth';

/**
 * Helper to safely extract Department Name and filter out raw MongoDB ObjectIds
 */
export const getCleanDepartmentName = (d) => {
  if (!d) return '';
  if (typeof d === 'string') {
    const trimmed = d.trim();
    if (/^[0-9a-fA-F]{24}$/.test(trimmed)) return '';
    return trimmed;
  }
  if (typeof d === 'object') {
    const name = d.name || d.departmentName || d.title || '';
    const nameStr = String(name).trim();
    if (nameStr && !/^[0-9a-fA-F]{24}$/.test(nameStr)) {
      return nameStr;
    }
  }
  return '';
};

/**
 * Fetch all departments from the backend.
 * Backend endpoints: GET /api/departments?includeInactive=true or GET /api/department/active
 */
export const getDepartments = async () => {
  const endpoints = [
    '/department/active',
    '/department/',
    '/department',
    '/departments'
  ];
  let lastErr = null;

  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint);
      if (response && response.data) {
        const data = response.data;
        let list = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data.data && Array.isArray(data.data.departments)) {
          list = data.data.departments;
        } else if (Array.isArray(data.departments)) {
          list = data.departments;
        } else if (Array.isArray(data.data)) {
          list = data.data;
        } else if (typeof data === 'object') {
          const deptsArray = [];
          Object.keys(data).forEach((key) => {
            if (!isNaN(key) && data[key] && typeof data[key] === 'object') {
              deptsArray.push(data[key]);
            }
          });
          if (deptsArray.length > 0) list = deptsArray;
        }

        if (list.length > 0 || data.success) {
          return { success: true, departments: list };
        }
      }
    } catch (err) {
      lastErr = err;
    }
  }

  console.warn("getDepartments API error:", lastErr?.message);
  return { success: false, departments: [], error: lastErr?.response?.data?.message || lastErr?.message || 'Failed to fetch departments' };
};

/**
 * Fetch active departments for dropdown selectors.
 */
export const getActiveDepartments = async () => {
  const endpoints = ['/department/active', '/departments', '/department/', '/department'];
  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint);
      if (response && response.data) {
        const data = response.data;
        let list = [];
        if (data.data && Array.isArray(data.data.departments)) {
          list = data.data.departments;
        } else if (Array.isArray(data.departments)) {
          list = data.departments;
        } else if (Array.isArray(data.data)) {
          list = data.data;
        } else if (Array.isArray(data)) {
          list = data;
        }

        if (list.length > 0) {
          return { success: true, departments: list };
        }
      }
    } catch (err) {
      // Continue to next endpoint
    }
  }
  return await getDepartments();
};

/**
 * Create a new department (Admin / Super Admin).
 * Endpoint: POST /api/department/create
 * Backend expects: { name: "Department Name" }
 */
export const createDepartment = async (payload) => {
  const nameVal = typeof payload === 'string' ? payload.trim() : (payload?.name ? String(payload.name).trim() : '');
  if (!nameVal) {
    throw new Error('Department name is required.');
  }

  const endpoints = ['/department/create', '/departments/create', '/departments'];
  let lastErr = null;

  for (const endpoint of endpoints) {
    try {
      const response = await api.post(endpoint, { name: nameVal });
      return response.data;
    } catch (err) {
      lastErr = err;
      // If 400 Bad Request with a clear message (e.g. duplicate name), throw immediately
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }
    }
  }

  throw new Error(lastErr?.response?.data?.message || lastErr?.message || 'Failed to create department.');
};

/**
 * Update an existing department name.
 * Endpoint: PUT /api/departments/:id or PUT /api/department/:id
 * Backend expects: { name: "Department Name" }
 */
export const updateDepartment = async (id, payload) => {
  const nameVal = typeof payload === 'string' ? payload.trim() : (payload?.name ? String(payload.name).trim() : '');
  if (!nameVal) {
    throw new Error('Department name is required.');
  }

  const endpoints = [`/departments/${id}`, `/department/${id}`];
  let lastErr = null;

  for (const endpoint of endpoints) {
    try {
      const response = await api.put(endpoint, { name: nameVal });
      return response.data;
    } catch (err) {
      lastErr = err;
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }
    }
  }

  throw new Error(lastErr?.response?.data?.message || lastErr?.message || 'Failed to update department.');
};

/**
 * Delete / Soft delete a department by ID.
 * Endpoint: DELETE /api/departments/:id or DELETE /api/department/:id
 */
export const deleteDepartment = async (id) => {
  const endpoints = [`/departments/${id}`, `/department/${id}`];
  let lastErr = null;

  for (const endpoint of endpoints) {
    try {
      const response = await api.delete(endpoint);
      return response.data;
    } catch (err) {
      lastErr = err;
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }
    }
  }

  throw new Error(lastErr?.response?.data?.message || lastErr?.message || 'Failed to delete department.');
};
