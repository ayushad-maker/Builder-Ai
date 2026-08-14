import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import { AlertCircleIcon, Loader } from "lucide-react";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import FullPagePreview from "../components/FullPagePreview";

const PreviewPage = () => {
  const { id } = useParams();
  const {
    activeProject: project,
    loadingActiveProject: loading,
    loadProject,
  } = useAppContext();

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  if (loading || !project) {
    return <Loading />;
  }

  return <FullPagePreview files={project.files} />;
};

export default PreviewPage;
