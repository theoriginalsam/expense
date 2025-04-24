import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { supabase } from '../../services/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { PieChart } from 'react-native-chart-kit';

type CategoryExpense = {
  category: string;
  amount: number;
  color: string;
};

export default function CategoryBreakdown() {
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchCategoryExpenses();
  }, []);

  const fetchCategoryExpenses = async () => {
    try {
      const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          amount,
          category:categories(name, color)
        `)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      // Group expenses by category
      const categoryMap = new Map<string, CategoryExpense>();
      data?.forEach((expense) => {
        const categoryName = expense.category?.name || 'Uncategorized';
        const existing = categoryMap.get(categoryName);
        if (existing) {
          existing.amount += expense.amount;
        } else {
          categoryMap.set(categoryName, {
            category: categoryName,
            amount: expense.amount,
            color: expense.category?.color || '#757575',
          });
        }
      });

      setCategoryExpenses(Array.from(categoryMap.values()));
    } catch (error) {
      console.error('Error fetching category expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading category breakdown...</Text>
      </View>
    );
  }

  if (categoryExpenses.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No expenses recorded for this month</Text>
      </View>
    );
  }

  const chartData = categoryExpenses.map((item) => ({
    name: item.category,
    amount: item.amount,
    color: item.color,
    legendFontColor: theme.colors.onSurface,
    legendFontSize: 12,
  }));

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>Category Breakdown</Text>
          
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData}
              width={Dimensions.get('window').width - 64}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>

          <View style={styles.legendContainer}>
            {categoryExpenses.map((item) => (
              <View key={item.category} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text variant="bodyMedium" style={styles.legendText}>
                  {item.category}: ${item.amount.toFixed(2)}
                </Text>
              </View>
            ))}
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
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  legendContainer: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
  },
}); 