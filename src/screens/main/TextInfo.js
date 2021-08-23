import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen, AppText } from '~/components';
import { Theme, MainNavigationOptions } from '~/styles';

import { renderHTML } from '~/core/utility';

export const TextInfoScreen = ({ navigation }) => {
  const content = useMemo(() => navigation.getParam('content'), []);

  return (
    <Screen>
      <View style={styles.container}>
        {content && (
          <AppText style={styles.content}>
            {renderHTML(content)}
          </AppText>
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

  content: {
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 20,
  },
});

TextInfoScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
        headerTitle: navigation.getParam('title'),
    },
  });
