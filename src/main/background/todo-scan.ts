import { randomUUID } from "node:crypto";

import type { WebContents } from "electron";

import type { Todo } from "../../shared/types/todo";
import type {
  BackgroundTaskCompleted,
  BackgroundTaskError,
  BackgroundTaskProgress,
  TodoScanReport,
} from "../../shared/contracts/todo-api";
import { IPC_CHANNELS } from "../../shared/ipc/channels";

import { getTodoService } from "../services/todo.service";

interface TodoScanTask {
  taskId: string;
  sender: WebContents;
  cancelled: boolean;
  startedAt: number;
}

const tasks = new Map<string, TodoScanTask>();

function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => {
    setImmediate(resolve);
  });
}

function sendProgress(
  task: TodoScanTask,
  processed: number,
  total: number,
) {
  if (task.sender.isDestroyed()) {
    return;
  }

  const event: BackgroundTaskProgress = {
    taskId: task.taskId,
    processed,
    total,
    percent: total === 0 ? 100 : Math.round((processed / total) * 100),
  };

  task.sender.send(IPC_CHANNELS.BACKGROUND.EVENTS.PROGRESS, event);
}

export function startTodoScan(sender: WebContents): string {
  const task: TodoScanTask = {
    taskId: randomUUID(),
    sender,
    cancelled: false,
    startedAt: Date.now(),
  };

  tasks.set(task.taskId, task);

  void runTodoScan(task);

  return task.taskId;
}

export function cancelTodoScan(taskId: string): boolean {
  const task = tasks.get(taskId);

  if (!task) {
    return false;
  }

  task.cancelled = true;

  return true;
}

async function runTodoScan(task: TodoScanTask) {
  try {
    const todoService = getTodoService();
    const todos = todoService.getAll();

    const report: TodoScanReport = {
      total: todos.length,
      completed: 0,
      active: 0,
      longestTitleLength: 0,
      durationMs: 0,
    };

    sendProgress(task, 0, todos.length);

    for (let index = 0; index < todos.length; index += 1) {
      if (task.cancelled) {
        emitCancelled(task);
        return;
      }

      processTodo(report, todos[index]);

      const processed = index + 1;
      sendProgress(task, processed, todos.length);

      if (processed % 25 === 0) {
        await yieldToEventLoop();
      }
    }

    report.durationMs = Date.now() - task.startedAt;

    emitCompleted(task, report);
  } catch {
    emitError(task, "Background Todo scan failed");
  } finally {
    tasks.delete(task.taskId);
  }
}

function processTodo(
  report: TodoScanReport,
  todo: Todo | undefined,
) {
  if (!todo) {
    return;
  }

  if (todo.completed) {
    report.completed += 1;
  } else {
    report.active += 1;
  }

  report.longestTitleLength = Math.max(
    report.longestTitleLength,
    todo.title.length,
  );
}

function emitCompleted(
  task: TodoScanTask,
  report: TodoScanReport,
) {
  if (task.sender.isDestroyed()) {
    return;
  }

  const event: BackgroundTaskCompleted = {
    taskId: task.taskId,
    report,
  };

  task.sender.send(
    IPC_CHANNELS.BACKGROUND.EVENTS.COMPLETED,
    event,
  );
}

function emitCancelled(task: TodoScanTask) {
  if (task.sender.isDestroyed()) {
    return;
  }

  task.sender.send(
    IPC_CHANNELS.BACKGROUND.EVENTS.CANCELLED,
    {
      taskId: task.taskId,
    },
  );
}

function emitError(
  task: TodoScanTask,
  message: string,
) {
  if (task.sender.isDestroyed()) {
    return;
  }

  const event: BackgroundTaskError = {
    taskId: task.taskId,
    message,
  };

  task.sender.send(
    IPC_CHANNELS.BACKGROUND.EVENTS.ERROR,
    event,
  );
}
