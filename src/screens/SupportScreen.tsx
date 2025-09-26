import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, List, Text, TextInput } from 'react-native-paper';
import { Header } from '@components';
import { useAppState } from '@hooks';

export const SupportScreen: React.FC = () => {
  const { complaints } = useAppState();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  return (
    <View style={styles.container}>
      <Header title="Support" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">New Complaint</Text>
            <TextInput
              label="Subject"
              value={subject}
              onChangeText={setSubject}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Description"
              value={message}
              onChangeText={setMessage}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
            />
            <View style={styles.buttonRow}>
              <Button icon="phone" mode="outlined">
                Call support
              </Button>
              <Button icon="chat" mode="outlined">
                Start chat
              </Button>
            </View>
            <Button icon="send" mode="contained" style={styles.submit}>
              Submit
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">Complaint History</Text>
            {complaints.map((complaint) => (
              <List.Item
                key={complaint.id}
                title={complaint.subject}
                description={`${complaint.status} • ${complaint.createdAt}`}
                left={() => <List.Icon icon="message-alert" />}
              />
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    padding: 16,
    gap: 16
  },
  card: {
    borderRadius: 20
  },
  input: {
    marginTop: 12
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12
  },
  submit: {
    marginTop: 12,
    borderRadius: 12
  }
});

