import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, IconButton, useTheme, Menu } from 'react-native-paper';
import { format } from 'date-fns';
import { Notification, getNotifications, markNotificationAsRead, deleteNotification } from '../../services/notifications';

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading notifications...</Text>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No notifications</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          style={[
            styles.card,
            !notification.read && { backgroundColor: theme.colors.primaryContainer },
          ]}>
          <Card.Content>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text variant="titleMedium">{notification.title}</Text>
                <Text variant="bodySmall" style={styles.date}>
                  {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
                </Text>
              </View>
              <Menu
                visible={menuVisible === notification.id}
                onDismiss={() => setMenuVisible(null)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    onPress={() => setMenuVisible(notification.id)}
                  />
                }>
                {!notification.read && (
                  <Menu.Item
                    onPress={() => {
                      handleMarkAsRead(notification.id);
                      setMenuVisible(null);
                    }}
                    title="Mark as read"
                    leadingIcon="check"
                  />
                )}
                <Menu.Item
                  onPress={() => {
                    handleDelete(notification.id);
                    setMenuVisible(null);
                  }}
                  title="Delete"
                  leadingIcon="delete"
                />
              </Menu>
            </View>
            <Text variant="bodyMedium" style={styles.message}>
              {notification.message}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  date: {
    color: '#666',
    marginTop: 4,
  },
  message: {
    marginTop: 8,
  },
}); 