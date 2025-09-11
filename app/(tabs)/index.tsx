import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTranslation } from '@/hooks/useTranslation';
import { RoleSwitcher } from '../../src/shared/components/RoleSwitcher';
import { useRole } from '../../src/shared/services/RoleContext';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { currentRole } = useRole();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{t('home.title')}</ThemedText>
        <ThemedText type="subtitle">
          Rol actual: {currentRole === 'customer' ? 'Cliente' : 'Comercio'}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{t('home.subtitle')}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <RoleSwitcher />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute'
  }
});
