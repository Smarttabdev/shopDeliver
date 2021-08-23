import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';

import { NavigationService } from '~/core/services';
import { Screen, Button } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { Constants } from '~/core/constant';

export const LocationTypeScreen = ({ navigation }) => {
  const _setAddressType = useCallback((type) => {
    NavigationService.navigate('LocationInstruction', {
      type,
    });
  }, []);

  return (
    <Screen hasList>
      <View style={styles.container}>
        <FlatList
          style={styles.list}
          alwaysBounceVertical={false}
          data={Constants.buildingTypes.map((item) => ({
            value: item,
            label: item,
          }))}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Button
              type="bordered-dark"
              style={GlobalStyles.formControl}
              onClick={() => {
                _setAddressType(item.value);
              }}>
              {item.label}
            </Button>
          )}
        />
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

LocationTypeScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Location Type',
    },
  });
