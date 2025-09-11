import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';

interface BusinessCardProps {
  name: string;
  logo?: string;
  onPress?: () => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ name, logo, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    {logo ? (
      <Image source={{ uri: logo }} style={styles.logo} />
    ) : (
      <View style={styles.logoPlaceholder} />
    )}
    <Text style={styles.name}>{name}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.overlay,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    backgroundColor: colors.background
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    backgroundColor: colors.disabled
  },
  name: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '500'
  }
});
