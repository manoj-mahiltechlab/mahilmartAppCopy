import React from 'react';
import {View, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from './CustomText';

type RatingStarsProps = {
  rating: number; // average rating (e.g., 4.3)
  reviews?: number; // total reviews
  variant?: 'box' | 'stars'; // box = Flipkart style, stars = review row
  size?: number;
};

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  reviews = 0,
  variant = 'box',
  size = 16,
}) => {
  // ✅ Don’t render if no reviews
  if (!reviews || reviews === 0) {
    return null;
  }

  if (variant === 'box') {
    return (
      <View style={styles.row}>
        {/* Green Rating Box */}
        <View style={styles.ratingBox}>
          <CustomText style={styles.ratingText}>{rating.toFixed(1)}</CustomText>
          <Icon name="star" size={12} color="white" style={{marginLeft: 2}} />
        </View>

        {/* Reviews Count */}
        <CustomText style={styles.reviewsText}>
          {reviews} {reviews === 1 ? 'Review' : 'Reviews'}
        </CustomText>
      </View>
    );
  }

  // ⭐⭐⭐⭐⭐ (used inside reviews tab)
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    let name = 'star-outline';
    if (i <= Math.floor(rating)) {
      name = 'star';
    } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
      name = 'star-half-full';
    }
    stars.push(
      <Icon
        key={i}
        name={name}
        size={size}
        color="#FFD700"
        style={{marginRight: 2}}
      />,
    );
  }

  return <View style={styles.row}>{stars}</View>;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#388E3C', // Flipkart Green
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reviewsText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#878787', // Flipkart Gray
  },
});

export default RatingStars;
