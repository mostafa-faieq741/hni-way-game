/**
 * projects.js (storage selector)
 * Chooses the storage adapter at runtime:
 *   - Supabase  when SUPABASE_URL + SUPABASE_SERVICE_KEY are set (production)
 *   - local JSON file otherwise (development)
 * The rest of the backend imports ONLY this module.
 */

const useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
const adapter = useSupabase
  ? await import('./projectsSupabase.js')
  : await import('./projectsJson.js')

export const STORAGE_BACKEND = useSupabase ? 'supabase' : 'json'
export const { listProjects, getProject, createProject, updateProject, deleteProject } = adapter
export { VALID_TEAM_IDS } from './projectsValidate.js'
