import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const fetchData = async (table: string, select: string) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`获取 ${table} 数据失败:`, error);
    // 这里可以使用 Toast 组件提示错误
    return [];
  }
};
