import React, { useState,useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import { Screen, Input, Button, AppText, } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';
import { fetchAPI } from '~/core/utility';
import {
  showNotification,
  updatePromoCode
} from '~/store/actions';

export const PromoCodeEditScreen = ({ navigation }) => {
  const [isLoading, setLoading] = useState(false);
  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);
  const [promo_code, setPromoCode] = useState('');
  const dispatch = useDispatch();   
  
  useEffect(() => {
    navigation.setParams({
    action: sendPromoCode,
    actionTitle: 'Next',
    actionColor: 'black',
    });
  }, [promo_code]);

  const sendPromoCode = useCallback(() => {
    setLoading(true);
    
    const formData = new FormData();
    formData.append('promo_code', promo_code);  
    fetchAPI('/order/promo_code', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
      body: formData,
    })
      .then((res) => {
        dispatch(updatePromoCode(res.data.discount_amount));
        NavigationService.navigate('MyOrder');
      })
      .catch((err) => dispatch(showNotification({ type: 'error', message: err.message })))
      .finally(() => setLoading(false));
  }, [promo_code]);
  
  return (
    <Screen isLoading={isLoading}>
      <View style={styles.container}>
        <View style={GlobalStyles.formControl}>
        <AppText style={styles.description}>{'Enter your promo code below'}</AppText>
          <Input
            style={GlobalStyles.formControl}
            type="text"
            title="Code"
            placeholder="Promo Code"
            value={promo_code}
            onChange={setPromoCode}
          />        
        </View>
        <View style={GlobalStyles.formControl}>
          <Button
            type="accent"
            onClick={sendPromoCode}>
            Continue
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
  description: {
    fontSize: 15,
    textAlign: 'center',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
  },
});

PromoCodeEditScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Promo Code',
    },
  });