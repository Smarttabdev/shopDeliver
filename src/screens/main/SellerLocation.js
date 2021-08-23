import React, { useMemo, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import GeoCoder from 'react-native-geocoding';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Screen, AppText } from '~/components';
import { Theme, MainNavigationOptions } from '~/styles';

export const SellerLocationScreen = ({ navigation }) => {
  const seller = useMemo(() => navigation.getParam('seller'), []);
  const distance = useMemo(() => navigation.getParam('distance'), []);
  const [geoCode, setGeoCode] = useState();

  useEffect(() => {
    navigation.setParams({
      title: `${+distance.toFixed(2)}km away`,
    });
    GeoCoder.from(seller.warehouse_address)
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
  }, [seller, distance]);

  return (
    <Screen>
      <View style={styles.container}>
        <AppText style={styles.sellerName}>{seller.name}</AppText>
        {geoCode && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={geoCode}
              pointerEvents="none">
              <Marker
                coordinate={geoCode}
                title={seller.address}
                style={styles.markerContainer}>
                <Icon name="map-marker" color="red" size={30} />
              </Marker>
            </MapView>
          </View>
        )}
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

  sellerName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },

  mapContainer: {
    marginLeft: -Theme.layout.screenPaddingHorizontal,
    marginRight: -Theme.layout.screenPaddingHorizontal,
    aspectRatio: 1,
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

SellerLocationScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: navigation.getParam('title'),
    },
  });
