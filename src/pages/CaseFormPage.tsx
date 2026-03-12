import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CodeEditor, PreviewArea, Toast, useToast, Loading } from '../components';
import { caseService } from '../services/caseService';
import { validateTitle, validateCode, copyToClipboard } from '../utils/helpers';
import {
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  CheckIcon,
  CloudArrowUpIcon,
  QuestionMarkCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

// 默认代码模板
const DEFAULT_CODE = `function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ color: '#06b6d4', marginBottom: '20px' }}>Hello World</h1>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>计数: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          background: '#06b6d4',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        点击增加
      </button>
    </div>
  );
}`;

export const CaseFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast, showToast, closeToast } = useToast();

  // 根据是否有 id 判断模式
  const isEditMode = !!id;
  const STORAGE_KEY = isEditMode ? `editPage_code_${id}` : 'uploadPage_code';

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [previewCode, setPreviewCode] = useState('');
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isCodeVisible, setIsCodeVisible] = useState(true);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      if (isEditMode) {
        // 编辑模式：从后端加载
        try {
          const caseData = await caseService.getCaseById(id!);
          setTitle(caseData.title);
          const savedCode = localStorage.getItem(STORAGE_KEY);
          const finalCode = savedCode || caseData.code;
          setCode(finalCode);
          setPreviewCode(finalCode);
        } catch (error) {
          console.error('Failed to fetch case:', error);
          showToast('加载案例失败', 'error');
          navigate('/');
          return;
        } finally {
          setIsLoading(false);
        }
      } else {
        // 新增模式：使用默认模板或本地缓存
        const savedCode = localStorage.getItem(STORAGE_KEY);
        const initialCode = savedCode || DEFAULT_CODE;
        setCode(initialCode);
        setPreviewCode(initialCode);
      }
      setIsInitialized(true);
    };

    initData();
  }, [id, isEditMode, STORAGE_KEY, navigate, showToast]);

  // 页面离开提醒
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
  }, [code, isInitialized, STORAGE_KEY]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    const validation = validateTitle(newTitle);
    setTitleError(validation.error || null);
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    localStorage.setItem(STORAGE_KEY, newCode);
  };

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

  const handleSubmit = async () => {
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

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await caseService.updateCase(id!, { title, code });
        clearSavedCode();
        showToast('更新成功', 'success');
        setTimeout(() => navigate(`/detail/${id}`), 1000);
      } else {
        await caseService.createCase({ title, code });
        clearSavedCode();
        showToast('上传成功', 'success');
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (error) {
      console.error('Submit failed:', error);
      showToast(isEditMode ? '更新失败，请重试' : '上传失败，请重试', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    clearSavedCode();
    navigate(isEditMode ? `/detail/${id}` : '/');
  };

  if (isLoading) {
    return <Loading text="加载中..." />;
  }

  return (
    <div className="flex flex-col h-screen bg-dark-800">
      {/* Header */}
      <header className="flex items-center justify-between p-2 sm:p-3 bg-dark-700 border-b border-dark-500">
        <button
          onClick={handleBack}
          className="p-2 rounded-lg text-dark-300 hover:text-primary hover:bg-dark-600 transition-all"
          title="返回"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !!titleError || !!previewError}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isEditMode ? (
            <CheckIcon className="w-4 h-4" />
          ) : (
            <CloudArrowUpIcon className="w-4 h-4" />
          )}
          {isSubmitting 
            ? (isEditMode ? '保存中...' : '上传中...') 
            : (isEditMode ? '保存' : '发布')}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-2 sm:p-4 flex flex-col gap-2 sm:gap-4">
        <label className="flex items-center gap-2 text-[12px] sm:text-[16px] text-dark-300">
          <span>案例标题: </span>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="输入案例标题..."
            maxLength={50}
            className="flex-1 px-3 sm:px-4 py-2 mr-2 text-sm sm:text-base bg-dark-700 border border-dark-500 rounded-lg text-dark-100 placeholder-dark-400 focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
        {titleError && <p className="text-danger text-xs sm:text-sm">{titleError}</p>}

        <PanelGroup direction="horizontal" className="h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)]">
          {isCodeVisible && (
            <Panel defaultSize={50} minSize={10}>
              <div className="flex flex-col h-full">
                <header className="flex items-center justify-between p-1.5 sm:p-2 bg-dark-700 border-b border-dark-500 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-dark-200">代码</span>
                    <div className="group relative flex justify-center items-center">
                      <button className="p-0.5 text-dark-400 hover:text-primary transition-colors">
                        <QuestionMarkCircleIcon className="w-4 h-4" />
                      </button>
                      <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-dark-600 border border-dark-500 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        <p className="text-xs text-gray-200 font-medium mb-2">代码规范</p>
                        <ul className="text-xs text-gray-300 space-y-1">
                          <li>• 使用 React 函数组件</li>
                          <li>• 导出组件名为 <span className="text-primary">App</span> 或 <span className="text-primary">Component</span></li>
                          <li>• 示例：<code className="text-primary bg-dark-700 px-1 rounded">function App() {"{ return (...) }"}</code></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button 
                      onClick={() => setPreviewCode(code)} 
                      className="p-1 sm:p-1.5 text-dark-300 hover:text-primary hover:bg-dark-600 rounded transition-all" 
                      title="刷新预览"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                    </button>
                    <button onClick={handleCopyCode} className="p-1 sm:p-1.5 text-dark-300 hover:text-primary hover:bg-dark-600 rounded transition-all" title="复制">
                      <ClipboardDocumentIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsPreviewVisible(!isPreviewVisible)} className="p-1 sm:p-1.5 text-dark-300 hover:text-primary hover:bg-dark-600 rounded transition-all" title="切换预览">
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
                  <button onClick={() => setIsCodeVisible(!isCodeVisible)} className="p-1 sm:p-1.5 text-dark-300 hover:text-primary hover:bg-dark-600 rounded transition-all" title="切换代码">
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
