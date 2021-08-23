import React, { useState, useCallback,useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import { Screen, Input, Button, AppText } from '~/components';
import { Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setToken, setUserInfo, setOrder } from '~/store/actions';

import { AppEventsLogger } from "react-native-fbsdk-next";

export const VerifyPhoneScreen = ({navigation}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setLoading] = useState(false);
  const user = useMemo(() => navigation.getParam('user'), []);
  const deliveryMode = useMemo(() => navigation.getParam('deliveryMode'), []);
  const tip_percentage = useMemo(() => navigation.getParam('tip_percentage'), []);

  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);
  const address = useSelector((state) => state.explorer.address);
  const guestToken = useSelector((state) => state.account.guestToken);
  const tempTokenSignup = useMemo(() => navigation.getParam('token'), []);
  const windowWidth = Dimensions.get('window').width;
  const checkPhone = useCallback((token, verificationCode) => {
    AppEventsLogger.logEvent('USER ENTERS VERIFICATION CODE')
    setLoading(true);

    const formData = new FormData();
    formData.append('code', verificationCode);

    fetchAPI(`/verification/check`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${tempTokenSignup ? tempTokenSignup : (token ? token : guestToken)}`,
      },
      body: formData,
    })
      .then((res) => {       
        console.log("verification code+++++++++++++", res.data);
        if(user && guestToken){
          const formData = new FormData();
          formData.append('first_name', user.firstName);
          formData.append('last_name', user.lastName);
          formData.append('email', user.email);
          formData.append('password', user.password);
          
          fetchAPI(`/signup`, {
            method: 'POST',
            headers: {
              authorization: `Bearer ${res.data.token}`,
            },
            body: formData,
          })
            .then((res) => {

              dispatch(
                setUserInfo({
                  uuid: res.data.uuid,
                  firstName: res.data.first_name,
                  lastName: res.data.last_name,
                  phone: res.data.phone,
                  email: res.data.email,
                  creditcard: res.data.creditcard,
                  totalOrders: res.data.total_orders,
                  user_verified: res.data.user_verified,
                  user_active: res.data.user_active
                }),
              );

              const signupToken = res.data.token;

              const formData = new FormData();
              formData.append('address', address);

              fetchAPI(`/order/address`, {
                method: 'POST',
                headers: {
                  authorization: `Bearer ${signupToken}`,
                },
                body: formData,
              })
                .then((res) => {
                  
                  dispatch(setOrder(res.data));
                  dispatch(setToken(signupToken));

                  NavigationService.navigate('Account/CreditCard',{
                    deliveryMode : deliveryMode,
                    tip_percentage: tip_percentage
                  });
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

              
            })
            .catch((err) =>
              dispatch(showNotification({ type: 'error', message: err.message })),
            )
            .finally(() => setLoading(false));
        }else{
          dispatch(setToken(res.data.token));
          dispatch(
            setUserInfo({
              uuid: res.data.uuid,
              firstName: res.data.first_name,
              lastName: res.data.last_name,
              phone: res.data.phone,
              email: res.data.email,
              creditcard: res.data.creditcard,
              totalOrders: res.data.total_orders,
              user_verified: res.data.user_verified,
              user_active: res.data.user_active
            }),
          );
          if (res.data.last_order_data) {
            dispatch(setOrder(res.data.last_order_data));
          }
          NavigationService.reset('Home');
        } 
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    console.log("aaaaaaaaaaaaaaa", windowWidth);
  }, [windowWidth])
  return (
    <Screen
      isLoading={isLoading}
      backgroundImage={require('~/assets/images/back5.png')} keyboardAware={true}>
      <View style={[styles.container]}>
         {windowWidth > 350 ? <View>
          <AppText style={[styles.whiteText, styles.title]}>
            Verify{`\n`}Your{`\n`}Number
          </AppText>
          <AppText style={[styles.whiteText, styles.subTitle]}>
            Enter the code we sent
          </AppText>
          </View> : <View>
          <AppText style={[styles.whiteText, styles.smalltitle]}>
            Verify{`\n`}Your{`\n`}Number
          </AppText>
          <AppText style={[styles.whiteText, styles.smallsubTitle]}>
            Enter the code we sent
          </AppText>
          </View>}
        <View style={styles.inputWrapper}>
          <Input
            title="Code"
            placeholder="XXXXXX"
            value={verificationCode}
            onChange={setVerificationCode}
            keyboardType="number-pad"
            actionIcon="chevron-right"
            actionHandler={() => checkPhone(token, verificationCode)}
          />
        </View>
        <Button
          type="borderless"
          style={styles.button}
          onClick={() => NavigationService.goBack()}>
          I didn't get the code
        </Button>
      </View>
    </Screen>
  );
};

VerifyPhoneScreen.navigationOptions = {
  headerShown: false,
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: Theme.layout.screenPaddingTop,
    paddingBottom: Theme.layout.screenPaddingBottom,
    flex: 1,

    width: '100%',
  },

  whiteText: {
    color: 'white',
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  title: {
    fontSize: 35,
    letterSpacing: 2,
    fontWeight: '800',
  },

  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },

  smalltitle: {
    fontSize: 20,
    letterSpacing: 1,
    fontWeight: '800',
  },

  smallsubTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
  },

  inputWrapper: {
    marginTop: 40,
    overflow: 'hidden',

    width: '100%',
  },

  button: {
    marginTop: 30,
  },
});
