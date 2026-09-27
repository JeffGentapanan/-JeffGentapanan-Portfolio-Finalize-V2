import { requireSupabase } from './supabase';

// Projects use * so existing content still loads before the optional-field migration.
const columns = {
  projects: '*',
  skills: 'id,title,items,position',
};

export async function loadContent(table) {
  const { data, error } = await requireSupabase()
    .from(table)
    .select(columns[table])
    .order('position')
    .order('id');
  if (error) throw error;
  return data;
}

export async function saveContentRow(table, row, exists) {
  const client = requireSupabase();
  const query = exists
    ? client.from(table).update(row).eq('id', row.id)
    : client.from(table).insert(row);
  const { data, error } = await query.select(columns[table]).single();
  if (error) throw error;
  return data;
}

export async function deleteContentRow(table, id) {
  const { data, error } = await requireSupabase()
    .from(table)
    .delete()
    .eq('id', id)
    .select('id')
    .single();
  if (error) throw error;
  return data;
}
