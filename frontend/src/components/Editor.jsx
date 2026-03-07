import Editor from '@monaco-editor/react';

function CodeEditor({ code,setCode }){
    return (
        <Editor
            height="70h"
            language="java"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value)}
        />
    );
}

export default CodeEditor;