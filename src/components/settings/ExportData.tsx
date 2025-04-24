import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, useTheme, Portal, Dialog, List } from 'react-native-paper';
import { format } from 'date-fns';
import { generateMonthlyReport, generateCSVReport, shareReport } from '../../services/reports';

export function ExportData() {
  const theme = useTheme();
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      setIsExporting(true);
      setError(null);

      const filePath = format === 'pdf'
        ? await generateMonthlyReport('all', new Date())
        : await generateCSVReport('all', new Date());

      await shareReport(filePath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
    } finally {
      setIsExporting(false);
      setIsDialogVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={() => setIsDialogVisible(true)}
        loading={isExporting}
        disabled={isExporting}
      >
        Export Data
      </Button>

      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
          <Dialog.Title>Export Data</Dialog.Title>
          <Dialog.Content>
            <Text>Choose export format:</Text>
            <List.Item
              title="PDF Report"
              description="Generate a detailed PDF report"
              left={props => <List.Icon {...props} icon="file-pdf-box" />}
              onPress={() => handleExport('pdf')}
            />
            <List.Item
              title="CSV Export"
              description="Export data in CSV format"
              left={props => <List.Icon {...props} icon="file-excel" />}
              onPress={() => handleExport('csv')}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  error: {
    marginTop: 8,
  },
}); 