import { useMemo, useRef, useEffect, useState } from "react";
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";

import { detectDependencies } from "../utils/sandpackUtils";
import { useAppContext } from "../context/AppContext";
import SandpackErrorMonitor from "./SandpackErrorMonitor";

/**
 * Watches Sandpack files and saves them to the backend.
 *
 * IMPORTANT:
 * This component does NOT update React state with the Sandpack files.
 * Otherwise we create:
 *
 * Sandpack -> React state -> Sandpack -> React state...
 *
 * which can cause Sandpack to reset to App.js.
 */
function SandpackFileWatcher() {
  const { sandpack } = useSandpack();
  const { files } = sandpack;

  const { activeProject, updateProjectFiles } = useAppContext();

  const activeProjectRef = useRef(activeProject);

  // Always keep the latest project in the ref.
  useEffect(() => {
    activeProjectRef.current = activeProject;
  }, [activeProject]);

  useEffect(() => {
    const project = activeProjectRef.current;

    if (!project) return;

    const updatedFiles = {};

    for (const [path, fileObj] of Object.entries(files)) {
      updatedFiles[path] = fileObj.code;
    }

    // Save Sandpack's current files.
    // updateProjectFiles already debounces the API request.
    updateProjectFiles(updatedFiles);
  }, [files, updateProjectFiles]);

  return null;
}

const PreviewPanel = ({ project, activeFile, showCode }) => {
  const [showErrorOverlay, setShowErrorOverlay] = useState(true);

  /**
   * Convert project.files into Sandpack's file format.
   *
   * IMPORTANT:
   * We are using project.files directly.
   * We are NOT doing:
   *
   * Sandpack -> liveFiles -> Sandpack
   *
   * because that can reset Sandpack's active file.
   */
  const sandpackFiles = useMemo(() => {
    const spFiles = {};

    for (const [path, content] of Object.entries(project.files || {})) {
      const fileCode =
        typeof content === "string"
          ? content
          : content?.content || "";

      spFiles[path] = {
        code: fileCode,
      };
    }

    return spFiles;
  }, [project.files]);

  /**
   * Detect dependencies from project files.
   */
  const dependencies = useMemo(() => {
    return detectDependencies(project.files || {});
  }, [project.files]);

  return (
    <div className="h-full w-full">
      <SandpackProvider
        key={`${project._id}-${project.version}`}
        template="react"
        files={sandpackFiles}
        customSetup={{
          dependencies,
        }}
        options={{
          externalResources: [
            "https://cdn.tailwindcss.com",
            "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
          ],

          classes: {
            "sp-wrapper": "sp-wrapper",
            "sp-layout": "sp-layout",
            "sp-preview": "sp-preview",
          },

          logLevel: 0,
        }}
        theme={{
          colors: {
            surface1: "#ffffff",
            surface2: "#f4f4f5",
            surface3: "#e4e4e7",
            clickable: "#71717a",
            base: "#09090b",
            disabled: "#a1a1aa",
            hover: "#18181b",
            accent: "#18181b",
            error: "#ef4444",
            errorSurface: "#fef2f2",
          },

          font: {
            body: "'Urbanist', system-ui, -apple-system, sans-serif",
            mono: "'Geist Mono', ui-monospace, monospace",
            size: "13px",
            lineHeight: "1.6",
          },
        }}
      >
        {/* Watches Sandpack and autosaves changes */}
        <SandpackFileWatcher />

        <SandpackErrorMonitor
          onErrorChange={setShowErrorOverlay}
        />

        <SandpackLayout
          style={{
            height: "100%",
            border: "none",
            borderRadius: 0,
            background: "transparent",
          }}
        >
          {showCode && (
            <SandpackCodeEditor
              showTabs
              showLineNumbers
              showInlineErrors
              wrapContent
              style={{
                height: "100%",
                flex: 1,
                minWidth: 0,
              }}
            />
          )}

          <SandpackPreview
            showNavigator={false}
            showRefreshButton
            showOpenInCodeSandbox={false}
            showSandpackErrorOverlay={showErrorOverlay}
            style={{
              height: "100%",
              flex: showCode ? 1 : 2,
              minWidth: 0,
            }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
};

export default PreviewPanel;