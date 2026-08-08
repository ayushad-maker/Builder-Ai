import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Loading from "../components/Loading";
import BuilderHeader from "../components/BuilderHeader";

const BuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leftTab, setLeftTab] = useState("chat");
  const [publishing, setPublishing] = useState(false);
  const [publishUrl, setPublishUrl] = useState(null);

  const {
    activeProject,
    loadingActiveProject,
    activeFile,
    showCode,
    setActiveFile,
    setShowCode,
    loadProject,
    logout,
  } = useAppContext();

  useEffect(() => {
    if (!id) return;
    loadProject(id);
  }, [id, loadProject]);

  useEffect(() => {
    if (!id || !activeProject) return;
    if (
      activeProject.status === "pending" ||
      activeProject.status === "request"
    ) {
      const interval = setInterval(() => {
        loadProject(id, true);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [id, loadProject, activeProject]);

  if (loadingActiveProject || !activeProject) {
    return <Loading />;
  }

  return (
    <div className="">
      {/* Top Bar Header */}
      <BuilderHeader />


      {/* Main Layout */}
    </div>
  );
};

export default BuilderPage;
