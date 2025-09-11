import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button as UIButton } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export function LoginScreen({ navigation }: any) {
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
    <View style={styles.container}>
      <Input
        label={t('login.email')}
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
        label={t('login.password')}
        placeholder={t('login.password')}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (passwordError) setPasswordError('');
        }}
        secureTextEntry
        error={passwordError}
      />
      <UIButton title={t('login.button')} onPress={handleLogin} disabled={!isFormValid} />
      <UIButton
        title={t('login.register')}
        variant="secondary"
        onPress={() => navigation.navigate('Register')}
      />
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
