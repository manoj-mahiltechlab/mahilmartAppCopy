import React, {useEffect, useState} from 'react';
import {View, FlatList, StyleSheet} from 'react-native';
import CustomText from '@components/ui/CustomText';
import axios from 'axios';
import {BASE_URL} from '@service/config';

const ProductReviews = ({route}) => {
  const {productId} = route.params;
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!productId) return;

    axios
      .get(`${BASE_URL}/reviews/${productId}`)
      .then(res => {
        // Map the reviews to include user name
        const mappedReviews = Array.isArray(res.data)
          ? res.data.map(r => ({
              id: r._id,
              comment: r.comment || 'No comment',
              user: r.userId?.name || 'Anonymous',
              rating: r.rating || 0,
            }))
          : [];
        setReviews(mappedReviews);
      })
      .catch(err => console.error('Failed to fetch reviews:', err));
  }, [productId]);

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({item}) => (
          <View style={styles.reviewCard}>
            <CustomText style={styles.reviewer}>{item.user}</CustomText>
            <CustomText>{item.comment}</CustomText>
          </View>
        )}
        ListEmptyComponent={
          <CustomText>No reviews yet for this product.</CustomText>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 12},
  reviewCard: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  reviewer: {fontWeight: 'bold', marginBottom: 4},
});

export default ProductReviews;
