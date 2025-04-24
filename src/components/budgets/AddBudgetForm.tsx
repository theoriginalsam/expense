import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText, Button } from 'react-native-paper';
import { format } from 'date-fns';
import { supabase } from '../../services/supabase';
import CategoryPicker from '../common/CategoryPicker';
import DatePicker from '../common/DatePicker';

type AddBudgetFormProps = {
  onSuccess?: () => void;
  onDismiss?: () => void;
  loading?: boolean;
  error?: string | null;
};

export default function AddBudgetForm({ onSuccess, onDismiss, loading, error }: AddBudgetFormProps) {
  const [limitAmount, setLimitAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [month, setMonth] = useState(new Date());
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      // Validate inputs
      if (!limitAmount) {
        setLocalError('Please enter a budget limit');
        return;
      }
      if (!categoryId) {
        setLocalError('Please select a category');
        return;
      }

      // Validate amount is a valid number
      const amount = parseFloat(limitAmount);
      if (isNaN(amount) || amount <= 0) {
        setLocalError('Please enter a valid amount greater than 0');
        return;
      }

      const budgetData = {
        category_id: categoryId,
        limit_amount: amount,
        month: format(month, 'yyyy-MM-dd'),
        rollover_amount: 0,
        notifications_enabled: true,
      };

      console.log('Submitting budget data:', budgetData); // Debug log

      const { error: supabaseError } = await supabase
        .from('budgets')
        .insert([budgetData]);

      if (supabaseError) {
        console.error('Supabase error:', supabaseError); // Debug log
        throw new Error(supabaseError.message);
      }

      setLimitAmount('');
      setCategoryId(null);
      setMonth(new Date());
      setLocalError(null);
      onSuccess?.();
    } catch (err) {
      console.error('Error in handleSubmit:', err); // Debug log
      setLocalError(err instanceof Error ? err.message : 'Failed to add budget. Please try again.');
    }
  };

  return (
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
        disabled={loading}
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

      {(error || localError) && (
        <HelperText type="error" visible={!!(error || localError)} style={styles.error}>
          {error || localError}
        </HelperText>
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={onDismiss}
          style={styles.button}
          disabled={loading}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}>
          Add Budget
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  button: {
    minWidth: 100,
    borderRadius: 8,
  },
}); 