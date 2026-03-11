import React, { useRef, useMemo } from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
}

// 计算缩进级别
function getIndentLevel(line: string): number {
  let spaces = 0;
  for (const char of line) {
    if (char === ' ') {
      spaces++;
    } else if (char === '\t') {
      spaces += 2;
    } else {
      break;
    }
  }
  return Math.floor(spaces / 2);
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, readOnly = false }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const indentRef = useRef<HTMLDivElement>(null);

  // 同步滚动
  const handleScroll = () => {
    if (textareaRef.current && indentRef.current) {
      indentRef.current.scrollTop = textareaRef.current.scrollTop;
      indentRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // 处理 Tab 键
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      onChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // 渲染缩进指示线
  const indentGuideLines = useMemo(() => {
    const lines = code.split('\n');
    return lines.map((line, index) => {
      const indentLevel = getIndentLevel(line);
      return (
        <div key={index} className="flex min-h-[1.5rem]">
          {indentLevel > 0 && (
            <div className="flex pointer-events-none shrink-0" style={{ width: indentLevel * 20 }}>
              {Array.from({ length: indentLevel }).map((_, i) => (
                <div key={i} className="w-5 border-l border-indigo-100" />
              ))}
            </div>
          )}
          <span className="flex-1" />
        </div>
      );
    });
  }, [code]);

  return (
    <div className="h-[calc(100vh-120px)] overflow-hidden bg-white rounded-md border border-gray-300 relative">
      {/* 缩进指示线层 */}
      <div
        ref={indentRef}
        className="absolute inset-0 p-4 font-mono text-sm leading-6 whitespace-pre-wrap break-all overflow-hidden pointer-events-none"
        style={{ fontFamily: '"Fira Code", "Fira Mono", monospace', fontSize: 14 }}
      >
        {indentGuideLines}
      </div>

      {/* 编辑层 */}
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        className="absolute inset-0 w-full h-full p-4 font-mono text-sm leading-6 whitespace-pre-wrap break-all resize-none outline-none bg-transparent text-gray-800"
        style={{ fontFamily: '"Fira Code", "Fira Mono", monospace', fontSize: 14 }}
        spellCheck={false}
        placeholder="在此输入代码..."
      />
    </div>
  );
};
