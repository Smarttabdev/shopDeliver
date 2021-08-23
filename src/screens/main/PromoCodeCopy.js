import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import {useClipboard} from '@react-native-community/clipboard';
import { useSelector, useDispatch } from 'react-redux';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';

import { Screen, Button, AppText } from '~/components';
import { NavigationService } from '~/core/services';
import { MainNavigationOptions, Theme } from '~/styles';

import { setTerritoryType,cancelOrder } from '~/store/actions';
import { Config } from '~/core/config';
import { fetchAPI } from '~/core/utility';

import analytics from '@react-native-firebase/analytics';
import { AppEventsLogger } from "react-native-fbsdk-next";

export const PromoCodeCopyScreen = ({ navigation }) => {
  const promoCode = useMemo(() => navigation.getParam('promoCode'), []);
  const userInfo = useSelector(
    (state) => state.account && state.account.userInfo,
  );
  const [promoData, setString] = useClipboard();

  const order = useSelector((state) => state.order.order);
  
  useEffect(() => {
    setString(promoCode.name);
  }, []);

  const openOrder = useSelector((state) => {
    if (state.order.order && (+state.order.order.cart_amount).toFixed(2) > 0) {
      return state.order.order.order_id;
    } else {
      return false;
    }
  });

  const MyCart = () => {
    const price = useSelector(
      (state) => state.order.order && state.order.order.cart_amount,
    );
    return (+price || 0) > 0 ? (
      <Button
        type="accent"
        style={styles.myCartButton}
        icon="cart-outline"
        rightText={`${order.currency_icon}${(+price || 0).toFixed(2)}`}
        onClick={() => NavigationService.navigate('MyOrder')}>
        My Cart
      </Button>
    ) : (
      <></>
    );
  };
  
  return (
    <Screen
      stickyBottom={openOrder > 0 && (<MyCart />)}>
        <View style={styles.container}>
          <View style={{marginTop:20}}><Icon size={120} color={ Theme.color.accentColor} name="emoticon-happy-outline" /></View>
          <AppText style={{textTransform:'uppercase', fontWeight: "bold"}}>Promo code Copied</AppText>
          <View style={{}}>
            <AppText style={{marginTop:20}}>{promoCode.territory.name+"'s promo code "+promoCode.name+" has been copied. Paste the code at checkout to save "+(promoCode.discount_type=='fixed'?"$":"")+promoCode.discount+(promoCode.discount_type=='fixed'?"":"%")}</AppText>
          </View>
          <Button 
            style={{width:"100%", marginTop:20, }}
            onClick={() => {
              setString('');
              NavigationService.goBack();
            }}>
            <AppText style={{textTransform: 'uppercase', fontWeight: 'bold',}}> Exit </AppText>
          </Button>
          {/* <View style={{width:"100%"}}>{openOrder > 0 && (<MyCart />)}</View> */}
          
        </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: Theme.layout.screenPaddingTop,
    paddingBottom: Theme.layout.screenPaddingBottom,
    alignItems: 'center'
  },

  myCartButton: {
    marginHorizontal: 20,    
    marginVertical: 15,  
    position:'absolute',
    bottom:0,
    display: 'flex',
    right:0,
    left:0,
  },

  imageWrapper: {
    paddingHorizontal: 60,
    marginTop: 40,
    marginBottom: 15,
    width: '100%',
    flexDirection: 'row',
  },

  image: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 500,
  },

  sellerName: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    textTransform: 'uppercase',
  },

  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.color.accentColor,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  orderNumber: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 10,
  },

  successTitle : { 
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },

  successSubtitle : { 
    fontSize: 12,
    color: 'black',
    textAlign: 'center',
    marginTop: 20,
  },

  successButton : {
    marginTop : 20
  }
});

// PromoCodeCopyScreen.navigationOptions = {
//   headerShown: false,
// };
PromoCodeCopyScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: '',
    },
  });
