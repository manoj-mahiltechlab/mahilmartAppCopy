import {View, StyleSheet, TouchableOpacity} from 'react-native';
import React, {FC} from 'react';
import {Colors, Fonts} from '@utils/Constants';
import CustomText from '@components/ui/CustomText';

interface TabBarProps {
  selectedTab: 'available' | 'accepted' | 'delivered';
  onTabChange: (tab: 'available' | 'accepted' | 'delivered') => void;
}

const TabBar: FC<TabBarProps> = ({selectedTab, onTabChange}) => {
  return (
    <View style={styles.tabContainer}>
      {/* Available Orders */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.tab,
          styles.leftTab,
          selectedTab === 'available' && styles.activeTab,
        ]}
        onPress={() => onTabChange('available')}>
        <CustomText
          numberOfLines={1}
          ellipsizeMode="tail"
          variant="h8"
          fontFamily={Fonts.SemiBold}
          style={[
            styles.tabText,
            selectedTab === 'available'
              ? styles.activeTabText
              : styles.inactiveTabText,
          ]}>
          Available
        </CustomText>
      </TouchableOpacity>

      {/* Accepted Orders */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.tab,
          styles.middleTab,
          selectedTab === 'accepted' && styles.activeTab,
        ]}
        onPress={() => onTabChange('accepted')}>
        <CustomText
          numberOfLines={1}
          ellipsizeMode="tail"
          variant="h8"
          fontFamily={Fonts.SemiBold}
          style={[
            styles.tabText,
            selectedTab === 'accepted'
              ? styles.activeTabText
              : styles.inactiveTabText,
          ]}>
          Accepted
        </CustomText>
      </TouchableOpacity>

      {/* Delivered Orders */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.tab,
          styles.rightTab,
          selectedTab === 'delivered' && styles.activeTab,
        ]}
        onPress={() => onTabChange('delivered')}>
        <CustomText
          numberOfLines={1}
          ellipsizeMode="tail"
          variant="h8"
          fontFamily={Fonts.SemiBold}
          style={[
            styles.tabText,
            selectedTab === 'delivered'
              ? styles.activeTabText
              : styles.inactiveTabText,
          ]}>
          Delivered
        </CustomText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.border,
    // overflow: 'hidden',  ❌ remove this
  },
  tab: {
    flex: 1, // equal space for all
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  leftTab: {
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
    borderRightWidth: 1,
    borderColor: Colors.border,
  },
  middleTab: {
    borderRightWidth: 1,
    borderColor: Colors.border,
  },
  rightTab: {
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
  },
  activeTab: {
    backgroundColor: Colors.secondary,
  },
  tabText: {
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  activeTabText: {
    color: '#fff',
  },
  inactiveTabText: {
    color: Colors.disabled,
  },
});

export default TabBar;
