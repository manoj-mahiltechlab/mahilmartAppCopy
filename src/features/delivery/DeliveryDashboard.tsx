import {View, Text, StyleSheet} from 'react-native';
import React from 'react';

const DeliveryDashboard = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Dashboard</Text>
      <Text style={styles.description}>Welcome to the Delivery Dashboard!</Text>
      {/* You can add more elements or components here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8', // Light background color
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
});

export default DeliveryDashboard;
