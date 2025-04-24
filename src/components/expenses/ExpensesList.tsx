import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, useTheme, IconButton } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import { supabase } from '../../services/supabase';
import { Expense, Category } from '../../types/schema';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import EditExpense from './EditExpense';
import DuplicateExpense from './DuplicateExpense';

type ExpenseWithCategory = Expense & {
  category: Category;
};

export type ExpensesListRef = {
  refresh: () => Promise<void>;
};

type ViewType = 'all' | 'daily' | 'weekly' | 'monthly';

type ExpensesListProps = {
  viewType: ViewType;
  selectedDate: Date;
  selectedCategories?: string[];
};

const ExpensesList = forwardRef<ExpensesListRef, ExpensesListProps>(({ viewType, selectedDate, selectedCategories }, ref) => {
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithCategory | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const theme = useTheme();

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('expenses')
        .select(`
          *,
          category:categories(name, color)
        `)
        .order('date', { ascending: false });

      // Apply category filters if any are selected
      if (selectedCategories && selectedCategories.length > 0) {
        query = query.in('category_id', selectedCategories);
      }

      // Apply date range based on view type
      if (viewType !== 'all') {
        let startDate, endDate;

        switch (viewType) {
          case 'daily':
            startDate = startOfDay(selectedDate);
            endDate = endOfDay(selectedDate);
            break;
          case 'weekly':
            startDate = startOfWeek(selectedDate);
            endDate = endOfWeek(selectedDate);
            break;
          case 'monthly':
            startDate = startOfMonth(selectedDate);
            endDate = endOfMonth(selectedDate);
            break;
        }

        query = query
          .gte('date', format(startDate, 'yyyy-MM-dd'))
          .lte('date', format(endDate, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;

      if (error) throw error;

      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [viewType, selectedDate, selectedCategories]);

  useImperativeHandle(ref, () => ({
    refresh: fetchExpenses,
  }));

  const handleEdit = (expense: ExpenseWithCategory) => {
    setSelectedExpense(expense);
    setShowEditDialog(true);
  };

  const handleDelete = async (expense: ExpenseWithCategory) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expense.id);

      if (error) throw error;
      await fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleDuplicate = (expense: ExpenseWithCategory) => {
    setSelectedExpense(expense);
    setShowDuplicateDialog(true);
  };

  const renderRightActions = (expense: ExpenseWithCategory) => {
    return (
      <View style={styles.rightActions}>
        <View style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}>
          <IconButton
            icon="pencil"
            iconColor="white"
            size={24}
            onPress={() => handleEdit(expense)}
          />
        </View>
        <View style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}>
          <IconButton
            icon="content-copy"
            iconColor="white"
            size={24}
            onPress={() => handleDuplicate(expense)}
          />
        </View>
        <View style={[styles.actionButton, { backgroundColor: theme.colors.error }]}>
          <IconButton
            icon="delete"
            iconColor="white"
            size={24}
            onPress={() => handleDelete(expense)}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading expenses...</Text>
      </View>
    );
  }

  if (expenses.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No expenses recorded{viewType !== 'all' ? ' for this period' : ''}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {expenses.map((expense) => (
        <Swipeable
          key={expense.id}
          renderRightActions={() => renderRightActions(expense)}
          overshootRight={false}
        >
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <Text variant="titleMedium">{expense.category?.name || 'Uncategorized'}</Text>
                <Text variant="titleMedium" style={styles.amount}>
                  ${expense.amount.toFixed(2)}
                </Text>
              </View>
              <View style={styles.details}>
                <Text variant="bodySmall">
                  Date: {format(parseISO(expense.date), 'MMM d, yyyy')}
                </Text>
                {expense.notes && (
                  <Text variant="bodySmall" style={styles.notes}>
                    {expense.notes}
                  </Text>
                )}
              </View>
            </Card.Content>
          </Card>
        </Swipeable>
      ))}

      <EditExpense
        expense={selectedExpense}
        visible={showEditDialog}
        onDismiss={() => {
          setShowEditDialog(false);
          setSelectedExpense(null);
        }}
        onSuccess={() => {
          setShowEditDialog(false);
          setSelectedExpense(null);
          fetchExpenses();
        }}
      />

      <DuplicateExpense
        expense={selectedExpense}
        visible={showDuplicateDialog}
        onDismiss={() => {
          setShowDuplicateDialog(false);
          setSelectedExpense(null);
        }}
        onSuccess={() => {
          setShowDuplicateDialog(false);
          setSelectedExpense(null);
          fetchExpenses();
        }}
      />
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    color: '#F44336', // Red color for expenses
  },
  details: {
    gap: 4,
  },
  notes: {
    fontStyle: 'italic',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    height: '100%',
  },
});

export default ExpensesList; 