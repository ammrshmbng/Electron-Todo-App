export default function SettingsPage() {
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

  return (
    <div>
      <h1>Settings</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginTop: 20,
          maxWidth: 400,
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
      </div>
    </div>
  );
}
