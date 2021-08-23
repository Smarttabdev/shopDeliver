import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import { Screen, Input, Button } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI, formatPhoneNumber } from '~/core/utility';
import { showNotification,signOut, setToken, setUserInfo, setPhone } from '~/store/actions';

export const UserInfoScreen = ({ navigation }) => {
  const deliveryMode = useMemo(() => navigation.getParam('deliveryMode'), []);
  const tip_percentage = useMemo(() => navigation.getParam('tip_percentage'), []);
  const [user, setUser] = useState({});
  const [isLoading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);

  const _continue = useCallback(() => {
    setLoading(true);

    const formData = new FormData();
    formData.append('first_name', user.firstName);
    formData.append('last_name', user.lastName);
    formData.append('email', user.email);
    formData.append('password', user.password);

    let error = false;

    if(!token && guestToken){
      
      if(!user.firstName){
        error = 'Please Enter your First Name';
      }else if(!user.lastName){
        error = 'Please Enter your Last Name';
      }else if(!user.email){
        error = 'Please Enter your Email';
      }else if(!user.phoneNumber){
        error = 'Please Enter your Phone Number';
      }else if(!user.password){
        error = 'Please Enter your Password';
      }

      if(error){
        dispatch(showNotification({ type: 'error', message: error, autoHide : false }))
        setLoading(false);
        return
      }

      const formData = new FormData();
      formData.append('phone_number', user.phoneNumber);
  
      fetchAPI(`/verification/send`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${guestToken}`,
        },
        body: formData,
      })
        .then( (res) => {
          if (res.data.existing_user) {
            dispatch(setPhone(user.phoneNumber));
            NavigationService.navigate('CheckPassword', {
              user : user,
              navigateTo : 'MyOrder',
              token : guestToken
            });
          } else {
            NavigationService.navigate('VerifyPhone',{
              user : user,
              token : res.data.token,
              deliveryMode: deliveryMode,
              tip_percentage: deliveryMode,
            });
          }
        })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
   
    }else{
        if(!user.firstName){
          error = 'Please Enter your First Name';
        }else if(!user.lastName){
          error = 'Please Enter your Last Name';
        }else if(!user.email){
          error = 'Please Enter your Email';
        }else if(!user.password){
          error = 'Please Enter your Password';
        }

        if(error){
          dispatch(showNotification({ type: 'error', message: error, autoHide : false }))
          setLoading(false);
          return
        }

        fetchAPI(`/${!user.password ? 'myaccount/update' : 'signup'}`, {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token ? token : guestToken}`,
          },
          body: formData,
        })
          .then((res) => {
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
            NavigationService.navigate('Account/CreditCard',{
              deliveryMode : deliveryMode,
              tip_percentage : tip_percentage,
            });
         
          })
          .catch((err) =>
            dispatch(showNotification({ type: 'error', message: err.message })),
          )
          .finally(() => setLoading(false));
       
    }
  }, [user, token, guestToken]);

  useEffect(() => {
    navigation.setParams({ action: _continue,actionTitle: 'Next', actionColor : 'black' });
  }, [_continue]);

  useEffect(() => {
    if(token){
      fetchAPI('/token', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.data.user_active) {
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

          } else {
            dispatch(signOut());
            dispatch(showNotification({ type: 'error', message: "Your account is not activated, Please Sign Up" }));
            //NavigationService.navigate('GetAccess');
          }
        })
        .catch(() => {
          dispatch(signOut());
          NavigationService.navigate('GetAccess');
        });
    
    }
  },[dispatch]);
  return (
    <Screen
      isLoading={isLoading}
      hasList
      >
      <View style={styles.container}>
        <Input
          title="First Name"
          placeholder="First Name"
          value={user.firstName}
          onChange={(e) => setUser({ ...user, firstName: e })}
          style={GlobalStyles.formControl}
        />
        <Input
          title="Last Name"
          placeholder="Last Name"
          value={user.lastName}
          onChange={(e) => setUser({ ...user, lastName: e })}
          style={GlobalStyles.formControl}
        />
        <Input
          title="Email"
          placeholder="Email"
          value={user.email}
          keyboardType="email-address"
          onChange={(e) => setUser({ ...user, email: e })}
          style={GlobalStyles.formControl}
        />
        {guestToken && 
        <Input
          title="Phone #"
          placeholder="XXX XXX XXXX"
          value={user.phoneNumber}
          onChange={(e) => setUser({ ...user, phoneNumber: formatPhoneNumber(e) })}
          keyboardType="number-pad"
          style={GlobalStyles.formControl}
        />}
        <Input
          title="Password"
          placeholder="Password"
          type="password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e })}
          style={GlobalStyles.formControl}
        />
        <Button
          type="bordered-dark"
          style={GlobalStyles.formControl}
          onClick={_continue}>
          Save and Continue
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
});

UserInfoScreen.navigationOptions = ({ navigation }) =>
MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Account',
    },
  });
