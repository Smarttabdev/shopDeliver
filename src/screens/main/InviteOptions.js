import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { Screen, Button, AppText } from '~/components';
import { MainNavigationOptions, Theme } from '~/styles';
import { NavigationService } from '~/core/services';


import { useDispatch } from 'react-redux';

import { setTerritoryType } from '~/store/actions';

export const InviteOptionsScreen = ({ navigation }) => {

    const [isLoading, setLoading] = useState(false);

    const dispatch = useDispatch();

    const chooseSellerCategory = (
      category
    ) => {
      dispatch(setTerritoryType({ territory_type : category }));
      NavigationService.navigate('Invite')
    }

    return (
        <Screen isLoading={isLoading} keyboardAware={true}>
            <View style={styles.container}>
                <AppText style={styles.description}>Can't find your favourite local shop or restaurant? Invite them to get on Shopl®</AppText>
                

                <Button 
                type="bordered-dark" 
                style={styles.button}
                onClick={() => {
                  chooseSellerCategory('shops');
                }}
                >
                Invite a local shop</Button>

                <Button 
                type="bordered-dark" 
                style={styles.button}
                onClick={() => {
                  chooseSellerCategory('restaurants');
                }}
                >
                Invite a local restaurant</Button>
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

InviteOptionsScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Invite',
    },
});
