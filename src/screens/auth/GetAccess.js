import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { useDispatch } from 'react-redux';

import { formatPhoneNumber } from '~/core/utility';
import { NavigationService } from '~/core/services';
import { Screen, Input, Button, AppText } from '~/components';
import { Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setToken, signOut, setPhone } from '~/store/actions';

import { AppEventsLogger } from "react-native-fbsdk-next";

export const GetAccessScreen = () => {
  const dispatch = useDispatch();

  const [phoneNumber, setPhoneNumber] = useState('');
  const anim = useRef(new Animated.Value(0)).current;
  const [isLoading, setLoading] = useState(false);

  const sendVerification = useCallback((phoneNumber) => {
    AppEventsLogger.logEvent('USER ENTERS PHONE NUMBER');
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
          NavigationService.navigate('CheckPassword');
        } else {
          dispatch(setToken(res.data.token));
          NavigationService.navigate('VerifyPhone');
        }
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, []);

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
    setTimeout(() => animStart(), 2000);
  }, []);

  return (
    <Screen
      align="center"
      isLoading={isLoading}
      backgroundImage={require('~/assets/images/back2.jpg')}>
      <View style={[styles.container]}>
      <Button
            type="borderless"
            style={styles.button}
            titleStyle={{fontSize: 14}}
            onClick={() => {
              AppEventsLogger.logEvent('SIGN-IN SKIPPED')
              dispatch(signOut());
              NavigationService.reset('Home');
            }}>
            Skip
          </Button>
        <AppText style={[styles.whiteText, styles.title]}>
          Shop{'\n'}Local
        </AppText>
        <AppText style={[styles.greenText, styles.title]}>
          Online
        </AppText>
        <AppText style={[styles.whiteText, styles.subTitle]}>
        Goods & Food
        </AppText>
        <Animated.View style={[styles.inputWrapper, { maxHeight: anim }]}>
          <Input
            title="Phone #"
            placeholder="XXX XXX XXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(formatPhoneNumber(e))}
            keyboardType="number-pad"
            actionIcon="chevron-right"
            actionHandler={() => sendVerification(phoneNumber)}
          />
        </Animated.View>
      </View>
    </Screen>
  );
};

GetAccessScreen.navigationOptions = {
  headerShown: false,
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: Theme.layout.screenPaddingTop,
    paddingBottom: Theme.layout.screenPaddingBottom,
    justifyContent: 'center',
    flex: 1,

    width: '100%',
  },

  whiteText: {
    color: 'white',
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  greenText: {
    color: '#31D457',
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  title: {
    fontSize: 40,
    letterSpacing: 2,
    fontWeight: '800',
  },

  subTitle: {
    fontSize: 14,
    fontWeight: 'bold',

    marginTop: 10,
  },

  inputWrapper: {
    marginTop: 40,
    flexGrow: 1,
    overflow: 'hidden',

    width: '100%',
  },

  button: {
    top:  40,
    right: Theme.layout.screenPaddingHorizontal,
    position: 'absolute'
  },
});
