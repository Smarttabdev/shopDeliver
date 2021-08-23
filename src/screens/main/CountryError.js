import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { useDispatch } from 'react-redux';

import { Screen, Button, AppText } from '~/components';
import { NavigationService } from '~/core/services';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Config } from '~/core/config';
import { showNotification } from '~/store/actions';

export const CountryErrorScreen = () => {
  const dispatch = useDispatch();

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.view_noSeller}>
          <Icon size={120} color={ 'black'} name="emoticon-sad-outline" />        
        </View> 
        <AppText style={styles.description}>
          WE'RE NOT THERE YET
        </AppText>

        <AppText
              style={[
                styles.description1,
                GlobalStyles.formControl,
                { marginBottom: 20 },
              ]}>
              Shopl® is not available in your neck of the woods yet!
            </AppText>

        <Button
          type="bordered-dark"
          style={GlobalStyles.formControl}
          onClick={() => {
            NavigationService.goBack();      
          }}>
          Exit
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
  view_noSeller : {
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
  },
  description1:{
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  }
});

CountryErrorScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: '',
    },
  });
