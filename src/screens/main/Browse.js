import React from 'react';
import { View, StyleSheet } from 'react-native';

import { NavigationService } from '~/core/services';
import { Screen, Button } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

export const BrowseScreen = () => {
  return (
    <Screen>
      <View style={styles.container}>
        <Button
          type="bordered-dark"
          style={GlobalStyles.formControl}
          onClick={() => NavigationService.navigate('Sellers')}>
          By Seller
        </Button>
        <Button
          type="bordered-dark"
          style={GlobalStyles.formControl}
          onClick={() => NavigationService.navigate('Category')}>
          By Category
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
});

BrowseScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Browse',
    },
  });
