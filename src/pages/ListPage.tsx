import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loading, Pagination, Toast, useToast } from '../components';
import { caseService } from '../services/caseService';
import type { Case } from '../types';
import { formatDate, debounce, generatePreviewHTML } from '../utils/helpers';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// 卡片预览组件
const CardPreview: React.FC<{ code: string }> = ({ code }) => {
  const htmlContent = useMemo(() => generatePreviewHTML(code), [code]);

  return (
    <iframe
      srcDoc={htmlContent}
      title="preview"
      sandbox="allow-scripts"
      className="w-full h-full border-none pointer-events-none"
    />
  );
};

export const ListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast, showToast, closeToast } = useToast();

  const [cases, setCases] = useState<Case[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [itemsPerPage] = useState(9);

  const loadCases = async (page: number, query: string = '') => {
    setLoading(true);
    try {
      const result = query
        ? await caseService.searchCases(query, page, itemsPerPage)
        : await caseService.getCases(page, itemsPerPage);

      setCases(result.data);
      setTotalPages(Math.ceil(result.total / itemsPerPage));
    } catch (error) {
      console.error('Failed to load cases:', error);
      showToast('加载失败，请重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases(1);
  }, []);

  const handleSearch = debounce((query: string) => {
    setCurrentPage(1);
    loadCases(1, query);
  }, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadCases(page, searchQuery);
  };

  const handleCaseClick = (id: string) => {
    navigate(`/detail/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent navigation
    if (window.confirm('你确定要删除这个案例吗？')) {
      try {
        await caseService.deleteCase(id);
        showToast('删除成功', 'success');
        setCases(cases.filter(c => c.id !== id));
      } catch (error) {
        console.error('Failed to delete case:', error);
        showToast('删除失败，请重试', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">案例广场</h1>
          <p className="text-gray-500 mt-1">发现、分享和学习前端交互案例</p>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="搜索案例..."
            className="w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Cases Grid */}
        {loading ? (
          <Loading text="加载中..." />
        ) : cases.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-xl">没有找到相关案例</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cases.map((caseItem) => (
              <div
                key={caseItem.id}
                onClick={() => handleCaseClick(caseItem.id)}
                className="group relative bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <button
                  onClick={(e) => handleDelete(e, caseItem.id)}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
                <div className="h-48 bg-white overflow-hidden">
                  <CardPreview code={caseItem.code} />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-gray-900 truncate mb-2">
                    {caseItem.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    发布于 {formatDate(caseItem.create_time)}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit/${caseItem.id}`);
                    }}
                    className="absolute bottom-4 right-4 z-10 p-1.5 bg-white rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </div>
        )}
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
