import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

export function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const { t } = useTranslation();

  const handleRegister = async () => {
    setError('');
    if (password !== confirmPassword) {
      setError(t('register.passwords_no_match'));
      return;
    }
    try {
      await signUp(email, password);
      navigation.replace('Login');
    } catch (e: any) {
      setError(e.message || t('register.error'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('register.title')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('register.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder={t('register.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder={t('register.confirm_password')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <Button title={t('register.button')} onPress={handleRegister} />
      <Button title={t('register.back_to_login')} onPress={() => navigation.goBack()} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
