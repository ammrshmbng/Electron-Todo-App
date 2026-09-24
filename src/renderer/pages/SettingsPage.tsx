import { useEffect, useState } from "react";

import type {
  AppInfo,
  AppUpdateState,
  BackgroundTaskProgress,
  TodoScanReport,
  WebContentsInfo,
} from "../../shared/contracts/todo-api";

export default function SettingsPage() {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [webContentsInfo, setWebContentsInfo] =
    useState<WebContentsInfo | null>(null);
  const [webContentsError, setWebContentsError] = useState<string | null>(null);

  const [backgroundTaskId, setBackgroundTaskId] = useState<string | null>(null);
  const [backgroundProgress, setBackgroundProgress] =
    useState<BackgroundTaskProgress | null>(null);
  const [backgroundReport, setBackgroundReport] =
    useState<TodoScanReport | null>(null);
  const [backgroundError, setBackgroundError] = useState<string | null>(null);

  const [updateState, setUpdateState] = useState<AppUpdateState | null>(null);
  const [updateChecking, setUpdateChecking] = useState(false);

  useEffect(() => {
    async function loadAppInfo() {
      try {
        const result = await window.todoAPI.getAppInfo();
        setAppInfo(result);
      } catch {
        setError("Failed to load application information.");
      } finally {
        setLoading(false);
      }
    }

    void loadAppInfo();
  }, []);

  useEffect(() => {
    void loadWebContentsInfo();
  }, []);

  useEffect(() => {
    const unsubscribeProgress = window.todoAPI.onBackgroundProgress((event) => {
      setBackgroundProgress(event);
      setBackgroundError(null);
    });

    const unsubscribeCompleted = window.todoAPI.onBackgroundCompleted((event) => {
      setBackgroundTaskId(null);
      setBackgroundProgress(null);
      setBackgroundReport(event.report);
      setBackgroundError(null);
    });

    const unsubscribeCancelled = window.todoAPI.onBackgroundCancelled((event) => {
      setBackgroundTaskId(null);
      setBackgroundProgress(null);
      setBackgroundError(null);

      if (backgroundTaskId === event.taskId) {
        setBackgroundReport(null);
      }
    });

    const unsubscribeError = window.todoAPI.onBackgroundError((event) => {
      setBackgroundTaskId(null);
      setBackgroundProgress(null);
      setBackgroundError(event.message);
    });

    return () => {
      unsubscribeProgress();
      unsubscribeCompleted();
      unsubscribeCancelled();
      unsubscribeError();
    };
  }, [backgroundTaskId]);

  useEffect(() => {
    async function loadUpdateState() {
      const state = await window.todoAPI.getUpdateState();
      setUpdateState(state);
    }

    void loadUpdateState();

    const unsubscribe = window.todoAPI.onUpdateState((state) => {
      setUpdateState(state);
      setUpdateChecking(state.status === "checking");
    });

    return unsubscribe;
  }, []);

  const loadWebContentsInfo = async () => {
    try {
      const result = await window.todoAPI.getWebContentsInfo();
      setWebContentsInfo(result);
      setWebContentsError(null);
    } catch {
      setWebContentsError("Failed to load WebContents information.");
    }
  };

  const handleReloadRenderer = async () => {
    await window.todoAPI.reloadRenderer();
  };

  const handleToggleDevTools = async () => {
    await window.todoAPI.toggleDevTools();
    await loadWebContentsInfo();
  };

  const handleOpenDataFolder = async () => {
    const result = await window.todoAPI.openDataFolder();

    if (!result.success) {
      window.alert(
        `Failed to open data folder: ${result.error ?? "Unknown error"}`,
      );
    }
  };

  const handleShowDatabase = async () => {
    await window.todoAPI.showDatabase();
  };

  const handleOpenElectronWebsite = async () => {
    const success = await window.todoAPI.openExternal(
      "https://www.electronjs.org",
    );

    if (!success) {
      window.alert("Failed to open external URL");
    }
  };

  const handleExport = async () => {
    const result = await window.todoAPI.exportFile();

    if (!result.success) {
      window.alert(result.error.message);
      return;
    }

    if (!result.data.path) {
      return;
    }

    window.alert(
      `Exported ${result.data.count} todos to:\n${result.data.path}`,
    );
  };

  const handleImport = async () => {
    const result = await window.todoAPI.importFile();

    if (!result.success) {
      window.alert(result.error.message);
      return;
    }

    if (result.data.count === 0) {
      return;
    }

    window.alert(`Imported ${result.data.count} todos successfully.`);
  };

  const handleStartTodoScan = async () => {
    setBackgroundError(null);
    setBackgroundReport(null);
    setBackgroundProgress(null);

    const result = await window.todoAPI.startTodoScan();

    if (!result.success) {
      setBackgroundError(result.error.message);
      return;
    }

    setBackgroundTaskId(result.data.taskId);
  };

  const handleCancelTodoScan = async () => {
    if (!backgroundTaskId) {
      return;
    }

    const result = await window.todoAPI.cancelBackgroundTask(backgroundTaskId);

    if (!result.success) {
      setBackgroundError(result.error.message);
    }
  };

  const handleCheckForUpdates = async () => {
    setUpdateChecking(true);
    const state = await window.todoAPI.checkForUpdates();
    setUpdateState(state);
    setUpdateChecking(state.status === "checking");
  };

  const handleInstallUpdate = async () => {
    const state = await window.todoAPI.installUpdate();
    setUpdateState(state);
  };

  return (
    <div>
      <h1>Settings</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginTop: 20,
          maxWidth: 500,
        }}
      >
        <button onClick={() => void handleOpenDataFolder()}>
          Open App Data Folder
        </button>

        <button onClick={() => void handleShowDatabase()}>
          Show Database File
        </button>

        <button onClick={() => void handleOpenElectronWebsite()}>
          Open Electron Website
        </button>

        <hr />

        <button onClick={() => void handleExport()}>Export Todos</button>

        <button onClick={() => void handleImport()}>Import Todos</button>
      </div>

      <hr style={{ margin: "32px 0" }} />

      <section>
        <h2>Updates</h2>

        <p>
          {updateState?.message ?? "Loading updater state..."}
        </p>

        {updateState && (
          <p>
            Status: <strong>{updateState.status}</strong>
            {updateState.version
              ? ` — ${updateState.version}`
              : ""}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
          }}
        >
          <button
            disabled={updateChecking}
            onClick={() => void handleCheckForUpdates()}
          >
            {updateChecking ? "Checking..." : "Check for Updates"}
          </button>

          <button
            disabled={updateState?.status !== "downloaded"}
            onClick={() => void handleInstallUpdate()}
          >
            Restart & Install Update
          </button>
        </div>
      </section>

      <hr style={{ margin: "32px 0" }} />

      <section>
        <h2>Background Tasks</h2>

        <p>
          Run a cooperative background scan of the Todo database without
          blocking the Renderer.
        </p>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 16,
          }}
        >
          <button
            disabled={backgroundTaskId !== null}
            onClick={() => void handleStartTodoScan()}
          >
            Run Todo Scan
          </button>

          <button
            disabled={backgroundTaskId === null}
            onClick={() => void handleCancelTodoScan()}
          >
            Cancel
          </button>
        </div>

        {backgroundProgress && (
          <div style={{ marginTop: 20 }}>
            <p>
              Progress: {backgroundProgress.percent}% — {backgroundProgress.processed} / {backgroundProgress.total}
            </p>

            <div
              style={{
                width: "100%",
                height: 12,
                background: "#ddd",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${backgroundProgress.percent}%`,
                  height: "100%",
                  background: "#2563eb",
                  transition: "width 0.1s linear",
                }}
              />
            </div>
          </div>
        )}

        {backgroundError && (
          <p style={{ color: "red", marginTop: 16 }}>
            {backgroundError}
          </p>
        )}

        {backgroundReport && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "180px 1fr",
              gap: 10,
              marginTop: 20,
            }}
          >
            <strong>Total</strong>
            <span>{backgroundReport.total}</span>

            <strong>Completed</strong>
            <span>{backgroundReport.completed}</span>

            <strong>Active</strong>
            <span>{backgroundReport.active}</span>

            <strong>Longest Title</strong>
            <span>{backgroundReport.longestTitleLength} characters</span>

            <strong>Duration</strong>
            <span>{backgroundReport.durationMs} ms</span>
          </div>
        )}
      </section>

      <hr style={{ margin: "32px 0" }} />

      <section>
        <h2>Application Information</h2>

        {loading && <p>Loading...</p>}

        {error && (
          <p style={{ color: "red" }}>{error}</p>
        )}

        {appInfo && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "180px 1fr",
              gap: 10,
              marginTop: 20,
            }}
          >
            <strong>Name</strong>
            <span>{appInfo.name}</span>

            <strong>Version</strong>
            <span>{appInfo.version}</span>

            <strong>Platform</strong>
            <span>{appInfo.platform}</span>

            <strong>Architecture</strong>
            <span>{appInfo.architecture}</span>

            <strong>Packaged</strong>
            <span>{appInfo.isPackaged ? "Yes" : "No"}</span>

            <strong>App Path</strong>
            <span>{appInfo.appPath}</span>

            <strong>User Data</strong>
            <span>{appInfo.paths.userData}</span>

            <strong>App Data</strong>
            <span>{appInfo.paths.appData}</span>

            <strong>Documents</strong>
            <span>{appInfo.paths.documents}</span>

            <strong>Downloads</strong>
            <span>{appInfo.paths.downloads}</span>

            <strong>Desktop</strong>
            <span>{appInfo.paths.desktop}</span>

            <strong>Temp</strong>
            <span>{appInfo.paths.temp}</span>

            <strong>Logs</strong>
            <span>{appInfo.paths.logs}</span>
          </div>
        )}
      </section>

      <hr style={{ margin: "32px 0" }} />

      <section>
        <h2>WebContents</h2>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 16,
            marginBottom: 16,
          }}
        >
          <button onClick={() => void handleReloadRenderer()}>
            Reload Renderer
          </button>

          <button onClick={() => void window.todoAPI.openDevTools()}>
            Open DevTools
          </button>

          <button onClick={() => void handleToggleDevTools()}>
            Toggle DevTools
          </button>

          <button onClick={() => void loadWebContentsInfo()}>
            Refresh Info
          </button>
        </div>

        {webContentsError && (
          <p style={{ color: "red" }}>{webContentsError}</p>
        )}

        {webContentsInfo && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "180px 1fr",
              gap: 10,
            }}
          >
            <strong>WebContents ID</strong>
            <span>{webContentsInfo.id}</span>

            <strong>BrowserWindow ID</strong>
            <span>{webContentsInfo.windowId ?? "None"}</span>

            <strong>Loading</strong>
            <span>{webContentsInfo.isLoading ? "Yes" : "No"}</span>

            <strong>DevTools</strong>
            <span>{webContentsInfo.isDevToolsOpened ? "Open" : "Closed"}</span>

            <strong>URL</strong>
            <span>{webContentsInfo.url}</span>

            <strong>Title</strong>
            <span>{webContentsInfo.title}</span>
          </div>
        )}
      </section>
    </div>
  );
}
