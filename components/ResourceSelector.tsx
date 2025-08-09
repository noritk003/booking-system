'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';

interface Resource {
  id: string;
  name: string;
}

interface ResourceSelectorProps {
  selectedResourceId: string;
  onResourceSelect: (resourceId: string) => void;
  disabled?: boolean;
}

export default function ResourceSelector({ 
  selectedResourceId, 
  onResourceSelect, 
  disabled = false 
}: ResourceSelectorProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResources() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/resources');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || 'リソースの取得に失敗しました');
        }

        // 新しいAPI形式に対応
        const resourcesData = result.data || [];
        setResources(resourcesData);
        
        // 警告がある場合は表示
        if (result.warning) {
          console.warn('⚠️ リソース取得警告:', result.warning);
        }
        
        // 初期選択（まだ選択されていない場合）
        if (!selectedResourceId && result.data?.length > 0) {
          onResourceSelect(result.data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
  }, [selectedResourceId, onResourceSelect]);

  if (loading) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">店舗選択</h2>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
          <span className="ml-3 text-gray-600">読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">店舗選択</h2>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">⚠️ エラーが発生しました</div>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">店舗選択</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {resources.map((resource) => (
          <button
            key={resource.id}
            onClick={() => onResourceSelect(resource.id)}
            disabled={disabled}
            className={`
              p-4 rounded-lg border-2 transition-all
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${selectedResourceId === resource.id
                ? 'border-primary-600 bg-primary-50 text-primary-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-25'
              }
            `}
          >
            <div className="text-lg font-medium">{resource.name}</div>
            <div className="text-sm text-gray-600 mt-1">
              {selectedResourceId === resource.id ? '選択中' : 'クリックして選択'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}