import React, { useState, useEffect,useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';

import { useDispatch,useSelector } from 'react-redux';
import { Screen, Input, Button, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setToken, setUserInfo , setOrder } from '~/store/actions';
import { NavigationService } from '~/core/services';

export const VerifyPhoneGuestScreen = ({ navigation }) => {
  const deliveryMode = useMemo(() => navigation.getParam('deliveryMode'), []);
  const tip_percentage = useMemo(() => navigation.getParam('tip_percentage'), []);

  const createMessage = useMemo(() => navigation.getParam('createMessage'), []);
  const territory = useMemo(() => navigation.getParam('territory'), []);
  const message = useMemo(() => navigation.getParam('message'), []);
  const firstName = useMemo(() => navigation.getParam('firstName'), []);
  const lastName = useMemo(() => navigation.getParam('lastName'), []);
  const email = useMemo(() => navigation.getParam('email'), []);

  const [isLoading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');    

  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);
  const tempTokenSignup = useMemo(() => navigation.getParam('token'), []);
  

  const sendVerification = useCallback(() => {
    setLoading(true);

    const formData = new FormData();
    formData.append('code', verificationCode);

    fetchAPI(`/verification/check`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${tempTokenSignup ? tempTokenSignup : (token ? token : guestToken)}`,
      },
      body: formData,
    })
    .then(async (res) => {
      dispatch(setToken(res.data.token));
      console.log("response++++++++++++++++++",res.data);   
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
      
      if(createMessage != true){   
        NavigationService.navigate('ProfileGuest', {
          deliveryMode: deliveryMode,
          tip_percentage: tip_percentage,
        });   
      }else{
        setLoading(true);
        const formData = new FormData();  
  
        formData.append('territory',territory)
        formData.append('message', message);
  
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('email', email);
        console.log('formdata++++++++ ++++++++++',formData);
        //fetchAPI(`/territory/contact`, {
        await fetchAPI(`/message/create`, {
          method: 'POST',
          body: formData,
          headers: {
            authorization: `Bearer ${res.data.token}`,
          },
        })
          .then((res) => {         
              dispatch(
                setUserInfo({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    user_verified: true,
                }),
              );
              //dispatch(showNotification({ type: 'success', message: res.message, buttonText: 'Exit', buttonAction : () => navigation.goBack() }));
              NavigationService.navigate('MessageRoom',{
                token: res.data.token,
                territory: territory,
              });
            
          })
          .catch((err) =>
            dispatch(showNotification({ type: 'error', message: err.message })),
          )
          .finally(() => setLoading(false));
      }
    })
    .catch((err) =>
      dispatch(showNotification({ type: 'error', message: err.message })),
    )
    .finally(() => setLoading(false));
  }, [token, verificationCode, dispatch]);

    return (
        <Screen isLoading={isLoading} keyboardAware={true}>
            <View style={styles.container}>
                <AppText style={styles.formHeading}>Verify your number</AppText>
                <AppText style={styles.description} numberOfLines={2}>Please enter the code we just sent to your phone.</AppText>                
                <Input
                  style={GlobalStyles.formControl}
                  title="Code"
                  placeholder="XXXXXX"
                  value={verificationCode}
                  onChange={setVerificationCode}
                  keyboardType="number-pad"
                />
                <Button 
                type="accent" 
                style={styles.button}
                onClick={sendVerification}>
                VERIFY</Button>
                <Button 
                type="bordered-dark" 
                style={styles.button}
                onClick={() => NavigationService.goBack()}>
                Try Again</Button>
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
      fontSize: 16,
      width: '80%',
      alignSelf: 'center',
      marginBottom: 10
  },

  description: {
    fontSize: 14,
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

VerifyPhoneGuestScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Account',
    },
});