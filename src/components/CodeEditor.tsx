import React, { useRef, useMemo } from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
}

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

  const handleScroll = () => {
    if (textareaRef.current && indentRef.current) {
      indentRef.current.scrollTop = textareaRef.current.scrollTop;
      indentRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

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

  // 彩虹色数组
  const rainbowColors = [
    'border-red-500/50',
    'border-orange-500/50',
    'border-yellow-500/50',
    'border-green-500/50',
    'border-cyan-500/50',
    'border-blue-500/50',
    'border-purple-500/50',
    'border-pink-500/50',
  ];

  const getRainbowColor = (index: number) => rainbowColors[index % rainbowColors.length];

  const indentGuideLines = useMemo(() => {
    const lines = code.split('\n');
    return lines.map((line, index) => {
      const indentLevel = getIndentLevel(line);
      return (
        <div key={index} className="flex min-h-[1.25rem] sm:min-h-[1.5rem]">
          {indentLevel > 0 && (
            <div className="flex pointer-events-none shrink-0" style={{ width: indentLevel * 20 }}>
              {Array.from({ length: indentLevel }).map((_, i) => (
                <div key={i} className={`w-[0.925rem] sm:w-[1.075rem] border-l ${getRainbowColor(i)}`} />
              ))}
            </div>
          )}
          <span className="flex-1" />
        </div>
      );
    });
  }, [code]);

  return (
    <div className="h-full overflow-hidden bg-dark-900 relative">
      <div
        ref={indentRef}
        className="absolute inset-0 p-2 sm:p-4 font-mono text-xs sm:text-sm leading-5 sm:leading-6 whitespace-pre-wrap break-all overflow-hidden pointer-events-none text-dark-400"
        style={{ fontFamily: '"Fira Code", "Fira Mono", monospace' }}
      >
        {indentGuideLines}
      </div>

      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        className="absolute inset-0 w-full h-full p-2 sm:p-4 font-mono text-xs sm:text-sm leading-5 sm:leading-6 whitespace-pre overflow-x-auto resize-none outline-none bg-transparent text-dark-100 caret-primary"
        style={{ fontFamily: '"Fira Code", "Fira Mono", monospace' }}
        spellCheck={false}
        placeholder="在此输入代码..."
      />
    </div>
  );
};
