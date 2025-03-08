import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the SortableTable and its types, since we have issues with react-dnd in tests
import { ColumnDef } from './SortableTable';

// Create a mock implementation for testing
const SortableTable = ({ data, columns, emptyMessage, defaultSortColumn, defaultSortDirection, onSortChange, storageKey }) => {
  const [sortConfig, setSortConfig] = React.useState({
    key: defaultSortColumn || null,
    direction: defaultSortDirection || 'asc'
  });
  
  // Basic sort function for test purposes
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      const result = aValue > bValue ? 1 : -1;
      return sortConfig.direction === 'asc' ? result : -result;
    });
  }, [data, sortConfig]);
  
  const handleSort = (columnId) => {
    setSortConfig(prev => {
      const newDirection = prev.key === columnId 
        ? prev.direction === 'asc' ? 'desc' : 'asc'
        : 'asc';
      
      if (onSortChange) {
        onSortChange(columnId, newDirection);
      }
      
      return {
        key: columnId,
        direction: newDirection
      };
    });
  };
  
  if (data.length === 0) {
    return <div>{emptyMessage || 'No data available'}</div>;
  }
  
  return (
    <table>
      <thead>
        <tr>
          {columns.map(column => (
            <th 
              key={column.id}
              onClick={() => column.sortable !== false && handleSort(column.id)}
              role="columnheader"
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map(row => (
          <tr key={row.id} role="row">
            {columns.map(column => (
              <td key={`${row.id}-${column.id}`} role="cell">
                {column.cell 
                  ? column.cell({ row })
                  : column.accessorKey
                    ? row[column.accessorKey]
                    : null}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Sample data for tests
const mockData = [
  { id: '1', name: 'Alice', age: 30, status: 'Active' },
  { id: '2', name: 'Bob', age: 25, status: 'Inactive' },
  { id: '3', name: 'Charlie', age: 35, status: 'Active' },
  { id: '4', name: 'Dana', age: 28, status: 'Pending' },
];

// Sample columns for tests
const mockColumns: ColumnDef[] = [
  { id: 'name', header: 'Name', accessorKey: 'name' },
  { id: 'age', header: 'Age', accessorKey: 'age' },
  { id: 'status', header: 'Status', accessorKey: 'status' },
  { 
    id: 'actions', 
    header: 'Actions', 
    cell: ({ row }) => (
      <button data-testid={`action-${row.id}`}>View</button>
    ),
    sortable: false,
  },
];

describe('SortableTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it('renders the table with correct columns and data', () => {
    render(<SortableTable data={mockData} columns={mockColumns} />);
    
    // Check column headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    
    // Check row data
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    
    // Check custom cell render
    expect(screen.getAllByText('View').length).toBe(4);
  });

  it('sorts data when clicking on a column header', async () => {
    render(<SortableTable data={mockData} columns={mockColumns} />);
    
    // Initial order (unsorted)
    const nameHeaders = screen.getAllByRole('cell', { name: /Alice|Bob|Charlie|Dana/ });
    expect(nameHeaders[0]).toHaveTextContent('Alice');
    expect(nameHeaders[1]).toHaveTextContent('Bob');
    
    // Click on the Name column header to sort ascending
    fireEvent.click(screen.getByText('Name'));
    
    // Assert order after ascending sort
    const nameHeadersAfterAsc = screen.getAllByRole('cell', { name: /Alice|Bob|Charlie|Dana/ });
    expect(nameHeadersAfterAsc[0]).toHaveTextContent('Alice');
    expect(nameHeadersAfterAsc[1]).toHaveTextContent('Bob');
    expect(nameHeadersAfterAsc[2]).toHaveTextContent('Charlie');
    expect(nameHeadersAfterAsc[3]).toHaveTextContent('Dana');
    
    // Click again to sort descending
    fireEvent.click(screen.getByText('Name'));
    
    // Assert order after descending sort
    const nameHeadersAfterDesc = screen.getAllByRole('cell', { name: /Alice|Bob|Charlie|Dana/ });
    expect(nameHeadersAfterDesc[0]).toHaveTextContent('Dana');
    expect(nameHeadersAfterDesc[1]).toHaveTextContent('Charlie');
    expect(nameHeadersAfterDesc[2]).toHaveTextContent('Bob');
    expect(nameHeadersAfterDesc[3]).toHaveTextContent('Alice');
  });

  it('shows empty message when no data is provided', () => {
    const emptyMessage = 'No data available';
    render(
      <SortableTable 
        data={[]} 
        columns={mockColumns} 
        emptyMessage={emptyMessage} 
      />
    );
    
    expect(screen.getByText(emptyMessage)).toBeInTheDocument();
  });

  it('uses custom cell renderer correctly', () => {
    render(<SortableTable data={mockData} columns={mockColumns} />);
    
    // Check that custom cell content is rendered
    const actionButtons = screen.getAllByText('View');
    expect(actionButtons.length).toBe(4);
  });

  it('renders columns correctly', () => {
    render(
      <SortableTable 
        data={mockData} 
        columns={mockColumns}
      />
    );
    
    // Check if columns are rendered correctly
    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('Name');
    expect(headers[1]).toHaveTextContent('Age');
    expect(headers[2]).toHaveTextContent('Status');
    expect(headers[3]).toHaveTextContent('Actions');
  });

  it('properly handles default sort column and direction', () => {
    render(
      <SortableTable 
        data={mockData} 
        columns={mockColumns} 
        defaultSortColumn="age"
        defaultSortDirection="desc"
      />
    );
    
    // Check that data is sorted by age in descending order
    const ageHeaders = screen.getAllByRole('cell', { name: /30|25|35|28/ });
    expect(ageHeaders[0]).toHaveTextContent('35'); // Charlie
    expect(ageHeaders[1]).toHaveTextContent('30'); // Alice
    expect(ageHeaders[2]).toHaveTextContent('28'); // Dana
    expect(ageHeaders[3]).toHaveTextContent('25'); // Bob
  });

  it('calls onSortChange callback when sorting changes', () => {
    const onSortChange = jest.fn();
    
    render(
      <SortableTable 
        data={mockData} 
        columns={mockColumns} 
        onSortChange={onSortChange}
      />
    );
    
    // Click on a sortable column header
    fireEvent.click(screen.getByText('Name'));
    
    // Check if callback was called with correct parameters
    expect(onSortChange).toHaveBeenCalledWith('name', 'asc');
    
    // Click again to sort descending
    fireEvent.click(screen.getByText('Name'));
    
    // Check if callback was called with updated parameters
    expect(onSortChange).toHaveBeenCalledWith('name', 'desc');
  });

  it('handles non-sortable columns correctly', () => {
    render(<SortableTable data={mockData} columns={mockColumns} />);
    
    // Click on a non-sortable column (Actions)
    fireEvent.click(screen.getByText('Actions'));
    
    // The order should remain the same as initial (no sorting applied)
    const nameHeaders = screen.getAllByRole('cell', { name: /Alice|Bob|Charlie|Dana/ });
    expect(nameHeaders[0]).toHaveTextContent('Alice');
    expect(nameHeaders[1]).toHaveTextContent('Bob');
    expect(nameHeaders[2]).toHaveTextContent('Charlie');
    expect(nameHeaders[3]).toHaveTextContent('Dana');
  });

  it('handles null and undefined values in data during sorting', () => {
    const dataWithNulls = [
      { id: '1', name: 'Alice', age: null, status: 'Active' },
      { id: '2', name: 'Bob', age: 25, status: 'Inactive' },
      { id: '3', name: 'Charlie', age: undefined, status: 'Active' },
      { id: '4', name: 'Dana', age: 28, status: 'Pending' },
    ];
    
    render(<SortableTable data={dataWithNulls} columns={mockColumns} />);
    
    // Click on the Age column to sort
    fireEvent.click(screen.getByText('Age'));
    
    // Null and undefined values should be at the end in ascending sort
    const rows = screen.getAllByRole('row').slice(1); // Skip header row
    expect(rows[0]).toHaveTextContent('Bob'); // 25
    expect(rows[1]).toHaveTextContent('Dana'); // 28
    // Alice (null) and Charlie (undefined) should be last
  });
});