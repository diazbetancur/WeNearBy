import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { Button as UIButton } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

const { width, height } = Dimensions.get('window');
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const { signIn } = useAuth();
  const { t } = useTranslation();

  const validate = () => {
    let valid = true;
    if (!email) {
      setEmailError(t('login.email_required'));
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError(t('login.email_invalid'));
      valid = false;
    } else {
      setEmailError('');
    }
    if (!password) {
      setPasswordError(t('login.password_required'));
      valid = false;
    } else {
      setPasswordError('');
    }
    return valid;
  };

  const handleLogin = async () => {
    setSubmitError('');
    if (!validate()) return;
    try {
      await signIn(email, password);
      navigation.replace('BusinessList');
    } catch (e: any) {
      setSubmitError(e.message || t('login.error'));
    }
  };

  const isFormValid = email && password && !emailError && !passwordError;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.loging}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
          </View>
          <View style={styles.formContainer}>
            <Input
              placeholder={t('login.email')}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              error={emailError}
            />
            <Input
              placeholder={t('login.password')}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              secureTextEntry
              showPasswordToggle={true}
              error={passwordError}
            />
            <UIButton
              title={t('login.button')}
              onPress={handleLogin}
              disabled={!isFormValid}
              style={styles.loginButton}
            />
            <UIButton
              title={t('login.register')}
              variant="secondary"
              onPress={() => navigation.navigate('Register')}
              style={styles.registerButton}
            />
            {submitError ? <Input error={submitError} editable={false} /> : null}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000'
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: height
  },
  loging: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: '70%',
    alignSelf: 'center',
    width: '100%'
  },
  logoContainer: {
    alignItems: 'center'
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    maxWidth: 200,
    maxHeight: 200,
    marginBottom: 10
  },
  formContainer: {
    alignSelf: 'center',
    width: '100%'
  },
  loginButton: {
    marginTop: 20,
    marginBottom: 12
  },
  registerButton: {
    marginBottom: 16
  }
});
