import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";

function CodeEditor({ yText, language, className }) {
    const editorRef = useRef(null);
    const bindingRef = useRef(null);

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;

        if (yText && editor.getModel()) {
            bindingRef.current = new MonacoBinding(
                yText,
                editor.getModel(),
                new Set([editor]),
                null
            );
        }
    };

    useEffect(() => {
        return () => {
            if (bindingRef.current) bindingRef.current.destroy();
        };
    }, []);

    return (
        <div className={className}>
            <Editor
                height="65vh"
                width="170vh"
                language={language}
                theme="vs-dark"
                defaultValue=""
                onMount={handleEditorDidMount}
            />
        </div>
    );
}

export default CodeEditor;