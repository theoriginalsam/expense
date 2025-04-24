import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, ProgressBar, useTheme } from 'react-native-paper';
import { supabase } from '../../services/supabase';
import { Budget } from '../../types/schema';

export default function BudgetList() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('month', { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (budget: Budget) => {
    // TODO: Calculate actual spending from expenses table
    const spent = 0; // Placeholder
    return Math.min(spent / budget.limit_amount, 1);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading budgets...</Text>
      </View>
    );
  }

  if (budgets.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No budgets set for this month</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {budgets.map((budget) => {
        const progress = calculateProgress(budget);
        const isOverBudget = progress >= 1;

        return (
          <Card key={budget.id} style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <Text variant="titleMedium">{budget.category}</Text>
                <Text variant="titleMedium">
                  ${budget.limit_amount.toFixed(2)}
                </Text>
              </View>
              <ProgressBar
                progress={progress}
                color={isOverBudget ? theme.colors.error : theme.colors.primary}
                style={styles.progressBar}
              />
              <View style={styles.footer}>
                <Text variant="bodySmall">
                  Spent: ${(budget.limit_amount * progress).toFixed(2)}
                </Text>
                <Text variant="bodySmall">
                  Remaining: ${(budget.limit_amount * (1 - progress)).toFixed(2)}
                </Text>
              </View>
            </Card.Content>
          </Card>
        );
      })}
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
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
}); 