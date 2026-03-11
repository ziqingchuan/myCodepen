import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CodeEditor, PreviewArea, Toast, useToast } from '../components';
import { caseService } from '../services/caseService';
import { validateTitle, validateCode, copyToClipboard } from '../utils/helpers';
import {
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon
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

  // 从 localStorage 加载保存的代码
  useEffect(() => {
    const savedCode = localStorage.getItem(STORAGE_KEY);
    const initialCode = savedCode || '<h1>Hello World</h1>\n<style>\n  h1 { color: blue; }\n</style>';
    setCode(initialCode);
    setPreviewCode(initialCode);
    setIsInitialized(true);
  }, []);

  // 监听页面刷新/关闭，提示未保存
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

  // 防抖更新预览和本地存储
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
    // Validate title
    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
      setTitleError(titleValidation.error || null);
      return;
    }

    // Check for preview error
    if (previewError) {
      showToast('预览失败，请修复代码后重试', 'error');
      return;
    }

    // Validate code
    const codeValidation = validateCode(code);
    if (!codeValidation.valid) {
      showToast(codeValidation.error || '代码验证失败', 'error');
      return;
    }

    setIsUploading(true);

    try {
      await caseService.createCase({ title, code });
      // 成功后清除 localStorage
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
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between p-2 sm:p-4 bg-white border-b border-gray-200">
        <h1 className="text-base sm:text-xl font-bold">创建新案例</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => navigate('/')}
            className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            返回
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading || !!previewError}
            className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUploading ? '上传中...' : '上传'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-2 sm:p-4 flex flex-col gap-2 sm:gap-4">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="请输入案例标题（2-50字）"
          maxLength={50}
          className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 ${titleError ? 'border-red-500 ring-red-500' : 'border-gray-300 ring-blue-500'}`}
        />
        {titleError && <p className="text-red-500 text-xs sm:text-sm">{titleError}</p>}

        <PanelGroup direction="horizontal" className="h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)]">
          {isCodeVisible && (
            <Panel defaultSize={50} minSize={10}>
              <div className="flex flex-col h-full">
                <header className="flex items-center justify-between p-1.5 sm:p-2 bg-gray-100 border-b border-gray-300 shrink-0">
                  <span className="font-semibold text-xs sm:text-sm">代码区</span>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button onClick={handleCopyCode} className="p-1 sm:p-1.5 text-gray-600 hover:bg-gray-200 rounded">
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => setIsPreviewVisible(!isPreviewVisible)} className="p-1 sm:p-1.5 text-gray-600 hover:bg-gray-200 rounded">
                      {isPreviewVisible ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </header>
                <CodeEditor code={code} onChange={handleCodeChange} />
              </div>
            </Panel>
          )}
          {isCodeVisible && isPreviewVisible && (
            <PanelResizeHandle className="w-1 sm:w-2 bg-gray-200 hover:bg-gray-300 cursor-col-resize" />
          )}
          {isPreviewVisible && (
            <Panel defaultSize={50} minSize={10}>
              <div className="flex flex-col h-full">
                <header className="flex items-center justify-between p-1.5 sm:p-2 bg-gray-100 border-b border-gray-300 shrink-0">
                  <span className="font-semibold text-xs sm:text-sm">预览区</span>
                  <button onClick={() => setIsCodeVisible(!isCodeVisible)} className="p-1 sm:p-1.5 text-gray-600 hover:bg-gray-200 rounded">
                    {isCodeVisible ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </header>
                <PreviewArea code={previewCode} onError={handlePreviewError} />
              </div>
            </Panel>
          )}
        </PanelGroup>
      </main>

      {/* Toast Notification */}
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
