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

const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const { signUp } = useAuth();
  const { t } = useTranslation();

  const validate = () => {
    let valid = true;
    if (!email) {
      setEmailError(t('register.email_required'));
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError(t('register.email_invalid'));
      valid = false;
    } else {
      setEmailError('');
    }
    if (!password) {
      setPasswordError(t('register.password_required'));
      valid = false;
    } else if (password.length < 6) {
      setPasswordError(t('register.password_short'));
      valid = false;
    } else {
      setPasswordError('');
    }
    if (!confirmPassword) {
      setConfirmError(t('register.confirm_required'));
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError(t('register.passwords_no_match'));
      valid = false;
    } else {
      setConfirmError('');
    }
    return valid;
  };

  const handleRegister = async () => {
    setSubmitError('');
    if (!validate()) return;
    try {
      await signUp(email, password);
      navigation.replace('Login');
    } catch (e: any) {
      setSubmitError(e.message || t('register.error'));
    }
  };

  const isFormValid =
    email && password && confirmPassword && !emailError && !passwordError && !confirmError;

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
        <View style={styles.register}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
          </View>
          <View style={styles.formContainer}>
            <Input
              placeholder={t('register.email')}
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
              placeholder={t('register.password')}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              secureTextEntry
              showPasswordToggle={true}
              error={passwordError}
            />
            <Input
              placeholder={t('register.confirmPassword')}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmError) setConfirmError('');
              }}
              secureTextEntry
              showPasswordToggle={true}
              error={confirmError}
            />
            <UIButton
              title={t('register.button')}
              onPress={handleRegister}
              disabled={!isFormValid}
              style={styles.registerButton}
            />
            <UIButton
              title={t('register.back')}
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            />
            {submitError ? <Input error={submitError} editable={false} /> : null}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

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
  register: {
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
  registerButton: {
    marginTop: 20,
    marginBottom: 12
  },
  backButton: {
    marginBottom: 16
  }
});
