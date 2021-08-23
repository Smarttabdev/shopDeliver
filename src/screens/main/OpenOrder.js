import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  Image,
  StyleSheet,
} from 'react-native';

import { useSelector, useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import {
  Screen,
  Button,
  AppText
} from '~/components';
import { Theme, MainNavigationOptions, GlobalStyles } from '~/styles';

import { fetchAPI, formatString, getTimePassed } from '~/core/utility';
import {
  showNotification,
  setOrder,
  cancelOrder,
  setTerritory,
  setToken,
} from '~/store/actions';

export const OpenOrder = ({ navigation }) => {
  const [orderDetail, setOrderDetail] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState('');
  const [addresses, setAddresses] = useState([]);

  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);
  const order = useSelector((state) => state.order.order);

  useEffect(() => {
    if (token) {
      setLoading(true);

      fetchAPI('/myaccount/addresses', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          setAddresses(res.data.addresses);
        })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
    }
  }, [dispatch]);

  // get Order Details
  const getOrderDetails = useCallback(() => {
    setLoading(true);

    fetchAPI(`/order/details`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        dispatch(setOrder(res.data));
        setOrderDetail(res.data);
        dispatch(setTerritory(res.data.territory));
        setDeliveryMode(
          +res.data.territory_distance >
            +res.data.territory.delivery_area_radius
            ? 'pickup'
            : 'deliver',
        );
      })
      .catch((err) =>
        {
          NavigationService.navigate('Location');
        }
      )
      .finally(() => setLoading(false));
  }, []);

  const _cancelOrder = useCallback(() => {
    setLoading(true);

    fetchAPI('/order/cancel', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        dispatch(cancelOrder());
        const formDataa = new FormData();
        if(order){
          console.log('cancelaaaaaaaled++++++',order.address_id);
          if(order.address_id == '' || order.address_id == '0'){
            
            formDataa.append('as_guest', 1);
            formDataa.append('address', order.address);
            await fetchAPI('/order/address', {
              method: 'POST',
              body: formDataa,
            })
              .then((res) => {
                console.log('cancelaaaaaaaled++++++',order.address);
                console.log('cancelled++++++',res.data.order_id);
                dispatch(setOrder(res.data));  
                dispatch(setToken(res.data.token));
              })
              .catch((err) =>
                dispatch(
                  showNotification({
                    type: 'error',
                    message: err.message,
                  }),
                ),
              )
              .finally(() => setLoading(false));  
          } else { 
            formDataa.append('address_id', order.address_id);
            await fetchAPI('/order/address', {
              method: 'POST',
              headers: {
                authorization: `Bearer ${token}`,
              },
              body: formDataa,
            })
              .then((res) => {
                dispatch(setOrder(res.data));  
              })
              .catch((err) =>
                dispatch(
                  showNotification({
                    type: 'error',
                    message: err.message,
                  }),
                ),
              )
              .finally(() => setLoading(false));  
          }
        }
          NavigationService.navigate('Home');
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: res.message })),
      );
  }, [addresses]);
 
  useEffect(() => getOrderDetails(), []);

  const timePassed = useMemo(
    () =>
      {
          if(orderDetail && orderDetail.date){
            return getTimePassed(orderDetail.date) ? getTimePassed(orderDetail.date)+' ago' : '';
          }
          
          else
          return null
      },
    [orderDetail],
  );

  return (
    <Screen hasList isLoading={isLoading} fullScreen={true}>
      <View style={styles.container}>
        {orderDetail && (
          <View style={[styles.centerAlign]}>
          <AppText style={styles.title}>You started an order {timePassed}</AppText>
        </View>
        )}
        {orderDetail && (
          <View style={styles.orderInfo}>
            <View style={styles.orderInfoWrapper}>
              <View style={[styles.orderInfoSeller,styles.greyBox]}>
                <View style={styles.imageWrapper}>
                  {orderDetail.territory && (
                    <Image
                      source={{ uri: orderDetail.territory.app_image }}
                      style={styles.image}
                    />
                  )}
                </View>
                <View style={styles.locationWrapper}>
                  <AppText style={styles.sellerName}>
                    {formatString(orderDetail.territory.name,12)}
                  </AppText>
                  <AppText>
                  {formatString((orderDetail.territory.type_slug != 'services' ? (+orderDetail.territory_distance_km).toFixed(2)+(`km away`) : (orderDetail.territory.warehouse_address)), 20)}                              
                  </AppText>
                </View>
              </View>
            </View>
            <View style={[styles.orderInfoTotal,styles.greyBox]}>
                <AppText style={[styles.orderNumber]}>
                    # {orderDetail.order_id}
                </AppText>
                <AppText style={[styles.orderTotal]}>
                    {orderDetail.currency_icon}
                    {(deliveryMode === 'deliver'
                      ? +orderDetail.total_amount_with_delivery
                      : +orderDetail.total_amount_without_delivery
                    ).toFixed(2)}
                </AppText>
            </View>
          </View>
        )}
        {orderDetail && (
          <View style={styles.actions}>
            <Button
              style={GlobalStyles.formControl}
              type="bordered-dark"
              onClick={() => {
                NavigationService.navigate('MyOrder');
              }}>
              Continue
            </Button>
            <View style={[GlobalStyles.formControl,styles.centerAlign]}>
              <AppText style={styles.greyText}>OR</AppText>
            </View>
            <Button
              style={GlobalStyles.formControl}
              type="bordered-dark"
              onClick={_cancelOrder}>
              Start a New Order
            </Button>
          </View>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Theme.layout.screenPaddingTop + 30,
    paddingBottom: Theme.layout.screenPaddingBottom,
    flex: 1,
  },

  title : {
    fontSize: 16,
    textAlign: 'center',
    paddingBottom: 15,
    color: '#54576F',
    fontWeight: '500'
  },

  orderNumber : {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold'
  },

  orderTotal: {
    fontSize: 14,
    color: Theme.color.accentColor,
    textAlign: 'center',
    fontWeight: '500'
  },

  actions: {
    paddingHorizontal: 20,
  },

  imageWrapper: {
    width: 60,
    alignItems: 'center',
  },

  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth:1,
    borderColor:'#EFEFEF'
  },

  sellerName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  distance: {
    color: '#B90E0F',
    fontSize: 14,
  },

  orderInfo : {
    flexDirection:'row',
    paddingHorizontal: 20, 
    paddingBottom: 10,
    marginBottom: 10
  },

  orderInfoWrapper : {
    flex:65,
    flexDirection: 'column',
    marginRight: 5
  },

  greyBox : {
    backgroundColor: '#D9D9D9',
    padding: 10,
    borderRadius: 8
  },

  orderInfoSeller : {
    flex: 2, 
    flexDirection:'row'
  },

  orderInfoTotal : {
    flex:35,
    flexDirection: 'column',
    alignItems :'flex-start',
    justifyContent: 'center',
    marginLeft: 5
  },

  centerAlign : {
    alignItems: 'center'
  },

  greyText : {
    color: '#ccc',
    fontWeight: 'bold'
  }

});

OpenOrder.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Open Order'
    }
  });
