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
  updatedNotes
} from '~/store/actions';

export const OrderNoteEditScreen = ({ navigation }) => {
  const [isLoading, setLoading] = useState(false);
  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);
  const [notes, setNote] = useState('');
  const dispatch = useDispatch();   
  
  useEffect(() => {
    navigation.setParams({
    action: updateNotes,
    actionTitle: 'Save',
    actionColor: 'black',
    });
  }, [notes]);

  const updateNotes = useCallback(() => {
    setLoading(true);
    
    const formData = new FormData();
    formData.append('notes', notes);  
    fetchAPI('/order/notes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
      body: formData,
    })
      .then((res) => {
        dispatch(updatedNotes(notes));
        NavigationService.navigate('MyOrder');
      })
      .catch((err) => dispatch(showNotification(err.message)))
      .finally(() => setLoading(false));
  }, [notes]);
  
  return (
    <Screen isLoading={isLoading}>
      <View style={styles.container}>
        <View style={GlobalStyles.formControl}>
          <Input
            type="textarea"
            title="Note"
            placeholder="Enter an optional note to go with this order"
            value={notes}
            onChange={setNote}
          />
        </View>
        <View style={GlobalStyles.formControl}>
          <Button
            type="accent"
            onClick={updateNotes}>
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

OrderNoteEditScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Order Note',
    },
  });