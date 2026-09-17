import { useEffect, useState } from "react";

import type { AppInfo } from "../../shared/contracts/todo-api";

export default function SettingsPage() {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

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

      <hr
        style={{
          margin: "32px 0",
        }}
      />

      <section>
        <h2>Application Information</h2>

        {loading && <p>Loading...</p>}

        {error && (
          <p
            style={{
              color: "red",
            }}
          >
            {error}
          </p>
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
    </div>
  );
}
