import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api.js";

const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {
  const navigate = useNavigate();

  // ===========================
  // Auth State
  // ===========================
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ===========================
  // Project State
  // ===========================
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [activeProject, setActiveProject] = useState(null);
  const [loadingActiveProject, setLoadingActiveProject] = useState(false);

  const [chatLoading, setChatLoading] = useState(false);
  const [generatingProject, setGeneratingProject] = useState(false);

  const [activeFile, setActiveFile] = useState("/App.js");
  const [showCode, setShowCode] = useState(false);

  // ===========================
  // Check Session
  // ===========================
  const checkSessions = async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    checkSessions();
  }, []);

  // ===========================
  // Login
  // ===========================
  const Login = async (email, password) => {
    try {
      const { data } = await api.post("/api/auth/login", {
        email,
        password,
      });

      setUser(data.user);
      toast.success("Login Successful");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
      setUser(null);
    }
  };

  // ===========================
  // Register
  // ===========================
  const Register = async (name, email, password) => {
    try {
      const { data } = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });

      setUser(data.user);
      toast.success("Registration Successful");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration Failed");
      setUser(null);
    }
  };

  // ===========================
  // Logout
  // ===========================
  const logout = async () => {
    try {
      await api.post("/api/auth/logout");

      setUser(null);
      setProjects([]);
      setActiveProject(null);

      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error("Logout Failed");
    }
  };

  // ===========================
  // Load Projects
  // ===========================
  const loadProjects = useCallback(async () => {
    if (!user) return;

    setLoadingProjects(true);

    try {
      const { data } = await api.get("/api/projects");
      setProjects(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load projects");
    } finally {
      setLoadingProjects(false);
    }
  }, [user]);

  // ===========================
  // Load Single Project
  // ===========================
  const loadProject = useCallback(
    async (id, silent = false) => {
      if (!user) return;

      if (!silent) {
        setLoadingActiveProject(true);
      }

      try {
        const { data } = await api.get(`/api/projects/${id}`);

        setActiveProject(data);

        const files = Object.keys(data.files || {});

        if (files.length > 0) {
          setActiveFile((prev) => {
            if (files.includes(prev)) return prev;
            if (files.includes("/App.js")) return "/App.js";
            return files[0];
          });
        }
      } catch (error) {
        console.error(error);

        if (!silent) {
          toast.error("Failed to load project");
          navigate("/");
        }
      } finally {
        if (!silent) {
          setLoadingActiveProject(false);
        }
      }
    },
    [user, navigate],
  );

  // ===========================
  // Poll Project Status
  // ===========================
  useEffect(() => {
    if (!activeProject?._id || !user) return;

    const ongoing =
      activeProject.status === "pending" ||
      activeProject.status === "generating" ||
      activeProject.status === "revising";

    if (!ongoing) {
      setChatLoading(false);
      return;
    }

    setChatLoading(true);

    const interval = setInterval(() => {
      loadProject(activeProject._id, true);
    }, 2000);

    return () => clearInterval(interval);
  }, [activeProject?._id, activeProject?.status, loadProject, user]);

  // ===========================
  // Generate Project
  // ===========================
  const handleGenerate = useCallback(
    async (prompt) => {
      if (!user) return;

      setGeneratingProject(true);

      try {
        const { data } = await api.post("/api/projects", {
          prompt,
        });

        toast.success("AI Agent is planning your project...");
        navigate(`/builder/${data._id}`);
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.error || "Failed to generate project",
        );
      } finally {
        setGeneratingProject(false);
      }
    },
    [user, navigate],
  );

  // ===========================
  // Delete Project
  // ===========================
  const handleDelete = useCallback(
    async (id) => {
      if (!user) return;

      try {
        await api.delete(`/api/projects/${id}`);

        setProjects((prev) => prev.filter((project) => project._id !== id));

        toast.success("Project deleted successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete project");
      }
    },
    [user],
  );

  const handleChat = useCallback(
    async (prompt) => {
      if (!activeProject || user) return;
      setChatLoading(true);
      try {
        const { data } = await api.post(
          `/api/projects/${activeProject._id}/chat`,
          { prompt },
        );
        setActiveProject(data);
        if (data.errors && data.errors.length > 0) {
          toast.error(`${data.errors.length} revison patch(es) failed`);
        } else {
          toast.success(`Updated to version ${data.version}`);
        }
      } catch (error) {
        console.error("Revision request failed:", error);
        toast.error(error?.response?.data?.error || "Revision request failed");
      } finally {
        setChatLoading(false);
      }
    },
    [activeProject, user],
  );

  const debounceSave = React.useMemo(
    () =>
      debounce(async (files, id) => {
        try {
          await api.post(`/api/projects/${id}/files`, { files });
        } catch (error) {
          console.error("Failed to auto-save files:", error);
          toast.error("Failed to save code notifications.");
        }
      }, 1000),
    [],
  );

  useEffect(() => {
    return () => {
      debounceSave.cancel();
    };
  }, []);

  const updateProjectFiles = useCallback(
    async (files) => {
      if(!activeProject || !user) return;
      debounceSave(files,activeProject._id);
    },[activeProject,user,debounceSave]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        loadingUser,

        Login,
        Register,
        logout,

        projects,
        loadingProjects,
        loadProjects,

        activeProject,
        loadingActiveProject,
        loadProject,

        chatLoading,

        generatingProject,
        handleGenerate,

        handleDelete,

        activeFile,
        setActiveFile,

        showCode,
        setShowCode,
        handleChat,
        updateProjectFiles
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }

  return context;
}
