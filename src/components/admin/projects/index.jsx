import React, { useState, useEffect } from 'react';
import ProjectList from './ProjectList';
import ProjectDetails from './ProjectDetails';
import CreateProjectModal from './CreateProjectModal';
import { getProjects, createProject } from '../../../service/project';

export default function Projects({ defaultTab = 'directory' }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filtering list states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Create Project Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    code: '', name: '', projectName: '', client: '', clientInformation: '', clientEmail: '', clientPhone: '',
    location: '', address: '', category: 'Commercial', priority: 'Medium', status: 'Planning',
    startDate: '', estCompletion: '', estimatedCompletion: '', budget: '', manager: 'Sarah Connor'
  });

  useEffect(() => {
    fetchProjectsList();
  }, [searchQuery, statusFilter, priorityFilter]);

  const fetchProjectsList = async () => {
    setLoading(true);
    try {
      const res = await getProjects({
        search: searchQuery,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        priority: priorityFilter !== 'All' ? priorityFilter : undefined
      });
      if (res?.success && Array.isArray(res.projects)) {
        const mapped = res.projects.map(p => ({
          ...p,
          code: p.code || `PRJ-${(p.projectName || p.name || 'PRJ').substring(0,3).toUpperCase()}-${(p._id || '').substring(0,4)}`,
          name: p.projectName || p.name || "Untitled Project",
          projectName: p.projectName || p.name || "Untitled Project",
          client: p.clientInformation || p.client || "N/A",
          location: p.address || p.location || "Site Location",
          category: (p.projectCategoryId && typeof p.projectCategoryId === 'object') ? p.projectCategoryId.name : (p.category || "Commercial"),
          progress: p.progressPercentage !== undefined ? p.progressPercentage : 0,
          progressPercentage: p.progressPercentage !== undefined ? p.progressPercentage : 0,
          status: p.status || "New"
        }));
        setProjects(mapped);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("Error fetching projects from backend:", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (defaultTab === 'timeline' && projects.length > 0) {
      setSelectedProject(projects[0]);
    } else if (defaultTab === 'directory') {
      setSelectedProject(null);
    }
  }, [defaultTab]);

  const handleCreateProjectSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      projectName: newProject.name || newProject.projectName || "Untitled Project",
      name: newProject.name || newProject.projectName || "Untitled Project",
      clientInformation: newProject.client || newProject.clientInformation || "",
      address: newProject.location || newProject.address || "",
      budget: parseFloat(newProject.budget) || 0,
      priority: newProject.priority || "Medium",
      projectCategoryId: newProject.projectCategoryId || null,
      startDate: newProject.startDate || new Date().toISOString().split('T')[0],
      estimatedCompletion: newProject.estCompletion || newProject.estimatedCompletion || new Date().toISOString().split('T')[0]
    };

    try {
      const res = await createProject(payload);
      if (res?.success) {
        setIsCreateModalOpen(false);
        setNewProject({
          code: '', name: '', projectName: '', client: '', clientInformation: '', clientEmail: '', clientPhone: '',
          location: '', address: '', category: 'Commercial', priority: 'Medium', status: 'Planning',
          startDate: '', estCompletion: '', estimatedCompletion: '', budget: '', manager: 'Sarah Connor'
        });
        fetchProjectsList();
        alert("ERP Project created successfully!");
      }
    } catch (err) {
      alert("Failed to create project: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateProject = (updatedProject) => {
    setSelectedProject(updatedProject);
    setProjects(prev => prev.map(p => (p._id === updatedProject._id || p.code === updatedProject.code) ? updatedProject : p));
  };

  const handleApproveDrawing = (dwgCode) => {
    if (!selectedProject) return;
    const updatedDrawings = (selectedProject.drawings || []).map(d => 
      d.code === dwgCode ? { ...d, status: "Approved" } : d
    );
    const updated = {
      ...selectedProject,
      drawings: updatedDrawings,
      pendingApprovals: Math.max(0, (selectedProject.pendingApprovals || 0) - 1)
    };
    setSelectedProject(updated);
    setProjects(prev => prev.map(p => (p._id === selectedProject._id || p.code === selectedProject.code) ? updated : p));
    alert(`Drawing ${dwgCode} approved successfully!`);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {!selectedProject ? (
        <ProjectList 
          projects={projects}
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          onSelectProject={(p) => setSelectedProject(p)}
          onCreateClick={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <ProjectDetails 
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
          onUpdateProject={handleUpdateProject}
          onApproveDrawing={handleApproveDrawing}
        />
      )}

      <CreateProjectModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProjectSubmit}
        newProject={newProject}
        setNewProject={setNewProject}
      />

    </div>
  );
}
