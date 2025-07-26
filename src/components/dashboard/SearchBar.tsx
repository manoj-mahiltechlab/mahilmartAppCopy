import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Keyboard,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {RFValue} from 'react-native-responsive-fontsize';
import RollingBar from 'react-native-rolling-bar';
import CustomText from '@components/ui/CustomText';
import {Fonts} from '@utils/Constants';
import axios from 'axios';
import {
  useNavigation,
  useFocusEffect,
  NavigationProp,
} from '@react-navigation/native';
import {BASE_URL} from '@service/config';

type RootStackParamList = {
  ProductCategories: {searchResults: any[]};
};

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useFocusEffect(
    useCallback(() => {
      // optional: setSearchQuery('');
    }, []),
  );

  const handleSearch = async () => {
    Keyboard.dismiss();

    if (!searchQuery.trim()) {
      Alert.alert('No items found', 'Please type something to search.');
      return;
    }

    setLoading(true);

    try {
      //  FIXED: added /api prefix to match backend
      const res = await axios.get(`${BASE_URL}/products/search`, {
        params: {q: searchQuery},
      });

      const results = res.data;
      console.log(' Search results received:', results);

      if (Array.isArray(results) && results.length > 0) {
        navigation.navigate('ProductCategories', {searchResults: results});
        setSearchQuery('');
      } else {
        Alert.alert('No Results', 'No products matched your search.');
        setSearchQuery('');
      }
    } catch (err: any) {
      console.log(' Search error:', err.message);
      Alert.alert('Search Error', 'Something went wrong while searching.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Icon name="search" color={'#000'} size={RFValue(20)} />

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={searchQuery}
          onChangeText={text => {
            const lettersOnly = text.replace(/[^A-Za-z\s]/g, '');
            setSearchQuery(lettersOnly);
          }}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {searchQuery === '' && !isFocused && (
          <View pointerEvents="none" style={styles.rollingOverlay}>
            <RollingBar
              interval={3000}
              defaultStyle={false}
              customStyle={styles.rollingContainer}>
              <CustomText variant="h6" fontFamily={Fonts.Medium}>
                Search "milk"
              </CustomText>
              <CustomText variant="h6" fontFamily={Fonts.Medium}>
                Search "sweets"
              </CustomText>
              <CustomText variant="h6" fontFamily={Fonts.Medium}>
                Search "ata", "dal", "coke"
              </CustomText>
              <CustomText variant="h6" fontFamily={Fonts.Medium}>
                Search "chips"
              </CustomText>
            </RollingBar>
          </View>
        )}
      </View>

      <TouchableOpacity onPress={handleSearch} style={{padding: 5}}>
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Icon
            name="arrow-forward-circle-outline"
            size={RFValue(22)}
            color={'#000'}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F7',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 0.6,
    borderColor: '#ccc',
    marginTop: 15,
    marginHorizontal: 10,
    paddingHorizontal: 10,
    height: 50,
  },
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#000',
    height: 50,
  },
  rollingOverlay: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  rollingContainer: {
    paddingLeft: 0,
  },
});

export default SearchBar;
