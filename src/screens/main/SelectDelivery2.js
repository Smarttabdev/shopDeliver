import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { Screen, Input, Button, MessageTerritoryItem, LoadingGIF } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setUserInfo, setPhone, setToken, setTerritory,enterMessageRoom } from '~/store/actions';
import { NavigationService } from '~/core/services';
import { DashedLine, AppText} from '../../components';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HeaderStyleInterpolators } from 'react-navigation-stack';

export const SelectDeliveryScreen2 = ({ navigation }) => {

    const [isLoading, setLoading] = useState(false);
    const [country, setCountry] = useState('');
    const selectCountry = (selected) => {
        setCountry(selected);
        NavigationService.navigate('SelectDelivery3', {
            country: selected
        });
    }
  return (
    <Screen isLoading={isLoading} keyboardAware={true}>   
        <View style={styles.container}>
        <View style={{marginTop: 10, marginBottom: 10}}><AppText style={styles.formHeading}>Country</AppText></View>
        <AppText style={styles.description}>Please select your country</AppText>
            <Button
                type="white"
                style={{marginTop: 10}}
                fullWidth
                onClick={() => selectCountry('ca')}>
                CANADA
            </Button>
            {/* <Button
                type="white"
                style={{marginTop: 20}}
                fullWidth
                onClick={() => selectCountry('usa')}>
                USA
            </Button> */}
            <Button
                type="white"
                style={{marginTop: 20}}
                fullWidth
                onClick={() => NavigationService.navigate('CountryError')}>
                OTHER
            </Button>
        </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: 60
  },
  description: {
    color: 'grey',
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center'
  },
  formHeading : {
    fontWeight: 'bold',
    textAlign: 'center',
    width: '80%',
    alignSelf: 'center',
    marginTop: 0,
    fontSize: 16
  },
});

SelectDeliveryScreen2.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Deliver to',
    },
  });