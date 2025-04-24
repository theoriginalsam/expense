import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { supabase } from '../../services/supabase';
import { Earning, Category } from '../../types/schema';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';

type EarningWithCategory = Earning & {
  category: Category;
};

export type EarningsListRef = {
  refresh: () => Promise<void>;
};

type ViewType = 'all' | 'daily' | 'weekly' | 'monthly';

type EarningsListProps = {
  viewType: ViewType;
  selectedDate: Date;
  selectedCategories?: string[];
};

const EarningsList = forwardRef<EarningsListRef, EarningsListProps>(({ viewType, selectedDate, selectedCategories }, ref) => {
  const [earnings, setEarnings] = useState<EarningWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('earnings')
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

      setEarnings(data || []);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [viewType, selectedDate, selectedCategories]);

  useImperativeHandle(ref, () => ({
    refresh: fetchEarnings,
  }));

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading earnings...</Text>
      </View>
    );
  }

  if (earnings.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No earnings recorded{viewType !== 'all' ? ' for this period' : ''}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {earnings.map((earning) => (
        <Card key={earning.id} style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Text variant="titleMedium">{earning.category?.name || 'Uncategorized'}</Text>
              <Text variant="titleMedium" style={styles.amount}>
                ${earning.amount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.details}>
              <Text variant="bodySmall">
                Date: {format(parseISO(earning.date), 'MMM d, yyyy')}
              </Text>
              {earning.notes && (
                <Text variant="bodySmall" style={styles.notes}>
                  {earning.notes}
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>
      ))}
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
    marginBottom: 8,
  },
  amount: {
    color: '#4CAF50', // Green color for earnings
  },
  details: {
    gap: 4,
  },
  notes: {
    fontStyle: 'italic',
  },
});

export default EarningsList; 