import { useState, useCallback, useEffect } from 'react';
import { tasksApi, Task } from '../lib/api';

interface UseTasksOptions {
  projectId?: string;
  initialFilters?: Record<string, any>;
  autoFetch?: boolean;
}

export function useTasks(options: UseTasksOptions = {}) {
  const { projectId, initialFilters = {}, autoFetch = true } = options;
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState(initialFilters);

  // Fetch tasks based on current filters
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data: Task[];
      
      if (projectId) {
        // If projectId is provided, get tasks for that project
        data = await tasksApi.getByProject(projectId, filters);
      } else {
        // Otherwise, get all tasks with filters
        data = await tasksApi.getAll(filters);
      }
      
      setTasks(data);
      return data;
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
      return [];
    } finally {
      setLoading(false);
    }
  }, [projectId, filters]);

  // Create a new task
  const createTask = useCallback(async (taskData: Partial<Task>) => {
    setLoading(true);
    setError(null);
    
    try {
      // If projectId is provided in options, add it to taskData
      const dataWithProject = projectId && !taskData.projectId 
        ? { ...taskData, projectId }
        : taskData;
        
      const newTask = await tasksApi.create(dataWithProject);
      
      // Update local state with the new task
      setTasks(prevTasks => [...prevTasks, newTask]);
      
      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err : new Error('Failed to create task'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Update an existing task
  const updateTask = useCallback(async (taskId: string, taskData: Partial<Task>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedTask = await tasksApi.update(taskId, taskData);
      
      // Update local state with the updated task
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === taskId ? updatedTask : task)
      );
      
      return updatedTask;
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err : new Error('Failed to update task'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update just the status of a task
  const updateTaskStatus = useCallback(async (taskId: string, status: Task['status']) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedTask = await tasksApi.updateStatus(taskId, status);
      
      // Update local state with the updated task
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === taskId ? updatedTask : task)
      );
      
      return updatedTask;
    } catch (err) {
      console.error('Error updating task status:', err);
      setError(err instanceof Error ? err : new Error('Failed to update task status'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a task
  const deleteTask = useCallback(async (taskId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await tasksApi.delete(taskId);
      
      // Remove the deleted task from local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      return true;
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete task'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters and refetch
  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  // Fetch tasks on mount if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      fetchTasks();
    }
  }, [fetchTasks, autoFetch]);

  return {
    tasks,
    loading,
    error,
    filters,
    updateFilters,
    fetchTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
  };
} 