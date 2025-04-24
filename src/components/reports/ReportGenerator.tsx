import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { generateMonthlyReport, generateCSVReport, shareReport } from '../../services/reports';
import { format } from 'date-fns';

type ReportType = 'expenses' | 'earnings' | 'all';

export function ReportGenerator() {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const generateReport = async (type: ReportType, format: 'pdf' | 'csv') => {
    try {
      setIsGenerating(true);
      setError(null);

      const filePath = format === 'pdf'
        ? await generateMonthlyReport(type, selectedDate)
        : await generateCSVReport(type, selectedDate);

      await shareReport(filePath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generate Monthly Report</Text>
      
      <Button
        mode="outlined"
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
      >
        {format(selectedDate, 'MMMM yyyy')}
      </Button>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => generateReport('all', 'pdf')}
          loading={isGenerating}
          disabled={isGenerating}
          style={styles.button}
        >
          Generate PDF Report
        </Button>

        <Button
          mode="contained"
          onPress={() => generateReport('all', 'csv')}
          loading={isGenerating}
          disabled={isGenerating}
          style={styles.button}
        >
          Generate CSV Report
        </Button>
      </View>

      {error && (
        <Text style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dateButton: {
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 8,
  },
  button: {
    marginBottom: 8,
  },
  error: {
    marginTop: 8,
  },
}); 