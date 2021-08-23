import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import { Screen, Input, Button, AppText } from '~/components';
import { GlobalStyles, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { setToken, setUserInfo, showNotification, setOrder } from '~/store/actions';
import { RegisterNavigationOptions } from '~/styles';

export const CheckPasswordScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setLoading] = useState(false);

  const phoneNumber = useSelector((state) => state.account.phone);
  const navigateTo = useMemo(() => navigation.getParam('navigateTo'), []);
  const signInToken = useMemo(() => navigation.getParam('token'), []);
  const address = useSelector((state) => state.explorer.address);

  const dispatch = useDispatch();

  const signIn = useCallback((password) => {
    setLoading(true);

    const formData = new FormData();
    formData.append('id', phoneNumber);
    formData.append('password', password);
    
    let headers = {};
    if(signInToken)
    headers = {
      authorization: `Bearer ${signInToken}`,
    };
    fetchAPI(`/login`, {
      method: 'POST',
      body: formData,
      headers : headers
    })
      .then((res) => {
        console.log(res.data);
        const loginToken = res.data.token;
        const userDetails = {
          uuid: res.data.uuid,
          firstName: res.data.first_name,
          lastName: res.data.last_name,
          phone: res.data.phone,
          email: res.data.email,
          creditcard: res.data.creditcard,
          totalOrders: res.data.total_orders,
          user_verified: res.data.user_verified
        };

        if (res.data.last_order_data) {
          dispatch(setOrder(res.data.last_order_data));
        }

        if(!signInToken){
          dispatch(setToken(loginToken));
          dispatch(
            setUserInfo(userDetails),
          );
        }
        
        if(signInToken){
          const formData = new FormData();
          formData.append('address', address);

          fetchAPI(`/order/address`, {
            method: 'POST',
            headers: {
              authorization: `Bearer ${loginToken}`,
            },
            body: formData,
          })
            .then((res) => {
              dispatch(setOrder(res.data));
              dispatch(setToken(loginToken));
              dispatch(
                setUserInfo(userDetails),
              );
              

              if(navigateTo)
              NavigationService.navigate(navigateTo);
              else
              NavigationService.reset('Home');

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
        }else{
          if(navigateTo)
          NavigationService.navigate(navigateTo);
          else
          NavigationService.reset('Home');
        }
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen
      isLoading={isLoading}
      backgroundImage={require('~/assets/images/back5.png')}>
      <View style={[styles.container]}>
        <AppText style={[styles.whiteText, styles.title]}>Welcome Back</AppText>
        <AppText style={[styles.whiteText, styles.subTitle]}>
          Please enter your password
        </AppText>
        <View style={styles.inputWrapper}>
          <Input
            title="Password"
            type="password"
            keyboardType="default"
            value={password}
            onChange={setPassword}
            style={GlobalStyles.formControl}
            actionIcon="chevron-right"
            actionHandler={() => signIn(password)}
          />
        </View>
        <Button
          type="borderless"
          style={[styles.button]}
          onClick={() => {
            NavigationService.navigate('ResetPasswordEmail');
          }}>
          I Forgot My Password
        </Button>
      </View>
    </Screen>
  );
};

CheckPasswordScreen.navigationOptions = ({ navigation }) =>
  RegisterNavigationOptions({
    navigation,
    options: {
      headerTitle: '',
    },
  });

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: Theme.layout.screenPaddingTop,
    paddingBottom: Theme.layout.screenPaddingBottom,
    flex: 1,

    width: '100%',
  },

  button: {
    marginTop: 30,
  },

  whiteText: {
    color: 'white',
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  title: {
    fontSize: 36,
    letterSpacing: 2,
    fontWeight: '800',
  },

  subTitle: {
    fontSize: 14,
    fontWeight: 'bold',

    marginTop: 10,
  },

  inputWrapper: {
    marginTop: 40,
    overflow: 'hidden',

    width: '100%',
  },
});
