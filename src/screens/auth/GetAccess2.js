import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';

import { Screen, Input, Button, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI, formatPhoneNumber } from '~/core/utility';
import { showNotification, setToken, setPhone } from '~/store/actions';
import { NavigationService } from '~/core/services';

export const GetAccessScreen2 = ({ navigation }) => {

    const dispatch = useDispatch();
    const businessName = useMemo(() => navigation.getParam('businessName'), '');
    const userInfo = useMemo(() => navigation.getParam('userInfo'), []);

    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setLoading] = useState(false);

    const sendVerification = useCallback((phoneNumber) => {

        setLoading(true);

        const formData = new FormData();
        formData.append('phone_number', phoneNumber);

        fetchAPI(`/verification/send`, {
        method: 'POST',
        body: formData,
        })
        .then((res) => {
            if (res.data.existing_user) {
                dispatch(setPhone(phoneNumber));
                NavigationService.navigate('CheckPassword2');
            } else {
                dispatch(setToken(res.data.token));
                NavigationService.navigate('VerifyPhone2', {
                    businessName: businessName,
                    userInfo : userInfo
                });
            }
        })
        .catch((err) =>
            dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        navigation.setParams({
        action: () => sendVerification(phoneNumber),
        actionTitle: 'Send',
        actionColor: 'black',
        });
    }, [sendVerification,phoneNumber]);

    return (
        <Screen isLoading={isLoading}>
            <View style={styles.container}>
                <AppText style={styles.formHeading}>Seems like you like this app. It's even better if you create an account. All we need is your..</AppText>
                
                <Input
                    style={GlobalStyles.formControl}
                    title="Phone #"
                    placeholder="XXX XXX XXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneNumber(e))}
                    keyboardType="number-pad"
                />

                <Button 
                type="accent" 
                style={styles.button}
                onClick={() => sendVerification(phoneNumber)}>
                Continue</Button>

                <Button 
                type="bordered-dark" 
                style={styles.button}
                onClick={() => NavigationService.reset('Home')}>
                Nah, Just Exit</Button>
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

GetAccessScreen2.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Sign up',
    },
});
