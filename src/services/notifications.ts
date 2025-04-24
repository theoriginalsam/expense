import { supabase } from './supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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

export const checkBudgetWarnings = async () => {
  try {
    const now = new Date();
    const startDate = format(startOfMonth(now), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(now), 'yyyy-MM-dd');

    // Get all active budgets
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select(`
        *,
        category:categories(name)
      `)
      .eq('notifications_enabled', true)
      .gte('month', startDate)
      .lte('month', endDate);

    if (budgetError) throw budgetError;

    // Check each budget
    for (const budget of budgets || []) {
      // Get total expenses for this category in the current month
      const { data: expenses, error: expenseError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('category_id', budget.category_id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (expenseError) throw expenseError;

      const totalSpent = expenses?.reduce((sum, item) => sum + item.amount, 0) || 0;
      const percentage = (totalSpent / budget.limit_amount) * 100;

      // Create notifications for different thresholds
      if (percentage >= 90 && percentage < 100) {
        await createNotification({
          title: 'Budget Warning',
          message: `You've used ${percentage.toFixed(1)}% of your ${budget.category?.name} budget`,
          type: 'budget',
          related_id: budget.id,
          related_type: 'budget',
          metadata: {
            budget_id: budget.id,
            category_name: budget.category?.name,
            limit_amount: budget.limit_amount,
            spent_amount: totalSpent,
            percentage,
          },
        });
      } else if (percentage >= 100) {
        await createNotification({
          title: 'Budget Exceeded',
          message: `You've exceeded your ${budget.category?.name} budget by ${(percentage - 100).toFixed(1)}%`,
          type: 'budget',
          related_id: budget.id,
          related_type: 'budget',
          metadata: {
            budget_id: budget.id,
            category_name: budget.category?.name,
            limit_amount: budget.limit_amount,
            spent_amount: totalSpent,
            percentage,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error checking budget warnings:', error);
  }
};

export const createNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        ...notification,
        read: false,
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const getNotifications = async () => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request notification permissions
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      showBadge: true,
    });
  }
  
  return true;
}

// Check if expense exceeds budget and send notification
export async function checkBudgetAndNotify(expenseAmount: number, budgetAmount: number) {
  if (expenseAmount > budgetAmount) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Budget Alert!',
        body: `You've exceeded your budget by $${(expenseAmount - budgetAmount).toFixed(2)}`,
        data: { type: 'budget_alert' },
        priority: 'high',
      },
      trigger: null, // Show immediately
    });
  }
}

// Send reminder notification
export async function sendReminderNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Expense Reminder',
      body: 'Don\'t forget to log your expenses today!',
      data: { type: 'reminder' },
      priority: 'high',
    },
    trigger: {
      hour: 20, // 8 PM
      minute: 0,
      repeats: true,
    },
  });
} 