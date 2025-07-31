import React from 'react';
import {View, StyleSheet, Image, Dimensions, Text} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const screenWidth = Dimensions.get('window').width;
const customWidth = screenWidth + 20;

const AdCarousal = ({adData = []}: {adData: string[]}) => {
  if (!adData || adData.length === 0) {
    return <Text style={styles.noAds}>No Ads Available</Text>;
  }

  const isSingle = adData.length === 1;

  return (
    <View style={styles.wrapper}>
      <Carousel
        width={customWidth}
        height={245}
        data={adData}
        autoPlay={!isSingle}
        autoPlayInterval={3000}
        loop={!isSingle}
        scrollAnimationDuration={800}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 40,
        }}
        renderItem={({item}) => (
          <View style={styles.imageContainer}>
            <Image source={{uri: item}} style={styles.image} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 10,
    alignSelf: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noAds: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
    color: 'gray',
  },
});

export default AdCarousal;
