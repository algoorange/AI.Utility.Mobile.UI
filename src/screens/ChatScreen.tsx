import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { 
  Card, 
  Text, 
  TextInput, 
  Button, 
  Avatar,
  useTheme,
  IconButton
} from 'react-native-paper';
import { Header } from '../components';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  senderName: string;
}

interface ChatScreenProps {
  navigation: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! Welcome to EB Customer Support. How can I help you today?',
      isUser: false,
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      senderName: 'Support Agent'
    },
    {
      id: '2',
      text: 'Hi, I have a question about my recent bill.',
      isUser: true,
      timestamp: new Date(Date.now() - 240000), // 4 minutes ago
      senderName: 'You'
    },
    {
      id: '3',
      text: 'I\'d be happy to help you with your bill. Could you please provide your account number?',
      isUser: false,
      timestamp: new Date(Date.now() - 180000), // 3 minutes ago
      senderName: 'Support Agent'
    },
    {
      id: '4',
      text: 'My account number is 12345. The bill amount seems higher than usual.',
      isUser: true,
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
      senderName: 'You'
    },
    {
      id: '5',
      text: 'Let me check your account details. I can see that your usage has increased by 15% compared to last month. This could be due to seasonal changes or additional appliances.',
      isUser: false,
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      senderName: 'Support Agent'
    }
  ]);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        isUser: true,
        timestamp: new Date(),
        senderName: 'You'
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage('');

      // Simulate agent response after 2 seconds
      setTimeout(() => {
        const agentResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Thank you for your message. Our support team will get back to you shortly.',
          isUser: false,
          timestamp: new Date(),
          senderName: 'Support Agent'
        };
        setMessages(prev => [...prev, agentResponse]);
      }, 2000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  return (
    <View style={styles.container}>
      <Header title="Customer Support" showBackButton onBackPress={() => navigation.goBack()} />
      
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((msg) => (
            <View 
              key={msg.id} 
              style={[
                styles.messageContainer,
                msg.isUser ? styles.userMessageContainer : styles.agentMessageContainer
              ]}
            >
              <View style={styles.messageHeader}>
                <Avatar.Text 
                  size={32} 
                  label={msg.senderName.charAt(0)} 
                  style={[
                    styles.avatar,
                    msg.isUser ? styles.userAvatar : styles.agentAvatar
                  ]}
                />
                <View style={styles.messageInfo}>
                  <Text variant="bodySmall" style={styles.senderName}>
                    {msg.senderName}
                  </Text>
                  <Text variant="bodySmall" style={styles.timestamp}>
                    {formatTime(msg.timestamp)}
                  </Text>
                </View>
              </View>
              
              <Card 
                style={[
                  styles.messageCard,
                  msg.isUser ? styles.userMessageCard : styles.agentMessageCard
                ]}
              >
                <Card.Content style={styles.messageContent}>
                  <Text variant="bodyMedium" style={styles.messageText}>
                    {msg.text}
                  </Text>
                </Card.Content>
              </Card>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            mode="outlined"
            style={styles.textInput}
            multiline
            maxLength={500}
            right={
              <TextInput.Icon 
                icon="send" 
                onPress={handleSendMessage}
                disabled={!message.trim()}
              />
            }
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16
  },
  messagesContent: {
    paddingVertical: 16,
    paddingBottom: 80 // Space for input
  },
  messageContainer: {
    marginBottom: 16
  },
  userMessageContainer: {
    alignItems: 'flex-end'
  },
  agentMessageContainer: {
    alignItems: 'flex-start'
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  avatar: {
    marginRight: 8
  },
  userAvatar: {
    backgroundColor: '#1976d2'
  },
  agentAvatar: {
    backgroundColor: '#4caf50'
  },
  messageInfo: {
    flex: 1
  },
  senderName: {
    fontWeight: '600',
    fontSize: 12
  },
  timestamp: {
    opacity: 0.6,
    fontSize: 10
  },
  messageCard: {
    maxWidth: '80%',
    elevation: 2
  },
  userMessageCard: {
    backgroundColor: '#e3f2fd',
    borderTopRightRadius: 4
  },
  agentMessageCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 4
  },
  messageContent: {
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  messageText: {
    lineHeight: 20
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  textInput: {
    flex: 1,
    marginRight: 8,
    maxHeight: 100
  }
});
