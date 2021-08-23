import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  View,
  StyleSheet,
  FlatList, 
  TouchableOpacity,
} from 'react-native';
import { NavigationService } from '~/core/services';
import { Screen, Input, Button, AppText, } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchAPI } from '~/core/utility';
import {
  showNotification,
} from '~/store/actions';
import { DashedLine, Review } from '../../components';

export const ReviewsScreen = ({ navigation }) => {
  const [isLoading, setLoading] = useState(false);
  const [productReview, setProductReview] = useState({});
  const token = useSelector((state) => state.account.token);
  const reviewUpdated = useSelector((state) =>  state.notification.updatedReview);
  const userInfo = useSelector((state) => state.account.userInfo);
  const guestToken = useSelector((state) => state.account.guestToken);
  const [available, setAvailable] =  useState();
  // const order = useSelector((state) => state.order.order);   
  const productId = useMemo(() => navigation.getParam('product_id'), []);
  const dispatch = useDispatch();

  useEffect(() => { 
    setLoading(true);
    setAvailable(false);
    fetchAPI(`/product_reviews?product=${productId}`, {
      method: 'POST',
    })
    .then((res) => {
      setProductReview(res.data);
      console.log("_reviesw++++++",res.data);   
    })
    .catch((err) =>
        dispatch(
          showNotification({
            type: 'error',
            message: err.message,
            options: { align: 'right' },
          }),
        ),
      )
    .finally(() => setLoading(false));   
   
    setLoading(true);
    fetchAPI(`/product_reviews/user_can_review?product=${productId}`, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
    })
   .then((res) => {
      if(res.success == true)
      {
        setAvailable(true);
      } else {
        setAvailable(false);
      }
    })
    .finally(() => setLoading(false)); 
  }, [dispatch,productId,token, reviewUpdated]);

  return (
    productReview.reviews && productReview.reviews.length == 0 ?
    <Screen isLoading={isLoading} hasList={productReview.reviews && productReview.reviews.length > 0} 
    stickyHeader={
      available == true && (  
       <View style={styles.reviewButtonNothing}>
         <AppText style={styles.reasonNothing} numberOfLines={1}>
           Since you purchased this you can add a review.
        </AppText>         
        <Button
          type="bordered-dark"
          onClick={() => NavigationService.navigate('MyReview',{productId: productId, reviewCnt: productReview.reviews.length})}>
          Add A Review
        </Button>        
      </View>)} >      
    </Screen> 
    :
    <Screen isLoading={isLoading} hasList={productReview.reviews && productReview.reviews.length > 0} 
    
    stickyHeader={
      available == true && (
       <View style={styles.reviewButton}>
         <AppText style={styles.reason} numberOfLines={1}>
           Since you purchased this you can add a review.
        </AppText>
         
        <Button
          type="bordered-dark"
          onClick={() => NavigationService.navigate('MyReview',{productId: productId, reviewCnt: productReview.reviews.length})}>
          Add A Review
        </Button>        
      </View>)} >
      {available == true ?
      <View style={styles.containerNothing}>
        <FlatList
            style={styles.availableSellers}
            data={productReview.reviews}
            keyExtractor={(item, index) => index.toString()}     
            renderItem={({ item, index }) => (<View style={styles.contentReview}>
              <TouchableOpacity
                style={styles.reviewItem}
                activeOpacity={0.8}
                onPress={() => userInfo && item.uuid == userInfo.uuid &&
                  NavigationService.navigate('MyReview',{
                  rating: item.rating,
                  review_text: item.review_text,
                  review_id : item.rid
                })}>
                <Review review={item} />             
              </TouchableOpacity>
              {productReview.reviews.length > index+1 && <DashedLine/>}
              </View>
            )}
        />       
      </View> : <View style={styles.container}>
        <FlatList
            style={styles.availableSellers}
            data={productReview.reviews}
            keyExtractor={(item, index) => index.toString()}     
            renderItem={({ item, index }) => (<View style={styles.contentReview}>
              <TouchableOpacity
                style={styles.reviewItem}
                activeOpacity={0.8}
                onPress={() => userInfo && item.uuid == userInfo.uuid &&
                  NavigationService.navigate('MyReview',{
                  rating: item.rating,
                  review_text: item.review_text,
                  review_id : item.rid
                })}>
                <Review review={item} />             
              </TouchableOpacity>
              {productReview.reviews.length > index+1 && <DashedLine/>}
              </View>
            )}
        />       
      </View> }
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: '#FFF',    
    paddingTop: Platform.OS === 'ios' ? 90 : 70,
  },
  
  containerNothing: {
    flex:1,
    backgroundColor: '#FFF',    
  },

  availableSellers: {
    flexDirection:'column',
    backgroundColor:'#FFF'
  },

  contentReview: {
    flexDirection:'column',
  },

  reviewItem : {
    padding: 10,
    marginBottom: 10
  },

  reviewButtonNothing: {
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,    
    flexDirection: 'column',
    paddingTop: Platform.OS === 'ios' ? 90 : 70,
  },

  reviewButton: { 
    paddingHorizontal: 20,
    paddingVertical: 10,    
    flexDirection: 'column',
    paddingTop: Platform.OS === 'ios' ? 90 : 70,

  },

  reason: {    
    color:'grey',
    fontSize:14,
    marginBottom: 10
  },
  
  reasonNothing: {
    textAlign: 'center',
    color:'grey',
    fontSize:14,
    marginBottom: 10
  }
});

ReviewsScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: navigation.getParam('reviewsPageTitle'),
    },
  });
