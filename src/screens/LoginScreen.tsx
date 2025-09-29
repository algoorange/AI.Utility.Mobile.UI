import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  TextInput, 
  useTheme,
  ActivityIndicator
} from 'react-native-paper';
import { Header } from '../components';
import { useAppState } from '../hooks';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { login } = useAppState();
  const [accountNumber, setAccountNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!accountNumber.trim() || !email.trim()) {
      Alert.alert('Missing Information', 'Please enter both account number and email.');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(accountNumber.trim(), email.trim());
      if (success) {
        // Navigation will be handled by the auth state change
        console.log('Login successful');
      } else {
        Alert.alert('Login Failed', 'Invalid account number or email. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Error', 'Failed to login. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <Header title="Login" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              Welcome Back
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Sign in to your account
            </Text>

            <TextInput
              label="Account Number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              mode="outlined"
              style={styles.input}
              placeholder="Enter your account number"
              keyboardType="default"
              autoCapitalize="none"
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.onPrimary} />
              ) : (
                'Sign In'
              )}
            </Button>

            <View style={styles.registerSection}>
              <Text variant="bodyMedium" style={styles.registerText}>
                Don't have an account?
              </Text>
              <Button
                mode="text"
                onPress={handleRegister}
                style={styles.registerButton}
              >
                Register Here
              </Button>
            </View>
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
    justifyContent: 'center',
    flexGrow: 1
  },
  card: {
    borderRadius: 16,
    elevation: 4
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold'
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7
  },
  input: {
    marginBottom: 16
  },
  loginButton: {
    marginTop: 16,
    borderRadius: 12
  },
  buttonContent: {
    paddingVertical: 8
  },
  registerSection: {
    alignItems: 'center',
    marginTop: 24
  },
  registerText: {
    opacity: 0.7
  },
  registerButton: {
    marginTop: 8
  }
});
