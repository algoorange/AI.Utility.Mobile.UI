import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
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

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { register } = useAppState();
  const [accountNumber, setAccountNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!accountNumber.trim() || !fullName.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await register({
        account_number: accountNumber.trim(),
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim()
      });

      if (success) {
        Alert.alert(
          'Registration Successful', 
          'Your account has been created successfully. Please login with your credentials.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Registration Failed', 'Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration Error', 'Failed to register. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Header title="Register" showBackButton onBackPress={handleBackToLogin} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.content} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.card}>
            <Card.Content>
              {/* Company Logo */}
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../assets/logo.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <Text variant="headlineSmall" style={styles.title}>
                Create Account
              </Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                Register for EB Meter Reading
              </Text>

            <TextInput
              label="Account Number *"
              value={accountNumber}
              onChangeText={setAccountNumber}
              mode="outlined"
              style={styles.input}
              placeholder="Enter your account number"
              keyboardType="default"
              autoCapitalize="none"
              returnKeyType="next"
            />

            <TextInput
              label="Full Name *"
              value={fullName}
              onChangeText={setFullName}
              mode="outlined"
              style={styles.input}
              placeholder="Enter your full name"
              keyboardType="default"
              autoCapitalize="words"
              returnKeyType="next"
            />

            <TextInput
              label="Email *"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />

            <TextInput
              label="Phone Number *"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              style={styles.input}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              returnKeyType="next"
            />

            <TextInput
              label="Address *"
              value={address}
              onChangeText={setAddress}
              mode="outlined"
              style={styles.input}
              placeholder="Enter your address"
              keyboardType="default"
              multiline
              numberOfLines={3}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              disabled={isLoading}
              style={styles.registerButton}
              contentStyle={styles.buttonContent}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.onPrimary} />
              ) : (
                'Create Account'
              )}
            </Button>

            <View style={styles.loginSection}>
              <Text variant="bodyMedium" style={styles.loginText}>
                Already have an account?
              </Text>
              <Button
                mode="text"
                onPress={handleBackToLogin}
                style={styles.loginButton}
              >
                Sign In Here
              </Button>
            </View>
          </Card.Content>
        </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  keyboardAvoidingView: {
    flex: 1
  },
  content: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24
  },
  logo: {
    width: 80,
    height: 80
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
  registerButton: {
    marginTop: 16,
    borderRadius: 12
  },
  buttonContent: {
    paddingVertical: 8
  },
  loginSection: {
    alignItems: 'center',
    marginTop: 24
  },
  loginText: {
    opacity: 0.7
  },
  loginButton: {
    marginTop: 8
  }
});
