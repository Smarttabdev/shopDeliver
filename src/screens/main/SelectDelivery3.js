import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Screen, Input, Button, LocationSelector, MessageTerritoryItem, LoadingGIF,Selector } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';

import { showNotification, enterMessageRoom, cancelOrder,setOrder,setPhone, setToken,setGuestToken, setAddress as setAddressdata, setAddressFull as setAddressFullAction } from '~/store/actions';
import { NavigationService } from '~/core/services';
import { DashedLine, AppText} from '../../components';
import { Constants } from '~/core/constant';
import { Config } from '~/core/config';

import GetLocation from 'react-native-get-location';
import GeoCoder from 'react-native-geocoding';
import Dialog from 'react-native-dialog';

import parseAddress from 'parse-address-string';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HeaderStyleInterpolators } from 'react-navigation-stack';
import { KeyboardAvoidingView } from 'react-native';

export const SelectDeliveryScreen3 = ({ navigation }) => {

    const [isLoading, setLoading] = useState(false);
    const userInfo = useSelector((state) => state.account.userInfo);
    const [buildType, setBuildType] = useState('');
    const [street, setStreet] = useState('');
    const [unit, setUnit] = useState('');
    const [city, setCity] = useState('');
    const [province, setProvince] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [note, setNote] = useState('');

    const [address, setAddress] = useState('');
    const [addressFull, setAddressFull] = useState(null);
    const [dlgVisible, setDlgVisible] = useState(false);
    const order = useSelector((state) => state.order.order);
    const country = navigation.getParam('country');
    const mapRef = useRef();
    const token = useSelector((state) => state.account.token);
    const guestToken = useSelector((state) => state.account.guestToken);
    const territory_type = useSelector(
      (state) => state.order.territory_type.territory_type,
    );
    const dispatch = useDispatch();
    const windowWidth = Dimensions.get("window").width;
    useEffect(() => {
      if(windowWidth < 400 ){
        navigation.setParams({
          fontSize: 18
        });
      } 
    }, [windowWidth]);
    const selectCurrentLocation = useCallback(() => {
      GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      })
        .then((location) => {
          GeoCoder.from([location.latitude, location.longitude])
            .then((json) => {
              let addressResult = json.results[0];
              setAddressFull(addressResult);
              setAddress(addressResult.formatted_address);
              setDlgVisible(true);
            })
            .catch((err) =>
              dispatch(showNotification({ type: 'error', message: err.message })),
            );
        })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        );
    }, [dispatch]);

    const saveDelivery = useCallback(() => {
      console.log("here",address);
      if(address === '') return;   
      if( (order && order.cart_amount> 0 ) && ( token || guestToken)) {
        setLoading(true);
        fetchAPI('/order/cancel', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token ? token : guestToken}`,
          },
        })
        .then(async (res) => {
          dispatch(cancelOrder());   
          const formData = new FormData();
          formData.append("city", city);
          formData.append("province", province);
          formData.append("zipcode", postalCode);
          formData.append("country", country);
          formData.append("apartment_nr", unit);
          formData.append("type", buildType);
          formData.append("delivery_instructions", note);
          formData.append("address", street);
          setLoading(true);
          if(token && ( userInfo && userInfo.user_verified  && userInfo.user_verified == true)){
              fetchAPI('/order/address', {
                method: 'POST',
                headers: {
                  authorization: `Bearer ${token}`,
                },
                body: formData,
              })
                .then((res) => {  
                  dispatch(setOrder(res.data));
                  dispatch(setAddressdata(address));
                  if (addressFull) {
                    dispatch(setAddressFullAction(addressFull));                      
                  }
                  if(territory_type && territory_type != 'address'){
                    NavigationService.navigate('Sellers');
                  } else {
                    NavigationService.reset('Home');
                    NavigationService.navigate('Location');
                  }
                  dispatch(enterMessageRoom('address updated'));
                })
                .catch((err) =>
                  dispatch(
                    showNotification({
                      type: 'error',
                      message: err.message,
                    }),
                  ),
                )
                .finally(() => setLoading(false));    
              } else {
                
                formData.append('as_guest', 1);
                fetchAPI('/order/address', {
                  method: 'POST',
                  body: formData,
                })
                  .then((res) => {
                    dispatch(setGuestToken(res.data.token));
                      if (address) {
                        dispatch(setAddressFullAction(address));
                        dispatch(setAddressdata(address));
                      }
                      //dispatch(setAddress(address));
                      if(territory_type){
                        NavigationService.navigate('Sellers');
                      } else {
                        NavigationService.reset('Home');
                      }
                  })
                  .catch((err) =>
                    dispatch(
                      showNotification({
                        type: 'error',
                        message: err.message,
                      }),
                    ),
                  )
                  .finally(() => setLoading(false)); 
              }     
      })
      .catch((err) =>
        dispatch(
          showNotification({
            type: 'error',
            message: err.message,
          }),
        ),
      )
      .finally(() => setLoading(false)); 
    } else {
      const formData = new FormData();
      formData.append("city", city);
      formData.append("province", province);
      formData.append("zipcode", postalCode);
      formData.append("country", country);
      formData.append("apartment_nr", unit);
      formData.append("type", buildType);
      formData.append("delivery_instructions", note);
      formData.append("address", street);
      console.log("formdata " ,  formData);
      setLoading(true);
      if(token && ( userInfo && userInfo.user_verified  && userInfo.user_verified == true)){
          fetchAPI('/order/address', {
            method: 'POST',
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: formData,
          })
            .then((res) => {  
              dispatch(setOrder(res.data));
              dispatch(setAddressdata(address));
              if (addressFull) {
                dispatch(setAddressFullAction(addressFull));                      
              }
              console.log("territory clcicked",territory_type);
              if(territory_type && territory_type != 'address'){
                NavigationService.navigate('Sellers');
              } else {
                NavigationService.reset('Home');
                NavigationService.navigate('Location');
              }
              dispatch(enterMessageRoom('address updated'));
            })
            .catch((err) =>
              dispatch(
                showNotification({
                  type: 'error',
                  message: err.message,
                }),
              ),
            )
            .finally(() => setLoading(false));    
          } else {
            
            formData.append('as_guest', 1);
            fetchAPI('/order/address', {
              method: 'POST',
              body: formData,
            })
              .then((res) => {
                console.log("+++++++++++++++",address);
                console.log("+++++++++++++++",res.data);
                dispatch(setGuestToken(res.data.token));
                  if (address) {
                    dispatch(setAddressFullAction(address));
                    dispatch(setAddressdata(address));
                  }
                  //dispatch(setAddress(address));
                  if(territory_type && territory_type != 'address'){
                    NavigationService.navigate('Sellers');
                  } else {
                    NavigationService.reset('Home');
                  }
              })
              .catch((err) =>
                dispatch(
                  showNotification({
                    type: 'error',
                    message: err.message,
                  }),
                ),
              )
              .finally(() => setLoading(false)); 
          }     
    }
},[dispatch,address,addressFull,street,city,province,country,postalCode,unit,buildType,note]);
    
useEffect(() => {
  setLoading(true);
  setBuildType('House');

  GeoCoder.init(Config.googleAPIKey);

  GetLocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 15000,
  })
    .then(() => {})
    // .catch((err) =>
    // dispatch(showNotification({ type: 'error', message: err.message })),
    // )
    .finally(() => setLoading(false));
}, []);
const _cancelOrder = useCallback(async () => {
  setLoading(true); 
  
}, [dispatch]);

  return (
    <Screen isLoading={isLoading}  keyboardAware={true} >
      <Dialog.Container visible={dlgVisible}>
        <Dialog.Description>{address}</Dialog.Description>
        <Dialog.Button
          label="Cancel"
          onPress={() => {
            setDlgVisible(false);
          }}
        />
        <Dialog.Button
          label="Edit"
          onPress={() => {
            mapRef.current.setAddressText(address);
            setDlgVisible(false);
          }}
        />
        <Dialog.Button
          label="Continue"
          onPress={() => {
            setDeliveryAddress(address);
            setDlgVisible(false);
          }}
        />
      </Dialog.Container>
      <View style={styles.container}>
       <View style={{marginTop: 10, marginBottom: 10}}><AppText style={styles.formHeading}>Delivery Address</AppText></View>
       <AppText style={styles.description}>Please enter your full address below</AppText>       
    
        <View style={[styles.flexRowBetween, GlobalStyles.formControl]}>
        {
        <Selector
            style={styles.option}
            typeSelector="Building"
            value={buildType}
            title="Building"
            header="Building"
            options={Constants.buildingTypes.map((item) => ({
              label: item,
              value: item,
            }))}
            placeholder="Please select a building type"
            onChange={setBuildType}
          />
        }
        </View>
        <View>  
          <LocationSelector
            mapRef={mapRef}
            value={address}
            country={country != 'other' ? country : undefined}
            onChange={(data) => {
              console.log("changed!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
              parseAddress(data.formatted_address, (err, addressObj) => {
                err = err;
                console.log(addressObj);
                setStreet(addressObj.street_address1);
                setCity(addressObj.city);
                setProvince(addressObj.state);
                setPostalCode(addressObj.postal_code);
                mapRef.current?.setAddressText(addressObj.street_address1);
                
              });
              setAddressFull(data);
              setAddress(data.formatted_address);
            }}
            style={{...GlobalStyles.formControl, backgroundColor: '#dedede'}}
            actionHandler={() => {
              //setDeliveryAddress(address, 'address', addressFull);
            }}
            // selectCurrentLocation={selectCurrentLocation}
          />
        </View>
{/*       
        <Input
          style={GlobalStyles.formControl}
          title="Street"
          placeholder="Enter your street address"
          value={street}
          editable={false}
          //actionIcon="chevron-down"
          //actionHandler= { ()=> console.log('abc') }
          onChange={(e) => setStreet(e)}
        /> */}
        
        {(buildType === 'Apartment' || buildType === 'Office Building') && (
          <Input
            style={GlobalStyles.formControl}
            title="Unit#"
            placeholder="Enter your street address"
            value={unit}
            onChange={(e) => setUnit(e)}
          />
        )}
        <Input
          style={GlobalStyles.formControl}
          title="City"
          placeholder="Enter your city name"
          value={city}
          editable={true}
          onChange={(e) => setCity(e)}
        />
        <Input
          style={GlobalStyles.formControl}
          title={navigation.getParam('country') ==  'usa' ? "State" : "Province"}
          placeholder={navigation.getParam('country') ==  'usa' ? "Enter your state name" : "Enter your province name"}
          value={province}
          editable={true}
          onChange={(e) => setProvince(e)}
        />
        <Input
          style={GlobalStyles.formControl}
          title={navigation.getParam('country') ==  'usa' ? "ZIP Code" : "Postal Code"}
          placeholder={navigation.getParam('country') ==  'usa' ? "Enter your ZIP code" : "Enter your postal code"}
          value={postalCode}
          editable={true}
          onChange={(e) => setPostalCode(e)}
        />
        <Input
          style={GlobalStyles.formControl}
          title="Note"
          placeholder="Optional"
          value={note}
          onChange={(e) => setNote(e)}
        />
      
        <Button
            type="accent"
            style={{marginTop: 30,marginBottom:20}}
            fullWidth
            onClick={() => saveDelivery()}>
            SAVE & CONTINUE
        </Button>

     
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: 60,  
  },  
  option: {
    flex: 5,
    borderWidth: 0,
    backgroundColor: '#dedede',
    height: 50
  },
  flexRowBetween: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formHeading : {
    fontWeight: 'bold',
    textAlign: 'center',
    width: '80%',
    alignSelf: 'center',
    marginTop: 0,
    fontSize: 16
  },

  description: {
    color: 'grey',
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center'
  },
});

SelectDeliveryScreen3.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Deliver To',
    },
  });