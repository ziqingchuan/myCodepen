import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CodeEditor, PreviewArea, Toast, useToast, Loading } from '../components';
import { caseService } from '../services/caseService';
import type { Case } from '../types';
import { copyToClipboard } from '../utils/helpers';
import {
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast, showToast, closeToast } = useToast();

  const [caseData, setCaseData] = useState< Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCodeVisible, setIsCodeVisible] = useState(true);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);

  useEffect(() => {
    const loadCase = async () => {
      try {
        if (!id) throw new Error('No case ID provided');
        const data = await caseService.getCaseById(id);
        setCaseData(data);
      } catch (error) {
        console.error('Failed to load case:', error);
        showToast('加载失败，请重试', 'error');
        setTimeout(() => navigate('/'), 2000);
      } finally {
        setLoading(false);
      }
    };

    loadCase();
  }, [id, navigate, showToast]);

  const handleCopyCode = async () => {
    if (!caseData) return;
    const success = await copyToClipboard(caseData.code);
    if (success) {
      showToast('代码复制成功', 'success', 2000);
    } else {
      showToast('复制失败，请手动复制', 'error');
    }
  };

  const handleDelete = async () => {
    if (!caseData) return;
    if (window.confirm('确定删除这个案例吗？')) {
      try {
        await caseService.deleteCase(caseData.id);
        showToast('删除成功', 'success');
        navigate('/');
      } catch (error) {
        console.error('Failed to delete case:', error);
        showToast('删除失败，请重试', 'error');
      }
    }
  };

  if (loading) {
    return <Loading text="加载中..." />;
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-dark-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
            <span className="text-3xl">😕</span>
          </div>
          <p className="text-dark-300 text-base sm:text-xl mb-4">案例不存在或已被删除</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-all"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-dark-800">
      {/* Header */}
      <header className="flex items-center justify-between p-2 sm:p-3 bg-dark-700 border-b border-dark-500">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg text-dark-300 hover:text-primary hover:bg-dark-600 transition-all shrink-0"
            title="返回"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-sm sm:text-base text-dark-100 truncate">{caseData.title}</h1>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={() => navigate(`/edit/${caseData.id}`)}
            className="p-2 rounded-lg text-dark-300 hover:text-primary hover:bg-dark-600 transition-all"
            title="编辑"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-dark-300 hover:text-danger hover:bg-danger/20 transition-all"
            title="删除"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-56px)] sm:h-[calc(100vh-72px)] overflow-hidden">
        <PanelGroup direction="horizontal">
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
                <CodeEditor
                  code={caseData.code}
                  onChange={() => {}}
                  readOnly={true}
                />
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
                <PreviewArea code={caseData.code} />
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
