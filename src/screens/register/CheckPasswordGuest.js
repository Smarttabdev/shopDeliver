import React, { useState, useEffect,useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch,useSelector } from 'react-redux';
import { Screen, Input, Button, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setUserInfo,setToken, setOrder } from '~/store/actions';
import { NavigationService } from '~/core/services';

export const CheckPasswordGuestScreen = ({ navigation }) => {
  const deliveryMode = useMemo(() => navigation.getParam('deliveryMode'), []);
  const tip_percentage = useMemo(() => navigation.getParam('tip_percentage'), []);
  
  const signInToken = useMemo(() => navigation.getParam('token'), []);

  const createMessage = useMemo(() => navigation.getParam('createMessage'), []);
  const territory = useMemo(() => navigation.getParam('territory'), []);
  const message = useMemo(() => navigation.getParam('message'), []);
  const firstName = useMemo(() => navigation.getParam('firstName'), []);
  const lastName = useMemo(() => navigation.getParam('lastName'), []);
  const email = useMemo(() => navigation.getParam('email'), []);

  const [isLoading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const phoneNumber = useSelector((state) => state.account.phone);
  const address = useSelector((state) => state.explorer.address);
  const resetMode = useSelector((state) => state.notification.descriptionUpdatedGuest);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);
  const [descriptionString,setDescriptionString] = useState('');

   
  const signIn = useCallback(() => {
    
    setLoading(true);

    const formData = new FormData();
    formData.append('id', phoneNumber);
    formData.append('password', password);
      
    fetchAPI(`/login`, {
      method: 'POST',
      body: formData,
      headers: {
        authorization: `Bearer ${signInToken}`,
      },
    })
      .then(async (res) => {
        console.log(res.data);
        console.log("sdsdfasdfasdfsadf", signInToken);
        const loginToken = res.data.token;
        const userDetails = {
          uuid: res.data.uuid,
          firstName: res.data.first_name,
          lastName: res.data.last_name,
          phone: res.data.phone,
          email: res.data.email,
          creditcard: res.data.creditcard,
          totalOrders: res.data.total_orders,
          user_verified: res.data.user_verified
        };

        if (res.data.last_order_data) {
          dispatch(setOrder(res.data.last_order_data));
        }
        if(!signInToken){
          dispatch(setToken(loginToken));
          dispatch(
            setUserInfo(userDetails),
          );
        }      
        if(signInToken){
          const formData = new FormData();
          formData.append('address', address);

          await fetchAPI(`/order/address`, {
            method: 'POST',
            headers: {
              authorization: `Bearer ${loginToken}`,
            },
            body: formData,
          })
            .then(async (res) => {
              dispatch(setOrder(res.data));
              dispatch(setToken(loginToken));
              dispatch(
                setUserInfo(userDetails),
              );
              
              if(createMessage != true){   
                if(userDetails.creditcard == '')
                {
                  NavigationService.navigate('Account/CreditCard', {
                    deliveryMode: deliveryMode,
                    tip_percentage: tip_percentage,
                  });
                }
                else
                  NavigationService.navigate('MyOrder');
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
                    authorization: `Bearer ${loginToken}`,
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
              dispatch(
                showNotification({
                  type: 'error',
                  message: err.message,
                }),
              ),
            )
            .finally(() => setLoading(false));
        }else{        

          if(createMessage != true){   
            if(res.data.creditcard == '')
            {
              NavigationService.navigate('Account/CreditCard', {
                deliveryMode: deliveryMode,
                tip_percentage: tip_percentage,
              });
            }
            else
              NavigationService.navigate('MyOrder');
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
        }
      
        
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, [password]);

  useEffect(()=> {
    if(resetMode == 'updated')
    {
      setDescriptionString('Please enter your password to continue.');
    }
    else{
      setDescriptionString('Your phone number matches an existing account. Please enter your password to continue.');
    }
  },[resetMode]);

  useEffect(() => {
    navigation.setParams({
    action: signIn,
    actionTitle: 'SIGN IN',
    actionColor: 'black',
    });
    
  }, [signIn]);

    return (
        <Screen isLoading={isLoading}>
            <View style={styles.container}>
                <AppText style={styles.formHeading}>Please sign in</AppText>
                <AppText style={styles.description}>{descriptionString}</AppText>
                <Input
                  style={GlobalStyles.formControl}
                  title="Password"
                  type="password"
                  keyboardType="default"
                  value={password}
                  onChange={setPassword}
                  style={GlobalStyles.formControl}   
                />
                <Button 
                type="accent" 
                style={styles.button}
                onClick={signIn}>
                SIGN IN</Button>
                <Button 
                type="bordered-dark" 
                style={styles.button}
                onClick={() => NavigationService.navigate("ResetPasswordEmailGuest", {
                  deliveryMode: deliveryMode,
                  tip_percentage: tip_percentage,
                })}>
                Forgot Password</Button>
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

CheckPasswordGuestScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Account',
    },
});