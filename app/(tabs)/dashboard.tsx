import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MonthlyOverview from '../../src/components/dashboard/MonthlyOverview';
import CategoryBreakdown from '../../src/components/dashboard/CategoryBreakdown';
import BudgetManagement from '../../src/components/budgets/BudgetManagement';

export default function DashboardScreen() {
  const theme = useTheme();

  return (
    <ScrollView style={styles.container}>
      <MonthlyOverview />
      <CategoryBreakdown />
      <BudgetManagement />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
}); 