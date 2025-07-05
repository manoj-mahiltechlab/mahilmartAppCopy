import React, {useEffect, useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  NavigationProp,
} from '@react-navigation/native';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import {Colors, Fonts} from '@utils/Constants';
import {useAuthStore} from '@state/authStore';
import axios from 'axios';

type RootStackParamList = {
  EditAddressScreen: {
    addressType?: 'primary' | 'secondary';
    fromPlaceOrder?: boolean;
  };
  ProductOrder: {
    newAddress: string;
    addressType: 'primary' | 'secondary';
    name: string;
    phone: string;
  };
};

const EditAddressScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const {user, setUser} = useAuthStore();
  const {addressType = 'primary', fromPlaceOrder = false} = route.params || {};

  const [selectedAddressType, setSelectedAddressType] = useState<
    'primary' | 'secondary'
  >(addressType);
  const [saving, setSaving] = useState(false);

  const [primaryAddress, setPrimaryAddress] = useState({
    fullName: '',
    phone: '',
    pincode: '',
    state: '',
    city: '',
    house: '',
    road: '',
  });

  const [secondaryAddress, setSecondaryAddress] = useState({
    fullName: '',
    phone: '',
    pincode: '',
    state: '',
    city: '',
    house: '',
    road: '',
  });

  useEffect(() => {
    if (user?.PrimaryAddress) {
      const parsed = parseAddress(user.PrimaryAddress);
      setPrimaryAddress({
        fullName: user?.primaryContact?.fullName || '',
        phone: user?.primaryContact?.phone || '',
        ...parsed,
      });
    }
    if (user?.SecondaryAddress) {
      const parsed = parseAddress(user.SecondaryAddress);
      setSecondaryAddress({
        fullName: user?.secondaryContact?.fullName || '',
        phone: user?.secondaryContact?.phone || '',
        ...parsed,
      });
    }
  }, [user]);

  const parseAddress = (addressString: string) => {
    try {
      const [house = '', road = '', city = '', stateZip = ''] = addressString
        .split(',')
        .map(s => s.trim());
      const [state = '', pincode = ''] = stateZip.split('-').map(s => s.trim());
      return {house, road, city, state, pincode};
    } catch {
      return {house: '', road: '', city: '', state: '', pincode: ''};
    }
  };

  const handleSave = async () => {
    if (!user?.token) {
      Alert.alert(
        'Error',
        'No authentication token found. Please login again.',
      );
      return;
    }

    const address =
      selectedAddressType === 'primary' ? primaryAddress : secondaryAddress;
    const trimmed = Object.fromEntries(
      Object.entries(address).map(([k, v]) => [k, v.trim()]),
    );

    const isEmpty = Object.values(trimmed).some(val => !val);
    if (isEmpty) {
      Alert.alert(
        'Missing Fields',
        `Please fill all required fields in the ${selectedAddressType} address.`,
      );
      return;
    }

    const formatted = [
      trimmed.house,
      trimmed.road,
      trimmed.city,
      `${trimmed.state} - ${trimmed.pincode}`,
    ].join(', ');

    const payload =
      selectedAddressType === 'primary'
        ? {
            PrimaryAddress: formatted,
            primaryContact: {fullName: trimmed.fullName, phone: trimmed.phone},
          }
        : {
            SecondaryAddress: formatted,
            secondaryContact: {
              fullName: trimmed.fullName,
              phone: trimmed.phone,
            },
          };

    try {
      setSaving(true);
      const res = await axios.patch(
        'http://192.168.1.144:3000/api/user',
        payload,
        {
          headers: {Authorization: `Bearer ${user.token}`},
        },
      );

      if (res.data?.user) {
        setUser(res.data.user);
        Alert.alert('Success', 'Address updated successfully!');

        if (fromPlaceOrder) {
          navigation.navigate('ProductOrder', {
            newAddress: formatted,
            addressType: selectedAddressType,
            name: trimmed.fullName,
            phone: trimmed.phone,
          });
        } else {
          navigation.goBack();
        }
      }
    } catch (error) {
      if (__DEV__)
        console.log('Update failed:', error?.response?.data || error.message);
      Alert.alert('Error', 'Failed to update address');
    } finally {
      setSaving(false);
    }
  };

  const renderAddressFields = (
    type: 'primary' | 'secondary',
    title: string,
    stateObj: any,
    setStateFn: any,
  ) => (
    <View style={styles.section}>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => setSelectedAddressType(type)}>
          <View
            style={[
              styles.radioCircle,
              selectedAddressType === type && styles.radioSelected,
            ]}
          />
          <CustomText style={styles.radioLabel}>
            {`Use ${type === 'primary' ? 'Primary' : 'Secondary'} Address`}
          </CustomText>
        </TouchableOpacity>
      </View>

      <CustomText fontFamily={Fonts.Bold} style={styles.sectionTitle}>
        {title}
      </CustomText>

      <TextInput
        placeholder="Full Name *"
        value={stateObj.fullName}
        onChangeText={text => setStateFn({...stateObj, fullName: text})}
        style={styles.input}
      />
      <TextInput
        placeholder="Phone Number *"
        keyboardType="phone-pad"
        value={stateObj.phone}
        onChangeText={text => setStateFn({...stateObj, phone: text})}
        style={styles.input}
      />
      <TextInput
        placeholder="Pincode *"
        keyboardType="numeric"
        value={stateObj.pincode}
        onChangeText={text => setStateFn({...stateObj, pincode: text})}
        style={styles.input}
      />
      <View style={styles.row}>
        <TextInput
          placeholder="State *"
          value={stateObj.state}
          onChangeText={text => setStateFn({...stateObj, state: text})}
          style={[styles.input, {flex: 1, marginRight: 5}]}
        />
        <TextInput
          placeholder="City *"
          value={stateObj.city}
          onChangeText={text => setStateFn({...stateObj, city: text})}
          style={[styles.input, {flex: 1}]}
        />
      </View>
      <TextInput
        placeholder="House No., Building Name *"
        value={stateObj.house}
        onChangeText={text => setStateFn({...stateObj, house: text})}
        style={styles.input}
      />
      <TextInput
        placeholder="Road name, Area, Colony *"
        value={stateObj.road}
        onChangeText={text => setStateFn({...stateObj, road: text})}
        style={styles.input}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{flex: 1, backgroundColor: '#fff'}}>
          <CustomHeader title="Edit Addresses" />
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled">
            {renderAddressFields(
              'primary',
              'Primary Address',
              primaryAddress,
              setPrimaryAddress,
            )}
            {renderAddressFields(
              'secondary',
              'Secondary Address',
              secondaryAddress,
              setSecondaryAddress,
            )}
            <TouchableOpacity
              style={[styles.saveButton, saving && {opacity: 0.6}]}
              onPress={handleSave}
              disabled={saving}>
              <CustomText
                fontFamily={Fonts.SemiBold}
                style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Address'}
              </CustomText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: Colors.backgroundSecondary,
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginRight: 8,
  },
  radioSelected: {
    backgroundColor: '#FFD814',
    borderColor: '#FFD814',
  },
  radioLabel: {
    fontSize: 14,
    color: Colors.textDark,
  },
  section: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: Colors.textDark,
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  saveButton: {
    backgroundColor: '#0B74DE',
    paddingVertical: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});

export default EditAddressScreen;
