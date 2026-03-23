import React, { useState, useMemo, useEffect } from 'react';
import { generatePreviewHTML } from '../utils/helpers';

interface PreviewAreaProps {
  code: string;
  onError?: (error: string | null) => void;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({ code, onError }) => {
  const [hasError, setHasError] = useState(false);

  // 使用 srcdoc 替代 Blob URL，提高移动端兼容性
  const srcdoc = useMemo(() => {
    try {
      return generatePreviewHTML(code);
    } catch (error) {
      return '';
    }
  }, [code]);

  // 在代码变化时检查错误状态并调用回调
  useEffect(() => {
    try {
      generatePreviewHTML(code);
      setHasError(false);
      onError?.(null);
    } catch (error) {
      setHasError(true);
      onError?.('预览失败：代码存在异常，请检查后重试');
    }
  }, [code, onError]);

  return (
    <div className="h-full overflow-hidden bg-dark-900 relative">
      {hasError ? (
        <div className="h-full flex items-center justify-center p-4">
          <p className="text-red-400 font-medium text-center text-xs sm:text-sm">预览失败：代码存在异常，请检查后重试</p>
        </div>
      ) : (
        <iframe
          srcDoc={srcdoc}
          title="code-preview"
          sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
          className="w-full h-full border-none"
        />
      )}
    </div>
  );
};
