import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CodeEditor, PreviewArea, Toast, useToast } from '../components';
import { caseService } from '../services/caseService';
import { validateTitle, validateCode, copyToClipboard } from '../utils/helpers';
import {
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

const STORAGE_KEY = 'uploadPage_code';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast, showToast, closeToast } = useToast();

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [previewCode, setPreviewCode] = useState('');
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [isCodeVisible, setIsCodeVisible] = useState(true);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedCode = localStorage.getItem(STORAGE_KEY);
    const initialCode = savedCode || '<h1>Hello World</h1>\n<style>\n  h1 { color: #06b6d4; }\n</style>';
    setCode(initialCode);
    setPreviewCode(initialCode);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isInitialized) {
        const savedCode = localStorage.getItem(STORAGE_KEY);
        if (savedCode && savedCode !== code) {
          e.preventDefault();
          e.returnValue = '';
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [code, isInitialized]);

  const clearSavedCode = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const handlePreviewError = useCallback((error: string | null) => {
    setPreviewError(error);
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    const validation = validateTitle(newTitle);
    setTitleError(validation.error || null);
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  useEffect(() => {
    if (!isInitialized) return;

    const timer = setTimeout(() => {
      setPreviewCode(code);
      localStorage.setItem(STORAGE_KEY, code);
    }, 2000);

    return () => clearTimeout(timer);
  }, [code, isInitialized]);

  const handleCopyCode = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      showToast('代码复制成功', 'success');
    } else {
      showToast('复制失败，请手动复制', 'error');
    }
  };

  const handleUpload = async () => {
    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
      setTitleError(titleValidation.error || null);
      return;
    }

    if (previewError) {
      showToast('预览失败，请修复代码后重试', 'error');
      return;
    }

    const codeValidation = validateCode(code);
    if (!codeValidation.valid) {
      showToast(codeValidation.error || '代码验证失败', 'error');
      return;
    }

    setIsUploading(true);

    try {
      await caseService.createCase({ title, code });
      clearSavedCode();
      showToast('上传成功', 'success', 3000);

      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Upload failed:', error);
      showToast('上传失败，请重试', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-dark-800">
      {/* Header */}
      <header className="flex items-center justify-between p-2 sm:p-3 bg-dark-700 border-b border-dark-500">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg text-dark-300 hover:text-primary hover:bg-dark-600 transition-all"
          title="返回"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <button
          onClick={handleUpload}
          disabled={isUploading || !!previewError}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <CloudArrowUpIcon className="w-4 h-4" />
          {isUploading ? '上传中...' : '发布'}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-2 sm:p-4 flex flex-col gap-2 sm:gap-4">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="输入案例标题..."
          maxLength={50}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-dark-700 border border-dark-500 rounded-lg text-dark-100 placeholder-dark-400 focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {titleError && <p className="text-danger text-xs sm:text-sm">{titleError}</p>}

        <PanelGroup direction="horizontal" className="h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)]">
          {isCodeVisible && (
            <Panel defaultSize={50} minSize={10}>
              <div className="flex flex-col h-full">
                <header className="flex items-center justify-between p-1.5 sm:p-2 bg-dark-700 border-b border-dark-500 shrink-0">
                  <span className="font-semibold text-xs sm:text-sm text-dark-200">代码</span>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button onClick={handleCopyCode} className="p-1 sm:p-1.5 text-dark-300 hover:text-primary hover:bg-dark-600 rounded transition-all" title="复制">
                      <ClipboardDocumentIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsPreviewVisible(!isPreviewVisible)} className="p-1 sm:p-1.5 text-dark-300 hover:text-primary hover:bg-dark-600 rounded transition-all" title="预览">
                      {isPreviewVisible ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </header>
                <CodeEditor code={code} onChange={handleCodeChange} />
              </div>
            </Panel>
          )}
          {isCodeVisible && isPreviewVisible && (
            <PanelResizeHandle className="w-1 sm:w-2 bg-dark-600 hover:bg-primary cursor-col-resize transition-colors" />
          )}
          {isPreviewVisible && (
            <Panel defaultSize={50} minSize={10}>
              <div className="flex flex-col h-full">
                <header className="flex items-center justify-between p-1.5 sm:p-2 bg-dark-700 border-b border-dark-500 shrink-0">
                  <span className="font-semibold text-xs sm:text-sm text-dark-200">预览</span>
                  <button onClick={() => setIsCodeVisible(!isCodeVisible)} className="p-1 sm:p-1.5 text-dark-300 hover:text-primary hover:bg-dark-600 rounded transition-all" title="代码">
                    {isCodeVisible ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </header>
                <PreviewArea code={previewCode} onError={handlePreviewError} />
              </div>
            </Panel>
          )}
        </PanelGroup>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={closeToast}
        />
      )}
    </div>
  );
};
