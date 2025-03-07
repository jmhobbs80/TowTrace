'use client';

import { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Column definition type
export type ColumnDef = {
  id: string;
  header: string;
  accessorKey?: string;
  cell?: (info: any) => React.ReactNode;
  sortable?: boolean;
  enableSorting?: boolean;
};

// Type for column ordering and visibility
export type ColumnOrder = {
  id: string;
  visible: boolean;
};

// DragItem type for React DnD
type DragItem = {
  index: number;
  id: string;
  type: string;
};

// Props for the DraggableHeader component
type DraggableHeaderProps = {
  column: ColumnDef;
  index: number;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
  handleSort: (columnId: string) => void;
  sortConfig: { key: string | null; direction: 'asc' | 'desc' | null };
};

// DraggableHeader component
const DraggableHeader: React.FC<DraggableHeaderProps> = ({ 
  column, 
  index, 
  moveColumn, 
  handleSort,
  sortConfig 
}) => {
  const ref = useRef<HTMLTableCellElement>(null);
  const isSortable = column.sortable !== false && column.enableSorting !== false;
  
  const [{ isDragging }, drag] = useDrag({
    type: 'column',
    item: { type: 'column', id: column.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'column',
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Time to actually perform the action
      moveColumn(dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const opacity = isDragging ? 0.5 : 1;
  
  drag(drop(ref));
  
  // Determine if this column is the current sort column
  const isSorted = sortConfig.key === column.id;
  
  return (
    <th 
      ref={ref} 
      className={`py-3 px-4 font-medium text-gray-600 text-sm select-none ${isDragging ? 'opacity-50' : ''} ${isSortable ? 'cursor-pointer hover:bg-gray-100' : ''}`} 
      style={{ opacity }}
      onClick={() => isSortable && handleSort(column.id)}
    >
      <div className="flex items-center space-x-1">
        <span>{column.header}</span>
        {isSortable && (
          <span className="text-gray-400">
            {isSorted ? (
              sortConfig.direction === 'asc' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                </svg>
              )
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-40">
                <path fillRule="evenodd" d="M2.24 6.8a.75.75 0 001.06-.04l1.95-2.1v8.59a.75.75 0 001.5 0V4.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0L2.2 5.74a.75.75 0 00.04 1.06zm8 6.4a.75.75 0 00-.04 1.06l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75a.75.75 0 00-1.5 0v8.59l-1.95-2.1a.75.75 0 00-1.06-.04z" clipRule="evenodd" />
              </svg>
            )}
          </span>
        )}
      </div>
    </th>
  );
};

// Props for the SortableTable component
type SortableTableProps = {
  data: any[];
  columns: ColumnDef[];
  defaultSortColumn?: string;
  defaultSortDirection?: 'asc' | 'desc';
  storageKey?: string;
  emptyMessage?: string;
  onSortChange?: (columnId: string, direction: 'asc' | 'desc' | null) => void;
  onColumnOrderChange?: (columnOrder: ColumnOrder[]) => void;
};

// Main SortableTable component
const SortableTable: React.FC<SortableTableProps> = ({
  data,
  columns,
  defaultSortColumn,
  defaultSortDirection = 'asc',
  storageKey,
  emptyMessage = "No data found",
  onSortChange,
  onColumnOrderChange,
}) => {
  // Initialize column order from localStorage if available
  const getInitialColumnOrder = (): ColumnOrder[] => {
    if (storageKey && typeof window !== 'undefined') {
      const savedOrder = localStorage.getItem(`${storageKey}-columns`);
      if (savedOrder) {
        try {
          const parsed = JSON.parse(savedOrder);
          // Ensure all columns are represented
          const columnIds = columns.map(column => column.id);
          const parsedIds = parsed.map((item: ColumnOrder) => item.id);
          
          // Add any missing columns
          columnIds.forEach(id => {
            if (!parsedIds.includes(id)) {
              parsed.push({ id, visible: true });
            }
          });
          
          // Remove any columns that don't exist anymore
          return parsed.filter((item: ColumnOrder) => columnIds.includes(item.id));
        } catch (e) {
          console.error('Error parsing saved column order:', e);
        }
      }
    }
    
    // Default: all columns visible in the original order
    return columns.map(column => ({
      id: column.id,
      visible: true
    }));
  };

  const [columnOrder, setColumnOrder] = useState<ColumnOrder[]>(getInitialColumnOrder);
  
  // Initialize sort configuration
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc' | null;
  }>({
    key: defaultSortColumn || null,
    direction: defaultSortColumn ? defaultSortDirection : null,
  });

  // Reorder the columns
  const orderedColumns = columnOrder
    .filter(col => col.visible)
    .map(col => columns.find(column => column.id === col.id))
    .filter(Boolean) as ColumnDef[];
  
  // Function to save column order to localStorage
  const saveColumnOrder = (newOrder: ColumnOrder[]) => {
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(`${storageKey}-columns`, JSON.stringify(newOrder));
    }
  };
  
  // Function to move a column
  const moveColumn = (dragIndex: number, hoverIndex: number) => {
    const visibleColumnOrder = columnOrder.filter(col => col.visible);
    const draggedItem = visibleColumnOrder[dragIndex];
    
    // Create a new array with the dragged item moved to the new position
    const newVisibleOrder = [...visibleColumnOrder];
    newVisibleOrder.splice(dragIndex, 1);
    newVisibleOrder.splice(hoverIndex, 0, draggedItem);
    
    // Update the full column order preserving the invisible columns
    const newFullOrder = [
      ...newVisibleOrder,
      ...columnOrder.filter(col => !col.visible)
    ];
    
    setColumnOrder(newFullOrder);
    saveColumnOrder(newFullOrder);
    
    if (onColumnOrderChange) {
      onColumnOrderChange(newFullOrder);
    }
  };
  
  // Function to handle sorting
  const handleSort = (columnId: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig.key === columnId) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }
    
    setSortConfig({
      key: direction ? columnId : null,
      direction,
    });
    
    if (onSortChange) {
      onSortChange(columnId, direction);
    }
  };
  
  // Sort the data
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) {
      return 0;
    }
    
    const column = columns.find(col => col.id === sortConfig.key);
    if (!column) return 0;
    
    const accessorKey = column.accessorKey || column.id;
    const aValue = a[accessorKey];
    const bValue = b[accessorKey];
    
    // Handle undefined or null values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    
    // Compare based on data type
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    // For numbers, dates, etc.
    return sortConfig.direction === 'asc'
      ? aValue > bValue ? 1 : -1
      : bValue > aValue ? 1 : -1;
  });
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {orderedColumns.map((column, index) => (
                <DraggableHeader
                  key={column.id}
                  column={column}
                  index={index}
                  moveColumn={moveColumn}
                  handleSort={handleSort}
                  sortConfig={sortConfig}
                />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedData.length > 0 ? (
              sortedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {orderedColumns.map((column) => (
                    <td key={column.id} className="py-3 px-4">
                      {column.cell 
                        ? column.cell({ row }) 
                        : row[column.accessorKey || column.id]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={orderedColumns.length} 
                  className="py-6 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DndProvider>
  );
};

export default SortableTable;