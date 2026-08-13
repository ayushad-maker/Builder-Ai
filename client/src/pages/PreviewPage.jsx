import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import { AlertCircleIcon, Loader } from "lucide-react";
import Loading from "../components/Loading";

const PreviewPage = () => {
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
         console.log("Failed to load public project:",error);
         setError(error?.response?.data?.error || "This project is not available or is not published yet.")
      } finally {
        setLoading(false)
      }
    };
    fetchPublicProject();
  }, []);

  if(loading){
    return <Loading />
  }

  if(error || !project){
    return(
      <div className="">
        <div>
          <AlertCircleIcon size={14}/>
        </div>
        <h1>Website Unavailable</h1>
        <p>{error}</p>

      </div>
    )
  }

  return <div>PreviewPage</div>;
};

export default PreviewPage;
