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
} from '@heroicons/react/24/outline';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast, showToast, closeToast } = useToast();

  const [caseData, setCaseData] = useState<Case | null>(null);
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
    if (window.confirm('你确定要删除这个案例吗？')) {
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-xl">案例不存在或已被删除</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            返回
          </button>
          <h1 className="text-xl font-bold truncate">{caseData.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/edit/${caseData.id}`)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            编辑
          </button>
          {/* <button
            onClick={handleCopyCode}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            复制代码
          </button> */}
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            删除
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-120px)] overflow-hidden">
        <PanelGroup direction="horizontal">
          {isCodeVisible && (
            <Panel defaultSize={50} minSize={10}>
              <div className="flex flex-col h-full">
                <header className="flex items-center justify-between p-2 bg-gray-100 border-b border-gray-300 shrink-0">
                  <span className="font-semibold text-sm">代码区</span>
                  <div className="flex items-center gap-2">
                    <button onClick={handleCopyCode} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded">
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => setIsPreviewVisible(!isPreviewVisible)} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded">
                      {isPreviewVisible ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
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
            <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300 cursor-col-resize transition-colors" />
          )}
          {isPreviewVisible && (
            <Panel defaultSize={50} minSize={10}>
              <div className="flex flex-col h-full">
                <header className="flex items-center justify-between p-2 bg-gray-100 border-b border-gray-300 shrink-0">
                  <span className="font-semibold text-sm">预览区</span>
                  <button onClick={() => setIsCodeVisible(!isCodeVisible)} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded">
                    {isCodeVisible ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </header>
                <PreviewArea code={caseData.code} />
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
