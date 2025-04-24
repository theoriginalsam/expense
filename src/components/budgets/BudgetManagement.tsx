import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, useTheme, ProgressBar, Button, Portal, Dialog } from 'react-native-paper';
import { supabase } from '../../services/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Budget, Category } from '../../types/schema';
import AddBudgetForm from './AddBudgetForm';

type BudgetWithProgress = Budget & {
  spent: number;
  progress: number;
  category: Category;
};

export default function BudgetManagement() {
  const [budgets, setBudgets] = useState<BudgetWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');

      // Fetch budgets with category information
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select(`
          *,
          category:categories(name, color)
        `)
        .gte('month', startDate)
        .lte('month', endDate);

      if (budgetError) throw budgetError;

      // Fetch expenses for each budget's category
      const budgetsWithProgress = await Promise.all(
        budgetData.map(async (budget) => {
          const { data: expenseData, error: expenseError } = await supabase
            .from('expenses')
            .select('amount')
            .eq('category_id', budget.category_id)
            .gte('date', startDate)
            .lte('date', endDate);

          if (expenseError) throw expenseError;

          const spent = expenseData?.reduce((sum, item) => sum + item.amount, 0) || 0;
          const progress = Math.min(spent / budget.limit_amount, 1);

          return {
            ...budget,
            spent,
            progress,
          };
        })
      );

      setBudgets(budgetsWithProgress);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudgetSuccess = () => {
    setShowAddBudget(false);
    fetchBudgets();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading budgets...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleLarge">Budget Management</Text>
            <Button
              mode="contained"
              onPress={() => setShowAddBudget(true)}
              style={styles.addButton}>
              Add Budget
            </Button>
          </View>

          {budgets.length === 0 ? (
            <Text style={styles.emptyText}>No budgets set for this month</Text>
          ) : (
            budgets.map((budget) => (
              <View key={budget.id} style={styles.budgetItem}>
                <View style={styles.budgetHeader}>
                  <Text variant="titleMedium">{budget.category?.name || 'Uncategorized'}</Text>
                  <Text variant="titleMedium">
                    ${budget.spent.toFixed(2)} / ${budget.limit_amount.toFixed(2)}
                  </Text>
                </View>
                <ProgressBar
                  progress={budget.progress}
                  color={budget.progress >= 1 ? theme.colors.error : theme.colors.primary}
                  style={styles.progressBar}
                />
                {budget.progress >= 1 && (
                  <Text style={[styles.alertText, { color: theme.colors.error }]}>
                    Budget exceeded!
                  </Text>
                )}
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      <Portal>
        <Dialog
          visible={showAddBudget}
          onDismiss={() => setShowAddBudget(false)}
          style={styles.dialog}>
          <Dialog.Title>Add New Budget</Dialog.Title>
          <Dialog.Content>
            <AddBudgetForm
              onSuccess={handleAddBudgetSuccess}
              onDismiss={() => setShowAddBudget(false)}
              loading={formLoading}
              error={formError}
            />
          </Dialog.Content>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

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
    marginBottom: 16,
  },
  addButton: {
    borderRadius: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 16,
  },
  budgetItem: {
    marginBottom: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  alertText: {
    marginTop: 4,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  dialog: {
    borderRadius: 12,
  },
}); 