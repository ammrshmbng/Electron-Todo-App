export const IPC_CHANNELS = {
  TODO: {
    GET_ALL: "todo:get-all",
    GET_BY_ID: "todo:get-by-id",
    CREATE: "todo:create",
    UPDATE: "todo:update",
    DELETE: "todo:delete",
    SHOW_CONTEXT_MENU: "todo:show-context-menu",
    EXPORT_FILE: "todo:export-file",
    IMPORT_FILE: "todo:import-file",
    IMPORT_FILE_PATH: "todo:import-file-path",
    EVENTS: {
      CHANGED: "todo:changed",
      DETAIL_ID: "todo:detail-id",
      CONTEXT_MENU_ACTION: "todo:context-menu-action",
    },
  },
  NATIVE: {
    CONFIRM: "native:confirm",
    OPEN_FILE: "native:open-file",
    NOTIFY: "native:notify",
    OPEN_DATA_FOLDER: "native:open-data-folder",
    SHOW_DATABASE: "native:show-database",
    OPEN_EXTERNAL: "native:open-external",
    GET_APP_INFO: "native:get-app-info",
    COPY_TEXT: "native:copy-text",
    READ_CLIPBOARD: "native:read-clipboard",
  },
  WINDOW: {
    OPEN_TODO_DETAIL: "window:open-todo-detail",
  },
  WEBCONTENTS: {
    RELOAD: "webcontents:reload",
    OPEN_DEVTOOLS: "webcontents:open-devtools",
    TOGGLE_DEVTOOLS: "webcontents:toggle-devtools",
    GET_INFO: "webcontents:get-info",
  },
  APP: {
    EVENTS: {
      COMMAND: "app:command",
    },
  },
} as const;

export type IPCInvokeChannel =
  | (typeof IPC_CHANNELS.TODO)[Exclude<
      keyof typeof IPC_CHANNELS.TODO,
      "EVENTS"
    >]
  | (typeof IPC_CHANNELS.NATIVE)[keyof typeof IPC_CHANNELS.NATIVE]
  | (typeof IPC_CHANNELS.WINDOW)[keyof typeof IPC_CHANNELS.WINDOW]
  | (typeof IPC_CHANNELS.WEBCONTENTS)[keyof typeof IPC_CHANNELS.WEBCONTENTS];
