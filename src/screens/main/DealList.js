import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { Screen, Input, Button, DealItem, LoadingGIF } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setUserInfo, setPhone, setToken, setTerritory,enterMessageRoom } from '~/store/actions';

import { AppText} from '../../components';


export const DealListScreen = ({ navigation }) => {
  const userinfo =  useSelector((state) => state.account.userInfo);
  const [isLoading, setLoading] = useState(false);
  const [dealList, setDealList] = useState(false);

  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);
  const explorer = useSelector((state) => state.explorer);
  const order = useSelector((state) => state.order.order);
  const windowHeight = Dimensions.get('window').height;
  const dispatch = useDispatch();
  const lastAddress = useMemo(() => {
    if (order && order.address) {
      return order.address;
    } else if (explorer && explorer.address) {
      return explorer.address;
  
    } else {
      return false;
    }
  }, [order, explorer]);
  useEffect(() => {
    console.log("+promocodes+++");
    fetchAPI(`/promo_codes?size=10&page=0&address=${lastAddress}`, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
    })
    .then((res) => {
      console.log("deals data ++ ",res.data);
      setDealList(res.data.promo_codes);
    })
    .catch((err) =>
      dispatch(showNotification({ type: 'error', message: err.message })),
    )
  },[token]);


  return (
    <Screen isLoading={isLoading} keyboardAware={true}>
      <View style={styles.container}>
        {dealList === false && (<><LoadingGIF/></>)}
        {dealList && dealList.length > 1 ? <AppText style={styles.heading}>{dealList.length} Promo codes available</AppText> : <AppText style={styles.heading}>{dealList.length} Promo code available</AppText>}
        {dealList && dealList.length > 0 && (
            <ScrollView>
            {
                dealList.map((item, index)=> (
                <TouchableOpacity
                    onPress={() => navigation.navigate('PromoCodeCopy',{
                        promoCode : item
                })}>
                <DealItem
                  item= {item}
                  key= {index}
                />
                </TouchableOpacity>
              ))
            }
            </ScrollView>
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

  heading : {
    fontWeight: 'bold',
    textAlign: 'center',
    width: '80%',
    alignSelf: 'center',
    fontSize: 16,
    marginBottom: 10
  },
});

DealListScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Deals',
    },
  });