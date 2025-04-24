export type Category = {
  id: string;
  name: string;
  type: 'expense' | 'earning';
  icon: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
  is_default: boolean;
};

export type Expense = {
  id: string;
  amount: number;
  category_id: string;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  tags: string[];
  receipt_url: string | null;
  is_recurring: boolean;
  recurrence_pattern: RecurrencePattern | null;
};

export type Earning = {
  id: string;
  amount: number;
  source: string;
  category_id: string;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  is_recurring: boolean;
  recurrence_pattern: RecurrencePattern | null;
};

export interface Budget {
  id: string;
  category: string;
  limit_amount: number;
  month: string;
  created_at: string;
  updated_at: string;
  rollover_amount: number;
  notifications_enabled: boolean;
}

export type Task = {
  id: string;
  task_description: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
  priority: 'low' | 'medium' | 'high';
  category_id: string | null;
  reminder_time: string | null;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'budget' | 'task' | 'system';
  created_at: string;
  read: boolean;
  action_url: string | null;
  metadata: Record<string, any> | null;
  related_id: string | null;
  related_type: 'expense' | 'task' | 'budget' | 'earning' | null;
};

export type RecurrencePattern = {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  end_date?: string;
  days_of_week?: number[];
  day_of_month?: number;
  month_of_year?: number;
}; 