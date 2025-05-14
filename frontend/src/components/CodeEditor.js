import React from 'react';
import Editor from '@monaco-editor/react';
import PropTypes from 'prop-types';

const CodeEditor = ({
  initialValue = '',
  language = 'javascript',
  theme = 'vs-dark',
  onChange,
  readOnly = false,
  height = '500px'
}) => {
  // Handle editor content changes
  const handleEditorDidMount = (editor, monaco) => {
    // Configure Python language
    if (!monaco.languages.getLanguages().some(lang => lang.id === 'python')) {
      monaco.languages.register({ id: 'python' });
      monaco.languages.setMonarchTokensProvider('python', {
        tokenizer: {
          root: [
            [/def\s+([a-zA-Z_]\w*)/, 'keyword'],
            [/class\s+([a-zA-Z_]\w*)/, 'keyword'],
            [/\b(if|else|for|while|try|except|return|import|from|as)\b/, 'keyword'],
            [/#.*$/, 'comment'],
            [/"""([^"]*)"""|'''([^']*)'''/, 'string'],
            [/"([^"]*)"/, 'string'],
            [/\b\d+(\.\d+)?\b/, 'number']
          ]
        }
      });
    }

    // Configure Java language
    if (!monaco.languages.getLanguages().some(lang => lang.id === 'java')) {
      monaco.languages.register({ id: 'java' });
      monaco.languages.setMonarchTokensProvider('java', {
        tokenizer: {
          root: [
            [/\b(public|private|protected|class|void|static|final|return)\b/, 'keyword'],
            [/\/\/.*$/, 'comment'],
            [/\/\*[\s\S]*?\*\//, 'comment'],
            [/"([^"]*)"/, 'string'],
            [/\b\d+(\.\d+)?\b/, 'number']
          ]
        }
      });
    }
  };

  return (
    <div className="code-editor-container">
      <Editor
        height={height}
        language={language}
        value={initialValue}
        theme={theme}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          fontSize: 14,
          tabSize: 2,
          automaticLayout: true,
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
};

CodeEditor.propTypes = {
  initialValue: PropTypes.string,
  language: PropTypes.string,
  theme: PropTypes.string,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  height: PropTypes.string,
};

export default CodeEditor;