import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet,Image, FlatList, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { Screen, Input, Button, MessageTerritoryItem, LoadingGIF } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, subscriptionAddressUpdated as subTipUpdated, subscriptionCancelled} from '~/store/actions';
import { NavigationService } from '~/core/services';
import { DashedLine, AppText, SubscriptionItem} from '../../components';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HeaderStyleInterpolators } from 'react-navigation-stack';

export const SubscriptionScreen = ({ navigation }) => {

    const [isLoading, setLoading] = useState(false);
    const [subscription, setSubscription] = useState(false);
    const dispatch = useDispatch();
    const item = navigation.getParam('item');
    const token = useSelector((state) => state.account.token);
    const subscriptionAddressUpdated = useSelector((state) => state.notification.subscriptionAddressUpdated);
    useEffect(() => {   
        dispatch(subTipUpdated(false));     
        setLoading(true);        
        if(token){
           
        const formData = new FormData();
        formData.append('subscription_id', item.sid);

        fetchAPI('/subscription', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: formData
        })
        .then((res) => {
            console.log("aaaaaaaaaaaaa222222222222",res.data.subscription.territory.tid);
            setSubscription(res.data.subscription);
        })
        .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
        
      }
    }, [token,subscriptionAddressUpdated,dispatch]);

    const cancelSubscrption = useCallback(() => {
    setLoading(true);
    const formData = new FormData();
    formData.append('subscription_id',item.sid);
        fetchAPI('/subscription/cancel', {
            method: 'POST',
            headers: {
            authorization: `Bearer ${token}`,
            },
            body: formData,
        })
        .then((res) => {
        dispatch(subscriptionCancelled(true));
        dispatch(showNotification({ type: 'success', message: res.message }));
        NavigationService.navigate('PastOrders')
        })
        .catch((err) =>
        dispatch(
        showNotification({
            type: 'error',
            message: err.message,
        }),
        ),
    )
    .finally(() => setLoading(false));
    });
  return (
    <Screen isLoading={isLoading} keyboardAware={true}>
      
        <View style={styles.container}>
            <SubscriptionItem
                subscription={item}
                onPress={() => {
                    console.log("Subscription clicked");
                }}
            /> 
            {subscription && 
            <View>
                <View style={{marginTop: 20}}>
                    <View style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
                        <AppText style={styles.plan}>{subscription.type_name_every}</AppText>
                        <AppText style={styles.title}>Subscription</AppText>
                    </View>
                    <View style={{marginTop: 10}}>
                        <AppText style={{fontSize: 11, color: "grey", fontStyle: 'italic'}}>Renews on the 1st of { <AppText style={{ textTransform: 'lowercase'}}>{subscription.type_name_every_full}</AppText>}, Cancel any time</AppText>
                    </View>
                </View> 
                
                <View style={{flexDirection: "row", marginTop: 10, flex: 1}}>
                    <View style={{marginTop: 10, flex: 1}}>
                        <AppText style={styles.heading}>Ordered By:</AppText>
                        <AppText style={styles.text}>{subscription.user_full_name}</AppText>
                        <AppText style={styles.text}>{subscription.user_phone}</AppText>
                    </View>
                    <View style={{marginTop: 10, flex: 1, paddingLeft:20}}>
                        <AppText style={styles.heading}>Delivery Address</AppText>
                        <AppText style={styles.text}>{subscription.full_address}
                            {subscription.status == 'Open'  && <AppText style={styles.link} onPress={()=> NavigationService.navigate('Location',{editSubscription: true,subscription_id: subscription.sid,delivery_type: subscription.delivery_type, territory_id: subscription.territory.tid})}> Edit</AppText>}
                        </AppText>
                    </View>
                </View>

                <View style={{flexDirection: "row", flex:1, marginBottom: 10}}>
                    <View style={{marginTop: 10, flex: 0.5}}>
                        <AppText style={styles.heading}>Credit Card</AppText>
                        <AppText style={styles.text}>{subscription.creditcard} - 
                            {subscription.status == 'Open'  && <AppText style={styles.link} onPress={()=>NavigationService.navigate('Account/CreditCard',{editSubscription: true,subscription_id: subscription.sid})}> Update</AppText>}
                        </AppText>
                    </View>
                    <View style={{marginTop: 10, flex: 0.5,paddingLeft:20}}>
                        <AppText style={styles.heading}>Last Charged</AppText>
                        <AppText style={styles.text}>{subscription.last_charged_formatted}</AppText>
                    </View>
                </View>
                <DashedLine/>
                <View style={{marginTop: 10,width:'55%'}}>
                    <AppText style={{...styles.text, marginTop: 5}}>{subscription.name}</AppText>
                </View>
                <View style={{paddingBottom: 5, flexDirection: 'row', flex: 1, alignItems: 'center',marginBottom:10}}>
                    <View style={{flex: 0.7}}>
                        <AppText style={{  color: 'grey',fontSize: 12, marginTop:0}}>{subscription.product_option_name}</AppText>
                    </View>
                    <View style={{flex: 0.3}}>
                        <AppText style={styles.text,{marginTop:-20}}>{subscription.quantity}</AppText>
                    </View>
                    <View>
                        <AppText style={{...styles.price,marginTop:-20}}>{subscription.product_price_formatted}</AppText>
                    </View>
                </View>
                <DashedLine/>
                <View style={{marginTop: 10, marginBottom: 10}}>
                    <View style={styles.priceContainer}>
                        <AppText style={{...styles.text, flex: 1}}>Delivery</AppText>
                        <AppText style={styles.price}>{subscription.delivery_amount_formatted}</AppText>
                    </View>
                    <View style={styles.priceContainer}>
                        <AppText style={{...styles.text, flex: 1}}>Tax</AppText>
                        <AppText style={styles.price}>{subscription.tax_amount_formatted}</AppText>
                    </View>
                    <View style={styles.priceContainer}>
                        <AppText style={{...styles.text, flex: 1}}>Tip ({subscription.tip_percentage}%) -  
                        {subscription.status == 'Open' &&  <AppText style={styles.link}
                            onPress={() => {
                                NavigationService.navigate('SelectorPercentPage', {
                                title: 'Tip',
                                header: 'HOW MUCH WOULD YOU LIKE TO TIP?',
                                options: [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100].map((item) => ({
                                    label: item+'%',
                                    value: item,
                                    selected: subscription.tip_percentage == item ? 'selected' : '',
                                })),
                                action: (value) => { 
                                    setLoading(true);
                                    const formData = new FormData();
                                    formData.append('subscription_id', subscription.sid);
                                    formData.append('tip_percentage', value);
                                    fetchAPI('/subscription/update_tip_percentage', {
                                    method: 'POST',
                                    headers: {
                                        authorization: `Bearer ${token}`,
                                    },
                                    body: formData,
                                    })
                                    .then((res) => {
                                        dispatch(showNotification({ type: 'success', message: res.message }));

                                        dispatch(subTipUpdated(true));
                                    })
                                    .catch((err) =>
                                    dispatch(
                                        showNotification({
                                        type: 'error',
                                        message: err.message,
                                        }),
                                    ),
                                    )
                                    .finally(() => setLoading(false));
                                },
                                noOptionsText: 'No Options Available',
                                });
                            }}
                            >Edit</AppText>}
                        </AppText>
                        <AppText style={styles.price}>{
                        `${
                            subscription.currency_icon
                            } ${(+subscription.price*subscription.tip_percentage/100).toFixed(
                                2,
                            )}`}</AppText>

                    </View>
                    <View style={styles.priceContainer}>
                        <AppText style={{...styles.text, flex: 1}}>Total</AppText>
                        <AppText style={styles.price}>{`${
                            subscription.currency_icon
                            } ${(+subscription.price+(subscription.price*subscription.tip_percentage)/100).toFixed(
                                2,
                            )}`}</AppText>
                    </View>
                </View>
                {subscription.status == 'Open' ?            
                <Button
                    type="white"
                    style={{marginTop: 20,marginBottom:15}}
                    fullWidth   
                    onClick={() => cancelSubscrption()}>
                    CANCEL SUBSCRIPTION
                    </Button>
                    :  <View style={styles.closedStore}>
                        <AppText style={styles.closedText}>
                        Subscription Already {subscription.status}
                        </AppText>            
                    
                        </View>
            }
            </View> 
         }
        </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: 90
  },
  heading: {
      color: 'grey',
      fontSize: 13,
      marginBottom: 10
  },
  text: {
    color: '#333',
    fontSize : 14
  },
  link: {
      color: "#31D457",
      fontWeight: 'bold'
  },
  price: {
      fontWeight: 'bold'
  },
  priceContainer: {
    flexDirection: 'row',
    flex: 1, 
    alignItems: 'center',
     marginTop: 10
  },
  plan: {
    backgroundColor: "#fd0", 
    paddingHorizontal: 20,
    paddingTop : 5, 
    paddingBottom: 5, 
    fontSize:12, 
    fontWeight: 'bold'
  },

  title: {
    fontWeight: 'bold', 
    fontSize: 14, 
    marginLeft: 15
  },

    closedText: {
    color: 'white',
    fontSize: 17,
    textAlign:'center',
    fontWeight: 'bold',
    },

    closedStore: {    
    height:50,
    marginTop:20,
    paddingTop:10,
    backgroundColor: 'black',
    flexDirection: 'column',
    alignItems:"center"
    },

});

SubscriptionScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'SUBSCRIPTION',
    },
  });