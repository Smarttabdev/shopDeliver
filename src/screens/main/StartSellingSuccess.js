import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';

import { Screen, Button, AppText } from '~/components';
import { Theme } from '~/styles';
import { NavigationService } from '~/core/services';
import { Config } from '~/core/config';

export const StartSellingSuccessScreen = ({ navigation }) => {

  return (
    <Screen>
        <View style={styles.container}>

        <View style={styles.successLogo}><Icon size={120} color={ Theme.color.accentColor} name="emoticon-happy-outline" /></View>

        <AppText style={styles.successTitle}>SUCCESS!</AppText>
        <AppText style={styles.successSubtitle}>You can now sign in to Shopl.net on your laptop or desktop computer to complete the on-board checklist required to start selling on Shopl®</AppText>

        
        <Button 
        type="bordered-dark" 
        fullWidth
        style={styles.successButton}
        onClick={() => NavigationService.reset('Home')}>
        Exit</Button>
        </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  imageWrapper: {
    paddingHorizontal: 60,
    marginTop: 40,
    marginBottom: 15,
    width: '100%',
    flexDirection: 'row',
  },

  image: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 500,
  },

  sellerName: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    textTransform: 'uppercase',
  },

  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.color.accentColor,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  orderNumber: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 10,
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
    marginTop: 20,
  },

  successButton : {
    marginTop : 20
  }
});

StartSellingSuccessScreen.navigationOptions = {
  headerShown: false,
};
