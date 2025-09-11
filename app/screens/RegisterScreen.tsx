import React, { useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export function RegisterScreen({ navigation }: any) {
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
    <View style={styles.container}>
      <Input
        label={t('register.email')}
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
        label={t('register.password')}
        placeholder={t('register.password')}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (passwordError) setPasswordError('');
        }}
        secureTextEntry
        error={passwordError}
      />
      <Input
        label={t('register.confirmPassword')}
        placeholder={t('register.confirmPassword')}
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          if (confirmError) setConfirmError('');
        }}
        secureTextEntry
        error={confirmError}
      />
      <Button title={t('register.button')} onPress={handleRegister} disabled={!isFormValid} />
      <Button title={t('register.back')} onPress={() => navigation.goBack()} />
      {submitError ? <Input error={submitError} editable={false} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  error: {
    color: 'red',
    marginTop: 12,
    textAlign: 'center'
  }
});
