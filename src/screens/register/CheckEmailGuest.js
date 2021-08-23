import React, { useState,useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import { Screen, Input, Button, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setToken } from '~/store/actions';


export const CheckEmailGuestScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const [code, setCode] = useState('');
  const [isLoading, setLoading] = useState(false);
  
  const deliveryMode = useMemo(() => navigation.getParam('deliveryMode'), []);
  const tip_percentage = useMemo(() => navigation.getParam('tip_percentage'), []);
  const token = useSelector((state) => state.account.token);

  const sendCode = useCallback(() => {
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
        NavigationService.navigate('ResetPasswordGuest', {
          deliveryMode: deliveryMode,
          tip_percentage: tip_percentage,
        });
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, [code]);

  useEffect(() => {
    navigation.setParams({
    action: sendCode,
    actionTitle: 'VERIFY',
    actionColor: 'black',
    });
  }, [code]);

  return (
    <Screen
    isLoading={isLoading}>
    <View style={[styles.container]}>
      <AppText style={styles.formHeading}>Verification code needed</AppText>
      <AppText style={styles.description}>
        Enter the code we sent to your email. You might have to check your spam folder.
      </AppText>

      <Input
        style={GlobalStyles.formControl}
        title="Code"
        keyboardType="number-pad"
        value={code}
        onChange={setCode}
        style={GlobalStyles.formControl}   
      />
      <Button 
        type="accent" 
        style={styles.button}
        onClick={sendCode}>
        VERIFY</Button>
    </View>
  </Screen>
   
  );
};

CheckEmailGuestScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Account',
    },
  });

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: Theme.layout.screenPaddingTop,
    paddingBottom: Theme.layout.screenPaddingBottom,
  },

  button : {
    marginTop : 10
  },

  formHeading : {
    fontWeight: 'bold',
    textAlign: 'center',
    //textTransform: 'uppercase',
    fontSize: 16,
    width: '80%',
    alignSelf: 'center',
    marginBottom: 10
  },

  description: {
    fontSize: 15,
    textAlign: 'center',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
  },
});
