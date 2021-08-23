import React, { useState, useCallback,useMemo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { Screen, Input, Button, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setUserInfo,setToken, setOrder } from '~/store/actions';
import { NavigationService } from '~/core/services';

export const ProfileGuestScreen = ({ navigation }) => {
  
  const deliveryMode = useMemo(() => navigation.getParam('deliveryMode'), []);
  const tip_percentage = useMemo(() => navigation.getParam('tip_percentage'), []);
  const signup_already = useMemo(() => navigation.getParam('signup_already'), []);
  const [isLoading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const dispatch = useDispatch();

  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);
  const userInfo = useSelector((state) => state.account.userInfo);
  const address = useSelector((state) => state.explorer.address);

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
    formData.append('email', user.email);
    formData.append('password', user.password);
    
    fetchAPI(`/signup`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
      body: formData,
    })
      .then(async (res) => {

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

        //dispatch(showNotification({ type: 'success', message: res.message }));
        if(signup_already == true) {
          dispatch(setToken(signupToken));

          NavigationService.navigate('Account/CreditCard', {
           deliveryMode: deliveryMode,
           tip_percentage: tip_percentage,
           });
        }
        else {
          const formData = new FormData();
          formData.append('address', address);

          await fetchAPI(`/order/address`, {
            method: 'POST',
            headers: {
              authorization: `Bearer ${signupToken}`,
            },
            body: formData,
          })
          .then((res) => {
            
            dispatch(setOrder(res.data));
            dispatch(setToken(signupToken));

          NavigationService.navigate('Account/CreditCard', {
            deliveryMode: deliveryMode,
            tip_percentage: tip_percentage,
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
      actionTitle: 'Next',
      actionColor: 'black',
    });
  }, [_save]);

  return (
    <Screen hasList isLoading={isLoading} showHeaderOverLayOnScroll>
      <View style={styles.container}>
        <AppText style={styles.formHeading}>Please sign up</AppText>
        <AppText style={styles.description}>Please enter your personal information below, including a password</AppText>
        
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
          type="accent"
          style={GlobalStyles.formControl}
          onClick={_save}>
          Create Account
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
    height:900,
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

ProfileGuestScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Account',
    },
  });
