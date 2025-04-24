import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Divider, useTheme } from 'react-native-paper';
import { ExportData } from '../../src/components/settings/ExportData';

export default function SettingsScreen() {
  const theme = useTheme();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Account Settings */}
      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <List.Item
          title="Profile"
          left={props => <List.Icon {...props} icon="account" />}
          onPress={() => {}}
        />
        <List.Item
          title="Notifications"
          left={props => <List.Icon {...props} icon="bell" />}
          onPress={() => {}}
        />
      </List.Section>

      <Divider />

      {/* App Settings */}
      <List.Section>
        <List.Subheader>App Settings</List.Subheader>
        <List.Item
          title="Theme"
          left={props => <List.Icon {...props} icon="palette" />}
          onPress={() => {}}
        />
        <List.Item
          title="Currency"
          left={props => <List.Icon {...props} icon="currency-usd" />}
          onPress={() => {}}
        />
      </List.Section>

      <Divider />

      {/* Data Management */}
      <List.Section>
        <List.Subheader>Data Management</List.Subheader>
        <View style={styles.exportContainer}>
          <ExportData />
        </View>
        <List.Item
          title="Backup"
          left={props => <List.Icon {...props} icon="backup" />}
          onPress={() => {}}
        />
      </List.Section>

      <Divider />

      {/* About */}
      <List.Section>
        <List.Subheader>About</List.Subheader>
        <List.Item
          title="Version"
          description="1.0.0"
          left={props => <List.Icon {...props} icon="information" />}
        />
        <List.Item
          title="Privacy Policy"
          left={props => <List.Icon {...props} icon="shield-account" />}
          onPress={() => {}}
        />
        <List.Item
          title="Terms of Service"
          left={props => <List.Icon {...props} icon="file-document" />}
          onPress={() => {}}
        />
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  exportContainer: {
    paddingHorizontal: 16,
  },
}); 