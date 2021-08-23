import React, { useState,useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import { Screen, Input, Button, AppText, } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';
import { fetchAPI } from '~/core/utility';
import {
  showNotification,
  setOrder,
  setToken,
  updatedInstructions
} from '~/store/actions';

export const ProductInstructionEditScreen = ({ navigation }) => {
  const [isLoading, setLoading] = useState(false);
  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);
  const original_instructions = useMemo(() => navigation.getParam('instructions'), []);
  const opid = useMemo(() => navigation.getParam('opid'), []);
  const [instructions, setInstruction] = useState('');
  const dispatch = useDispatch(); 

  useEffect(() => {
   setInstruction(original_instructions);
  }, [original_instructions]);
  
  useEffect(() => {
    navigation.setParams({
    action: updateInstructions,
    actionTitle: 'Save',
    actionColor: 'black',
    });
  }, [instructions]);

  const updateInstructions = useCallback(() => {
    setLoading(true);
    
    const formData = new FormData();
    formData.append('order_product_id', opid);
    formData.append('instructions', instructions);  
    fetchAPI('/order/update_product_instructions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
      body: formData,
    })
      .then((res) => {
        dispatch(setOrder(res.data));
        if(res.data.token)
        {
          dispatch(setToken(res.data.token));
        }
        dispatch(updatedInstructions(instructions));
        NavigationService.navigate('MyOrder');
      })
      .catch((err) => dispatch(showNotification(err.message)))
      .finally(() => setLoading(false));
  }, [instructions]);
  
  return (
    <Screen isLoading={isLoading}>
      <View style={styles.container}>
        <View style={GlobalStyles.formControl}>
          <Input
            type="textarea"
            title="Special Instructions (optional)"
            placeholder="Type any special instructions you want the delivery person to see"
            value={instructions}
            onChange={setInstruction}
          />
        </View>
        <View style={GlobalStyles.formControl}>
          <Button
            type="accent"
            onClick={updateInstructions}>
            Save
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

ProductInstructionEditScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Edit Instructions',
    },
  });