import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch,useSelector } from 'react-redux';

import { Screen, Input, Button, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setToken } from '~/store/actions';
import { NavigationService } from '~/core/services';

export const VerifyPhoneScreen2 = ({ navigation }) => {

    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setLoading] = useState(false);
    const businessName = useMemo(() => navigation.getParam('businessName'), '');
    const userInfo = useMemo(() => navigation.getParam('userInfo'), []);

    const dispatch = useDispatch();
    const token = useSelector((state) => state.account.token);

    const checkPhone = useCallback((token, verificationCode) => {

      setLoading(true);

      const formData = new FormData();
      formData.append('code', verificationCode);

      fetchAPI(`/verification/check`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: formData,
      })
        .then((res) => {
          dispatch(setToken(res.data.token))
          NavigationService.navigate('Register/SetPassword', {
              businessName: businessName,
              userInfo : userInfo
          });
        })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        navigation.setParams({
        action: () => checkPhone(token, verificationCode),
        actionTitle: 'Send',
        actionColor: 'black',
        });
    }, [checkPhone,token,verificationCode]);

    return (
        <Screen isLoading={isLoading}>
            <View style={styles.container}>
                <AppText style={styles.formHeading}>We just sent a verification code to your phone. Enter it below</AppText>
                
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
                onClick={() => checkPhone(token, verificationCode)}>
                Continue</Button>

                <Button 
                type="bordered-dark" 
                style={styles.button}
                onClick={() => NavigationService.goBack()}>
                Go Back</Button>
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

VerifyPhoneScreen2.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Verify',
    },
});
