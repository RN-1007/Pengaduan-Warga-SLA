import { useState, useMemo } from 'react';

export type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a';

interface UseFilteredDataOptions<T> {
  initialData: T[] | undefined | null;
  searchKeys: string[]; // Dot notation supported, e.g., 'users.full_name'
  defaultSort?: SortOption;
  dateField?: string; // e.g., 'created_at', default is 'created_at'
  titleField?: string; // e.g., 'title' or 'name', default is 'title'
}

// Utility to get nested object property
const getNestedValue = (obj: any, path: string): string => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || '';
};

export function useFilteredData<T>({
  initialData,
  searchKeys,
  defaultSort = 'newest',
  dateField = 'created_at',
  titleField = 'title',
}: UseFilteredDataOptions<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>(defaultSort);

  const filteredAndSortedData = useMemo(() => {
    if (!initialData) return [];

    let result = [...initialData];

    // 1. Filter
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((item: any) => {
        return searchKeys.some((key) => {
          const val = getNestedValue(item, key);
          if (typeof val === 'string') {
            return val.toLowerCase().includes(query);
          }
          return false;
        });
      });
    }

    // 2. Sort
    result.sort((a: any, b: any) => {
      const dateA = new Date(getNestedValue(a, dateField) || 0).getTime();
      const dateB = new Date(getNestedValue(b, dateField) || 0).getTime();
      const titleA = (getNestedValue(a, titleField) || '').toLowerCase();
      const titleB = (getNestedValue(b, titleField) || '').toLowerCase();

      switch (sortOption) {
        case 'newest':
          return dateB - dateA;
        case 'oldest':
          return dateA - dateB;
        case 'a-z':
          return titleA.localeCompare(titleB);
        case 'z-a':
          return titleB.localeCompare(titleA);
        default:
          return 0;
      }
    });

    return result;
  }, [initialData, searchQuery, sortOption, searchKeys, dateField, titleField]);

  return {
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    filteredData: filteredAndSortedData,
  };
}
