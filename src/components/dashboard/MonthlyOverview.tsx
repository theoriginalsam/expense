import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, useTheme, ProgressBar } from 'react-native-paper';
import { supabase } from '../../services/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';

type MonthlyStats = {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsPercentage: number;
};

export default function MonthlyOverview() {
  const [stats, setStats] = useState<MonthlyStats>({
    totalIncome: 0,
    totalExpenses: 0,
    savings: 0,
    savingsPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchMonthlyStats();
  }, []);

  const fetchMonthlyStats = async () => {
    try {
      const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');

      // Fetch total income
      const { data: incomeData, error: incomeError } = await supabase
        .from('earnings')
        .select('amount')
        .gte('date', startDate)
        .lte('date', endDate);

      if (incomeError) throw incomeError;

      // Fetch total expenses
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select('amount')
        .gte('date', startDate)
        .lte('date', endDate);

      if (expenseError) throw expenseError;

      const totalIncome = incomeData?.reduce((sum, item) => sum + item.amount, 0) || 0;
      const totalExpenses = expenseData?.reduce((sum, item) => sum + item.amount, 0) || 0;
      const savings = totalIncome - totalExpenses;
      const savingsPercentage = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

      setStats({
        totalIncome,
        totalExpenses,
        savings,
        savingsPercentage,
      });
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading monthly overview...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>Monthly Overview</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="titleMedium">Income</Text>
              <Text variant="headlineSmall" style={styles.income}>
                ${stats.totalIncome.toFixed(2)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="titleMedium">Expenses</Text>
              <Text variant="headlineSmall" style={styles.expense}>
                ${stats.totalExpenses.toFixed(2)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="titleMedium">Savings</Text>
              <Text 
                variant="headlineSmall" 
                style={[
                  styles.savings,
                  { color: stats.savings >= 0 ? theme.colors.primary : theme.colors.error }
                ]}>
                ${stats.savings.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <Text variant="bodyMedium">Savings Rate</Text>
            <ProgressBar
              progress={stats.savingsPercentage / 100}
              color={stats.savings >= 0 ? theme.colors.primary : theme.colors.error}
              style={styles.progressBar}
            />
            <Text variant="bodySmall" style={styles.percentage}>
              {stats.savingsPercentage.toFixed(1)}%
            </Text>
          </View>
        </Card.Content>
      </Card>
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
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  income: {
    color: '#4CAF50', // Green
  },
  expense: {
    color: '#F44336', // Red
  },
  savings: {
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  percentage: {
    textAlign: 'center',
    marginTop: 4,
  },
}); 