import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, FAB, useTheme } from 'react-native-paper';
import QuickAddExpense from '../../src/components/expenses/QuickAddExpense';
import ExpensesList, { ExpensesListRef } from '../../src/components/expenses/ExpensesList';
import ViewOptions from '../../src/components/common/ViewOptions';
import TransactionCalendar from '../../src/components/common/TransactionCalendar';
import { supabase } from '../../src/services/supabase';
import { Category } from '../../src/types/schema';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';

type ViewType = 'all' | 'daily' | 'weekly' | 'monthly';

export default function ExpensesScreen() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [viewType, setViewType] = useState<ViewType>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const expensesListRef = useRef<ExpensesListRef>(null);
  const theme = useTheme();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [viewType, selectedCategories, selectedDate]);

  const fetchCategories = async () => {
    try {
      const data = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'expense')
        .order('name');
      
      if (data.error) throw data.error;
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getDateRangeText = () => {
    if (viewType === 'all') return 'All Expenses';

    let startDate, endDate;

    switch (viewType) {
      case 'daily':
        startDate = endDate = selectedDate;
        return format(startDate, 'MMMM d, yyyy');
      case 'weekly':
        startDate = startOfWeek(selectedDate);
        endDate = endOfWeek(selectedDate);
        return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
      case 'monthly':
        startDate = startOfMonth(selectedDate);
        endDate = endOfMonth(selectedDate);
        return format(startDate, 'MMMM yyyy');
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('expenses')
        .select(`
          id,
          amount,
          date,
          category:categories (
            name,
            color
          )
        `)
        .order('date', { ascending: false });

      // Apply category filters if any are selected
      if (selectedCategories.length > 0) {
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

      // Transform data for calendar
      const transformedData = data?.map(item => ({
        id: item.id,
        amount: item.amount,
        date: item.date,
        type: 'expense' as const,
        category: {
          name: item.category?.name || 'Uncategorized',
          color: item.category?.color || '#757575',
        },
      })) || [];

      setTransactions(transformedData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpenseSuccess = useCallback(() => {
    setShowAddExpense(false);
    expensesListRef.current?.refresh();
    fetchTransactions();
  }, []);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const handleDayPress = useCallback((date: string) => {
    try {
      const parsedDate = parseISO(date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date');
      }
      setSelectedDate(parsedDate);
      setShowCalendar(false);
    } catch (error) {
      console.error('Error parsing date:', error);
    }
  }, []);

  const handleViewTypeChange = useCallback((type: ViewType) => {
    setViewType(type);
    setShowCalendar(false);
  }, []);

  // Transform categories for ViewOptions component
  const transformedCategories = categories.map(category => ({
    id: category.id,
    name: category.name,
    color: category.color || '#757575', // Default color if null
  }));

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Expenses
        </Text>

        <ViewOptions
          viewType={viewType}
          onViewTypeChange={handleViewTypeChange}
          filterType="expense"
          onFilterTypeChange={() => {}}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          categories={transformedCategories}
          showCalendar={showCalendar}
          onToggleCalendar={() => setShowCalendar(prev => !prev)}
        />

        <Text variant="titleMedium" style={styles.dateRange}>
          {getDateRangeText()}
        </Text>

        {showCalendar && viewType !== 'all' && (
          <TransactionCalendar
            transactions={transactions}
            onDayPress={handleDayPress}
            loading={loading}
          />
        )}

        <ExpensesList 
          ref={expensesListRef}
          viewType={viewType}
          selectedDate={selectedDate}
          selectedCategories={selectedCategories}
        />
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowAddExpense(true)}
      />

      <QuickAddExpense
        visible={showAddExpense}
        onDismiss={() => setShowAddExpense(false)}
        onSuccess={handleAddExpenseSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    padding: 16,
  },
  dateRange: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 