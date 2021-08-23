import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import { Screen, Input, Button } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification } from '~/store/actions';

export const LocationInstructionScreen = ({ navigation }) => {
  const token = useSelector((state) => state.account.token);
  const order = useSelector((state) => state.order.order);
  const type = useMemo(() => navigation.getParam('type'), []);
  const dispatch = useDispatch();

  const [apartmentNumber, setApartmentNumber] = useState('');
  const [instruction, setInstruction] = useState('');

  const setAddressInfo = useCallback((apartmentNumber, instruction) => {
    const formData = new FormData();
    formData.append('address_id', order.address_id);
    formData.append('type', type);
    formData.append('apartment_nr', apartmentNumber);
    formData.append('delivery_instructions', instruction);
    fetchAPI('/myaccount/edit_address_info', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => {
        NavigationService.navigate('Sellers');
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      );
  }, []);

  return (
    <Screen>
      <View style={styles.container}>
        {(type === 'Apartment' || type === 'Office Building') && (
          <View style={GlobalStyles.formControl}>
            <Input
              title="Unit #"
              placeholder="XXX"
              value={apartmentNumber}
              onChange={setApartmentNumber}
            />
          </View>
        )}
        <View style={GlobalStyles.formControl}>
          <Input
            type="textarea"
            title="Delivery Instructions (optional)"
            placeholder="Type any special instructions you want the delivery person to see"
            value={instruction}
            onChange={setInstruction}
          />
        </View>
        <View style={GlobalStyles.formControl}>
          <Button
            type="bordered-dark"
            onClick={() => setAddressInfo(apartmentNumber, instruction)}>
            Next
          </Button>
        </View>
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
});

LocationInstructionScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Location Type',
    },
  });
