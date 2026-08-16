import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProject,
  getPublicProject,
  listProjects,
  publishProject,
  updateProjectFiles,
} from "../controllers/projectControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const projectRouter = Router();

// Public Route

projectRouter.get("public/:id", getPublicProject);

// Protect all following Routes
projectRouter.use(authMiddleware);

projectRouter.post("/", createProject);
projectRouter.get("/", listProjects);
projectRouter.post("/:id", getProject);
projectRouter.post("/:id", deleteProject);
projectRouter.post("/:id/files", updateProjectFiles);
projectRouter.post("/:id/publish", publishProject);

export default projectRouter;
