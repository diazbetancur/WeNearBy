import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../hooks/useTranslation';
import { getBusinesses } from '../../services/businessService';

type Business = {
  id: string;
  name: string;
  logo?: string;
};

type RootStackParamList = {
  BusinessProfile: { businessId: string; businessName: string };
};

export default function BusinessListScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useTranslation();

  useEffect(() => {
    getBusinesses().then(setBusinesses);
  }, []);

  const renderItem = ({ item }: { item: Business }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        navigation.navigate('BusinessProfile', { businessId: item.id, businessName: item.name })
      }
    >
      {item.logo ? (
        <Image source={{ uri: item.logo }} style={styles.logo} />
      ) : (
        <View style={styles.logoPlaceholder} />
      )}
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('businessList.title')}</Text>
      <FlatList
        data={businesses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={<Text style={styles.empty}>{t('businessList.empty')}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    backgroundColor: '#eee'
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    backgroundColor: '#eee'
  },
  name: {
    fontSize: 18,
    fontWeight: '500'
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 32,
    fontSize: 16
  }
});
