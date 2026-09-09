import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase env vars. Create a .env file with:\n' +
    'VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=your-anon-key'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper: upload a file to the entry-files bucket
export async function uploadFile(file, entryId) {
  const ext = file.name.split('.').pop()
  const path = `${entryId}/${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from('entry-files')
    .upload(path, file)

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('entry-files')
    .getPublicUrl(path)

  return {
    file_name: file.name,
    file_url: urlData.publicUrl,
    file_type: file.type,
    storage_path: path,
  }
}

// Helper: delete a file from storage
export async function deleteFile(storagePath) {
  const { error } = await supabase.storage
    .from('entry-files')
    .remove([storagePath])
  if (error) throw error
}
