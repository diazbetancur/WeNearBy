import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { getBusinesses } from '../../services/businessService';

export default function BusinessListScreen({ navigation }: any) {
  const [businesses, setBusinesses] = useState<any[]>([]);

  useEffect(() => {
    getBusinesses().then(setBusinesses);
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Comercios Cercanos</Text>
      <FlatList
        data={businesses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('BusinessProfile', { businessId: item.id })}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
