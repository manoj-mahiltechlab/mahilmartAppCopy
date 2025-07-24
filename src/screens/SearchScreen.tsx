import SearchBarWithResults from '@components/dashboard/SearchBar';
import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';

const SearchScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <SearchBarWithResults />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default SearchScreen;
