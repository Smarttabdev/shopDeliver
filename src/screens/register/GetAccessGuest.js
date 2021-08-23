import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Animated,View, StyleSheet } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { useDispatch,useSelector } from 'react-redux';
import { formatPhoneNumber } from '~/core/utility';
import { Screen, Input, Button, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setToken, setPhone } from '~/store/actions';
import { NavigationService } from '~/core/services';

export const GetAccessGuestScreen = ({ navigation }) => {
  
  const deliveryMode = useMemo(() => navigation.getParam('deliveryMode'), []);
  const tip_percentage = useMemo(() => navigation.getParam('tip_percentage'), []);
  const [isLoading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');  
  const anim = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);

   
    const sendVerification = useCallback(() => {
      setLoading(true);

      const formData = new FormData();
      formData.append('phone_number', phoneNumber);

      fetchAPI(`/verification/send`, {
        method: 'POST',
        body: formData,
        headers: {
          authorization: `Bearer ${token ? token : guestToken}`,
        },
      })
        .then((res) => {
          console.log("!%%%%%%%%%%%%%%",res.data);
          if (res.data.active_user) {
            dispatch(setPhone(phoneNumber));
            NavigationService.navigate('CheckPasswordGuest',{
              token: token ? token : guestToken,
              deliveryMode: deliveryMode,
              tip_percentage: tip_percentage,});
          } 
          // else if(res.data.user_verified){
          //   NavigationService.navigate('ProfileGuest', {
          //     deliveryMode: deliveryMode,
          //     tip_percentage: tipValue,
          //   });
          // }
          else {
            dispatch(setToken(res.data.token));
            NavigationService.navigate('VerifyPhoneGuest',{
              token: res.data.token,
              deliveryMode: deliveryMode,
              tip_percentage: tip_percentage,});
          }
        })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
    }, [phoneNumber]);

  const animStart = useCallback(() => {
    // Will change anim value to 500 in 1 second
    Animated.timing(anim, {
      toValue: 150,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    navigation.setParams({
    action: sendVerification,
    actionTitle: 'NEXT',
    actionColor: 'black',
    });
  }, [sendVerification]);

  useEffect(() => {
    setTimeout(() => animStart(), 2000);
  }, []);

    return (
        <Screen isLoading={isLoading}>
            <View style={styles.container}>
                <AppText style={styles.formHeading}>Sign in or Sign up</AppText>
                <AppText style={styles.description}>You need a Shopl® account to check out. Enter your phone number to continue.</AppText>
                
                <Input
                  style={GlobalStyles.formControl}
                  title="Phone"
                  placeholder="XXX XXX XXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatPhoneNumber(e))}
                  keyboardType="number-pad"
                />
                <Button 
                type="accent" 
                style={styles.button}
                onClick={sendVerification}>
                Continue</Button>
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

  formHeading : {
      fontWeight: 'bold',
      textAlign: 'center',
      // textTransform: 'uppercase',
      width: '80%',
      alignSelf: 'center',
      fontSize: 16,
      marginBottom: 10
  },

  description: {
    fontSize: 15,
    textAlign: 'center',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
  },

  button : {
    marginTop : 10
  },

  successLogo : {
      alignItems: 'center'
  },

  successTitle : { 
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },

  successSubtitle : { 
    fontSize: 12,
    color: 'black',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
});

GetAccessGuestScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Account',
    },
});