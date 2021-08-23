import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch,useSelector } from 'react-redux';

import { Screen, Input, Button, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setToken, setUserInfo } from '~/store/actions';
import { NavigationService } from '~/core/services';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const UpdatePasswordScreen = ({ navigation }) => {

    const userInfo = useSelector((state) => state.account.userInfo);
    
    const [isLoading, setLoading] = useState(false);
    const [user, setUser] = useState([]);

    const dispatch = useDispatch();
    const token = useSelector((state) => state.account.token);

    const _continue = useCallback(() => {

        const formData = new FormData();
        formData.append('password', user.password);

        formData.append('first_name', userInfo.firstName);
        formData.append('last_name', userInfo.lastName);
        formData.append('email', userInfo.email);
    
        let error = false;
    
        if(!user.password){
          error = 'Please Enter your Password';
        }

        if(error){
        dispatch(showNotification({ type: 'error', message: error, autoHide : false }))
        setLoading(false);
        return
        }

        fetchAPI(`/myaccount/update`, {
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
            NavigationService.reset('Home');
        })
        .catch((err) =>
            dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
        
      }, [user, token]);

    return (
        <Screen isLoading={isLoading}>
            <View style={styles.container}>
                <View style={styles.successLogo}><Icon size={120} color={ Theme.color.accentColor} name="emoticon-happy-outline" /></View>

                <AppText style={styles.formHeading}>Profile Almost Complete</AppText>
                <AppText style={styles.successSubtitle}>Since you just filled out a form requiring your personal information, we've updated your profile. All you need to complete your profile is password.</AppText>
                
                <Input
                style={GlobalStyles.formControl}
                title="Password"
                placeholder="Password"
                type="password"
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e })}
                style={GlobalStyles.formControl}
                />

                <Button 
                type="accent" 
                style={styles.button}
                onClick={_continue}>
                Save</Button>

                <Button 
                type="bordered-dark" 
                style={styles.button}
                onClick={() => NavigationService.reset('Home')}>
                Exit</Button>
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

UpdatePasswordScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Last Step',
    },
});
