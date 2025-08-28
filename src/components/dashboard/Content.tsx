import {View, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import React, {FC, useEffect, useState, useCallback} from 'react';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';

import AdCarousal from './AdCarousal';
import CustomText from '@components/ui/CustomText';
import {Fonts} from '@utils/Constants';
import CategoryContainer from './CategoryContainer';
import {getAdImages, getAllSections} from '@service/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

type DashboardStackParamList = {
  CategoryOrSubcategory: {categoryId: string; categoryName: string};
  ProductCategories: {
    selectedCategory: {_id: string; name: string};
    subcategoryId: string;
    categoryName: string;
  };
  ProductDashboard: undefined;
  DeliveryLogin: undefined;
  DeliveryDashboard: undefined;
};

const Content: FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<DashboardStackParamList>>();
  const [adData, setAdData] = useState<string[]>([]);
  const [allSections, setAllSections] = useState<any[]>([]);
  //const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);

  const handleCategoryPress = (categoryItem: {id: string; name: string}) => {
    navigation.navigate('CategoryOrSubcategory', {
      categoryId: categoryItem.id,
      categoryName: categoryItem.name,
    });
  };

  // Reusable fetch function
  const fetchSections = useCallback(async () => {
    setRefreshing(true);
    try {
      const sectionData = await getAllSections();

      if (sectionData?.success && Array.isArray(sectionData.sections)) {
        setAllSections(sectionData.sections);

        // ✅ save to cache
        await AsyncStorage.setItem(
          'cachedSections',
          JSON.stringify(sectionData.sections),
        );
      } else {
        // ✅ fallback immediately
        const cached = await AsyncStorage.getItem('cachedSections');
        if (cached) {
          setAllSections(JSON.parse(cached));
        }
      }
    } catch (error) {
      // ❌ don’t log big error, just fallback
      const cached = await AsyncStorage.getItem('cachedSections');
      if (cached) {
        setAllSections(JSON.parse(cached));
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const loadCache = async () => {
      const cached = await AsyncStorage.getItem('cachedSections');
      if (cached) {
        setAllSections(JSON.parse(cached));
        console.log('✅ Initial cache loaded');
      }
    };
    loadCache();
  }, []);

  // Fetch on screen focus
  // useEffect(() => {
  //   if (isFocused) {
  //     fetchSections();
  //   }
  // }, [isFocused, fetchSections]);
  // Auto-polling every 15 sec
  // Auto-polling every 15 sec
  useEffect(() => {
    fetchSections(); // ✅ first load immediately when component mounts
    const interval = setInterval(() => {
      fetchSections();
    }, 15000); // 15 sec
    return () => clearInterval(interval);
  }, [fetchSections]);

  //Fetch Ads (every 10 seconds)
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const images = await getAdImages('Home');
        if (images?.length) {
          setAdData(images);
          await AsyncStorage.setItem('cachedAds', JSON.stringify(images));
        }
      } catch {
        const cached = await AsyncStorage.getItem('cachedAds');
        if (cached) setAdData(JSON.parse(cached));
      }
    };

    // load initial cache
    (async () => {
      const cached = await AsyncStorage.getItem('cachedAds');
      if (cached) setAdData(JSON.parse(cached));
    })();

    fetchAds();
    const interval = setInterval(fetchAds, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchSections} />
      }>
      <AdCarousal adData={adData} />

      {allSections.map(section => (
        <View key={section.id}>
          <View style={styles.sectionHeader}>
            <CustomText variant="h5" fontFamily={Fonts.SemiBold}>
              {section.name}
            </CustomText>
          </View>

          <CategoryContainer
            data={section.categories}
            onCategoryPress={handleCategoryPress}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 5,
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 12,
    paddingTop: 1,
    paddingBottom: 30, // gap between name and grid
  },
});

export default Content;
