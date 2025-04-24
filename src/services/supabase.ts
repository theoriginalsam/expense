import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { ENV } from '../../config/env';

export const supabase = createClient<Database>(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY
);

// Expenses
export const getExpenses = async () => {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      categories (
        name,
        icon,
        color
      )
    `)
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
};

// Categories
export const getCategories = async (type?: 'expense' | 'earning') => {
  let query = supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Earnings
export const getEarnings = async () => {
  const { data, error } = await supabase
    .from('earnings')
    .select(`
      *,
      categories (
        name,
        icon,
        color
      )
    `)
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
};

// Budgets
export const getBudgets = async (month: string) => {
  const { data, error } = await supabase
    .from('budgets')
    .select(`
      *,
      categories (
        name,
        icon,
        color
      )
    `)
    .eq('month', month);

  if (error) throw error;
  return data;
};

// Tasks
export const getTasks = async (completed?: boolean) => {
  let query = supabase
    .from('tasks')
    .select(`
      *,
      categories (
        name,
        icon,
        color
      )
    `)
    .order('due_date', { ascending: true });

  if (completed !== undefined) {
    query = query.eq('completed', completed);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Notifications
export const getNotifications = async (read?: boolean) => {
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (read !== undefined) {
    query = query.eq('read', read);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}; 