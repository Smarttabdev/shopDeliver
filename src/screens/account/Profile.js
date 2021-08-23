import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { Screen, Button, Input,AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setUserInfo } from '~/store/actions';

import { NavigationService } from '~/core/services';

export const ProfileScreen = ({ navigation }) => {
  const [isLoading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const dispatch = useDispatch();

  const token = useSelector((state) => state.account.token);
  const userInfo = useSelector((state) => state.account.userInfo);

  const message = useMemo(() => navigation.getParam('message'));

  useEffect(() => {
    setUser({
      ...user,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
    });
  }, [userInfo]);

  const _save = useCallback(() => {
    setLoading(true);

    const formData = new FormData();
    formData.append('first_name', user.firstName);
    formData.append('last_name', user.lastName);
    formData.append('password', user.password);
    formData.append('email', user.email);

    fetchAPI(`/myaccount/update`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body : formData,
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
        dispatch(showNotification({ type: 'success', message: res.message }));
        if(message) {
          NavigationService.goBack();
        }
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    navigation.setParams({
      action: _save,
      actionTitle: 'Save',
      actionColor: 'black',
    });
  }, [_save]);

  return (
    <Screen hasList isLoading={isLoading} keyboardAware={true} >
      <View style={styles.container}>
        <AppText style={styles.formHeading}>Update your profile</AppText>
        <AppText style={styles.description} numberOfLines={2}>Please enter your personal information below, including a password</AppText>
        <Input
          style={GlobalStyles.formControl}
          title="First Name"
          placeholder="First Name"
          value={user.firstName}
          onChange={(e) => setUser({ ...user, firstName: e })}
        />
        <Input
          style={GlobalStyles.formControl}
          title="Last Name"
          placeholder="Last Name"
          value={user.lastName}
          onChange={(e) => setUser({ ...user, lastName: e })}
        />
        <Input
          style={GlobalStyles.formControl}
          title="Email"
          placeholder="Email"
          value={user.email}
          keyboardType="email-address"
          onChange={(e) => setUser({ ...user, email: e })}
        />
        <Input
          style={GlobalStyles.formControl}
          title="Password"
          placeholder="Password"
          type="password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e })}
        />
        <Button
          type="bordered-dark"
          style={GlobalStyles.formControl}
          onClick={_save}>
          UPDATE
        </Button>
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

  name: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 5,
  },

  number: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '300',
    marginBottom: 10,
    color: Theme.color.accentColor,
  },
  formHeading : {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
    // textTransform: 'uppercase',
    width: '80%',
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 10
  },

  description: {
    fontSize: 15,
    textAlign: 'center',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
  }
});

ProfileScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'ACCOUNT',
    },
  });
