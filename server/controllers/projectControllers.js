//Post /api/projects
//Create a new project from an AI prompt

import { Project } from "../models/Project.js";

export async function creationProject(req, res) {
  const prompt = req.body;
  if (!prompt || !typeof prompt !== "string") {
    res.status(400).json({
      error: "prompt is required",
    });
    return;
  }

  const user = req.user;
  if (!user) {
    res.status(401).json({
      error: "Unauthorized",
    });
    return;
  }

  //create a project in Db immediately with "pending" status

  const project = await Project.create({
    name: "Planning Project...",
    description: prompt,
    files: {},
    messages: [
      { role: "user", content: prompt },
      { role: "user", content: "Planning project structure" },
    ],
    version: 0,
    owner: req.user.userId,
    status: "pending",
    filesPlanned: [],
    filesGenerated: [],
    currentFile: null,
    error: null,
  });

  //Start background genration

  runBackgroundGeneration(project._id.toString(), prompt).catch((err) => {
    console.error(
      `[Background AI] Fatal generation error for project ${project._id}:`,
      err,
    );
  });

  res.status(201).json({
    _id: project._id,
    name: project.name,
    description: project.description,
    files: {},
    messages: project.messages,
    version: project.version,
    status: project.status,
    filesPlanned: project.filesPlanned,
    filesGenerated: project.filesGenerated,
    currentFile: project.currentFile,
    error: project.error,
    createdAt: project.createdAt,
  });
}

//Background worker to progressive generate files and update database in real-time

async function runBackgroundGeneration(projectId, prompt) {}

//GET /api/projects
// List all projects owned by the user (summary only,no file contents).

export async function listProjects(req, res) {
  if (!req.user) {
    res.status(401).json({
      messages: "Unauthorized",
    });
    return;
  }

  const projects = await Project.find(
    { owner: req.user.userId },
    { name: 1, description: 1, version: 1, createdAt: 1, updatedAt: 1 },
  ).sort({ updatedAt: -1 });

  res.json(projects);
}

// GET /api/projects/:id
//GET full project details

export async function getProject(req, res) {
  if (!req.user) {
    res.status(401).json({
      messages: "Unauthorized",
    });
    return;
  }

  const project = await Project.findOne({
    _id: req.params.id,
    owner: req.user.userId,
  });

  if (!project) {
    res.status(404).json({
      error: "Project Not Found",
    });
  }

  const filesObj = {};

  for (const [path, entry] of Object.entries(project.files)) {
    filesObj[path] = entry.content;
  }

  res.json({
    _id: project._id,
    name: project.name,
    description: project.description,
    files: filesObj,
    messages: project.messages,
    version: project.version,
    status: project.status,
    filesPlanned: project.filesPlanned,
    filesGenerated: project.filesGenerated,
    currentFile: project.currentFile,
    error: project.error,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  });
}

//DELETE /api/projects/:id
//delete a project

export async function deleteProject(req, res) {
  if (!req.user) {
    res.status(400).json({
      message: "Unauthorize",
    });
  }

  const result = await Project.findByIdAndDelete({
    _id: req.params.id,
    owner: req.user.userId,
  });

  if (!result) {
    res.staus(404).json({
      error: "Project not found",
    });
    return;
  }

  res.json({ success: true });
}

//put /api/project/:id/files
//update project files (manuel edits)

export async function updateProjectFiles(req, res) {}

//post /api/project/:id/publish
// mark a project as publicly published

export async function publishProject(req, res) {}

// post /api/projects/public/:id
// get a publicly published project details (without auth)

export async function getPublicProject(req, res) {}
