import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button as UIButton } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const { t } = useTranslation();

  const handleLogin = async () => {
    setError('');
    try {
      await signIn(email, password);
      navigation.replace('BusinessList');
    } catch (e: any) {
      setError(e.message || t('login.error'));
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label={t('login.email')}
        placeholder={t('login.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input
        label={t('login.password')}
        placeholder={t('login.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <UIButton title={t('login.button')} onPress={handleLogin} />
      <UIButton
        title={t('login.register')}
        variant="secondary"
        onPress={() => navigation.navigate('Register')}
      />
      {error ? <Input error={error} editable={false} /> : null}
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
