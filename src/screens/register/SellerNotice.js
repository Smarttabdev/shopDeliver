import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { useDispatch } from 'react-redux';

import { Screen, Button, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { Config } from '~/core/config';
import { showNotification } from '~/store/actions';

export const SellerNoticeScreen = () => {
  const dispatch = useDispatch();

  return (
    <Screen>
      <View style={styles.container}>
        <AppText style={styles.description}>
          Our mobile app is designed for buyers.
        </AppText>

        <AppText style={styles.description}>
          If you want to sign up as a seller, click on the button below to sign
          up (free) through our website.
        </AppText>

        <Button
          type="bordered-dark"
          style={GlobalStyles.formControl}
          onClick={() => {
            Linking.canOpenURL(Config.signUpURL).then((supported) => {
              if (supported) {
                Linking.openURL(Config.signUpURL);
              } else {
                dispatch(
                  showNotification({
                    type: 'error',
                    message: `Don't know how to open URI: ${Config.signUpURL}`,
                  }),
                );
              }
            });
          }}>
          Sign up as a seller
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

  description: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
  },
});

SellerNoticeScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Seller',
    },
  });
