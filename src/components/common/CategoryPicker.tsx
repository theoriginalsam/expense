import React, { useEffect, useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { List, Menu, TextInput, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { Category } from '../../types/schema';
import { getCategories } from '../../services/supabase';

type CategoryPickerProps = {
  type: 'expense' | 'earning';
  value: string | null;
  onChange: (value: string | null) => void;
  style?: StyleProp<ViewStyle>;
};

export default function CategoryPicker({ type, value, onChange, style }: CategoryPickerProps) {
  const [visible, setVisible] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, [type]);

  useEffect(() => {
    if (value) {
      const category = categories.find(c => c.id === value);
      setSelectedCategory(category || null);
    } else {
      setSelectedCategory(null);
    }
  }, [value, categories]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategories(type);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (category: Category) => {
    onChange(category.id);
    setVisible(false);
  };

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <TextInput
          label="Category"
          value={selectedCategory?.name || ''}
          onFocus={() => setVisible(true)}
          right={
            loading ? (
              <TextInput.Icon icon={() => <ActivityIndicator size={20} />} />
            ) : (
              <TextInput.Icon icon="menu-down" />
            )
          }
          style={style}
          error={!!error}
          disabled={loading}
        />
      }>
      {loading ? (
        <Menu.Item
          title="Loading categories..."
          disabled
          leadingIcon={({ size, color }) => (
            <ActivityIndicator size={size} color={color} />
          )}
        />
      ) : error ? (
        <Menu.Item
          title={error}
          disabled
          leadingIcon={({ size, color }) => (
            <MaterialIcons name="error" size={size} color={color} />
          )}
        />
      ) : categories.length === 0 ? (
        <Menu.Item
          title="No categories found"
          disabled
          leadingIcon={({ size, color }) => (
            <MaterialIcons name="info" size={size} color={color} />
          )}
        />
      ) : (
        categories.map((category) => (
          <Menu.Item
            key={category.id}
            onPress={() => handleSelect(category)}
            title={category.name}
            leadingIcon={({ size, color }) => (
              <MaterialIcons
                name={category.icon as any || 'label'}
                size={size}
                color={category.color || color}
              />
            )}
          />
        ))
      )}
    </Menu>
  );
} 