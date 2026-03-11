import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CodeEditor, PreviewArea, Toast, useToast, Loading } from '../components';
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

const STORAGE_KEY = 'editPage_code';

export const EditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast, showToast, closeToast } = useToast();

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [previewCode, setPreviewCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isCodeVisible, setIsCodeVisible] = useState(true);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!id) {
      showToast('无效的案例ID', 'error');
      navigate('/');
      return;
    }

    const fetchCase = async () => {
      try {
        const caseData = await caseService.getCaseById(id);
        setTitle(caseData.title);
        // 如果 localStorage 没有保存的代码，则使用数据库的代码
        const savedCode = localStorage.getItem(STORAGE_KEY);
        const finalCode = savedCode || caseData.code;
        setCode(finalCode);
        setPreviewCode(finalCode);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to fetch case:', error);
        showToast('加载案例失败', 'error');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCase();
  }, [id, navigate, showToast]);

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
    }, 2000); // 增加到 2s，确保在内容变动后几秒才触发保存

    return () => clearTimeout(timer);
  }, [code, isInitialized]);

  const clearSavedCode = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleCopyCode = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      showToast('代码复制成功', 'success');
    } else {
      showToast('复制失败，请手动复制', 'error');
    }
  };

  const handlePreviewError = useCallback((error: string | null) => {
    setPreviewError(error);
  }, []);

  const handleUpdate = async () => {
    if (!id) return;

    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
      setTitleError(titleValidation.error || '标题验证失败');
      return;
    }

    const codeValidation = validateCode(code);
    if (!codeValidation.valid) {
      showToast(codeValidation.error || '代码不能为空', 'error');
      return;
    }

    if (previewError) {
      showToast('预览失败，请修复代码后重试', 'error');
      return;
    }

    setIsUpdating(true);

    try {
      await caseService.updateCase(id, { title, code });
      // 成功后清除 localStorage
      clearSavedCode();
      showToast('更新成功', 'success');
      setTimeout(() => navigate(`/detail/${id}`), 1000);
    } catch (error) {
      console.error('Update failed:', error);
      showToast('更新失败，请重试', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <Loading text="加载中..." />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="flex items-center justify-between p-2 sm:p-4 bg-white border-b border-gray-200">
        <h1 className="text-base sm:text-xl font-bold">编辑案例</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => {
              clearSavedCode();
              navigate(`/detail/${id}`);
            }}
            className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleUpdate}
            disabled={isUpdating || !!titleError || !!previewError}
            className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {isUpdating ? '更新中...' : '保存'}
          </button>
        </div>
      </header>

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