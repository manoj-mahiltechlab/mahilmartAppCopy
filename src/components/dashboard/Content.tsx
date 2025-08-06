import {View, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import React, {FC, useEffect, useState, useCallback} from 'react';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';

import AdCarousal from './AdCarousal';
import CustomText from '@components/ui/CustomText';
import {Fonts} from '@utils/Constants';
import CategoryContainer from './CategoryContainer';
import {getAdImages, getAllSections} from '@service/authService';

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
  const isFocused = useIsFocused();
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
        //    console.log('✅ Sections updated:', sectionData.sections);
      } else {
        setAllSections([]);
        console.warn('⚠️ No sections found');
      }
    } catch (error) {
      console.error('❌ Failed to fetch sections:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Fetch on screen focus
  useEffect(() => {
    if (isFocused) {
      fetchSections();
    }
  }, [isFocused, fetchSections]);
  // Auto-polling every 15 sec
  useEffect(() => {
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

        setAdData(images);
      } catch (error) {
        console.error('❌ Failed to fetch ad images:', error);
      }
    };

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
