import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loading, Pagination, Toast, useToast } from '../components';
import { caseService } from '../services/caseService';
import type { Case } from '../types';
import { formatDate, debounce, generatePreviewHTML } from '../utils/helpers';
import { PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// 卡片预览组件
const CardPreview: React.FC<{ code: string }> = ({ code }) => {
  const htmlContent = useMemo(() => generatePreviewHTML(code), [code]);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-900 z-10">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <iframe
        srcDoc={htmlContent}
        title="preview"
        sandbox="allow-scripts"
        className="w-full h-full border-none pointer-events-none"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

export const ListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast, showToast, closeToast } = useToast();

  const [cases, setCases] = useState<Case[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
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
    e.stopPropagation();
    if (window.confirm('确定删除这个案例吗？')) {
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
    <div className="min-h-screen bg-dark-800">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Search Bar */}
        <div className="mb-4 sm:mb-8">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="搜索案例..."
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-dark-700 border border-dark-500 rounded-xl text-dark-100 placeholder-dark-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Cases Grid */}
        {loading ? (
          <Loading text="加载中..." />
        ) : cases.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
              <MagnifyingGlassIcon className="w-8 h-8 text-dark-400" />
            </div>
            <p className="text-dark-300 text-base sm:text-xl">暂无案例，快去创建一个吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {cases.map((caseItem) => (
              <div
                key={caseItem.id}
                onClick={() => handleCaseClick(caseItem.id)}
                className="group relative bg-dark-700 rounded-xl overflow-hidden cursor-pointer card-hover border border-dark-600 hover:border-primary/50"
              >
                <button
                  onClick={(e) => handleDelete(e, caseItem.id)}
                  className="absolute top-2 right-2 z-10 p-2 bg-dark-800/80 backdrop-blur rounded-lg text-dark-300 hover:text-danger hover:bg-danger/20 opacity-0 group-hover:opacity-100 transition-all"
                  title="删除"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
                <div className="h-36 sm:h-44 bg-dark-900 overflow-hidden">
                  <CardPreview code={caseItem.code} />
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-sm sm:text-base text-dark-100 truncate mb-1">
                    {caseItem.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-dark-400">
                    {formatDate(caseItem.create_time)}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit/${caseItem.id}`);
                    }}
                    className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-10 p-1.5 sm:p-2 bg-dark-800/80 backdrop-blur rounded-lg text-dark-300 hover:text-primary hover:bg-primary/20 opacity-0 group-hover:opacity-100 transition-all"
                    title="编辑"
                  >
                    <PencilSquareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 sm:mt-12">
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
