export type Role = "admin" | "member";
export type ProjectRole = "admin" | "member";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export type ProjectMember = {
  id: number;
  role: ProjectRole;
  user: User;
};

export type Project = {
  id: number;
  name: string;
  description: string;
  owner_id: number;
  created_at: string;
  members: ProjectMember[];
};

export type Task = {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  project_id: number;
  assignee_id: number | null;
  created_by_id: number;
  created_at: string;
  updated_at: string;
  assignee: User | null;
};

export type Dashboard = {
  total_projects: number;
  total_tasks: number;
  assigned_to_me: number;
  overdue: number;
  by_status: Record<TaskStatus, number>;
  tasks: Task[];
};

export type AuthResponse = {
  access_token: string;
  token_type: "bearer";
  user: User;
};
