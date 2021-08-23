import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { Screen, Input, Button, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification,setUserInfo } from '~/store/actions';
import { NavigationService } from '~/core/services';

export const InviteScreen = ({ navigation }) => {

    const token = useSelector((state) => state.account.token);
    const userInfo = useSelector((state) => state.account.userInfo);
    const territory_type = useSelector((state) => state.order.territory_type.territory_type);
    const order = useSelector((state) => state.order.order);
    const explorer = useSelector((state) => state.explorer);

    const [isLoading, setLoading] = useState(false);
    
    const [businessName, setBusinessName] = useState('');
    const [email, setEmail] = useState('');
    // const [message, setMessage] = useState('');

    const [fromFirstName, setFromFirstName] = useState(userInfo && userInfo.firstName || '');
    const [fromLastName, setFromLastName] = useState(userInfo && userInfo.lastName || '');
    const [fromEmail, setFromEmail] = useState(userInfo && userInfo.email || '');

    const partialGuest = useMemo(() => {
      return (!token || (!userInfo || !userInfo.email))
    },[token,userInfo])

    const lastAddress = useMemo(
      () =>
        {
          if(order || explorer){
              if(order && order.address && order.address){
                return order.address
              }else if(explorer.address){
                return explorer.address
              }else{
                return false;
              }
          }else{
            return false;
          }
        },
      [order,explorer],
    );

    const city = useMemo(
      () =>
        {
          if(explorer){
            if(explorer.addressFull){

                let city = false;
             
                //find city name 
                for (var i=0; i<explorer.addressFull.address_components.length; i++) { 
                    if(explorer.addressFull.address_components[i].types.indexOf('locality') > -1){
                      city = explorer.addressFull.address_components[i].long_name;
                      break;
                    }
                } 

                return city;
            }else{
              return false;
            }
        }else{
          return false;
        }
        },
      [explorer],
    );

    const dispatch = useDispatch();

    const send = useCallback(() => {
      
        setLoading(true);

        const formData = new FormData();

        if(!businessName){
            dispatch(showNotification({ type: 'error', message: 'Please enter Business Name' }))
            setLoading(false);
            return
        }

        if(!email){
          dispatch(showNotification({ type: 'error', message: 'Please enter Business E-mail' }))
          setLoading(false);
          return
        }

        if(partialGuest){
          if(!fromFirstName){
            dispatch(showNotification({ type: 'error', message: 'Please enter your First Name' }))
            setLoading(false);
            return
          }
          if(!fromLastName){
            dispatch(showNotification({ type: 'error', message: 'Please enter your Last Name' }))
            setLoading(false);
            return
          }
          if(!fromEmail){
            dispatch(showNotification({ type: 'error', message: 'Please enter your E-mail' }))
            setLoading(false);
            return
          }
        }
        
        formData.append('business_name', businessName);
        formData.append('email', email);
        // if(message)
        // formData.append('message', message);

        if(!token || (!userInfo || !userInfo.email) ){
          formData.append('as_guest',1);
            
          if(fromFirstName)
          formData.append('from_first_name', fromFirstName);
          if(fromLastName)
          formData.append('from_last_name', fromLastName);
          if(fromEmail)
          formData.append('from_email', fromEmail);
        }


        formData.append('type', territory_type);

        if(city)
        formData.append('city',city);

        if(lastAddress)
        formData.append('full_address',lastAddress);

        let headers = {};

        if(token){
          headers = {
              authorization: `Bearer ${token}`,
          }
        }
        

        fetchAPI(`/seller/invite`, {
            method: 'POST',
            body: formData,
            headers: headers,
        })
        .then((res) => {

          if(!userInfo || !userInfo.email){
            dispatch(
              setUserInfo({
                  firstName: fromFirstName,
                  lastName: fromLastName,
                  email: fromEmail
              }),
            );
            NavigationService.reset('Account/UpdatePassword');
          }else{
            if(token){
              NavigationService.reset('InvitationSucess', {
                  businessName: businessName,
              });
            }
            else{
              NavigationService.navigate('GetAccessScreen2', {
                  businessName: businessName,
                  userInfo : {
                    firstName: fromFirstName,
                    lastName: fromLastName,
                    email: fromEmail,
                  }
              });
            }
          }
        })
        .catch((err) =>
            dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
    }, [token, email, fromFirstName, fromLastName, fromEmail]);

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
                <AppText style={styles.formHeading}>Use the form below to invite a business to get on Shopl®</AppText>
                <Input
                style={GlobalStyles.formControl}
                title="Business"
                placeholder="Business Name"
                value={businessName}
                onChange={setBusinessName}
                />

                <Input
                style={GlobalStyles.formControl}
                title="E-mail"
                placeholder="Business E-mail Address"
                value={email}
                onChange={setEmail}
                />

                {partialGuest && <>
                <AppText style={[styles.formHeading,{marginTop: 20}]}>From</AppText>

                <Input
                style={GlobalStyles.formControl}
                title="First Name"
                placeholder="Your First Name"
                value={fromFirstName}
                onChange={setFromFirstName}
                />

                <Input
                style={GlobalStyles.formControl}
                title="Last Name"
                placeholder="Your Last Name"
                value={fromLastName}
                onChange={setFromLastName}
                />

                <Input
                style={GlobalStyles.formControl}
                title="Your E-mail"
                placeholder="Your E-mail Address"
                value={fromEmail}
                onChange={setFromEmail}
                />
                </>}

                {/* <Input
                style={GlobalStyles.formControl}
                type="textarea"
                title="Message"
                placeholder="Enter your personal message (optional)"
                value={message}
                onChange={setMessage}
                /> */}

                <Button 
                type="accent" 
                style={styles.button}
                onClick={send}>
                Send Invitation</Button>
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
      //textTransform: 'uppercase',
      fontSize: 16,
      width: '80%',
      alignSelf: 'center',
      marginBottom: 10
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

InviteScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Invite',
    },
});
