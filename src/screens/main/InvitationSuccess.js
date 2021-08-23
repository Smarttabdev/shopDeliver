import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';

import { Screen, Button, AppText } from '~/components';
import { Theme } from '~/styles';
import { NavigationService } from '~/core/services';
import { Config } from '~/core/config';

export const InvitationSuccessScreen = ({ navigation }) => {

  const businessName = useMemo(() => navigation.getParam('businessName'), []);

  return (
    <Screen>
        <View style={styles.container}>

        <View style={styles.successLogo}><Icon size={120} color={ Theme.color.accentColor} name="emoticon-happy-outline" /></View>

        <AppText style={styles.successTitle}>INVITATION SENT!</AppText>
        <AppText style={styles.successSubtitle}>We sent a friendly invitation email to {businessName} on your behalf.</AppText>

        <Button 
        type="accent" 
        fullWidth
        style={styles.successButton}
        onClick={() => NavigationService.navigate('Invite')}>
        Invite Another Business</Button>
        <Button 
        type="bordered-dark" 
        fullWidth
        style={styles.successButton}
        onClick={() => {
        Share.open({
            title: 'Share Shopl®',
            url: Config.shareURL,
        });
        }}>
        Share Shopl®</Button>
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

InvitationSuccessScreen.navigationOptions = {
  headerShown: false,
};
