import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, GitCommitHorizontal, CheckCircle2, Search, 
  Settings, Bell, Plus, Video, Image as ImageIcon,
  MessageSquare, MoreHorizontal, LayoutGrid, List,
  PlayCircle, Hash, Clock, ArrowLeft, ChevronRight,
  Share2, Download, Users, Camera,
  Play, Pause, SkipBack, SkipForward, Volume2, Maximize, X, Calendar, LogOut, Film, HardDrive, MapPin
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './lib/AuthContext';
import { db, handleFirestoreError, OperationType, signInWithGoogle } from './lib/firebase';
import { DriveFolderMapper } from './components/DriveFolderMapper';
import { ProjectDetail } from './components/ProjectDetail';
import { googleDriveService } from './services/googleDriveService';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy, getDocs, getDoc } from 'firebase/firestore';

export default function App() {
  const { user, loading, signIn, signOut } = useAuth();
  useEffect(() => {
    const check = setTimeout(() => {
      const el = document.querySelector('div#root:nth-of-type(1) > div:nth-of-type(1) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > button:nth-of-type(2)');
      console.log('DEBUG_BUTTON:', el ? (el as HTMLElement).outerHTML : 'NOT FOUND');
      console.log('DEBUG_BUTTON_PARENT:', el?.parentElement ? (el.parentElement as HTMLElement).innerHTML : 'NOT FOUND');
    }, 5000);
    return () => clearTimeout(check);
  }, []);

  const [activeTab, setActiveTab] = useState('unconfirmed');
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [projectPage, setProjectPage] = useState<'detail' | 'feedback' | 'workspace'>('detail');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectClient, setNewProjectClient] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
      setActiveProject(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
    }
  };

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'projects'), 
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projData: any[] = [];
      snapshot.forEach(doc => {
        projData.push({ id: doc.id, ...doc.data() });
      });
      setProjects(projData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    return () => unsubscribe();
  }, [user]);

  const projectDetail = projects.find(p => p.id === activeProject);

  const handleCreateProject = async () => {
    if (!user || !newProjectName.trim()) return;
    setIsSubmitting(true);
    try {
      const projectId = `prj-${Date.now()}`;
      await setDoc(doc(db, 'projects', projectId), {
        ownerId: user.uid,
        title: newProjectName,
        client: newProjectClient || 'Internal',
        status: 'pending',
        dueDate: 'TBD',
        progress: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setNewProjectName('');
      setNewProjectClient('');
      setActiveTab('projects');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'projects');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNav = (tab: string) => {
    setActiveTab(tab);
    setActiveProject(null);
    setProjectPage('detail');
  };

  const openProject = (id: string, view: 'detail' | 'feedback' = 'detail') => {
    setActiveProject(id);
    setProjectPage(view);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg-base text-text-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded bg-accent-primary animate-pulse flex flex-col items-center justify-center">
            <span className="text-xs text-white leading-none font-black">O</span>
          </div>
          <span className="text-sm text-text-muted font-medium tracking-wide">Starting ODONE...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg-base relative overflow-hidden text-text-primary">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzQTYzQTQ0IiBmaWxsLW9wYWNpdHk9IjAuMDUiPjxwYXRoIGQ9Ik0zNiAzNHYtbGgtaDE0di00aDE0di00aDR2NGgxNHY0aC0xNHY0aC00em0tMjYgMnYtNGgtNHYtNGg0di00aDR2NGg0djRoLTR2NGgtNHptMC0yNHYtNGgtNHYtNGg0di00aDR2NGg0djRoLTR2NGgtNHptMjYgMHYtNGgtdjRoNHYtNGg0djRoNHY0aC00djRoLTR2LTRoLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50 z-0 pointer-events-none"></div>
        <div className="w-[4 00px] bg-surface-1 border border-border-subtle rounded-xl p-8 relative z-10 shadow-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded bg-accent-primary flex flex-col items-center justify-center mb-6">
            <span className="text-[20px] text-white leading-none font-black">O</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-2">Welcome to ODONE</h1>
          <p className="text-sm text-text-secondary mb-8">Sign in to access your media projects and timelines.</p>
          
          <button 
            onClick={signIn}
            className="w-full h-10 px-4 bg-surface-2 hover:bg-border-subtle border border-border-subtle text-text-primary text-sm font-medium rounded flex items-center justify-center gap-3 transition-colors"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  const handleGlobalProjectStatusChange = async (projectId: string, newStatus: string) => {
    try {
      if (newStatus === 'archived') {
          await deleteDoc(doc(db, 'projects', projectId));
          setActiveProject(null);
          return;
      }
      let progress = 0;
      const proj = projects.find(p => p.id === projectId);
      if (proj) {
        progress = proj.progress;
      }
      if (newStatus === 'unconfirmed') progress = 0;
      else if (newStatus === 'pending') progress = 0;
      else if (newStatus === 'progress') progress = 45;
      else if (newStatus === 'review') progress = 80;
      else if (newStatus === 'delivered') progress = 100;

      await updateDoc(doc(db, 'projects', projectId), {
        status: newStatus,
        progress: progress,
        updatedAt: serverTimestamp()
      });
      if (newStatus === 'archived') {
         setActiveProject(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}`);
    }
  };

  return (
    <div className="flex h-screen bg-bg-base text-text-primary overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] flex-shrink-0 border-r border-border-subtle flex flex-col bg-bg-base relative z-20">
        <div className="h-16 flex items-center px-6 border-b border-border-subtle cursor-pointer hover:bg-surface-1 transition-colors" onClick={() => handleNav('dashboard')}>
          <div className="flex items-center gap-2 font-bold tracking-tight text-lg">
            <div className="w-6 h-6 rounded bg-accent-primary flex flex-col items-center justify-center">
              <span className="text-[10px] text-white leading-none font-black">O</span>
            </div>
            ODONE
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
          <div className="px-3 mb-2 text-[12px] font-semibold tracking-wide text-text-muted uppercase">
            Workspace
          </div>
          <NavItem 
            icon={<LayoutGrid className="w-4 h-4" />} 
            label="Dashboard" 
            active={activeTab === 'dashboard' && !activeProject} 
            onClick={() => handleNav('dashboard')} 
          />
          <NavItem 
            icon={<FolderOpen className="w-4 h-4" />} 
            label="Projects" 
            active={activeTab === 'projects' && !activeProject} 
            onClick={() => handleNav('projects')} 
          />
          <NavItem 
            icon={<Calendar className="w-4 h-4" />} 
            label="Calendar" 
            active={activeTab === 'calendar' && !activeProject} 
            onClick={() => handleNav('calendar')} 
          />
          <NavItem 
            icon={<GitCommitHorizontal className="w-4 h-4" />} 
            label="In Review" 
            badge={projects ? projects.filter(p => p.status === 'review').length.toString() : "0"}
            active={activeTab === 'review'} 
            onClick={() => handleNav('review')} 
          />
          <NavItem 
            icon={<Calendar className="w-4 h-4" />} 
            label="Inquiries" 
            badge={projects ? projects.filter(p => p.status === 'unconfirmed').length.toString() : "0"}
            active={activeTab === 'unconfirmed'} 
            onClick={() => handleNav('unconfirmed')} 
          />
          <NavItem 
            icon={<Users className="w-4 h-4" />} 
            label="See More" 
            active={activeTab === 'seemore' && !activeProject} 
            onClick={() => handleNav('seemore')} 
          />
          
          <div className="px-3 mt-8 mb-2 text-[12px] font-semibold tracking-wide text-text-muted uppercase">
            Library
          </div>
          <NavItem icon={<Video className="w-4 h-4" />} label="Footage" />
          <NavItem icon={<ImageIcon className="w-4 h-4" />} label="Assets" />
        </nav>

        <div className="p-4 border-t border-border-subtle space-y-2">
          <button 
            onClick={() => handleNav('settings')}
            className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-surface-1 transition-colors text-sm font-medium text-text-secondary hover:text-text-primary">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-border-subtle" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-surface-2 border border-border-subtle flex items-center justify-center text-[10px] font-bold text-text-primary">
                {user.displayName ? user.displayName.substring(0,2).toUpperCase() : 'US'}
              </div>
            )}
            <div className="flex flex-col items-start flex-1 text-left w-[120px]">
              <span className="text-text-primary line-clamp-1 text-sm font-medium w-full truncate">{user.displayName || 'Starep User'}</span>
              <span className="text-text-muted text-xs truncate w-full">{user.email}</span>
            </div>
            <Settings className="w-4 h-4 text-text-muted flex-shrink-0" />
          </button>
          
          <button 
            onClick={signOut}
            className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-surface-1 transition-colors text-sm font-medium text-text-secondary hover:text-status-error"
           >
             <div className="w-8 h-8 flex items-center justify-center"><LogOut className="w-4 h-4" /></div>
             <span className="flex-1 text-left">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="h-16 border-b border-border-subtle flex items-center justify-between px-8 bg-bg-base z-10 flex-shrink-0">
          <div className="flex flex-1 items-center">
            {activeProject ? (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 text-sm w-full"
              >
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setActiveProject(null);
                      setProjectPage('detail');
                    }}
                    className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-1 rounded transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <span className="font-mono text-xs text-text-muted px-2 border-r border-border-subtle">{projectDetail?.id ? projectDetail.id.split('-')[1] : 'PRJ'}</span>
                  <span className="font-semibold text-text-primary pl-2">{projectDetail?.title || 'Loading...'}</span>
                </div>
                
                <div className="flex items-center gap-1 bg-surface-1 p-1 rounded-lg border border-border-subtle ml-8">
                   <button 
                     onClick={() => setProjectPage('detail')}
                     className={cn("px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors", projectPage === 'detail' ? "bg-accent-primary text-white" : "text-text-secondary hover:text-text-primary hover:bg-surface-2")}
                   >
                     Order Details
                   </button>
                   <button 
                     onClick={() => setProjectPage('workspace')}
                     className={cn("px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors", projectPage === 'workspace' ? "bg-accent-primary text-white" : "text-text-secondary hover:text-text-primary hover:bg-surface-2")}
                   >
                     Workspace
                   </button>
                   <button 
                     onClick={() => setProjectPage('feedback')}
                     className={cn("px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors", projectPage === 'feedback' ? "bg-accent-primary text-white" : "text-text-secondary hover:text-text-primary hover:bg-surface-2")}
                   >
                     Feedback
                   </button>
                </div>
              </motion.div>
            ) : (
               <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input 
                  type="text" 
                  placeholder="Search projects, files..." 
                  className="w-full h-8 pl-9 pr-4 bg-surface-1 border border-border-subtle rounded text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-emp focus:border-b-accent-primary focus:ring-0 transition-all border-b-2 focus:border-b-2"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
             {activeProject && projectDetail?.status === 'unconfirmed' && (
               <div className="flex items-center gap-2 mr-2">
                 <button 
                   onClick={() => handleGlobalProjectStatusChange(activeProject, 'pending')}
                   className="px-3 py-1.5 bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-widest rounded transition-colors"
                 >
                   Confirm Order
                 </button>
                 <button 
                   onClick={() => handleGlobalProjectStatusChange(activeProject, 'archived')}
                   className="px-3 py-1.5 bg-surface-2 border border-border-subtle hover:bg-surface-3 text-text-secondary hover:text-text-primary text-xs font-bold uppercase tracking-widest rounded transition-colors"
                 >
                   Archive
                 </button>
               </div>
             )}

            <button className="w-8 h-8 flex items-center justify-center rounded text-text-secondary hover:text-text-primary hover:bg-surface-1 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-primary border border-bg-base"></span>
            </button>
            {!activeProject && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="h-8 px-4 bg-accent-primary hover:bg-accent-hover text-white text-sm font-medium rounded flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>
            )}
             {activeProject && (
              <button className="h-8 px-4 border border-border-subtle hover:bg-surface-1 text-text-primary text-sm font-medium rounded flex items-center gap-2 transition-colors">
                <Share2 className="w-4 h-4 text-text-secondary" />
                <span>Share</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            {activeProject ? (
              <motion.div
                key="project"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 bg-bg-base overflow-y-auto"
              >
                {projectPage === 'detail' ? (
                  <OrderDetailView 
                     projectId={activeProject} 
                     projectDetail={projectDetail} 
                     user={user} 
                     onOpenFeedback={() => setProjectPage('feedback')}
                     onDelete={handleDeleteProject}
                  />
                ) : projectPage === 'workspace' ? (
                  <ProjectDetail 
                     projectId={activeProject}
                     onOpenDocument={(id) => console.log('Open doc:', id)}
                     onOpenVideo={(id) => setProjectPage('feedback')}
                  />
                ) : (
                  <ProjectView projectId={activeProject} user={user} projectDetail={projectDetail} />
                )}
              </motion.div>
            ) : activeTab === 'calendar' ? (
              <motion.div
                 key="calendar"
                 initial={{ opacity: 0, y: 4 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -4 }}
                 transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                 className="absolute inset-0"
              >
                 <CalendarView 
                   onOpenProject={openProject} 
                   projects={projects} 
                   user={user}
                 />
              </motion.div>
            ) : activeTab === 'seemore' ? (
              <motion.div
                 key="seemore"
                 initial={{ opacity: 0, y: 4 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -4 }}
                 transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                 className="absolute inset-0"
              >
                 <SeeMoreView />
              </motion.div>
            ) : activeTab === 'settings' ? (
              <motion.div
                 key="settings"
                 initial={{ opacity: 0, y: 4 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -4 }}
                 transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                 className="absolute inset-0"
              >
                 <SettingsView />
              </motion.div>
            ) : (
              <motion.div
                 key="dashboard"
                 initial={{ opacity: 0, y: 4 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -4 }}
                 transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                 className="absolute inset-0"
              >
                 <DashboardView onOpenProject={openProject} projects={projects} activeTab={activeTab} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* New Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.15 }}
               className="absolute inset-0 bg-black/60 backdrop-blur-md"
               onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="bg-surface-2 w-full max-w-[560px] rounded-xl border border-border-emp shadow-2xl flex flex-col overflow-hidden relative z-10"
            >
              <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                <h2 className="text-xl font-semibold tracking-tight text-text-primary">Create New Project</h2>
                <button 
                  className="text-text-muted hover:text-text-primary transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-semibold tracking-wide text-text-muted uppercase mb-2">Project Name</label>
                    <input 
                      type="text" 
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="e.g. Q4 Marketing Campaign"
                      className="w-full h-10 px-3 bg-surface-1 border border-border-subtle rounded text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-emp focus:border-b-accent-primary border-b-2 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[12px] font-semibold tracking-wide text-text-muted uppercase mb-2">Client / Internal</label>
                    <input 
                      type="text" 
                      value={newProjectClient}
                      onChange={(e) => setNewProjectClient(e.target.value)}
                      placeholder="e.g. Horizon Realty"
                      className="w-full h-10 px-3 bg-surface-1 border border-border-subtle rounded text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-emp focus:border-b-accent-primary border-b-2 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-border-subtle bg-bg-base/50">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="h-10 px-4 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-1 rounded transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateProject}
                  disabled={isSubmitting || !newProjectName.trim()}
                  className="h-10 px-6 text-sm font-medium bg-accent-primary hover:bg-accent-hover text-white rounded transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, active, badge, onClick }: { icon: React.ReactNode, label: string, active?: boolean, badge?: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors group",
        active 
          ? "bg-surface-2 text-text-primary" 
          : "text-text-secondary hover:bg-surface-1 hover:text-text-primary"
      )}
    >
      <span className={cn("transition-colors", active ? "text-accent-primary" : "text-text-muted group-hover:text-text-primary")}>
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="bg-surface-1 border border-border-subtle px-1.5 py-0.5 rounded text-[10px] font-mono leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}

function DashboardView({ onOpenProject, projects, activeTab }: { onOpenProject: (id: string) => void, projects: any[], activeTab: string }) {
  const [selectedShooter, setSelectedShooter] = useState<string>('all');

  const handleUpdateStatus = async (projectId: string, newStatus: string) => {
    try {
      if (newStatus === 'archived') {
         await deleteDoc(doc(db, 'projects', projectId));
         return;
      }
      let progress = 0;
      if (newStatus === 'pending') progress = 0;
      else if (newStatus === 'progress') progress = 45;
      else if (newStatus === 'review') progress = 80;
      else if (newStatus === 'delivered') progress = 100;

      await updateDoc(doc(db, 'projects', projectId), {
        status: newStatus,
        progress: progress,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}`);
    }
  };

  const displayProjects = projects ? projects.filter(p => {
    if (activeTab === 'review' && p.status !== 'review') return false;
    if (activeTab === 'unconfirmed' && p.status !== 'unconfirmed') return false;
    if (activeTab === 'dashboard' && (p.status === 'archived' || p.status === 'delivered' || p.status === 'unconfirmed')) return false;
    if (activeTab === 'projects' && (p.status === 'archived' || p.status === 'unconfirmed')) return false;
    if (selectedShooter !== 'all' && p.shooterName !== selectedShooter) return false;
    return true;
  }) : [];

  const shooters = projects ? Array.from(new Set(projects.map(p => p.shooterName).filter(Boolean))) : [];
  const ongoingCount = displayProjects.filter(p => ['progress', 'pending'].includes(p.status)).length;
  const reviewCount = displayProjects.filter(p => p.status === 'review').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8">
      {/* Header section */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-1">
            {activeTab === 'review' ? 'In Review' : activeTab === 'unconfirmed' ? 'Inquiries & Ext. Events' : (activeTab === 'projects' ? 'All Projects' : 'Active Projects')}
          </h1>
          <p className="text-sm text-text-secondary">Showing {displayProjects.length} items. You have {ongoingCount} ongoing edits and {reviewCount} waiting for review.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={selectedShooter}
            onChange={(e) => setSelectedShooter(e.target.value)}
            className="bg-surface-1 border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none"
          >
            <option value="all">All Shooters</option>
            {shooters.map(s => (
              <option key={s as string} value={s as string}>{s as string}</option>
            ))}
          </select>
          <div className="flex bg-surface-1 p-1 rounded-lg border border-border-subtle">
              <button className="px-3 py-1.5 bg-surface-2 rounded text-sm font-medium text-text-primary shadow-sm border border-border-subtle">Board</button>
              <button className="px-3 py-1.5 rounded text-sm font-medium text-text-secondary hover:text-text-primary">List</button>
          </div>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayProjects.map(proj => (
          <ProjectCard 
            key={proj.id}
            title={proj.title}
            client={proj.client}
            status={proj.status}
            dueDate={proj.dueDate === 'TBD' ? proj.dueDate : (new Date(proj.dueDate).toLocaleDateString() || 'TBD')}
            progress={proj.progress}
            comments={proj.commentsCount || 0}
            id={proj.id.split('-')[1] || proj.id}
            onClick={() => {
              if (proj.status !== 'unconfirmed') {
                onOpenProject(proj.id);
              }
            }}
            onConfirm={(e: any) => { e.stopPropagation(); handleUpdateStatus(proj.id, 'pending'); }}
            onArchive={(e: any) => { e.stopPropagation(); handleUpdateStatus(proj.id, 'archived'); }}
          />
        ))}
        {displayProjects.length === 0 && (
           <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-border-subtle rounded-xl text-text-secondary">
             <FolderOpen className="w-8 h-8 mb-4 text-text-muted opacity-50" />
             <p>No projects found.</p>
             <p className="text-xs text-text-muted mt-1">{activeTab === 'review' ? 'You have no projects in review.' : 'Create your first project to get started.'}</p>
           </div>
        )}
      </div>

      {activeTab === 'dashboard' && projects && projects.length > 0 && (
        <div className="pt-8 border-t border-border-subtle">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-text-muted" />
            <h2 className="text-lg font-medium">Recent Activity</h2>
          </div>

          <div className="space-y-4">
            <ActivityRow 
              user="Sarah J." 
              action="left a comment on" 
              target="Villa Paradiso Walkthrough (01:24)" 
              time="10m ago"
              type="comment"
            />
            <ActivityRow 
              user="Mike T." 
              action="uploaded 14 new clips to" 
              target="Tech Launch 2026 Keynote" 
              time="2h ago"
              type="upload"
            />
            <ActivityRow 
              user="Client" 
              action="approved" 
              target="Q3 Product Shoot v2" 
              time="Yesterday"
              type="approve"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ title, client, status, dueDate, progress, comments, id, onClick, onConfirm, onArchive }: any) {
  const statusConfig: Record<string, { label: string, color: string, bg: string }> = {
    unconfirmed: { label: 'Unconfirmed', color: 'text-text-muted', bg: 'bg-surface-2 border border-border-subtle' },
    pending: { label: 'Waiting', color: 'text-status-pending', bg: 'bg-status-pending/15' },
    progress: { label: 'Editing', color: 'text-status-progress', bg: 'bg-status-progress/15' },
    review: { label: 'In Review', color: 'text-status-review', bg: 'bg-status-review/15' },
    delivered: { label: 'Delivered', color: 'text-status-delivered', bg: 'bg-status-delivered/15' },
    archived: { label: 'Archived', color: 'text-text-muted', bg: 'bg-surface-2 border border-border-subtle opacity-50' },
    error: { label: 'Overdue', color: 'text-status-error', bg: 'bg-status-error/15' }
  };

  const conf = statusConfig[status] || statusConfig['pending'];

  return (
    <div onClick={onClick} className="group bg-surface-1 border border-border-subtle rounded-[10px] overflow-hidden hover:border-border-emp transition-colors cursor-pointer flex flex-col min-h-48 relative">
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div className="font-mono text-xs text-text-muted tracking-wider uppercase">{id}</div>
          <div className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1.5", conf.bg, conf.color)}>
            <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
            {conf.label}
          </div>
        </div>
        
        <h3 className="text-base font-semibold text-text-primary leading-tight line-clamp-2 mb-1 group-hover:text-accent-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-text-secondary">{client}</p>
        
        {status === 'unconfirmed' ? (
          <div className="mt-4 flex items-center gap-2">
             <button onClick={onConfirm} className="flex-1 bg-accent-primary hover:bg-accent-hover text-white text-[11px] font-medium uppercase tracking-wider py-2 rounded transition-colors text-center">Confirm</button>
             <button onClick={onArchive} className="flex-1 bg-surface-2 hover:bg-surface-3 border border-border-subtle text-text-secondary hover:text-text-primary text-[11px] font-medium uppercase tracking-wider py-2 rounded transition-colors text-center">Archive</button>
          </div>
        ) : (
          <div className="mt-auto flex items-center justify-between text-xs text-text-muted font-mono pt-4">
            <span>{dueDate}</span>
            {comments && (
              <div className="flex items-center gap-1 text-text-secondary font-sans border border-border-subtle bg-surface-2 px-1.5 py-0.5 rounded">
                <MessageSquare className="w-3 h-3" />
                <span>{comments}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Progress bar container */}
      <div className="h-1 bg-surface-2 w-full mt-auto">
        <div 
          className={cn("h-full", status === 'delivered' ? "bg-status-delivered" : "bg-accent-primary")} 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function ActivityRow({ user, action, target, time, type }: any) {
  let Icon = PlayCircle;
  let iconBg = "bg-surface-2";
  
  if (type === 'comment') {
    Icon = MessageSquare;
    iconBg = "bg-status-review/10 text-status-review";
  } else if (type === 'upload') {
    Icon = Video;
    iconBg = "bg-status-progress/10 text-status-progress";
  } else if (type === 'approve') {
    Icon = CheckCircle2;
    iconBg = "bg-status-success/10 text-status-success";
  }

  return (
    <div className="flex items-center gap-4 py-3 border-b border-border-subtle last:border-0 group hover:bg-surface-1 -mx-4 px-4 rounded transition-colors cursor-pointer">
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border border-border-subtle shrink-0", iconBg)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 text-sm">
        <span className="font-medium text-text-primary">{user}</span>
        <span className="text-text-secondary mx-1">{action}</span>
        <span className="font-medium text-text-primary group-hover:underline decoration-border-emp underline-offset-4">{target}</span>
      </div>
      <div className="font-mono text-xs text-text-muted shrink-0">
        {time}
      </div>
    </div>
  );
}

function OrderDetailView({ projectId, projectDetail, user, onOpenFeedback, onDelete }: any) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSystemRootPickerOpen, setIsSystemRootPickerOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);

  const handleDelete = async () => {
    if (!projectId) return;
    if (onDelete) onDelete(projectId);
  };

  const handleUpdateProjectField = async (field: string, value: any) => {
    if (!user || !projectId || !projectDetail) return;
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        [field]: value,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}`);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!user || !projectId || !projectDetail) return;
    try {
      let progress = projectDetail.progress;
      if (newStatus === 'unconfirmed') progress = 0;
      else if (newStatus === 'pending') progress = 0;
      else if (newStatus === 'progress') progress = 45;
      else if (newStatus === 'review') progress = 80;
      else if (newStatus === 'delivered') progress = 100;

      await updateDoc(doc(db, 'projects', projectId), {
        status: newStatus,
        progress: progress,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}`);
    }
  };

  const isUnconfirmed = projectDetail?.status === 'unconfirmed';
  const isPending = projectDetail?.status === 'pending'; // Wait for RAW
  const isEditing = projectDetail?.status === 'progress';
  const isReview = projectDetail?.status === 'review';
  const isDelivered = projectDetail?.status === 'delivered';
  
  const [dragActivePhotos, setDragActivePhotos] = useState(false);
  const [dragActiveVideos, setDragActiveVideos] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragPhotos = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActivePhotos(true);
    } else if (e.type === "dragleave") {
      setDragActivePhotos(false);
    }
  };

  const handleDragVideos = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveVideos(true);
    } else if (e.type === "dragleave") {
      setDragActiveVideos(false);
    }
  };

  const handleFilesUpload = async (files: FileList, type: 'photos' | 'videos') => {
    try {
      const token = localStorage.getItem('google_drive_token');
      if (!token) {
        alert("Google Drive not connected! Please connect in Settings to authorize.");
        return;
      }
      
      const settingsDoc = await getDoc(doc(db, 'settings', 'system'));
      const rootId = settingsDoc.exists() ? settingsDoc.data()?.driveRootFolderId : null;
      if (!rootId) {
        setIsSystemRootPickerOpen(true);
        // We save the pending files to process after root is selected
        setPendingFiles(files); // Need a way to save which type, but skip for now
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      // Safe names
      const safeTitle = (projectDetail.title || 'Untitled').replace(/[^a-zA-Z0-9 ]/g, '');
      const safeClient = (projectDetail.client || 'Client').replace(/[^a-zA-Z0-9 ]/g, '');
      const safeShooter = (projectDetail.shooterName || 'Unassigned').replace(/[^a-zA-Z0-9 ]/g, '');
      const projectFolderName = `${projectDetail.id?.split('-')[1]}_${safeClient}_${safeTitle}`;
      
      const shooterFolderId = await googleDriveService.getOrCreateFolder(token, safeShooter, rootId);
      const projectFolderId = await googleDriveService.getOrCreateFolder(token, projectFolderName, shooterFolderId);
      const rawFolderId = await googleDriveService.getOrCreateFolder(token, 'RAW', projectFolderId);
      const targetFolderId = await googleDriveService.getOrCreateFolder(token, type === 'photos' ? 'Photos' : 'Videos', rawFolderId);
      await googleDriveService.getOrCreateFolder(token, 'FINAL', projectFolderId);
      
      let completedCount = 0;
      for (let i = 0; i < files.length; i++) {
        await googleDriveService.uploadFile(token, files[i], targetFolderId, (prog) => {
           const overallProgress = ((completedCount * 100) + prog) / files.length;
           setUploadProgress(overallProgress);
        });
        completedCount++;
      }
      
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        handleUpdateStatus('progress');
      }, 500);

    } catch (e: any) {
      console.error("Upload error", e);
      alert("Failed to upload: " + (e.message || 'Unknown error'));
      setIsUploading(false);
    }
  };

  const handleDropPhotos = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActivePhotos(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files, 'photos');
    }
  };

  const handleDropVideos = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveVideos(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files, 'videos');
    }
  };

  const handlePhotoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesUpload(e.target.files, 'photos');
    }
  };

  const handleVideoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesUpload(e.target.files, 'videos');
    }
  };
  
  const hasRawFiles = isEditing || isReview || isDelivered;
  const showVersions = isEditing || isReview || isDelivered;

  return (
    <div className="max-w-6xl mx-auto p-8 h-full flex flex-col min-h-0 bg-[#0A0A0B] text-white">
      <div className="flex items-start justify-between mb-4 shrink-0 pb-4 border-b border-white/5">
         <div>
           <div className="flex items-center gap-3 mb-2">
             <input
               type="text"
               value={projectDetail?.title || ''}
               onChange={(e) => handleUpdateProjectField('title', e.target.value)}
               className="text-2xl font-bold uppercase tracking-[0.1em] text-white bg-transparent border-none outline-none focus:ring-1 focus:ring-indigo-500/50 hover:bg-white/5 rounded px-2 -ml-2 transition-all w-full max-w-lg"
               placeholder="Project Title"
             />
             <span className={cn(
                "px-2.5 py-1 rounded bg-[#121214] text-[10px] font-bold uppercase tracking-widest border",
                projectDetail?.status === 'review' ? "text-purple-400 border-purple-400/20" :
                projectDetail?.status === 'progress' ? "text-indigo-400 border-indigo-400/20" :
                projectDetail?.status === 'delivered' ? "text-teal-400 border-teal-400/20" :
                projectDetail?.status === 'unconfirmed' ? "text-white/40 border-white/10" :
                projectDetail?.status === 'archived' ? "text-white/20 border-white/5" :
                "text-blue-400 border-blue-400/20"
              )}>
                {projectDetail?.status === 'progress' ? 'In Progress' : projectDetail?.status === 'unconfirmed' ? 'Unconfirmed' : projectDetail?.status === 'archived' ? 'Archived' : projectDetail?.status || 'Pending'}
              </span>
           </div>
           <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50 px-2 -ml-2 font-bold">
             <span>Client:</span>
             <input
               type="text"
               value={projectDetail?.client || ''}
               onChange={(e) => handleUpdateProjectField('client', e.target.value)}
               className="bg-transparent border-none outline-none hover:bg-white/5 focus:ring-1 focus:ring-indigo-500/50 rounded px-1 py-0.5 transition-all text-white/80"
               placeholder="Client Name"
             />
           </div>
         </div>

         <div className="flex items-center gap-3">
            {showVersions && (
              <button 
                onClick={onOpenFeedback}
                className="px-4 py-2 border border-white/5 bg-[#121214] hover:bg-white/5 text-white/80 hover:text-white rounded text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center gap-2"
              >
                <Video className="w-3 h-3" />
                Feedback
              </button>
            )}
            {!isUnconfirmed && (
              <button 
                onClick={() => handleUpdateStatus('delivered')}
                className="px-4 py-2 border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(45,212,191,0.1)] hover:shadow-[0_0_20px_rgba(45,212,191,0.2)]"
              >
                <Share2 className="w-3 h-3" />
                Deliver
              </button>
            )}
         </div>
      </div>

      <div className="flex gap-8 flex-1 min-h-0">
         <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
            {/* Meta */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-[#121214] border border-white/5 rounded flex flex-col items-start hover:border-white/10 transition-colors cursor-pointer group">
                 <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                   <Calendar className="w-3 h-3 text-white/20 group-hover:text-indigo-400 transition-colors" /> Event Date
                 </p>
                 <p className="font-mono text-sm text-white/90">{projectDetail?.dueDate !== 'TBD' ? new Date(projectDetail?.dueDate).toLocaleDateString() : 'TBD'}</p>
                 <p className="text-[10px] text-white/40 mt-1 font-mono">10:00 AM - 02:00 PM</p>
              </div>
              <div className="p-4 bg-[#121214] border border-white/5 rounded flex flex-col items-start hover:border-white/10 transition-colors cursor-pointer group">
                 <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-white/20 group-hover:text-indigo-400 transition-colors" /> Location
                 </p>
                 <p className="font-mono text-sm text-white/90">123 Horizon Ave, NY</p>
                 <p className="text-[10px] text-indigo-400 mt-1 font-bold uppercase tracking-widest hover:text-indigo-300">View Map</p>
              </div>
              <div className="p-4 bg-[#121214] border border-white/5 rounded flex flex-col items-start hover:border-white/10 transition-colors cursor-pointer group">
                 <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <Video className="w-3 h-3 text-white/20 group-hover:text-indigo-400 transition-colors" /> Job Type
                 </p>
                 <p className="font-mono text-sm text-white/90">Real Estate Promo</p>
                 <div className="flex gap-2 mt-2">
                    <span className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] font-bold text-white/50 uppercase tracking-widest border border-white/5">DRONE</span>
                    <span className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] font-bold text-white/50 uppercase tracking-widest border border-white/5">CAM</span>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Photo Upload Area */}
              <div 
                 className={cn("border rounded bg-[#121214] overflow-hidden flex flex-col relative transition-colors", dragActivePhotos ? "border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_30px_rgba(99,102,241,0.1)]" : "border-white/5")}
                 onDragEnter={handleDragPhotos}
                 onDragLeave={handleDragPhotos}
                 onDragOver={handleDragPhotos}
                 onDrop={handleDropPhotos}
              >
                 <div className="p-4 border-b border-white/5 bg-[#0D0D0E] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h3 className={cn("font-bold text-[11px] uppercase tracking-widest transition-colors", dragActivePhotos ? "text-indigo-400" : "text-white")}>RAW Photos</h3>
                      <label className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[9px] uppercase tracking-widest font-bold transition-colors text-white/80 cursor-pointer">
                        Browse
                        <input type="file" multiple className="hidden" onChange={handlePhotoInput} />
                      </label>
                    </div>
                 </div>
                 <div className="p-6 flex flex-col items-center justify-center text-center bg-[#121214]/50 min-h-[140px] pointer-events-none">
                    {isUploading ? (
                      <>
                        <div className="w-6 h-6 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin mb-2"></div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">Uploading...</p>
                      </>
                    ) : hasRawFiles ? (
                      <>
                        <ImageIcon className="w-6 h-6 text-indigo-400 mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Photos uploaded.</p>
                      </>
                    ) : (
                      <>
                        <ImageIcon className={cn("w-6 h-6 mb-2 transition-colors", dragActivePhotos ? "text-indigo-400 scale-110" : "text-white/10")} />
                        <p className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", dragActivePhotos ? "text-indigo-400" : "text-white/40")}>Drop photos here</p>
                      </>
                    )}
                 </div>
              </div>

              {/* Video Upload Area */}
              <div 
                 className={cn("border rounded bg-[#121214] overflow-hidden flex flex-col relative transition-colors", dragActiveVideos ? "border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_30px_rgba(99,102,241,0.1)]" : "border-white/5")}
                 onDragEnter={handleDragVideos}
                 onDragLeave={handleDragVideos}
                 onDragOver={handleDragVideos}
                 onDrop={handleDropVideos}
              >
                 <div className="p-4 border-b border-white/5 bg-[#0D0D0E] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h3 className={cn("font-bold text-[11px] uppercase tracking-widest transition-colors", dragActiveVideos ? "text-indigo-400" : "text-white")}>RAW Videos</h3>
                      <label className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[9px] uppercase tracking-widest font-bold transition-colors text-white/80 cursor-pointer">
                        Browse
                        <input type="file" multiple className="hidden" onChange={handleVideoInput} />
                      </label>
                    </div>
                 </div>
                 <div className="p-6 flex flex-col items-center justify-center text-center bg-[#121214]/50 min-h-[140px] pointer-events-none">
                    {isUploading ? (
                      <>
                        <div className="w-6 h-6 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin mb-2"></div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">Uploading...</p>
                      </>
                    ) : hasRawFiles ? (
                      <>
                        <Video className="w-6 h-6 text-indigo-400 mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Videos uploaded.</p>
                      </>
                    ) : (
                      <>
                        <Video className={cn("w-6 h-6 mb-2 transition-colors", dragActiveVideos ? "text-indigo-400 scale-110" : "text-white/10")} />
                        <p className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", dragActiveVideos ? "text-indigo-400" : "text-white/40")}>Drop videos here</p>
                      </>
                    )}
                 </div>
              </div>
            </div>

                {/* Deliverables */}
                {showVersions && (
                  <div>
                     <h3 className="font-bold text-white/40 text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <Film className="w-3 h-3 text-white/20" /> Versions
                     </h3>
                     {hasRawFiles && (isReview || isDelivered) ? (
                       <div className="space-y-2">
                          <div className="p-3 border border-white/10 rounded bg-[#121214] flex items-center justify-between group hover:border-white/20 transition-colors cursor-pointer">
                             <div className="flex items-center gap-4">
                                <div className="w-14 h-9 bg-[#0A0A0B] rounded border border-white/5 flex items-center justify-center">
                                   <Video className="w-4 h-4 text-indigo-400/50 group-hover:text-indigo-400 transition-colors" />
                                </div>
                                <div>
                                   <p className="font-bold text-white text-[11px] tracking-wide line-clamp-1">V2_Horizon_Promo_Final.mp4</p>
                                   <p className="text-[9px] font-mono text-white/40 mt-1">Uploaded 2 hours ago • Version 2</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <button className="p-1.5 text-white/40 hover:text-white transition-colors bg-white/5 rounded border border-white/5 opacity-0 group-hover:opacity-100">
                                   <Download className="w-3 h-3" />
                                </button>
                                <button onClick={onOpenFeedback} className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-[9px] font-bold rounded uppercase tracking-widest transition-colors">Needs Review</button>
                             </div>
                          </div>
                          <div className="p-3 border border-white/5 rounded bg-[#121214]/50 flex items-center justify-between opacity-50 hover:opacity-100 transition-opacity">
                             <div className="flex items-center gap-4">
                                <div className="w-14 h-9 bg-[#0A0A0B] rounded border border-white/5 flex items-center justify-center">
                                   <Video className="w-4 h-4 text-white/20" />
                                </div>
                                <div>
                                   <p className="font-bold text-white text-[11px] tracking-wide line-clamp-1">V1_Horizon_Promo.mp4</p>
                                   <p className="text-[9px] font-mono text-white/40 mt-1">Uploaded yesterday • Version 1</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-white/5 text-white/30 border border-white/5 text-[9px] font-bold rounded uppercase tracking-widest">Archived</span>
                             </div>
                          </div>
                       </div>
                     ) : (
                       <div className="p-8 border border-white/5 bg-[#121214] rounded flex flex-col items-center justify-center text-center">
                          <Video className="w-8 h-8 text-white/10 mb-3" />
                          <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">Editing in progress...</p>
                          <p className="text-[10px] font-mono text-white/30 mt-1">Edited videos will appear here once ready.</p>
                       </div>
                     )}
                  </div>
                )}
          </div>
      </div>

      {isSystemRootPickerOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="w-full max-w-2xl relative">
             <DriveFolderMapper 
               accessToken={localStorage.getItem('google_drive_token') || ''} 
               onSelectRoot={async (id, name) => {
                 try {
                   await setDoc(doc(db, 'settings', 'system'), { driveRootFolderName: name, driveRootFolderId: id }, { merge: true });
                   setIsSystemRootPickerOpen(false);
                   if (pendingFiles) {
                     handleFilesUpload(pendingFiles, 'photos');
                     setPendingFiles(null);
                   }
                 } catch (error) {
                   handleFirestoreError(error, OperationType.UPDATE, 'settings/system');
                 }
               }}
               onClose={() => setIsSystemRootPickerOpen(false)}
             />
           </div>
        </div>
      )}
    </div>
  );
}

function ProjectView({ projectId, user, projectDetail }: any) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  
  useEffect(() => {
     if (!user || !projectId) return;
     const q = query(
       collection(db, 'projects', projectId, 'comments'),
       orderBy('createdAt', 'asc')
     );
     const unsubscribe = onSnapshot(q, (snapshot) => {
       const cmts: any[] = [];
       snapshot.forEach(doc => {
         cmts.push({ id: doc.id, ...doc.data() });
       });
       setComments(cmts);
     }, (error) => {
       handleFirestoreError(error, OperationType.LIST, `projects/${projectId}/comments`);
     });
     return () => unsubscribe();
  }, [projectId, user]);

  const handlePostComment = async () => {
     if (!user || !newComment.trim()) return;
     try {
       const commentId = `cmt-${Date.now()}`;
       await setDoc(doc(db, 'projects', projectId, 'comments', commentId), {
         ownerId: user.uid,
         timestamp: "01:24", // mock timestamp
         text: newComment.trim(),
         createdAt: serverTimestamp()
       });
       setNewComment('');
     } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, `projects/${projectId}/comments`);
     }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!user || !projectId || !projectDetail) return;
    try {
      let progress = projectDetail.progress;
      if (newStatus === 'pending') progress = 0;
      else if (newStatus === 'progress') progress = 45;
      else if (newStatus === 'review') progress = 80;
      else if (newStatus === 'delivered') progress = 100;

      await updateDoc(doc(db, 'projects', projectId), {
        status: newStatus,
        progress: progress,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}`);
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#000]">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="aspect-video w-full max-w-5xl bg-surface-1 border border-border-subtle rounded-lg flex items-center justify-center relative shadow-xl overflow-hidden group">
            <span className="text-text-muted font-mono flex items-center gap-2"><PlayCircle className="w-12 h-12 stroke-[1px]" /></span>
            
            {/* Fake video controls overlay (shows on hover) */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <button><Play className="w-5 h-5 fill-white" /></button>
                    <button><SkipBack className="w-4 h-4" /></button>
                    <button><SkipForward className="w-4 h-4" /></button>
                    <button><Volume2 className="w-4 h-4" /></button>
                    <span className="font-mono text-sm ml-2">01:24 <span className="text-white/50">/ 03:45</span></span>
                  </div>
                  <button><Maximize className="w-4 h-4" /></button>
               </div>
            </div>
          </div>
        </div>
        
        {/* Scrubber Area */}
        <div className="h-48 border-t border-border-subtle bg-bg-base p-6 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="font-mono text-2xl font-medium tracking-tight text-text-primary">01:24<span className="text-text-muted">:15</span></div>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded border border-border-subtle flex items-center justify-center hover:bg-surface-1"><SkipBack className="w-4 h-4" /></button>
              <button className="w-10 h-8 rounded bg-surface-2 border border-border-subtle flex items-center justify-center hover:bg-surface-1 text-text-primary"><Play className="w-4 h-4 fill-current" /></button>
              <button className="w-8 h-8 rounded border border-border-subtle flex items-center justify-center hover:bg-surface-1"><SkipForward className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex-1 relative cursor-text group">
             {/* Timeline background */}
             <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 bg-surface-1 border border-border-subtle rounded flex overflow-hidden">
                {/* Waveform placeholder */}
                <div className="w-full h-full opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iMTAwJSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAgNDBMMTAgNjBNMjAgMjBMMjAgODBNMzAgMzBMMzAgNzBNNDAgMTBMNDAgOTBNNTAgMzBMNTAgNzAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+')] background-repeat-x background-size-contain"></div>
             </div>
             
             {/* Progress Fill */}
             <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 bg-surface-2 mix-blend-screen overflow-hidden border-y border-border-subtle rounded-l z-10" style={{ width: '40%' }}>
             </div>

             {/* Playhead */}
             <div className="absolute top-0 bottom-0 w-0.5 bg-accent-primary z-20 left-[40%] group-hover:opacity-100 transition-opacity">
                <div className="absolute -top-3 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-3 h-3 bg-accent-primary rotate-45 rounded-sm"></div>
                </div>
             </div>

             {/* Comment Markers */}
             <div className="absolute top-1/2 -translate-y-1/2 left-[10%] z-20 w-3 h-3 rounded-full bg-status-review border border-bg-base/50 ring-2 ring-black/20 hover:scale-150 transition-transform cursor-pointer"></div>
             <div className="absolute top-1/2 -translate-y-1/2 left-[40%] z-20 w-3 h-3 rounded-full bg-status-review border border-bg-base/50 ring-2 ring-black/20 hover:scale-150 transition-transform cursor-pointer animate-pulse shadow-[0_0_10px_rgba(184,107,200,0.5)]"></div>
             <div className="absolute top-1/2 -translate-y-1/2 left-[60%] z-20 w-3 h-3 rounded-full bg-status-review border border-bg-base/50 ring-2 ring-black/20 hover:scale-150 transition-transform cursor-pointer"></div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Comments */}
      <div className="w-[320px] flex-shrink-0 border-l border-border-subtle flex flex-col bg-bg-base">
        <div className="h-14 border-b border-border-subtle flex items-center justify-between px-4">
          <h2 className="font-medium text-text-primary text-sm">Comments & Revisions</h2>
          <div className="flex gap-2 items-center">
             <select 
               value={projectDetail?.status || 'pending'} 
               onChange={(e) => handleUpdateStatus(e.target.value)}
               className="bg-surface-1 border border-border-subtle rounded px-2 py-1 text-xs text-text-primary outline-none focus:border-border-emp cursor-pointer"
             >
               <option value="pending">Pending</option>
               <option value="progress">In Progress</option>
               <option value="review">In Review</option>
               <option value="delivered">Delivered</option>
             </select>
             <button className="text-text-muted hover:text-text-primary"><FilterIcon /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 && <div className="text-sm text-text-muted text-center py-8">No comments yet</div>}
          {comments.map((c, i) => (
            <div key={c.id} className={cn("p-4 rounded-lg border flex flex-col gap-2 transition-colors", "bg-bg-base border-border-subtle hover:border-border-emp")}>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-surface-1 border border-border-subtle text-[9px] font-bold flex items-center justify-center text-text-secondary">
                     {c.ownerId === user?.uid ? "ME" : "U"}
                   </div>
                   <span className="font-medium text-sm text-text-primary">{c.ownerId === user?.uid ? user?.displayName || 'Me' : 'User'}</span>
                 </div>
                 <button className="px-2 py-0.5 rounded border border-border-subtle bg-surface-1 font-mono text-[11px] text-text-muted hover:text-text-primary transition-colors">
                   {c.timestamp}
                 </button>
              </div>
              <p className="text-sm text-text-secondary mt-1">{c.text}</p>
              
              <div className="mt-3 flex gap-2">
                 <input type="text" placeholder="Reply..." className="flex-1 bg-surface-1 border border-border-subtle rounded h-7 px-2 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-border-emp" />
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border-subtle bg-surface-1">
          <textarea 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment at 01:24..." 
            className="w-full bg-bg-base border border-border-subtle rounded-md p-3 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent-primary transition-colors h-24"
          />
          <div className="flex justify-between items-center mt-2">
            <div className="p-1.5 rounded bg-surface-2 border border-border-subtle text-text-muted hover:text-text-primary cursor-pointer transition-colors">
               <ImageIcon strokeWidth={1.5} className="w-4 h-4" />
            </div>
            <button 
              onClick={handlePostComment}
              disabled={!newComment.trim()}
              className="px-4 py-1.5 bg-accent-primary hover:bg-accent-hover text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
            >
              Post Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
}

function CalendarView({ onOpenProject, projects, user }: { onOpenProject: (id: string, view?: 'detail' | 'feedback') => void, projects: any[], user: any }) {
  const [events, setEvents] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState<any[]>([]);
  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(null);

  const handleArchiveEvent = async (e: React.MouseEvent, ev: any) => {
    e.stopPropagation();
    const existing = projects.find(p => p.title === (ev.summary || 'Busy'));
    if (existing) {
      if (existing.status !== 'archived') {
        try {
          await updateDoc(doc(db, 'projects', existing.id), {
            status: 'archived',
            progress: 0,
            updatedAt: serverTimestamp()
          });
        } catch (error) {
          console.error(error);
        }
      }
      return;
    }
    
    if (!user) return;
    try {
      const description = ev.description || '';
      const shooterMatch = description.match(/Shooter:\s*([^\n]+)/i);
      const clientMatch = description.match(/Client:\s*([^\n]+)/i);
      const editorMatch = description.match(/Editor:\s*([^\n]+)/i);

      const shooterName = shooterMatch ? shooterMatch[1].trim() : '';
      const clientName = clientMatch ? clientMatch[1].trim() : 'TBD Client';
      const editorName = editorMatch ? editorMatch[1].trim() : '';

      const newProjectId = `PRJ-${Date.now()}`;
      await setDoc(doc(db, 'projects', newProjectId), {
        title: ev.summary || 'Busy',
        client: clientName,
        shooterName: shooterName,
        editorName: editorName,
        status: 'archived',
        progress: 0,
        dueDate: ev.start ? (ev.start.dateTime || ev.start.date) : new Date().toISOString(),
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEvent = async (ev: any) => {
    const existing = projects.find(p => p.title === (ev.summary || 'Busy'));
    if (existing) {
      onOpenProject(existing.id, 'detail');
      return;
    }
    
    if (!user) return;
    try {
      const description = ev.description || '';
      const shooterMatch = description.match(/Shooter:\s*([^\n]+)/i);
      const clientMatch = description.match(/Client:\s*([^\n]+)/i);
      const editorMatch = description.match(/Editor:\s*([^\n]+)/i);

      const shooterName = shooterMatch ? shooterMatch[1].trim() : '';
      const clientName = clientMatch ? clientMatch[1].trim() : 'TBD Client';
      const editorName = editorMatch ? editorMatch[1].trim() : '';

      const newProjectId = `PRJ-${Date.now()}`;
      await setDoc(doc(db, 'projects', newProjectId), {
        title: ev.summary || 'Busy',
        client: clientName,
        shooterName: shooterName,
        editorName: editorName,
        status: 'unconfirmed',
        progress: 0,
        dueDate: ev.start ? (ev.start.dateTime || ev.start.date) : new Date().toISOString(),
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      // Do not auto-open project for unconfirmed events
    } catch (e) {
      console.error(e);
      // fallback
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('google_calendar_token');
    if (token) {
      setIsConnected(true);
      const fetchEvents = async () => {
         try {
           const timeMin = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
           const timeMax = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
           
           const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime`, {
             headers: {
               Authorization: `Bearer ${token}`
             }
           });
           if (!res.ok) {
             if (res.status === 401) {
               localStorage.removeItem('google_calendar_token');
               setIsConnected(false);
             }
             return;
           }
           const data = await res.json();
           setEvents(data.items || []);
         } catch(e) { console.error(e) }
      };
      fetchEvents();
    } else {
      setIsConnected(false);
    }
  }, [currentDate]);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Generating calendar grid dynamically based on currentDate
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startingDayOfWeek = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; 
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
  
  const dates = Array.from({ length: 35 }, (_, i) => {
    let dateNum;
    let isCurrentMonth = false;
    if (i < startingDayOfWeek) {
      dateNum = daysInPrevMonth - startingDayOfWeek + i + 1;
    } else if (i >= startingDayOfWeek + daysInMonth) {
      dateNum = i - startingDayOfWeek - daysInMonth + 1;
    } else {
      dateNum = i - startingDayOfWeek + 1;
      isCurrentMonth = true;
    }
    
    // Find events for this day
    const dayEvents = isCurrentMonth ? events.filter(e => {
        if (!e.start) return false;
        const d = new Date(e.start.dateTime || e.start.date);
        return d.getDate() === dateNum && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    }) : [];

    // Fallback static events if not connected
    let hasFallbackEvent = false;
    let fallbackEvents: any[] = [];
    if (!isConnected && isCurrentMonth) {
      if (dateNum === 12) fallbackEvents.push({ summary: 'Tech Launch Shoot' });
      if (dateNum === 14) fallbackEvents.push({ summary: 'Villa Paradiso Review' });
      if (dateNum === 22) fallbackEvents.push({ summary: 'Aura Interiors' });
      hasFallbackEvent = fallbackEvents.length > 0;
    }

    const currentCellDate = new Date(
      isCurrentMonth ? currentDate.getFullYear() : (i < startingDayOfWeek ? currentDate.getFullYear() : currentDate.getFullYear() + Math.floor(currentDate.getMonth()/12)),
      isCurrentMonth ? currentDate.getMonth() : (i < startingDayOfWeek ? currentDate.getMonth() - 1 : currentDate.getMonth() + 1),
      dateNum
    );

    return {
      date: dateNum,
      isCurrentMonth,
      fullDate: currentCellDate,
      dayEvents: isConnected ? dayEvents : fallbackEvents,
      hasEvent: isConnected ? dayEvents.length > 0 : hasFallbackEvent,
      isToday: isCurrentMonth && dateNum === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()
    };
  });

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  return (
    <div className="max-w-7xl mx-auto p-8 h-full flex flex-col bg-[#0A0A0B] text-white">
      <div className="flex items-end justify-between shrink-0 mb-8 pb-6 border-b border-white/5">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold uppercase tracking-[0.2em] text-white">Ops Calendar</h1>
          <p className="text-[10px] text-white/40 uppercase font-mono tracking-widest">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        
        <div className="flex items-center gap-3">
            {!isConnected && (
              <span className="text-[10px] text-orange-400 px-3 uppercase tracking-widest font-bold flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></div>
                 Calendar Not Synced
              </span>
            )}
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 border border-white/5 bg-[#121214] hover:bg-white/5 text-white/80 hover:text-white rounded text-[10px] uppercase tracking-widest font-bold transition-colors">Today</button>
            <div className="flex bg-[#121214] rounded border border-white/5 items-center overflow-hidden">
                <button onClick={prevMonth} className="px-3 py-2 text-white/40 hover:text-white transition-colors flex items-center justify-center border-r border-white/5 hover:bg-white/5">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button onClick={nextMonth} className="px-3 py-2 text-white/40 hover:text-white transition-colors flex items-center justify-center hover:bg-white/5">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
            </div>
            <div className="flex bg-[#121214] p-1 rounded border border-white/5 ml-2">
                <button className="px-3 py-1.5 bg-white/5 rounded text-[10px] font-bold text-white uppercase tracking-widest border border-white/5">Month</button>
                <button className="px-3 py-1.5 rounded text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest">Week</button>
            </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 gap-8">
        <div className="flex-1 flex flex-col min-h-0 bg-[#121214] border border-white/5 rounded overflow-hidden">
          <div className="grid grid-cols-7 border-b border-white/5 shrink-0 bg-black/20">
            {daysOfWeek.map(day => (
              <div key={day} className="py-3 px-4 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase text-right">
                {day}
              </div>
            ))}
          </div>
          
          <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-white/5 gap-[1px]">
            {dates.map((d, i) => (
              <div 
                key={i} 
                onClick={() => { setSelectedDateObj(d.fullDate); setSelectedDateEvents(d.dayEvents); }}
                className={cn(
                "bg-[#0A0A0B] p-2 transition-colors relative group",
                d.isCurrentMonth ? "hover:bg-[#121214] cursor-pointer" : "opacity-30 bg-[#0A0A0B] cursor-pointer",
                selectedDateObj?.getTime() === d.fullDate.getTime() && "bg-indigo-500/5 ring-1 ring-inset ring-indigo-500/30"
              )}>
                <div className="flex justify-end mb-2 relative z-10">
                  <span className={cn(
                    "text-[11px] font-mono flex items-center justify-center w-6 h-6 rounded transition-colors", 
                    d.isToday ? "bg-indigo-500 text-white font-bold" : "text-white/40 group-hover:text-white",
                    selectedDateObj?.getTime() === d.fullDate.getTime() && !d.isToday && "bg-white/10 text-white font-bold"
                  )}>
                    {d.date}
                  </span>
                </div>
                
                <div className="space-y-1 relative z-10">
                  {d.dayEvents.slice(0, 3).map((ev: any, evIdx: number) => (
                    <div key={evIdx} className={cn(
                      "px-1.5 py-1 rounded text-[9px] uppercase tracking-wider truncate font-bold border",
                      evIdx % 3 === 0 ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                      evIdx % 3 === 1 ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                      "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    )}>
                      {ev.summary || 'Busy'}
                    </div>
                  ))}
                  {d.dayEvents.length > 3 && (
                    <div className="text-[9px] text-white/40 px-1 font-mono">+{d.dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedDateObj && (
          <div className="w-[320px] shrink-0 bg-[#121214] border border-white/5 rounded p-5 flex flex-col overflow-y-auto custom-scrollbar relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50"></div>
            <h3 className="font-bold text-white text-[11px] uppercase tracking-widest mb-1">
               {selectedDateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <p className="text-[10px] text-white/40 font-mono mb-6 pb-4 border-b border-white/5">
              {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''} scheduled
            </p>

            <div className="space-y-4">
              {selectedDateEvents.length === 0 ? (
                 <div className="py-8 text-center border border-dashed border-white/5 rounded">
                   <Clock className="w-5 h-5 text-white/20 mx-auto mb-2" />
                   <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">No activities.</span>
                 </div>
              ) : (
                selectedDateEvents
                  .filter((ev) => {
                    const existing = projects.find(p => p.title === (ev.summary || 'Busy'));
                    return !existing || existing.status !== 'archived';
                  })
                  .map((ev, i) => (
                  <div key={i} className="p-4 bg-[#0A0A0B] border border-white/5 rounded hover:border-indigo-500/30 transition-colors cursor-pointer group" onClick={() => handleOpenEvent(ev)}>
                    <div className="flex items-start justify-between mb-2">
                       <h4 className="font-bold text-[11px] uppercase tracking-wide text-white leading-tight pr-4">{ev.summary || 'Busy'}</h4>
                       <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1 shadow-[0_0_8px_rgba(129,140,248,0.5)]"></span>
                    </div>
                    {ev.description && <p className="text-[10px] font-mono text-white/40 line-clamp-2 mb-4">{ev.description}</p>}
                    <div className="flex gap-2 relative z-10">
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleOpenEvent(ev); }}
                         className="flex-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/5 hover:border-white/10 text-[9px] uppercase tracking-widest font-bold rounded transition-colors text-center"
                       >
                          Process Order
                       </button>
                       <button 
                         onClick={(e) => handleArchiveEvent(e, ev)}
                         className="px-3 py-1.5 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 border border-red-500/10 hover:border-red-500/20 text-[9px] uppercase tracking-widest font-bold rounded transition-colors"
                       >
                          Archive
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SeeMoreView() {
  const [activeSubTab, setActiveSubTab] = useState<'clients' | 'shooters' | 'editors'>('clients');

  return (
    <div className="flex flex-col h-full bg-bg-base overflow-hidden">
      <div className="flex px-8 pt-6 border-b border-border-subtle shrink-0 items-center justify-start gap-8">
         <button onClick={() => setActiveSubTab('clients')} className={cn("text-xs font-bold uppercase tracking-widest pb-3 border-b-2 transition-colors", activeSubTab === 'clients' ? "border-accent-primary text-text-primary" : "border-transparent text-text-muted hover:text-text-secondary")}>Clients</button>
         <button onClick={() => setActiveSubTab('shooters')} className={cn("text-xs font-bold uppercase tracking-widest pb-3 border-b-2 transition-colors", activeSubTab === 'shooters' ? "border-accent-primary text-text-primary" : "border-transparent text-text-muted hover:text-text-secondary")}>Shooters</button>
         <button onClick={() => setActiveSubTab('editors')} className={cn("text-xs font-bold uppercase tracking-widest pb-3 border-b-2 transition-colors", activeSubTab === 'editors' ? "border-accent-primary text-text-primary" : "border-transparent text-text-muted hover:text-text-secondary")}>Editors</button>
      </div>
      <div className="flex-1 overflow-y-auto w-full relative">
         <AnimatePresence mode="wait">
            {activeSubTab === 'clients' && (
              <motion.div key="clients" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="absolute inset-0">
                 <UserManagementView type="clients" title="Clients" description="Manage your client database and billing." icon={<Users className="w-8 h-8 text-text-muted mb-3" />} />
              </motion.div>
            )}
            {activeSubTab === 'shooters' && (
               <motion.div key="shooters" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="absolute inset-0">
                 <UserManagementView type="shooters" title="Shooters" description="Manage videographers and availability." icon={<Camera className="w-8 h-8 text-text-muted mb-3" />} />
               </motion.div>
            )}
            {activeSubTab === 'editors' && (
               <motion.div key="editors" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="absolute inset-0">
                 <UserManagementView type="editors" title="Editors" description="Manage editors, workloads, and performance." icon={<Film className="w-8 h-8 text-text-muted mb-3" />} />
               </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  )
}

function UserManagementView({ title, type, description, icon }: { title: string, type: 'clients' | 'shooters' | 'editors', description: string, icon: React.ReactNode }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We could fetch real users from a 'users' collection with role = type
    // For now we simulate an empty view ready for real entries
    const unsub = onSnapshot(query(collection(db, 'profiles'), where('role', '==', type)), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    return () => unsub();
  }, [type]);

  return (
    <div className="max-w-7xl mx-auto p-8 h-full flex flex-col bg-bg-base text-text-primary">
      <div className="flex items-end justify-between shrink-0 mb-8 pb-6 border-b border-border-subtle">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold uppercase tracking-[0.2em] text-text-primary">{title}</h1>
          <p className="text-[10px] text-text-muted uppercase font-mono tracking-widest">{description}</p>
        </div>
        <button className="px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white text-[10px] uppercase font-bold tracking-widest rounded transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add {title.slice(0, -1)}
        </button>
      </div>
      
      <div className="flex-1 overflow-auto">
         {loading ? (
           <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 rounded-full border-2 border-border-subtle border-t-accent-primary animate-spin"></div>
           </div>
         ) : users.length === 0 ? (
           <div className="flex flex-col items-center justify-center p-12 border border-border-subtle border-dashed rounded-lg bg-surface-1 mt-8 text-center">
             <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mb-4 text-text-muted">
               {icon}
             </div>
             <h3 className="font-bold text-sm uppercase tracking-widest text-text-primary mb-2">No {title} Found</h3>
             <p className="text-[11px] font-mono text-text-muted max-w-md">
               There are no {type} in your database yet. Add your first one to start assigning them to projects.
             </p>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {users.map(u => (
               <div key={u.id} className="p-5 border border-border-subtle bg-surface-1 rounded hover:border-border-emp transition-colors">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-10 h-10 rounded bg-surface-2 flex items-center justify-center font-bold text-text-primary uppercase border border-border-subtle">
                       {u.name ? u.name[0] : '?'}
                     </div>
                     <div>
                       <div className="font-bold text-[12px] text-text-primary">{u.name || 'Unnamed'}</div>
                       <div className="font-mono text-[10px] text-text-muted">{u.email || 'No email provided'}</div>
                     </div>
                  </div>
               </div>
             ))}
           </div>
         )}
      </div>
    </div>
  );
}

function SettingsView() {
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'system'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    });
    return () => unsub();
  }, []);

  const handleUpdateSetting = async (key: string, value: any) => {
    try {
      await setDoc(doc(db, 'settings', 'system'), { [key]: value }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'settings/system');
    }
  };

  const handleConnectCalendar = async () => {
    try {
      const { credential } = await signInWithGoogle(['https://www.googleapis.com/auth/calendar.readonly'], calendarConnected);
      if (credential?.accessToken) {
        localStorage.setItem('google_calendar_token', credential.accessToken);
        setCalendarConnected(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleConnectDrive = async () => {
    try {
      const { credential } = await signInWithGoogle(['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.file'], driveConnected);
      if (credential?.accessToken) {
        localStorage.setItem('google_drive_token', credential.accessToken);
        setDriveConnected(true);
        setIsDrivePickerOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setCalendarConnected(!!localStorage.getItem('google_calendar_token'));
    setDriveConnected(!!localStorage.getItem('google_drive_token'));
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-8 h-full flex flex-col bg-[#0A0A0B] text-white">
      <div className="flex items-end justify-between shrink-0 mb-10 pb-6 border-b border-white/5">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold uppercase tracking-[0.2em] text-white">System Configuration</h1>
          <p className="text-[10px] text-white/40 uppercase font-mono tracking-widest">Integrations & Parameters</p>
        </div>
      </div>

      <div className="bg-[#121214] border border-white/5 rounded relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50"></div>
        <div className="p-6 border-b border-white/5">
           <h3 className="font-bold text-[11px] uppercase tracking-widest text-white mb-2">Workspace Integrations</h3>
           <p className="text-[10px] font-mono text-white/40">Connect external tools to synchronize your media pipeline.</p>
        </div>
        <div className="p-6 space-y-6">
          {/* Google Calendar */}
          <div className="flex items-center justify-between p-4 bg-[#0A0A0B] border border-white/5 rounded hover:border-white/10 transition-colors">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded flex items-center justify-center">
                 <Calendar className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-[11px] uppercase tracking-widest text-white">Google Calendar</h4>
                <p className="text-[10px] font-mono text-white/40">Sync production schedules and event dates.</p>
              </div>
            </div>
            <button 
              onClick={handleConnectCalendar}
              className={cn("px-5 py-2.5 rounded text-[9px] uppercase tracking-widest font-bold transition-all border", calendarConnected ? "bg-white/5 text-emerald-400 border-white/5 hover:bg-white/10 hover:border-emerald-500/30" : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white")}
            >
              {calendarConnected ? "Change Account" : "Authorize"}
            </button>
          </div>

          {/* Google Drive */}
          <div className="flex flex-col p-4 bg-[#0A0A0B] border border-white/5 rounded hover:border-white/10 transition-colors gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded flex items-center justify-center">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.33333 19.3333L1.66666 8.00001L5.33333 2.00001L12.1667 13.6667L8.33333 19.3333Z" fill="#818CF8"/><path d="M12.1667 19.3333H23.5L15.8333 6.00001L12.1667 13.6667V19.3333Z" fill="#34D399"/><path d="M5.33333 2.00001H15.8333L23.5 13.6667H12.1667L5.33333 2.00001Z" fill="#FBBF24"/></svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-bold text-[11px] uppercase tracking-widest text-white">Google Drive</h4>
                  <p className="text-[10px] font-mono text-white/40">Link root directories for unified media management.</p>
                </div>
              </div>
              <button 
                onClick={handleConnectDrive}
                className={cn("px-5 py-2.5 rounded text-[9px] uppercase tracking-widest font-bold transition-all border", driveConnected ? "bg-white/5 text-emerald-400 border-white/5 hover:bg-white/10 hover:border-emerald-500/30" : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white")}
              >
                {driveConnected ? "Change Account" : "Authorize"}
              </button>
            </div>
            
            {driveConnected && (
              <div className="pt-4 border-t border-white/5 flex items-center justify-between pl-17">
                 <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-white/30">System Root Folder</span>
                    <span className="text-xs font-mono text-indigo-400">{settings?.driveRootFolderName || 'Not selected'}</span>
                 </div>
                 <button onClick={() => setIsDrivePickerOpen(true)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[9px] uppercase font-bold text-white/60 hover:text-white transition-colors">
                    Change Root
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isDrivePickerOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="w-full max-w-2xl relative">
             <DriveFolderMapper 
               accessToken={localStorage.getItem('google_drive_token') || ''} 
               onSelectRoot={(id, name) => {
                 handleUpdateSetting('driveRootFolderName', name);
                 handleUpdateSetting('driveRootFolderId', id);
                 setIsDrivePickerOpen(false);
               }}
               currentRootId={settings?.driveRootFolderId}
               onClose={() => setIsDrivePickerOpen(false)}
             />
           </div>
        </div>
      )}
    </div>
  );
}
