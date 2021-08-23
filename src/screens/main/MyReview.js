import React, { useState,useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Rating } from 'react-native-ratings';
import { NavigationService } from '~/core/services';
import { Screen, Input, Button, AppText, } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';
import { fetchAPI } from '~/core/utility';
import {
  showNotification,
  setOrder,
  setAddedReview,
} from '~/store/actions';

export const MyReviewScreen = ({ navigation }) => {
  const [isLoading, setLoading] = useState(false);
  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);
  const productId = useMemo(() => navigation.getParam('productId'), []);
  const reviewCnt = useMemo(() => navigation.getParam('reviewCnt'), []);
  const reviewId = useMemo(() => navigation.getParam('review_id'), []);
  const rating_original = useMemo(() => navigation.getParam('rating'), []);
  const reviewText_original = useMemo(() => navigation.getParam('review_text'), []);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    if(rating_original)
    {
      setRating(rating_original);
    } else {
      setRating(0);
    }
    setReviewText(reviewText_original);
    
  }, [reviewText_original,rating_original,reviewId]);
  
  useEffect(() => {
    navigation.setParams({
    action: saveReviews,
    actionTitle: 'ADD',
    actionColor: 'black',
    });
  }, [reviewText,rating]);

  const updateReviews = useCallback(() => {
    setLoading(true);
    
    const formData = new FormData();
    formData.append('rating', rating);
    formData.append('review_text', reviewText);
    formData.append('review_id', reviewId);
    fetchAPI('/product_reviews/edit', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
      body: formData,
    })
      .then((res) => {
        // dispatch(setOrder(res.data));
        // dispatch(updatedInstructions(instructions));
        dispatch(setAddedReview(reviewText+rating));
        NavigationService.navigate('Reviews');
      })
      .catch((err) => dispatch(showNotification( {type: 'error',
      message: err.message,})))
      .finally(() => setLoading(false));
  }, [reviewText, rating, reviewId, dispatch]);

  const saveReviews = useCallback(() => {
    setLoading(true);
    
    const formData = new FormData();
    formData.append('rating', rating);
    formData.append('review_text', reviewText);
    formData.append('product_id', productId);
    fetchAPI('/product_reviews/add', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
      body: formData,
    })
      .then((res) => {
        // dispatch(setOrder(res.data));
        // dispatch(updatedInstructions(instructions));
        dispatch(setAddedReview(reviewText+rating));
        if(reviewCnt == 0){
          NavigationService.navigate('Product',{productId: productId});
        }
        else {
          NavigationService.navigate('Reviews',{reviewsPageTitle:  (reviewCnt + 1) + ((reviewCnt+1) < 2 ? ' Review' : ' Reviews') });
        }
      })
      .catch((err) => dispatch(showNotification( {type: 'error',
      message: err.message,})))
      .finally(() => setLoading(false));
  }, [reviewText,rating,reviewCnt,dispatch]);
  
  return (
    <Screen isLoading={isLoading}>
      <View style={styles.container}>
        <Rating
          type='star'
          ratingCount={5}
          imageSize={30}
          style={styles.ratingStyle}
          onFinishRating={setRating}
          startingValue={rating}
          fractions = {0}
          style={{paddingVertical: 10}}
          ratingBackgroundColor={{color:'#FFF'}}
        />
          <View style={GlobalStyles.formControl}>
          <Input
            type="textarea"
            title="Review"
            placeholder="Let everyone know what you think of this product"
            value={reviewText}
            onChange={setReviewText}
          />
        </View>
        <View style={GlobalStyles.formControl}>
          <Button
            type="accent"
            onClick={reviewId ? updateReviews: saveReviews}>
            Add My Review
          </Button>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: Theme.layout.screenPaddingTop,
    paddingBottom: Theme.layout.screenPaddingBottom,
  },
});

MyReviewScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'My Review',
    },
  });