/**
 * Unit tests for TaskCreate endpoint
 */

import { TaskCreate } from './taskCreate';

// Mock the OpenAPIRoute methods
jest.mock('chanfana', () => {
  return {
    OpenAPIRoute: class MockOpenAPIRoute {
      async getValidatedData() {
        return this._mockData || {};
      }
      
      setMockData(data: any) {
        this._mockData = data;
      }
    },
    Bool: () => jest.fn().mockReturnValue(true),
  };
});

describe('TaskCreate Endpoint', () => {
  let taskCreate: TaskCreate;
  
  beforeEach(() => {
    taskCreate = new TaskCreate();
    jest.clearAllMocks();
  });
  
  it('should correctly define the API schema', () => {
    expect(taskCreate.schema).toBeDefined();
    expect(taskCreate.schema.tags).toContain('Tasks');
    expect(taskCreate.schema.summary).toBe('Create a new Task');
    expect(taskCreate.schema.request.body.content['application/json']).toBeDefined();
    expect(taskCreate.schema.responses['200']).toBeDefined();
  });
  
  it('should create a task with all provided fields', async () => {
    // Mock the validated data
    const mockTask = {
      name: 'Test Task',
      slug: 'test-task',
      description: 'This is a test task',
      completed: false,
      due_date: '2025-03-15T12:00:00Z',
    };
    
    // Set the mock data for getValidatedData
    (taskCreate as any).setMockData({
      body: mockTask,
    });
    
    // Call the handle method with a mock context
    const result = await taskCreate.handle({} as any);
    
    // Verify the result
    expect(result).toEqual({
      success: true,
      task: mockTask,
    });
  });
  
  it('should create a task with minimal required fields', async () => {
    // Mock the validated data with only required fields
    const mockTask = {
      name: 'Minimal Task',
      slug: 'minimal-task',
      due_date: '2025-03-15T12:00:00Z',
    };
    
    // Set the mock data for getValidatedData
    (taskCreate as any).setMockData({
      body: mockTask,
    });
    
    // Call the handle method with a mock context
    const result = await taskCreate.handle({} as any);
    
    // Verify the result has default values for missing fields
    expect(result).toEqual({
      success: true,
      task: {
        name: 'Minimal Task',
        slug: 'minimal-task',
        due_date: '2025-03-15T12:00:00Z',
        description: undefined,
        completed: undefined,
      },
    });
  });
  
  it('should handle task with optional fields marked as undefined', async () => {
    // Mock the validated data with explicit undefined values
    const mockTask = {
      name: 'Optional Fields Task',
      slug: 'optional-fields-task',
      description: undefined,
      completed: undefined,
      due_date: '2025-03-15T12:00:00Z',
    };
    
    // Set the mock data for getValidatedData
    (taskCreate as any).setMockData({
      body: mockTask,
    });
    
    // Call the handle method with a mock context
    const result = await taskCreate.handle({} as any);
    
    // Verify the result
    expect(result).toEqual({
      success: true,
      task: mockTask,
    });
  });
});