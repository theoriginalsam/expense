import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedButtons, Chip, useTheme, IconButton } from 'react-native-paper';

type ViewType = 'all' | 'daily' | 'weekly' | 'monthly';
type FilterType = 'expense' | 'earning';

type ViewOptionsProps = {
  viewType: ViewType;
  onViewTypeChange: (type: ViewType) => void;
  filterType: FilterType;
  onFilterTypeChange: (type: FilterType) => void;
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  categories: Array<{ id: string; name: string; color: string }>;
  showCalendar: boolean;
  onToggleCalendar: () => void;
};

export default function ViewOptions({
  viewType,
  onViewTypeChange,
  filterType,
  onFilterTypeChange,
  selectedCategories,
  onCategoryToggle,
  categories,
  showCalendar,
  onToggleCalendar,
}: ViewOptionsProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SegmentedButtons
          value={viewType}
          onValueChange={onViewTypeChange}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
          ]}
          style={styles.segmentedButtons}
        />
        {viewType !== 'all' && (
          <IconButton
            icon={showCalendar ? 'calendar' : 'calendar-outline'}
            mode="contained"
            onPress={onToggleCalendar}
            style={styles.calendarButton}
          />
        )}
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <Chip
              key={category.id}
              selected={selectedCategories.includes(category.id)}
              onPress={() => onCategoryToggle(category.id)}
              style={[
                styles.categoryChip,
                { borderColor: category.color },
                selectedCategories.includes(category.id) && { backgroundColor: category.color + '20' },
              ]}
              textStyle={[
                styles.categoryText,
                { color: selectedCategories.includes(category.id) ? category.color : theme.colors.onSurface },
              ]}>
              {category.name}
            </Chip>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  segmentedButtons: {
    flex: 1,
  },
  calendarButton: {
    margin: 0,
  },
  filterContainer: {
    gap: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
  },
}); 