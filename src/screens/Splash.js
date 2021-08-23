import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import { Screen, AppText } from '~/components';

import { fetchAPI } from '~/core/utility';
import { setUserInfo, setToken, signOut, setOrder } from '~/store/actions';
import { Theme } from '~/styles';

export const SplashScreen = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);

  useEffect(() => {
    if (token) {
      fetchAPI('/token', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          console.log('_____verified______token+++++++',res.data);
          if (res.data.user_active || res.data.user_verified) {
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
            console.log('___________token+++++++',res.data);
            setTimeout(() => NavigationService.reset('Home'), 3000);
          } else {
            dispatch(signOut());
            setTimeout(() => NavigationService.reset('GetAccess'), 3000);
          }
        })
        .catch(() => {
          dispatch(signOut());
          setTimeout(() => NavigationService.reset('GetAccess'), 3000);
        });
    } else {
      setTimeout(() => NavigationService.reset('GetAccess'), 3000);
    }
  }, []);

  if (token) {
    return (
      <Screen
        align="center"
        backgroundImage={require('~/assets/images/back2.jpg')}>
        <View style={styles.container}>
          <AppText style={[styles.heading]}>SHOP</AppText>
          <AppText style={[styles.heading]}>LOCAL</AppText>
          <AppText style={[styles.heading, styles.accentColor]}>ONLINE</AppText>
          <AppText style={styles.subheading}>Goods & Food</AppText>
        </View>
      </Screen>
    );
  } else {
    return (
      <Screen
        align="center"
        backgroundImage={require('~/assets/images/back6.jpg')}>
        <View style={styles.container}>
          <Image
            source={require('~/assets/images/logo-light.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <AppText style={styles.subheading}>SHOP LOCAL ONLINE™</AppText>
        </View>
      </Screen>
    );
  }
};

SplashScreen.navigationOptions = {
  headerShown: false,
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: Theme.layout.screenPaddingTop,
    paddingBottom: Theme.layout.screenPaddingBottom,

    display: 'flex',
    minHeight: '100%',
  },

  logo: {
    width: '80%',
    height: 80,
    resizeMode: 'contain',
    margin: 'auto',
  },

  accentColor: {
    color: Theme.color.accentColor,
  },

  heading: {
    color: '#FFF',
    fontSize: 40,
    letterSpacing: 2,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  subheading: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
