const express = require("express");

const app = express();

app.use(express.json());

let nRequests = 0;

const projects = [];

function logRequests(req, res, next) {
  console.log(`Requests so on: ${++nRequests}`);
  return next();
}

app.use(logRequests);

function findProject(req, res, next) {
  const { id } = req.params;

  for (let i = 0; i < projects.length; ++i) {
    if (projects[i].id == id) {
      req.project = projects[i];
      return next();
    }
  }

  return res.status(400).json({ error: "Project does not exist" });
}

function checkTaskInProject(req, res, next) {
  const task = req.project.tasks[req.params.index];

  if (!task) {
    return res.status(400).json({ error: "Task does not exist" });
  }

  req.task = task;

  return next();
}

function checkIdInBody(req, res, next) {
  if (!req.body.id) {
    return res.status(400).json({ error: "'id' field is required" });
  }

  return next();
}

function checkTitleInBody(req, res, next) {
  if (!req.body.title) {
    return res.status(400).json({ error: "'title' field is required" });
  }

  return next();
}

app.get("/projects", (req, res) => {
  return res.json(projects);
});

app.get("/projects/:id", findProject, (req, res) => {
  return res.json(req.project);
});

app.post("/projects", checkIdInBody, checkTitleInBody, (req, res) => {
  const { id, title } = req.body;

  projects.forEach((project) => {
    if (project.id == id) {
      res.status(400).json({ error: "Id already in use" });
    }
  });

  const newProject = {
    id,
    title,
    tasks: [],
  };

  projects.push(newProject);

  return res.json(newProject);
});

app.put("/projects/:id", findProject, checkTitleInBody, (req, res) => {
  const { title } = req.body;

  req.project.title = title;

  res.json(req.project);
});

app.delete("/projects/:id", findProject, (req, res) => {
  projects.splice(projects.indexOf(req.project), 1);

  return res.send();
});

app.get("/projects/:id/tasks", findProject, (req, res) => {
  return res.json(req.project.tasks);
});

app.get(
  "/projects/:id/tasks/:index",
  findProject,
  checkTaskInProject,
  (req, res) => {
    return res.json(req.task);
  }
);

app.post("/projects/:id/tasks", findProject, checkTitleInBody, (req, res) => {
  const { title } = req.body;

  req.project.tasks.push(title);

  res.json(req.project.tasks);
});

app.put(
  "/projects/:id/tasks/:index",
  findProject,
  checkTaskInProject,
  checkTitleInBody,
  (req, res) => {
    const { index } = req.params;
    const { title } = req.body;

    req.project.tasks[index] = title;

    res.json(req.project.tasks);
  }
);

app.delete(
  "/projects/:id/tasks/:index",
  findProject,
  checkTaskInProject,
  (req, res) => {
    const { index } = req.params;

    req.project.tasks.splice(index, 1);

    res.json(req.project.tasks);
  }
);

app.listen(3000);
