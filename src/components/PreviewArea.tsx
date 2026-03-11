import React, { useEffect, useRef, useState } from 'react';
import { generatePreviewHTML } from '../utils/helpers';

interface PreviewAreaProps {
  code: string;
  onError?: (error: string | null) => void;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({ code, onError }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!iframeRef.current) return;

    try {
      setHasError(false);
      onError?.(null);

      const htmlContent = generatePreviewHTML(code);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      iframeRef.current.src = url;

      const handleIframeError = () => {
        setHasError(true);
        onError?.('预览失败：代码存在异常，请检查后重试');
      };

      iframeRef.current.addEventListener('error', handleIframeError);

      return () => {
        URL.revokeObjectURL(url);
        iframeRef.current?.removeEventListener('error', handleIframeError);
      };
    } catch (error) {
      setHasError(true);
      onError?.('预览失败：代码存在异常，请检查后重试');
    }
  }, [code, onError]);

  return (
    <div className="h-[calc(100vh-120px)] overflow-hidden bg-white rounded-md border border-gray-300">
      {hasError ? (
        <div className="h-full flex items-center justify-center p-4">
          <p className="text-red-500 font-medium text-center">预览失败：代码存在异常，请检查后重试</p>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          title="code-preview"
          sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
          className="w-full h-full border-none"
        />
      )}
    </div>
  );
};
