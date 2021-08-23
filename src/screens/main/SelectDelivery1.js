import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { Screen, Input, Button, MessageTerritoryItem, LoadingGIF } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';
import { Constants } from '~/core/constant';
import { fetchAPI } from '~/core/utility';
import { NavigationService } from '~/core/services';
import { DashedLine, AppText, Selector} from '../../components';

import LocationSVG from '~/assets/images/location.svg';

export const SelectDeliveryScreen1 = ({ navigation }) => {
  // const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.account.userInfo);
  const addressCnt = useMemo(() => navigation.getParam('addressCnt'), []);
const [isLoading, setLoading] = useState(false);
const [country, setCountry] = useState('');
const windowWidth = Dimensions.get("window").width;
const territory_type = useSelector((state) => state.order.territory_type.territory_type);
useEffect(() => {
  console.log(territory_type);
  if(windowWidth < 400 ){
    navigation.setParams({
      fontSize: 18
    });
  } 
}, [windowWidth]);
  return (
    <Screen isLoading={isLoading} keyboardAware={true}>
      <View style={styles.container}>
        {addressCnt > 0 && <View style={{marginTop: 10}}><AppText style={styles.formHeading}>Delivery Address</AppText></View>}
        {addressCnt < 1 && <View style={{marginTop:30, textAlign:'center', alignSelf: 'center',}}>
        <LocationSVG height={100} width={100}/>
        </View>}
        <AppText style={{marginTop:30,color:'grey'}}>{'Please add your delivery address in order to view ' + (territory_type && territory_type != "address" ? territory_type : 'businesses') + ' located nearby.'} <AppText style={{fontWeight: "bold", color:'black'}}>Start by selecting your country</AppText></AppText>
        <TouchableOpacity
            onPress={()=> NavigationService.navigate('SelectDelivery2')}
        >
        <View>
          <Input
            style={GlobalStyles.formControl}
            title="Country"
            type="address_country"
            placeholder="Select Your Country"
            value={country}
            editable={false}
            actionIcon="chevron-down"
            actionHandler= {()=> NavigationService.navigate('SelectDelivery2')}
          />
        </View>
        </TouchableOpacity>

        {addressCnt < 1 && ((userInfo && userInfo.user_verified) 
          ? <AppText style={{marginTop:20, color:'grey'}}>
            {'Shopl will save your address so that you don\'t have to do this again.'}
          </AppText>
          : <AppText style={{marginTop:20, color:'grey'}}>
            {'Shopl® can not save your delivery address since you are not signed in. To avoid having to enter your delivery address each time you want to browse, tap on the button below to sign up or sign in.'}
          </AppText>)
        }
        {(!userInfo || !userInfo.user_verified) &&
          <Button
            type="bordered-dark"
            style={{marginTop:30}}
            onClick={() => navigation.navigate('GetAccess')}>
            <AppText style={{ textTransform:'uppercase',fontWeight: "bold"}}>Sign in</AppText>
          </Button>
        }
      
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: 60
  },
  formHeading : {
    fontWeight: 'bold',
    textAlign: 'center',
    width: '80%',
    alignSelf: 'center',
    marginTop: 0,
    fontSize: 16
  },
  detailValueWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    // backgroundColor : '#000'
  },
});

SelectDeliveryScreen1.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: navigation.getParam('addressCnt') < 1 ? 'Delivery Address': "Deliver To",
    },
  });