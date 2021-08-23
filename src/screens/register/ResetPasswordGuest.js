import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import { Screen, Input, AppText,Button } from '~/components';

import { fetchAPI } from '~/core/utility';
import { showNotification,setDescriptionUpdatedGuest } from '~/store/actions';

import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

export const ResetPasswordGuestScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const [password, setPassword] = useState('');
  const [isLoading, setLoading] = useState(false);
  const token = useSelector((state) => state.account.token);
  const deliveryMode = useMemo(() => navigation.getParam('deliveryMode'), []);
  const tip_percentage = useMemo(() => navigation.getParam('tip_percentage'), []);

  const setNewPassword = useCallback(() => {
    setLoading(true);

    const formData = new FormData();
    formData.append('password', password);
    formData.append('password_repeat', password);
    
    fetchAPI(`/myaccount/reset_password_set_new`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => {
        dispatch(setDescriptionUpdatedGuest('updated'));
        NavigationService.navigate('CheckPasswordGuest', {
          deliveryMode: deliveryMode,
          tip_percentage: tip_percentage,
        });
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, [password,dispatch]);

  useEffect(() => {
    navigation.setParams({
    action: setNewPassword,
    actionTitle: 'SAVE',
    actionColor: 'black',
    });
  }, [password]);

  return (
    <Screen
    isLoading={isLoading}>
    <View style={[styles.container]}>
      <AppText style={styles.formHeading}>New password</AppText>
      <AppText style={styles.description}>
        Enter a new password below.
      </AppText>

      <Input
        style={GlobalStyles.formControl}
        title="Password"
        type='password'
        keyboardType="default"
        value={password}
        onChange={setPassword}
        style={GlobalStyles.formControl}   
      />
      <Button 
        type="accent" 
        style={styles.button}
        onClick={setNewPassword}>
        SAVE</Button>
    </View>
  </Screen>
  );
};

ResetPasswordGuestScreen.navigationOptions = ({ navigation }) =>
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
