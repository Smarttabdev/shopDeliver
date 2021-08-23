import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { Screen, Input, Button } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setUserInfo, setPhone, setToken } from '~/store/actions';
import { NavigationService } from '~/core/services';

export const ContactSellerScreen = ({ navigation }) => {

  const sellerID = useMemo(() => navigation.getParam('sellerID'), []);
  const userInfo = useSelector((state) => state.account.userInfo);

  const [isLoading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [fromFirstName, setFromFirstName] = useState(userInfo && userInfo.firstName || '');
  const [fromLastName, setFromLastName] = useState(userInfo && userInfo.lastName || '');
  const [fromEmail, setFromEmail] = useState(userInfo && userInfo.email || '');
  const [phoneNumber, setPhoneNumber] = useState(userInfo && userInfo.phone || '');


  const dispatch = useDispatch();

  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);

  const sendVerification = useCallback(() => {
    setLoading(true);    
    const formData = new FormData();
    formData.append('phone_number', phoneNumber);
    console.log("+++++++",phoneNumber);
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
            createMessage: true,
            territory: sellerID,
            message: message,
            firstName: fromFirstName,
            lastName: fromLastName,
            email: fromEmail,
          });
        }      
        else {
          console.log("tet is testmesage________------------------",message);
          dispatch(setToken(res.data.token));
          NavigationService.navigate('VerifyPhoneGuest',{
            token: res.data.token,
            createMessage: true,
            territory: sellerID,
            message: message,
            firstName: fromFirstName,
            lastName: fromLastName,
            email: fromEmail,
          });
        }
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, [phoneNumber,message]);

  const send = useCallback(() => {
    if(!userInfo || userInfo.user_verified == false )
    {
      sendVerification();
    } else {
      setLoading(true);
      console.log('token++++++++++',token);
      const formData = new FormData();

      formData.append('territory',sellerID)
      formData.append('message', message);
      if(fromFirstName)
      formData.append('first_name', fromFirstName);
      if(fromLastName)
      formData.append('last_name', fromLastName);
      if(fromEmail)
      formData.append('email', fromEmail);

      // fetchAPI(`/territory/contact`, {
      
      fetchAPI(`/message/create`, {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token ? token : guestToken}`,
          },
          body: formData,
        })     
        .then((res) => {
          setMessage('');
          if(!userInfo || (!userInfo.firstName || !userInfo.lastName || !userInfo.email)){
            dispatch(
              setUserInfo({
                  firstName: fromFirstName,
                  lastName: fromLastName,
                  email: fromEmail
              }),
            );
          }
          //After create message, navigate to MessageRoom
          NavigationService.navigate('MessageRoom',{
            token: res.data.token,
            territory: sellerID,
          });
        })
        .catch((err) =>
           dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
      }
  }, [userInfo,subject, message, fromFirstName, fromLastName, fromEmail]);

  useEffect(() => {
    navigation.setParams({
      action: send,
      actionTitle: 'Send',
      actionColor: 'black',
    });
  }, [send]);

  return (
    <Screen isLoading={isLoading} keyboardAware={true}>
      <View style={styles.container}>

        {(!userInfo || !userInfo.firstName) && <Input
        style={GlobalStyles.formControl}
        title="First Name"
        placeholder="Your First Name"
        value={fromFirstName}
        onChange={setFromFirstName}
        />}

        {(!userInfo || !userInfo.lastName) && <Input
        style={GlobalStyles.formControl}
        title="Last Name"
        placeholder="Your Last Name"
        value={fromLastName}
        onChange={setFromLastName}
        />}

        {(!userInfo || !userInfo.email) && <Input
        style={GlobalStyles.formControl}
        title="Your E-mail"
        placeholder="Your E-mail Address"
        value={fromEmail}
        onChange={setFromEmail}
        />}
        
        {(!userInfo || userInfo.user_verified == false) && <Input
        style={GlobalStyles.formControl}
        title="Phone #"
        placeholder="Your Phone number"
        value={phoneNumber}
        keyboardType="number-pad"
        onChange={setPhoneNumber}
        />}
        
{/* 
        <Input
          style={GlobalStyles.formControl}
          title="Subject"
          placeholder="Subject"
          value={subject}
          onChange={setSubject}
        /> */}

        <Input
          style={GlobalStyles.formControl}
          type="textarea"
          title="Message"
          placeholder="Type your message here ..."
          value={message}
          onChange={setMessage}
        />

        <Button 
        type="accent" 
        style={styles.button}
        onClick={send}>
          Send</Button>
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

  description: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
  },

  button : {
    marginTop : 10
  }
});

ContactSellerScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Contact',
    },
  });
