import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import MapView, { Marker } from 'react-native-maps';
import GeoCoder from 'react-native-geocoding';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import parseAddress from 'parse-address-string';

import { NavigationService } from '~/core/services';
import { Constants } from '~/core/constant';
import { Screen, Input, Button, AppText } from '~/components';
import { Theme, MainNavigationOptions, GlobalStyles } from '~/styles';
import { fetchAPI } from '~/core/utility';
import { showNotification } from '~/store/actions';

export const DeliveryLocationScreen = ({ navigation }) => {
  const addressId = useMemo(() => navigation.getParam('addressId'), []);
  const token = useSelector((state) => state.account.token);
  const dispatch = useDispatch();

  const [isLoading, setLoading] = useState();
  const [address, setAddress] = useState();
  const [locationInfo, setLocationInfo] = useState({});
  const [geoCode, setGeoCode] = useState();
  const [parsedAddress, setParsedAddress] = useState();

  useEffect(() => {
    setLoading(true);

    fetchAPI(`/myaccount/address/${addressId}`, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setAddress(res.data.address);
        setLocationInfo({
          type: res.data.type,
          unitNumber: res.data.apartment_nr,
          deliveryNote: res.data.delivery_instructions,
        });
        parseAddress(res.data.address, (err, addressObj) => {
          err = err;
          setParsedAddress(addressObj);
        });

        GeoCoder.from(res.data.address)
          .then((json) => {
            const location = json.results[0].geometry.location;
            setGeoCode({
              latitude: location.lat,
              longitude: location.lng,
              latitudeDelta: 0.001,
              longitudeDelta: 0.001,
            });
          })
          .catch((err) => console.log(err));
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, [addressId, token]);

  const _save = useCallback(() => {
    const formData = new FormData();
    formData.append('address_id', addressId);
    formData.append('type', locationInfo.type);
    formData.append('apartment_nr', locationInfo.unitNumber);
    formData.append('delivery_instructions', locationInfo.deliveryNote);

    fetchAPI('/myaccount/edit_address_info', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => {
        navigation.goBack();
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      );
  }, [locationInfo]);

  useEffect(() => {
    navigation.setParams({
      actionTitle: 'SAVE',
      actionColor: 'black',
      action: _save,
    });
  }, [_save]);

  return (
    <Screen isLoading={isLoading}>
      <View style={styles.container}>
        {parsedAddress && (
          <AppText style={styles.streetName}>
            {parsedAddress.street_address1}
          </AppText>
        )}
        {geoCode && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={geoCode}
              pointerEvents="none">
              <Marker
                coordinate={geoCode}
                title={address}
                style={styles.markerContainer}>
                <Icon name="map-marker" color="red" size={30} />
              </Marker>
            </MapView>
          </View>
        )}
        <Input
          style={GlobalStyles.formControl}
          title="Type"
          placeholder="Apartment"
          value={locationInfo.type}
          onChange={(e) => setLocationInfo({ ...locationInfo, type: e })}
          editable={false}
          actionIcon="chevron-right"
          actionHandler={() => {
            NavigationService.navigate('SelectorPage', {
              title: 'Location Type',
              options: Constants.buildingTypes.map((item) => ({
                label: item,
                value: item,
              })),
              action: (e) => setLocationInfo({ ...locationInfo, type: e }),
            });
          }}
        />
        {(locationInfo.type === 'Apartment' ||
          locationInfo.type === 'Office Building') && (
          <Input
            style={GlobalStyles.formControl}
            title="Unit #"
            placeholder="XXX"
            value={locationInfo.unitNumber}
            onChange={(e) =>
              setLocationInfo({ ...locationInfo, unitNumber: e })
            }
          />
        )}
        <Input
          style={GlobalStyles.formControl}
          type="textarea"
          title="Instructions"
          placeholder="Type instructions for the delivery person"
          value={locationInfo.deliveryNote}
          onChange={(e) =>
            setLocationInfo({ ...locationInfo, deliveryNote: e })
          }
        />
        <Button
          style={GlobalStyles.formControl}
          type="bordered-dark"
          onClick={_save}>
          Save
        </Button>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Theme.layout.screenPaddingTop,
    paddingBottom: Theme.layout.screenPaddingBottom,
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    flex: 1,
  },

  streetName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 20,
  },

  mapContainer: {
    marginLeft: -Theme.layout.screenPaddingHorizontal,
    marginRight: -Theme.layout.screenPaddingHorizontal,
    height: 150,
    position: 'relative',
  },

  map: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

DeliveryLocationScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'address',
      textTintColor: 'black',
    },
  });
