import React, { useState, useCallback } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { Button, TextInput, HelperText, Portal, Dialog, useTheme } from 'react-native-paper';
import { format } from 'date-fns';
import { supabase } from '../../services/supabase';
import { Earning } from '../../types/schema';
import CategoryPicker from '../common/CategoryPicker';
import DatePicker from '../common/DatePicker';

type QuickAddEarningProps = {
  onSuccess?: () => void;
  onDismiss?: () => void;
  visible: boolean;
};

export default function QuickAddEarning({ onSuccess, onDismiss, visible }: QuickAddEarningProps) {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  const handleSubmit = useCallback(async () => {
    if (!amount || !source || !categoryId) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const earningData: Omit<Earning, 'id' | 'created_at' | 'updated_at'> = {
        amount: parseFloat(amount),
        source,
        category_id: categoryId,
        date: format(date, 'yyyy-MM-dd'),
        notes: notes || null,
        is_recurring: false,
        recurrence_pattern: null,
      };

      const { error: supabaseError } = await supabase
        .from('earnings')
        .insert([earningData]);

      if (supabaseError) throw supabaseError;

      setAmount('');
      setSource('');
      setCategoryId(null);
      setDate(new Date());
      setNotes('');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [amount, source, categoryId, date, notes, onSuccess]);

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
        <Dialog.Title style={styles.title}>Add New Earning</Dialog.Title>
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

                  <TextInput
                    label="Source"
                    value={source}
                    onChangeText={setSource}
                    style={styles.input}
                    returnKeyType="next"
                    mode="outlined"
                    placeholder="e.g., Salary, Freelance, Gift"
                  />

                  <CategoryPicker
                    type="earning"
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
            Add Earning
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