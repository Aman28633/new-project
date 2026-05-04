from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.task_manager import ProjectRole, TaskPriority, TaskStatus, UserRole


class UserBase(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole

    model_config = ConfigDict(from_attributes=True)


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=72)
    role: UserRole = UserRole.member

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        value = value.strip().lower()
        if "@" not in value or "." not in value.split("@")[-1]:
            raise ValueError("Enter a valid email address")
        return value


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserBase


class ProjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    description: str = Field(default="", max_length=2000)


class MemberAdd(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    role: ProjectRole = ProjectRole.member


class MemberOut(BaseModel):
    id: int
    role: ProjectRole
    user: UserBase

    model_config = ConfigDict(from_attributes=True)


class ProjectOut(BaseModel):
    id: int
    name: str
    description: str
    owner_id: int
    created_at: datetime
    members: list[MemberOut] = []

    model_config = ConfigDict(from_attributes=True)


class TaskCreate(BaseModel):
    title: str = Field(min_length=2, max_length=180)
    description: str = Field(default="", max_length=3000)
    priority: TaskPriority = TaskPriority.medium
    due_date: datetime | None = None
    assignee_id: int | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=180)
    description: str | None = Field(default=None, max_length=3000)
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    due_date: datetime | None = None
    assignee_id: int | None = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    status: TaskStatus
    priority: TaskPriority
    due_date: datetime | None
    project_id: int
    assignee_id: int | None
    created_by_id: int
    created_at: datetime
    updated_at: datetime
    assignee: UserBase | None = None

    model_config = ConfigDict(from_attributes=True)


class DashboardOut(BaseModel):
    total_projects: int
    total_tasks: int
    assigned_to_me: int
    overdue: int
    by_status: dict[str, int]
    tasks: list[TaskOut]
