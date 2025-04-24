import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { format } from 'date-fns';

type Transaction = {
  id: string;
  amount: number;
  date: string;
  type: 'expense' | 'earning';
  category: {
    name: string;
    color: string;
  };
};

type TransactionCalendarProps = {
  transactions: Transaction[];
  onDayPress: (date: string) => void;
  loading?: boolean;
};

export default function TransactionCalendar({ 
  transactions, 
  onDayPress,
  loading = false 
}: TransactionCalendarProps) {
  const theme = useTheme();

  // Create marked dates object for the calendar
  const markedDates = transactions.reduce((acc, transaction) => {
    const date = format(new Date(transaction.date), 'yyyy-MM-dd');
    const existing = acc[date] || { dots: [] };
    
    return {
      ...acc,
      [date]: {
        ...existing,
        dots: [
          ...existing.dots,
          {
            color: transaction.type === 'expense' ? theme.colors.error : theme.colors.primary,
            key: transaction.id,
          },
        ],
      },
    };
  }, {} as Record<string, { dots: Array<{ color: string; key: string }> }>);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day: DateData) => onDayPress(day.dateString)}
        markedDates={markedDates}
        markingType="multi-dot"
        theme={{
          calendarBackground: theme.colors.surface,
          textSectionTitleColor: theme.colors.onSurface,
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: theme.colors.surface,
          todayTextColor: theme.colors.primary,
          dayTextColor: theme.colors.onSurface,
          textDisabledColor: theme.colors.onSurfaceDisabled,
          dotColor: theme.colors.primary,
          selectedDotColor: theme.colors.surface,
          arrowColor: theme.colors.primary,
          monthTextColor: theme.colors.onSurface,
          indicatorColor: theme.colors.primary,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    minHeight: 350, // Ensure consistent height
    justifyContent: 'center',
  },
}); 