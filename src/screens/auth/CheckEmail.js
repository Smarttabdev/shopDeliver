import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import { Screen, Input, AppText } from '~/components';
import { Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setToken } from '~/store/actions';

import { RegisterNavigationOptions } from '~/styles';

export const CheckEmailScreen = () => {
  const dispatch = useDispatch();

  const [code, setCode] = useState('');
  const [isLoading, setLoading] = useState(false);
  const token = useSelector((state) => state.account.token);

  const sendCode = useCallback((code) => {
    setLoading(true);

    const formData = new FormData();
    formData.append('code', code);

    fetchAPI(`/myaccount/reset_password_check_code`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => {
        dispatch(setToken(res.data.token));
        NavigationService.navigate('ResetPassword');
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
      backgroundImage={require('~/assets/images/back5.png')}>
      <View style={[styles.container]}>
        <AppText style={[styles.whiteText, styles.title]}>Check your email</AppText>
        <AppText style={[styles.whiteText, styles.subTitle]}>
          Enter the code we just sent
        </AppText>
        <View style={[styles.inputWrapper]}>
          <Input
            title="Code"
            value={code}
            onChange={setCode}
            keyboardType="number-pad"
            actionIcon="chevron-right"
            actionHandler={() => sendCode(code)}
          />
        </View>
      </View>
    </Screen>
  );
};

CheckEmailScreen.navigationOptions = ({ navigation }) =>
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
