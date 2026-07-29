import React, { useState, useEffect } from 'react';
import ProjectList from './ProjectList';
import ProjectDetails from './ProjectDetails';
import CreateProjectModal from './CreateProjectModal';

const INITIAL_PROJECTS = [
  {
    code: "PRJ-CP-101",
    name: "Central Office Tower",
    client: "NexGen Infrastructure Ltd.",
    clientEmail: "contact@nexgen.com",
    clientPhone: "+91 98765 00111",
    location: "Sector 62, Noida, UP",
    category: "Commercial",
    priority: "Critical",
    status: "In Progress",
    startDate: "2026-01-10",
    estCompletion: "2026-12-31",
    actualCompletion: "N/A",
    budget: 1200000,
    spent: 850000,
    progress: 71,
    pendingTasks: 8,
    pendingApprovals: 3,
    lastUpdated: "2 mins ago",
    manager: "Sarah Connor",
    delayFlag: false,
    delayReason: "",
    milestones: [
      { name: "Site Excavation", date: "2026-02-15", status: "Completed", actualDate: "2026-02-14" },
      { name: "Foundation Laying", date: "2026-04-30", status: "Completed", actualDate: "2026-05-02" },
      { name: "Superstructure Framing", date: "2026-08-15", status: "In Progress", actualDate: "N/A" },
      { name: "Interior Fitouts", date: "2026-11-30", status: "Planned", actualDate: "N/A" }
    ],
    drawings: [
      { code: "DWG-CP-001", name: "Foundation Elevation Details", version: "V2.1", type: "Structural DWG", status: "Approved" },
      { code: "DWG-CP-002", name: "HVAC Layout Schematic", version: "V1.0", type: "Service DWG", status: "Pending PM Review" },
      { code: "DWG-CP-003", name: "Plumbing Riser Diagram", version: "V1.2", type: "GFC Release", status: "Pending Admin Signoff" }
    ],
    tasks: [
      { name: "Complete soil testing", dept: "Engineering", status: "Completed", assignee: "Bob Johnson" },
      { name: "Draft facade drawings", dept: "Architecture", status: "In Progress", assignee: "Alice Smith" },
      { name: "Procure structural steel", dept: "Procurement", status: "Delayed", assignee: "Frank Castle" },
      { name: "Concrete slab reinforcement", dept: "Engineering", status: "In Progress", assignee: "Bob Johnson" }
    ],
    team: [
      { name: "Sarah Connor", role: "Lead Project Manager", dept: "Management" },
      { name: "Alice Smith", role: "Jr Architect", dept: "Architecture" },
      { name: "Bob Johnson", role: "Site Engineer", dept: "Engineering" },
      { name: "Frank Castle", role: "Mason Supervisor", dept: "Engineering" }
    ],
    documents: [
      { name: "Structural Integrity Report.pdf", size: "2.4 MB" },
      { name: "Client Agreement Contract.pdf", size: "4.8 MB" }
    ],
    chats: [
      { sender: "Sarah Connor", message: "We need GFC drawing approvals finalized by this Friday to avoid further delays.", time: "10:15 AM" },
      { sender: "John Wick", message: "Client requested minor revision in lobby electrical layout.", time: "11:20 AM" }
    ]
  },
  {
    code: "PRJ-OV-202",
    name: "Oceanic Luxury Villas",
    client: "Goa Beachfront Developments",
    clientEmail: "info@goabeachfront.com",
    clientPhone: "+91 98765 00222",
    location: "Candolim Beachfront, Goa",
    category: "Residential",
    priority: "High",
    status: "Planning",
    startDate: "2026-03-01",
    estCompletion: "2026-10-15",
    actualCompletion: "N/A",
    budget: 850000,
    spent: 310000,
    progress: 36,
    pendingTasks: 4,
    pendingApprovals: 1,
    lastUpdated: "1 hour ago",
    manager: "Sarah Connor",
    delayFlag: false,
    delayReason: "",
    milestones: [
      { name: "Site Excavation", date: "2026-03-15", status: "Completed", actualDate: "2026-03-12" },
      { name: "Plumbing Mockups", date: "2026-06-01", status: "In Progress", actualDate: "N/A" },
      { name: "Roof Structural Setup", date: "2026-08-30", status: "Planned", actualDate: "N/A" }
    ],
    drawings: [
      { code: "DWG-OV-001", name: "Villa Elevation View", version: "V1.0", type: "Architectural", status: "Approved" },
      { code: "DWG-OV-002", name: "Sanitary Layout", version: "V1.1", type: "Mechanical", status: "Pending PM Review" }
    ],
    tasks: [
      { name: "Excavate swimming pool boundary", dept: "Engineering", status: "Completed", assignee: "Frank Castle" },
      { name: "Confirm tiles sourcing", dept: "Procurement", status: "In Progress", assignee: "Alice Smith" }
    ],
    team: [
      { name: "Sarah Connor", role: "Lead Project Manager", dept: "Management" },
      { name: "Alice Smith", role: "Jr Architect", dept: "Architecture" }
    ],
    documents: [
      { name: "Soil Siltation Test.pdf", size: "1.2 MB" }
    ],
    chats: [
      { sender: "Alice Smith", message: "Drafted the pool boundary sketches, waiting for approval.", time: "Yesterday" }
    ]
  },
  {
    code: "PRJ-SM-303",
    name: "Smart City Mall",
    client: "SmartCity Retail Group",
    clientEmail: "procure@smartcity.com",
    clientPhone: "+91 98765 00333",
    location: "Mumbai Bypass Rd, MH",
    category: "Retail",
    priority: "Critical",
    status: "Delayed / At Risk",
    startDate: "2025-10-01",
    estCompletion: "2026-07-31",
    actualCompletion: "N/A",
    budget: 3500000,
    spent: 2900000,
    progress: 82,
    pendingTasks: 18,
    pendingApprovals: 9,
    lastUpdated: "1 day ago",
    manager: "John Wick",
    delayFlag: true,
    delayReason: "Supply chain shortage for specialized GFC double-glazed facade panels.",
    milestones: [
      { name: "Excavation", date: "2025-11-01", status: "Completed", actualDate: "2025-11-05" },
      { name: "Main Slab Cast", date: "2026-01-20", status: "Completed", actualDate: "2026-01-30" },
      { name: "Facade Panel Mounting", date: "2026-04-15", status: "Delayed", actualDate: "N/A" },
      { name: "Atrium Fitouts", date: "2026-06-30", status: "Planned", actualDate: "N/A" }
    ],
    drawings: [
      { code: "DWG-SM-010", name: "Structural Facade Bracket", version: "V3.4", type: "Structural", status: "Pending Admin Signoff" },
      { code: "DWG-SM-011", name: "Atrium Lighting Layout", version: "V1.0", type: "Electrical", status: "Approved" }
    ],
    tasks: [
      { name: "Inspect facade structural brackets", dept: "Quality Control", status: "In Progress", assignee: "Bob Johnson" },
      { name: "Source panel replacements", dept: "Procurement", status: "Delayed", assignee: "John Wick" }
    ],
    team: [
      { name: "John Wick", role: "Project Lead Manager", dept: "Management" },
      { name: "Bob Johnson", role: "Site Engineer", dept: "Engineering" }
    ],
    documents: [
      { name: "Material Testing Log.pdf", size: "6.7 MB" }
    ],
    chats: [
      { sender: "John Wick", message: "We need custom steel anchors re-tested immediately.", time: "2 days ago" }
    ]
  }
];

export default function Projects({ defaultTab = 'directory' }) {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    if (defaultTab === 'timeline' && projects.length > 0) {
      setSelectedProject(projects[0]);
    } else if (defaultTab === 'directory') {
      setSelectedProject(null);
    }
  }, [defaultTab, projects]);
  
  // Filtering list states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Create Project Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    code: '', name: '', client: '', clientEmail: '', clientPhone: '',
    location: '', category: 'Commercial', priority: 'Medium', status: 'Planning',
    startDate: '', estCompletion: '', budget: '', manager: 'Sarah Connor'
  });

  const handleCreateProjectSubmit = (e) => {
    e.preventDefault();
    const created = {
      ...newProject,
      budget: parseFloat(newProject.budget) || 0,
      spent: 0,
      progress: 0,
      pendingTasks: 0,
      pendingApprovals: 0,
      lastUpdated: "Just now",
      delayFlag: false,
      delayReason: "",
      milestones: [
        { name: "Project Initiation", date: newProject.startDate, status: "Completed", actualDate: newProject.startDate }
      ],
      drawings: [],
      tasks: [],
      team: [{ name: newProject.manager, role: "Lead Project Manager", dept: "Management" }],
      documents: [],
      chats: []
    };
    setProjects(prev => [created, ...prev]);
    setIsCreateModalOpen(false);
    // Reset inputs
    setNewProject({
      code: '', name: '', client: '', clientEmail: '', clientPhone: '',
      location: '', category: 'Commercial', priority: 'Medium', status: 'Planning',
      startDate: '', estCompletion: '', budget: '', manager: 'Sarah Connor'
    });
    alert("ERP Project created successfully!");
  };

  const handleUpdateProject = (updatedProject) => {
    setSelectedProject(updatedProject);
    setProjects(prev => prev.map(p => p.code === updatedProject.code ? updatedProject : p));
  };

  const handleApproveDrawing = (dwgCode) => {
    const updatedDrawings = selectedProject.drawings.map(d => 
      d.code === dwgCode ? { ...d, status: "Approved" } : d
    );
    const updated = {
      ...selectedProject,
      drawings: updatedDrawings,
      pendingApprovals: Math.max(0, selectedProject.pendingApprovals - 1)
    };
    setSelectedProject(updated);
    setProjects(prev => prev.map(p => p.code === selectedProject.code ? updated : p));
    alert(`Drawing ${dwgCode} approved successfully!`);
  };

  return (
    <div className="space-y-6">
      
      {!selectedProject ? (
        <ProjectList 
          projects={projects}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          onSelectProject={handleSelectProject}
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

  function handleSelectProject(project) {
    setSelectedProject(project);
  }
}
