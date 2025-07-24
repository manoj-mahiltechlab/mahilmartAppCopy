import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  ToastAndroid,
  Clipboard,
} from 'react-native';
import {Colors, Fonts} from '@utils/Constants';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import {getSupportInfo} from '@service/authService';

import moment from 'moment';

const SupportScreen = () => {
  const [support, setSupport] = useState<{
    email: string;
    phone: string;
    whatsapp: string;
    createdAt?: string;
  } | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const fetchSupport = useCallback(async () => {
    try {
      const data = await getSupportInfo();
      if (data) setSupport(data);
    } catch (err) {
      console.log('❌ Support fetch error:', err);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchSupport();
    }, 1000);
  }, [fetchSupport]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSupport();
    setRefreshing(false);
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
  };

  const handleEmailPress = () => {
    if (support?.email) Linking.openURL(`mailto:${support.email}`);
  };

  const handlePhonePress = () => {
    if (support?.phone) Linking.openURL(`tel:${support.phone}`);
  };

  const handleWhatsAppPress = () => {
    if (support?.whatsapp)
      Linking.openURL(`https://wa.me/${support.whatsapp}?text=Hello%20Support`);
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Support" />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <CustomText
          variant="h3"
          fontFamily={Fonts.SemiBold}
          style={styles.title}>
          💬 Need Help?
        </CustomText>

        {!support ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          <>
            <TouchableOpacity
              onPress={handleEmailPress}
              onLongPress={() => copyToClipboard(support.email)}
              style={styles.card}>
              <CustomText variant="h6" style={styles.iconText}>
                📧 {support.email}
              </CustomText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePhonePress}
              onLongPress={() => copyToClipboard(support.phone)}
              style={styles.card}>
              <CustomText variant="h6" style={styles.iconText}>
                📞 {support.phone}
              </CustomText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleWhatsAppPress}
              onLongPress={() => copyToClipboard(support.whatsapp)}
              style={styles.card}>
              <CustomText variant="h6" style={styles.iconText}>
                💬 WhatsApp: {support.whatsapp}
              </CustomText>
            </TouchableOpacity>

            {support.createdAt && (
              <CustomText style={styles.lastUpdated}>
                🕘 Last updated: {moment(support.createdAt).fromNow()}
              </CustomText>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    color: '#f5410bff',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f1f1f1',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 16,
    color: '#363636',
  },
  lastUpdated: {
    marginTop: 25,
    fontSize: 14,
    color: '#363636',
  },
});

export default SupportScreen;
