import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { NavigationService } from '~/core/services';
import { Screen, Button } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification } from '~/store/actions';

export const CategoryScreen = ({ navigation }) => {
  const [allCategories, setAllCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setLoading] = useState(false);

  // store
  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);
  const territory = useSelector(
    (state) => state.order && state.order.territory,
  );
  const explorer = useSelector((state) => state.explorer);

  // get categories
  const getCategory = useCallback(
    (parentCategory) => {
      fetchAPI(
        `/categories?territory=${
          token ? territory.tid : explorer.territory.tid
        }&parent=${+parentCategory}`,
        {
          method: 'GET',
        },
      )
        .then((res) => {
          const parentCategoryInfo = allCategories.find(
            (item) => +item.cid === +parentCategory,
          );
          navigation.setParams({ parentCategory: parentCategoryInfo });
          setCategories(res.data.categories);
        })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => {
          setLoading(false);
        });
    },
    [allCategories],
  );

  useEffect(() => {
    fetchAPI(`/categories`, {
      method: 'GET',
    })
      .then((res) => {
        setAllCategories(res.data.categories);
        getCategory(0);
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => {
        setLoading(false);
      });

    navigation.setParams({ goToParentCategoryAction: getCategory });
  }, []);

  return (
    <Screen hasList isLoading={isLoading}>
      <View style={styles.container}>
        {categories && categories.length > 0 && (
          <FlatList
            style={styles.list}
            alwaysBounceVertical={false}
            data={categories}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Button
                type="bordered-dark"
                style={GlobalStyles.formControl}
                onClick={() => {
                  if (item.total_children) {
                    getCategory(item.cid);
                  } else {
                    NavigationService.navigate('Products', { category: item });
                  }
                }}>
                {item.name}
              </Button>
            )}
          />
        )}
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

CategoryScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: (
        navigation.getParam('parentCategory') || { name: 'Categories' }
      ).name,

      headerLeft: () => (
        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={() => {
            const parentCategory = navigation.getParam('parentCategory');
            if (parentCategory && parentCategory.parent) {
              const goToParentCategory = navigation.getParam(
                'goToParentCategoryAction',
              );
              goToParentCategory(parentCategory.parent);
            } else {
              navigation.goBack();
            }
          }}>
          <Icon size={24} name="chevron-left" />
        </TouchableOpacity>
      ),
    },
  });
