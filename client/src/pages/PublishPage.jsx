import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../components/Loading";
import { AlertCircleIcon } from "lucide-react";
import api from "../api/api";
import FullPagePreview from "../components/FullPagePreview";

const PublishPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchPublicProject = async () => {
      try {
        const { data } = await api.get(`/api/projects/public/${id}`);
        setProject(data);
      } catch (error) {
        console.log("Failed to load public project:", error);
        setError(
          error?.response?.data?.error ||
            "This project is not available or is not published yet.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPublicProject();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error || !project) {
    return (
      <div className="">
        <div>
          <AlertCircleIcon size={24} />
        </div>
        <h1 className="text-lg font-semibold text-zinc-900 mb-1.5">
          Website Unavailable
        </h1>
        <p className="text-sm text-zinc-500 max-w-sm leading-relaxed mb-6">
          {error}
        </p>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
          BuilderAi
        </div>
      </div>
    );
  }

  return <FullPagePreview files={project.files} />;
};

export default PublishPage;
