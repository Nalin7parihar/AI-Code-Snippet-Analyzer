"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";

export default function CodeEditor({ value, onChange, language }) {
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const [editorTheme, setEditorTheme] = useState("vs-light");

  useEffect(() => {
    setEditorTheme(theme === "dark" ? "vs-dark" : "vs-light");
  }, [theme]);

  const handleEditorChange = (value) => {
    onChange(value);
  };

  const handleEditorDidMount = () => {
    setIsLoading(false);
  };

  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme("customLightTheme", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#ffffff",
      },
    });

    monaco.editor.defineTheme("customDarkTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1e1e1e",
      },
    });
  };

  return (
    <div className="relative">
      <Editor
        height="400px"
        width="100%"
        language={language || "javascript"}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        beforeMount={handleEditorWillMount}
        theme={theme === "dark" ? "customDarkTheme" : "customLightTheme"}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          lineNumbers: "on",
          automaticLayout: true,
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 dark:bg-opacity-70">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
    </div>
  );
}
