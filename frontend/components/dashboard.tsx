"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import type { Dashboard as DashboardData, Project, Role, Task, TaskPriority, TaskStatus, User } from "@/lib/types";

import styles from "./dashboard.module.css";

const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  review: "Review",
  done: "Done",
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const emptyDashboard: DashboardData = {
  total_projects: 0,
  total_tasks: 0,
  assigned_to_me: 0,
  overdue: 0,
  by_status: { todo: 0, in_progress: 0, review: 0, done: 0 },
  tasks: [],
};

export function Dashboard() {
  const [token, setToken] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [authRole, setAuthRole] = useState<Role>("admin");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [memberForm, setMemberForm] = useState({ email: "", role: "member" as Role });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "medium" as TaskPriority, due_date: "", assignee_id: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? null,
    [projects, selectedProjectId],
  );

  const canManageSelectedProject = useMemo(() => {
    if (!user || !selectedProject) return false;
    return user.role === "admin" || selectedProject.members.some((member) => member.user.id === user.id && member.role === "admin");
  }, [selectedProject, user]);

  useEffect(() => {
    const storedToken = window.localStorage.getItem("ttm_token");
    if (!storedToken) return;
    setToken(storedToken);
    api
      .me(storedToken)
      .then(setUser)
      .catch(() => window.localStorage.removeItem("ttm_token"));
  }, []);

  useEffect(() => {
    if (!token || !user) return;
    void refresh(token);
  }, [token, user]);

  async function refresh(activeToken = token) {
    const [projectList, userList, taskList, dashboardData] = await Promise.all([
      api.projects(activeToken),
      api.users(activeToken),
      api.tasks(activeToken),
      api.dashboard(activeToken),
    ]);
    setProjects(projectList);
    setUsers(userList);
    setTasks(taskList);
    setDashboard(dashboardData);
    setSelectedProjectId((current) => current ?? projectList[0]?.id ?? null);
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response =
        mode === "signup"
          ? await api.signup({ ...authForm, role: authRole })
          : await api.login({ email: authForm.email, password: authForm.password });
      window.localStorage.setItem("ttm_token", response.access_token);
      setToken(response.access_token);
      setUser(response.user);
      setMessage(`Welcome, ${response.user.name}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      const project = await api.createProject(token, projectForm);
      setProjectForm({ name: "", description: "" });
      setSelectedProjectId(project.id);
      await refresh();
      setMessage("Project created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create project");
    } finally {
      setBusy(false);
    }
  }

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedProject) return;
    setBusy(true);
    try {
      await api.addMember(token, selectedProject.id, memberForm);
      setMemberForm({ email: "", role: "member" });
      await refresh();
      setMessage("Team member updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add member");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedProject) return;
    setBusy(true);
    try {
      await api.createTask(token, selectedProject.id, {
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        due_date: taskForm.due_date ? new Date(taskForm.due_date).toISOString() : null,
        assignee_id: taskForm.assignee_id ? Number(taskForm.assignee_id) : null,
      });
      setTaskForm({ title: "", description: "", priority: "medium", due_date: "", assignee_id: "" });
      await refresh();
      setMessage("Task created and assigned.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create task");
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(task: Task, status: TaskStatus) {
    if (!token) return;
    setBusy(true);
    try {
      await api.updateTask(token, task.id, { status });
      await refresh();
      setMessage("Task status updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update task");
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    window.localStorage.removeItem("ttm_token");
    setToken("");
    setUser(null);
    setProjects([]);
    setTasks([]);
    setDashboard(emptyDashboard);
  }

  if (!user) {
    return (
      <main className={styles.authShell}>
        <section className={styles.authVisual}>
          <div>
            <p className={styles.eyebrow}>Team Task Manager</p>
            <h1>Plan projects, assign work, and watch progress in one place.</h1>
            <p className={styles.lede}>A full-stack submission with JWT authentication, SQL relationships, REST APIs, and role-based access for Admin and Member users.</p>
          </div>
        </section>
        <section className={styles.authPanel}>
          <div className={styles.switcher}>
            <button className={mode === "signup" ? styles.active : ""} onClick={() => setMode("signup")} type="button">Signup</button>
            <button className={mode === "login" ? styles.active : ""} onClick={() => setMode("login")} type="button">Login</button>
          </div>
          <form onSubmit={handleAuth} className={styles.form}>
            {mode === "signup" && (
              <label>
                Name
                <input value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} minLength={2} required />
              </label>
            )}
            <label>
              Email
              <input type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} required />
            </label>
            <label>
              Password
              <input type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} minLength={8} required />
            </label>
            {mode === "signup" && (
              <label>
                Role
                <select value={authRole} onChange={(event) => setAuthRole(event.target.value as Role)}>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
              </label>
            )}
            <button disabled={busy} className={styles.primaryButton}>{mode === "signup" ? "Create account" : "Login"}</button>
            {message && <p className={styles.message}>{message}</p>}
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Team Task Manager</p>
          <h1>Workspace Dashboard</h1>
        </div>
        <div className={styles.profile}>
          <span>{user.name}</span>
          <strong>{user.role}</strong>
          <button onClick={logout} type="button">Logout</button>
        </div>
      </header>

      <section className={styles.metrics}>
        <Metric label="Projects" value={dashboard.total_projects} />
        <Metric label="Tasks" value={dashboard.total_tasks} />
        <Metric label="Assigned to me" value={dashboard.assigned_to_me} />
        <Metric label="Overdue" value={dashboard.overdue} tone="danger" />
      </section>

      <section className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.panelHeader}>
            <h2>Projects</h2>
          </div>
          <div className={styles.projectList}>
            {projects.map((project) => (
              <button key={project.id} className={selectedProject?.id === project.id ? styles.selectedProject : ""} onClick={() => setSelectedProjectId(project.id)} type="button">
                <strong>{project.name}</strong>
                <span>{project.members.length} members</span>
              </button>
            ))}
            {projects.length === 0 && <p className={styles.empty}>Create your first project to begin.</p>}
          </div>
          <form onSubmit={handleCreateProject} className={styles.form}>
            <input placeholder="Project name" value={projectForm.name} onChange={(event) => setProjectForm({ ...projectForm, name: event.target.value })} required minLength={2} />
            <textarea placeholder="Project description" value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} />
            <button disabled={busy} className={styles.primaryButton}>New project</button>
          </form>
        </aside>

        <section className={styles.mainPanel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>{selectedProject?.name ?? "No project selected"}</h2>
              <p>{selectedProject?.description || "Team, task and status controls appear here."}</p>
            </div>
            {message && <span className={styles.toast}>{message}</span>}
          </div>

          {selectedProject && (
            <div className={styles.management}>
              <div className={styles.teamBlock}>
                <h3>Team</h3>
                <div className={styles.memberList}>
                  {selectedProject.members.map((member) => (
                    <span key={member.id}>{member.user.name}<small>{member.role}</small></span>
                  ))}
                </div>
                {canManageSelectedProject && (
                  <form onSubmit={handleAddMember} className={styles.inlineForm}>
                    <input placeholder="member@email.com" value={memberForm.email} onChange={(event) => setMemberForm({ ...memberForm, email: event.target.value })} type="email" required />
                    <select value={memberForm.role} onChange={(event) => setMemberForm({ ...memberForm, role: event.target.value as Role })}>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button disabled={busy}>Add</button>
                  </form>
                )}
              </div>

              {canManageSelectedProject && (
                <form onSubmit={handleCreateTask} className={styles.taskForm}>
                  <input placeholder="Task title" value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} required minLength={2} />
                  <textarea placeholder="Task details" value={taskForm.description} onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })} />
                  <select value={taskForm.priority} onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value as TaskPriority })}>
                    {Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <input type="datetime-local" value={taskForm.due_date} onChange={(event) => setTaskForm({ ...taskForm, due_date: event.target.value })} />
                  <select value={taskForm.assignee_id} onChange={(event) => setTaskForm({ ...taskForm, assignee_id: event.target.value })}>
                    <option value="">Unassigned</option>
                    {selectedProject.members.map((member) => <option key={member.user.id} value={member.user.id}>{member.user.name}</option>)}
                  </select>
                  <button disabled={busy} className={styles.primaryButton}>Create task</button>
                </form>
              )}
            </div>
          )}

          <div className={styles.board}>
            {(Object.keys(statusLabels) as TaskStatus[]).map((status) => (
              <section key={status} className={styles.column}>
                <h3>{statusLabels[status]} <span>{dashboard.by_status[status]}</span></h3>
                {tasks.filter((task) => task.status === status && (!selectedProject || task.project_id === selectedProject.id)).map((task) => (
                  <article key={task.id} className={styles.taskCard}>
                    <div className={styles.taskTop}>
                      <strong>{task.title}</strong>
                      <span className={`${styles.priority} ${styles[task.priority]}`}>{priorityLabels[task.priority]}</span>
                    </div>
                    <p>{task.description || "No description added."}</p>
                    <div className={styles.taskMeta}>
                      <span>{task.assignee?.name ?? "Unassigned"}</span>
                      <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}</span>
                    </div>
                    <select value={task.status} onChange={(event) => updateStatus(task, event.target.value as TaskStatus)} disabled={busy}>
                      {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </article>
                ))}
              </section>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: "danger" }) {
  return (
    <article className={`${styles.metric} ${tone === "danger" ? styles.dangerMetric : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
