import React, { useState, useCallback } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { Button, TextInput, HelperText, Portal, Dialog, useTheme } from 'react-native-paper';
import { format } from 'date-fns';
import { supabase } from '../../services/supabase';
import { Budget } from '../../types/schema';
import CategoryPicker from '../common/CategoryPicker';
import DatePicker from '../common/DatePicker';

type QuickAddBudgetProps = {
  onSuccess?: () => void;
  onDismiss?: () => void;
  visible: boolean;
};

export default function QuickAddBudget({ onSuccess, onDismiss, visible }: QuickAddBudgetProps) {
  const [limitAmount, setLimitAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [month, setMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  const handleSubmit = useCallback(async () => {
    if (!limitAmount || !categoryId) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const budgetData: Omit<Budget, 'id' | 'created_at' | 'updated_at'> = {
        category: categoryId,
        limit_amount: parseFloat(limitAmount),
        month: format(month, 'yyyy-MM-dd'),
        rollover_amount: 0,
        notifications_enabled: true,
      };

      const { error: supabaseError } = await supabase
        .from('budgets')
        .insert([budgetData]);

      if (supabaseError) throw supabaseError;

      setLimitAmount('');
      setCategoryId(null);
      setMonth(new Date());
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [limitAmount, categoryId, month, onSuccess]);

  return (
    <Portal>
      <Dialog 
        visible={visible} 
        onDismiss={onDismiss} 
        style={styles.dialog}
        theme={{
          colors: {
            surface: theme.colors.surface,
          },
        }}>
        <Dialog.Title style={styles.title}>Add New Budget</Dialog.Title>
        <Dialog.Content>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView>
                <View style={styles.container}>
                  <TextInput
                    label="Budget Limit"
                    value={limitAmount}
                    onChangeText={setLimitAmount}
                    keyboardType="decimal-pad"
                    style={styles.input}
                    returnKeyType="next"
                    mode="outlined"
                    left={<TextInput.Affix text="$" />}
                    placeholder="0.00"
                  />

                  <CategoryPicker
                    type="expense"
                    value={categoryId}
                    onChange={setCategoryId}
                    style={styles.input}
                  />

                  <DatePicker
                    label="Month"
                    value={month}
                    onChange={setMonth}
                    style={styles.input}
                  />

                  {error && (
                    <HelperText type="error" visible={!!error} style={styles.error}>
                      {error}
                    </HelperText>
                  )}
                </View>
              </ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          <Button 
            onPress={onDismiss}
            style={styles.button}
            textColor={theme.colors.primary}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={[styles.button, styles.submitButton]}>
            Add Budget
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  container: {
    gap: 16,
    paddingVertical: 8,
  },
  input: {
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  error: {
    marginTop: 8,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  button: {
    minWidth: 100,
    borderRadius: 8,
  },
  submitButton: {
    minWidth: 120,
  },
}); 