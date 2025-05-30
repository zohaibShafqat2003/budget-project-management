import { useState, useCallback, useEffect } from 'react';
import { projectsApi, Project } from '../lib/api';

interface UseProjectsOptions {
  initialFilters?: Record<string, any>;
  autoFetch?: boolean;
}

export function useProjects(options: UseProjectsOptions = {}) {
  const { initialFilters = {}, autoFetch = true } = options;
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState(initialFilters);

  // Fetch projects based on current filters
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await projectsApi.getAll(filters);
      setProjects(data);
      return data;
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Create a new project
  const createProject = useCallback(async (projectData: Partial<Project>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newProject = await projectsApi.create(projectData);
      
      // Update local state with the new project
      setProjects(prevProjects => [...prevProjects, newProject]);
      
      return newProject;
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err : new Error('Failed to create project'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing project
  const updateProject = useCallback(async (projectId: string, projectData: Partial<Project>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await projectsApi.update(projectId, projectData);
      
      // Update local state with the updated project
      setProjects(prevProjects => 
        prevProjects.map(project => project.id === projectId ? updatedProject : project)
      );
      
      return updatedProject;
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err instanceof Error ? err : new Error('Failed to update project'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a project
  const deleteProject = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await projectsApi.delete(projectId);
      
      // Remove the deleted project from local state
      setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
      
      return true;
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete project'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add team members to a project
  const addTeamMembers = useCallback(async (projectId: string, userIds: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      await projectsApi.addMembers(projectId, userIds);
      
      // Refetch the project to get updated members
      const updatedProject = await projectsApi.getById(projectId);
      
      // Update the project in local state
      setProjects(prevProjects => 
        prevProjects.map(project => project.id === projectId ? updatedProject : project)
      );
      
      return updatedProject;
    } catch (err) {
      console.error('Error adding team members:', err);
      setError(err instanceof Error ? err : new Error('Failed to add team members'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove team members from a project
  const removeTeamMembers = useCallback(async (projectId: string, userIds: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      await projectsApi.removeMembers(projectId, userIds);
      
      // Refetch the project to get updated members
      const updatedProject = await projectsApi.getById(projectId);
      
      // Update the project in local state
      setProjects(prevProjects => 
        prevProjects.map(project => project.id === projectId ? updatedProject : project)
      );
      
      return updatedProject;
    } catch (err) {
      console.error('Error removing team members:', err);
      setError(err instanceof Error ? err : new Error('Failed to remove team members'));
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

  // Fetch projects on mount if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      fetchProjects();
    }
  }, [fetchProjects, autoFetch]);

  return {
    projects,
    loading,
    error,
    filters,
    updateFilters,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    addTeamMembers,
    removeTeamMembers
  };
} 