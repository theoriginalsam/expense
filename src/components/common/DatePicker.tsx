import React, { useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { TextInput } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

type DatePickerProps = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  style?: StyleProp<ViewStyle>;
};

export default function DatePicker({ label, value, onChange, style }: DatePickerProps) {
  const [show, setShow] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShow(false);
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <>
      <TextInput
        label={label}
        value={format(value, 'PPP')}
        onFocus={() => setShow(true)}
        right={<TextInput.Icon icon="calendar" />}
        style={style}
      />
      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          onChange={handleChange}
        />
      )}
    </>
  );
} 