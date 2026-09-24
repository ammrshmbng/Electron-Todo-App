import type { Todo } from "../types/todo";
import type { IPCResult } from "./result";

export interface CreateTodoInput {
  title: string;
}

export interface UpdateTodoInput {
  id: string;
  title: string;
  completed: boolean;
}

export interface AppInfo {
  name: string;
  version: string;
  platform: NodeJS.Platform;
  architecture: string;
  isPackaged: boolean;
  appPath: string;

  paths: {
    userData: string;
    appData: string;
    documents: string;
    downloads: string;
    desktop: string;
    temp: string;
    logs: string;
  };
}

export type AppCommand = "new-todo" | "focus-search";

export type TodoContextMenuAction =
  | "open-detail"
  | "toggle-completed"
  | "copy-title"
  | "copy-json"
  | "delete";

export interface TodoContextMenuEvent {
  action: TodoContextMenuAction;
  todoId: string;
}

export interface WebContentsInfo {
  id: number;
  url: string;
  title: string;
  isLoading: boolean;
  isDevToolsOpened: boolean;
  windowId: number | null;
}

export interface TodoScanReport {
  total: number;
  completed: number;
  active: number;
  longestTitleLength: number;
  durationMs: number;
}

export interface BackgroundTaskProgress {
  taskId: string;
  processed: number;
  total: number;
  percent: number;
}

export interface BackgroundTaskCompleted {
  taskId: string;
  report: TodoScanReport;
}

export interface BackgroundTaskCancelled {
  taskId: string;
}

export interface BackgroundTaskError {
  taskId: string;
  message: string;
}

export type AppUpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "downloaded"
  | "not-available"
  | "unsupported"
  | "not-configured"
  | "error";

export interface AppUpdateState {
  status: AppUpdateStatus;
  version: string | null;
  message: string;
}

export interface TodoAPI {
  getAll(): Promise<IPCResult<Todo[]>>;

  getById(id: string): Promise<IPCResult<Todo | null>>;

  create(input: CreateTodoInput): Promise<IPCResult<Todo>>;

  update(input: UpdateTodoInput): Promise<IPCResult<Todo>>;

  delete(id: string): Promise<IPCResult<null>>;

  onChanged(callback: () => void): () => void;

  openTodoDetail(todoId: string): Promise<void>;

  onTodoDetailId(callback: (todoId: string) => void): () => void;

  confirm(options: {
    title: string;
    message: string;
    detail?: string;
  }): Promise<boolean>;

  openFile(): Promise<string | null>;

  notify(options: { title: string; body: string }): Promise<boolean>;

  openDataFolder(): Promise<{
    success: boolean;
    path: string;
    error: string | null;
  }>;

  showDatabase(): Promise<string>;

  openExternal(url: string): Promise<boolean>;

  getAppInfo(): Promise<AppInfo>;

  reloadRenderer(): Promise<void>;

  openDevTools(): Promise<void>;

  toggleDevTools(): Promise<void>;

  getWebContentsInfo(): Promise<WebContentsInfo>;

  copyText(text: string): Promise<boolean>;

  readClipboardText(): Promise<string>;

  exportFile(): Promise<IPCResult<{ path: string; count: number }>>;

  importFile(): Promise<IPCResult<{ count: number }>>;

  importDroppedFile(file: unknown): Promise<IPCResult<{ count: number }>>;

  showTodoContextMenu(input: {
    todoId: string;
    completed: boolean;
  }): Promise<void>;

  onTodoContextMenuAction(
    callback: (event: TodoContextMenuEvent) => void,
  ): () => void;

  onAppCommand(callback: (command: AppCommand) => void): () => void;

  startTodoScan(): Promise<IPCResult<{ taskId: string }>>;

  cancelBackgroundTask(taskId: string): Promise<IPCResult<null>>;

  onBackgroundProgress(
    callback: (event: BackgroundTaskProgress) => void,
  ): () => void;

  onBackgroundCompleted(
    callback: (event: BackgroundTaskCompleted) => void,
  ): () => void;

  onBackgroundCancelled(
    callback: (event: BackgroundTaskCancelled) => void,
  ): () => void;

  onBackgroundError(
    callback: (event: BackgroundTaskError) => void,
  ): () => void;

  getUpdateState(): Promise<AppUpdateState>;

  checkForUpdates(): Promise<AppUpdateState>;

  installUpdate(): Promise<AppUpdateState>;

  onUpdateState(
    callback: (state: AppUpdateState) => void,
  ): () => void;
}
