import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import { Screen, Input, AppText } from '~/components';
import { Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setToken } from '~/store/actions';

import { RegisterNavigationOptions } from '~/styles';

export const ResetPasswordEmailScreen = () => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [isLoading, setLoading] = useState(false);
  const windowWidth = Dimensions.get('window').width;
  const sendVerification = useCallback((email) => {
    setLoading(true);

    const formData = new FormData();
    formData.append('id', email);

    fetchAPI(`/myaccount/reset_password_send_code`, {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        dispatch(setToken(res.data.token));
        NavigationService.navigate('CheckEmail');
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen
      align="center"
      isLoading={isLoading}
      backgroundImage={require('~/assets/images/back5.png')} keyboardAware={true}>
      <View style={[styles.container]}>
      {windowWidth > 250 ? <View>
        <AppText style={[styles.whiteText, styles.title]}>Password Reset</AppText>
        <AppText style={[styles.whiteText, styles.subTitle]}>
          Enter your email address
        </AppText></View>
        :
        <View>
        <AppText style={[styles.whiteText, styles.smalltitle]}>Password Reset</AppText>
        <AppText style={[styles.whiteText, styles.smallsubTitle]}>
          Enter your email address
        </AppText></View>
        }
        <View style={[styles.inputWrapper]}>
          <Input
            title="Email"
            value={email}
            onChange={setEmail}
            keyboardType="email-address"
            actionIcon="chevron-right"
            actionHandler={() => sendVerification(email)}
          />
        </View>
      </View>
    </Screen>
  );
};

ResetPasswordEmailScreen.navigationOptions = ({ navigation }) =>
  RegisterNavigationOptions({
    navigation,
    options: {
      headerTitle: '',
      headerTintColor: 'white',
    },
  });

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: Theme.layout.screenPaddingTop,
    paddingBottom: Theme.layout.screenPaddingBottom,
    justifyContent: 'center',
    flex: 1,

    width: '100%',
  },

  whiteText: {
    color: 'white',
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  title: {
    fontSize: 40,
    letterSpacing: 2,
    fontWeight: '800',
  },

  subTitle: {
    fontSize: 14,
    fontWeight: 'bold',

    marginTop: 10,
  },

  
  smalltitle: {
    fontSize: 22,
    letterSpacing: 2,
    fontWeight: '800',
  },

  smallsubTitle: {
    fontSize: 11,
    fontWeight: 'bold',

    marginTop: 10,
  },


  inputWrapper: {
    marginTop: 40,
    flexGrow: 1,
    overflow: 'hidden',

    width: '100%',
  },

  button: {
    marginTop: 30,
  },
});
