import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';

import { Screen, Button, AppText } from '~/components';
import { NavigationService } from '~/core/services';
import { Theme } from '~/styles';

import { setTerritoryType,cancelOrder } from '~/store/actions';
import { Config } from '~/core/config';
import { fetchAPI } from '~/core/utility';

import analytics from '@react-native-firebase/analytics';
import { AppEventsLogger } from "react-native-fbsdk-next";

export const OrderSuccessScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const [isLoading, setLoading] = useState(false);
  const [shopsCount, setShopsCount] = useState(0);
  const [restaurantsCount, setRestaurantsCount] = useState(0);

  const token = useSelector((state) => state.account.token);
  const orderId = useMemo(() => navigation.getParam('orderId'), []);
  const order = useSelector((state) => state.order && state.order.order);
  const explorer = useSelector((state) => state.explorer);

  const territory_type = useMemo(
    () => (order ? order.territory.type_slug : false),
    [order],
  );

  const territory_type_other = useMemo(
    () => (territory_type ? (territory_type == 'shops' ? 'restaurants' : territory_type == 'shops' ? 'shops' : 'services') : false),
    [territory_type],
  );

  const navigateToSellers = (
    category
  ) => {
    dispatch(setTerritoryType({ territory_type : category }));
    dispatch(cancelOrder());

    NavigationService.navigate('Sellers',{
      title : category == 'restaurants' ? 'restaurants' : category == 'shops' ? 'shops' : 'services' 
    })
  }

  useEffect(() => {
    if (token && order && order.address_id != '0') {
      setLoading(true);
      const formData = new FormData();
      formData.append('address_id', order.address_id);
      const getSellersDelivery = fetchAPI(`/territories/by_address_id?1&type=${territory_type_other}&deliverable=1&filter_by=products_totals&size=4&page=0&sort_by_extra=is-operational`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: formData,
      }).then((res) => {
        if(territory_type_other == 'restaurants')
        setRestaurantsCount(
          res.data.total,
        );
        else
        setShopsCount(
          res.data.total,
        );
      });

      Promise.all([getSellersDelivery])
        .catch((err) => {
          dispatch(showNotification({ type: 'error', message: err.message }));
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(true);
      const getSellersDelivery = fetchAPI(
        `/territories/by_address?address=${explorer.address}&type=${territory_type_other}&deliverable=1&filter_by=products_totals&size=4&page=0&sort_by_extra=is-operational`,
        {
          method: 'GET',
        },
      ).then((res) => {
        if(territory_type_other == 'restaurants')
        setRestaurantsCount(
          res.data.total,
        );
        else
        setShopsCount(
          res.data.total,
        );
      });

      Promise.all([getSellersDelivery])
        .catch((err) => {
          dispatch(showNotification({ type: 'error', message: err.message }));
        })
        .finally(() => setLoading(false));
    }
  }, [dispatch, territory_type_other]);

  const showAnotherTerritoryButton = useMemo(
    () => (territory_type ? (territory_type == 'shops' ? restaurantsCount > 0 : shopsCount > 0) : false),
    [territory_type,shopsCount,restaurantsCount],
  );

  

  useEffect(() => {
    if(order){
      const analytics_data = {
        transaction_id: orderId,
        currency: order.currency,
        value: +order.cart_total_amount,
        tax: +order.cart_tax_amount
      };

      analytics().logEvent('purchase', analytics_data)
      AppEventsLogger.logPurchase(analytics_data.value, analytics_data.currency, analytics_data);
    }
  }, [order]);

  return (
    <Screen>
      {order && (
        <View style={styles.container}>

          <View><Icon size={120} color={ Theme.color.accentColor} name="emoticon-happy-outline" /></View>

          <AppText style={styles.successTitle}>ORDER RECEIVED!</AppText>

          <AppText style={styles.successSubtitle}>Your credit card has been charged successfully.</AppText>
          <AppText style={styles.successSubtitle}>Check your e-mail for a copy of your Order.</AppText>
          <AppText style={styles.successSubtitle}>On behalf of {order.territory.name}, thanks for shopping local!</AppText>

          <Button
            type="accent"
            fullWidth
            style={styles.successButton}
            onClick={() => {
              Share.open({
                title: 'Share Shopl',
                url: Config.shareURL,
              });
          }}>
            Tell your friends about Shopl
          </Button>
          
          <Button
            type="bordered-dark"
            fullWidth
            style={styles.successButton}
            onClick={() => navigateToSellers(territory_type)}>
            {territory_type === 'restaurants' ? 'Order More Food' : 'Keep Shopping' }
          </Button>

          {showAnotherTerritoryButton && <Button
            type="bordered-dark"
            fullWidth
            style={styles.successButton}
            onClick={() => navigateToSellers(territory_type == 'restaurants' ? 'shops' : 'restaurants')}>
            {territory_type === 'restaurants' ? 'View Shops' : 'Order Food' }
          </Button>}

          <Button
            type="bordered-dark"
            fullWidth
            style={styles.successButton}
            onClick={() => {
              dispatch(cancelOrder());
              NavigationService.reset('Home');
            }}>
            Exit
          </Button>
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  imageWrapper: {
    paddingHorizontal: 60,
    marginTop: 40,
    marginBottom: 15,
    width: '100%',
    flexDirection: 'row',
  },

  image: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 500,
  },

  sellerName: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    textTransform: 'uppercase',
  },

  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.color.accentColor,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  orderNumber: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 10,
  },

  successTitle : { 
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },

  successSubtitle : { 
    fontSize: 12,
    color: 'black',
    textAlign: 'center',
    marginTop: 20,
  },

  successButton : {
    marginTop : 20
  }
});

OrderSuccessScreen.navigationOptions = {
  headerShown: false,
};
