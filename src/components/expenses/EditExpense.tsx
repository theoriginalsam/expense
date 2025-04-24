import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { Button, TextInput, HelperText, Portal, Dialog, useTheme, Text } from 'react-native-paper';
import { format } from 'date-fns';
import { supabase } from '../../services/supabase';
import { Expense } from '../../types/schema';
import CategoryPicker from '../common/CategoryPicker';
import DatePicker from '../common/DatePicker';

type EditExpenseProps = {
  expense: Expense | null;
  onSuccess?: () => void;
  onDismiss?: () => void;
  visible: boolean;
};

export default function EditExpense({ expense, onSuccess, onDismiss, visible }: EditExpenseProps) {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setCategoryId(expense.category_id);
      setDate(new Date(expense.date));
      setNotes(expense.notes || '');
    }
  }, [expense]);

  const handleSubmit = useCallback(async () => {
    if (!amount || !categoryId || !expense) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const expenseData: Partial<Expense> = {
        amount: parseFloat(amount),
        category_id: categoryId,
        date: format(date, 'yyyy-MM-dd'),
        notes: notes || null,
      };

      const { error: supabaseError } = await supabase
        .from('expenses')
        .update(expenseData)
        .eq('id', expense.id);

      if (supabaseError) throw supabaseError;

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [amount, categoryId, date, notes, onSuccess, expense]);

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
        <Dialog.Title style={styles.title}>Edit Expense</Dialog.Title>
        <Dialog.Content>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView>
                <View style={styles.container}>
                  <TextInput
                    label="Amount"
                    value={amount}
                    onChangeText={setAmount}
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
                    label="Date"
                    value={date}
                    onChange={setDate}
                    style={styles.input}
                  />

                  <TextInput
                    label="Notes (optional)"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    style={styles.input}
                    returnKeyType="done"
                    blurOnSubmit
                    mode="outlined"
                    numberOfLines={3}
                    placeholder="Add any additional details..."
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
            Save Changes
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