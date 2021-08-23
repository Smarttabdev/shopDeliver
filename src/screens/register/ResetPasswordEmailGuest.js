import React, { useState,useEffect,useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import { Screen, Input, AppText,Button } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setToken } from '~/store/actions';


export const ResetPasswordEmailGuestScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const deliveryMode = useMemo(() => navigation.getParam('deliveryMode'), []);
  const tip_percentage = useMemo(() => navigation.getParam('tip_percentage'), []);
  const [email, setEmail] = useState('');
  const [isLoading, setLoading] = useState(false);

  const sendVerification = useCallback(() => {
    setLoading(true);

    const formData = new FormData();
    formData.append('id', email);

    fetchAPI(`/myaccount/reset_password_send_code`, {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        dispatch(setToken(res.data.token));
        NavigationService.navigate('CheckEmailGuest', {
          deliveryMode: deliveryMode,
          tip_percentage: tip_percentage,
        });
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, [email]);

  useEffect(() => {
    navigation.setParams({
    action: sendVerification,
    actionTitle: 'NEXT',
    actionColor: 'black',
    });
  }, [email]);

  return (
    <Screen
      isLoading={isLoading}>
      <View style={[styles.container]}>
        <AppText style={styles.formHeading}>Reset your password</AppText>
        <AppText style={styles.description}>
          Enter the email address below to start the password reset process.
        </AppText>

        <Input
          style={GlobalStyles.formControl}
          title="Email"
          keyboardType="email-address"
          value={email}
          onChange={setEmail}
          style={GlobalStyles.formControl}   
        />
        <Button 
          type="accent" 
          style={styles.button}
          onClick={sendVerification}>
          CONTINUE</Button>
      </View>
    </Screen>
  );
};

ResetPasswordEmailGuestScreen.navigationOptions = ({ navigation }) =>
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
    // textTransform: 'uppercase',
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
