import { View, StyleSheet } from 'react-native';
import { Text, List, Switch, Divider } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { requestNotificationPermissions } from '../../src/services/notifications';

export default function SettingsScreen() {
  const [expenseNotifications, setExpenseNotifications] = useState(true);
  const [budgetNotifications, setBudgetNotifications] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    const hasPermission = await requestNotificationPermissions();
    setNotificationsEnabled(hasPermission);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Settings</Text>
      
      <List.Section>
        <List.Subheader>Notifications</List.Subheader>
        <List.Item
          title="Enable Notifications"
          description="Allow the app to send you notifications"
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={checkNotificationPermissions}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Expense Notifications"
          description="Get notified when you add new expenses"
          right={() => (
            <Switch
              value={expenseNotifications}
              onValueChange={setExpenseNotifications}
              disabled={!notificationsEnabled}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Budget Alerts"
          description="Get notified when you're close to your budget limit"
          right={() => (
            <Switch
              value={budgetNotifications}
              onValueChange={setBudgetNotifications}
              disabled={!notificationsEnabled}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Reminder Notifications"
          description="Get reminded to log your expenses"
          right={() => (
            <Switch
              value={reminderNotifications}
              onValueChange={setReminderNotifications}
              disabled={!notificationsEnabled}
            />
          )}
        />
      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 20,
  },
}); 