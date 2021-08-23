import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  FlatList,
  Image,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {CheckBox} from 'react-native-elements';
import MapView from 'react-native-maps';
import GeoCoder from 'react-native-geocoding';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { showLocation } from 'react-native-map-link';
import { Config } from '~/core/config';

import { useSelector, useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import {
  Screen,
  CartItem,
  Button,
  DeliveryMode,
  AppText,
  StoredAddress,
  Selector,
} from '~/components';
import { Theme, MainNavigationOptions, GlobalStyles } from '~/styles';

import { fetchAPI, formatString } from '~/core/utility';
import {
  showNotification,
  setOrder,
  cancelOrder,
  setUserInfo,
  setTerritory,
  setToken,
  updatedNotes,
  updatePromoCode,
  setOrderProduct
} from '~/store/actions';
import { DashedLine } from '../../components';

import { AppEventsLogger } from "react-native-fbsdk-next";

export const MyOrderScreen = ({ navigation }) => {
  const [orderDetail, setOrderDetail] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState('');
  const [geoCode, setGeoCode] = useState(null);
  const [isDeliveryDisabled, setDeliveryDisabled] = useState(false);
  const [isPickupDisabled, setPickupDisabled] = useState(false);

  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);
  const order = useSelector((state) => state.order.order);
  const guestToken = useSelector((state) => state.account.guestToken);
  const userInfo = useSelector((state) => state.account.userInfo);
  const territory = useSelector((state) => state.order.territory);
  const [tipValue, setChecked] = useState('');
  const [checked, setOther] = useState('');
  const updated = useSelector((state) => state.notification.updated);
  const updatedNote = useSelector((state) => state.notification.updatedNote);
  const addedPromoCode = useSelector((state) => state.notification.updatePromoCode)
  const [note, setNote] =  useState();
  const [noteLink, setNoteLink] =  useState();
  const _pay = useCallback(() => {


    if(orderDetail)
    AppEventsLogger.logEvent('Initiate Checkout',orderDetail.cart_total_amount,{
      NUM_ITEMS : orderDetail.cart_quantity,
      CURRENCY : orderDetail.currency
    })

    if (!userInfo || !userInfo.email && userInfo.user_verified == false) {      
        
        NavigationService.navigate('GetAccessGuest', {
          deliveryMode: deliveryMode,
          tip_percentage: tipValue,
        });  
    }else if(!userInfo.email && userInfo.user_verified == true){
      NavigationService.navigate('ProfileGuest', {
        deliveryMode: deliveryMode,
        tip_percentage: tipValue,
        signup_already: true,
      });
    } else if (userInfo.creditcard ) {
      setLoading(true);

      const formData = new FormData();
      formData.append('delivery_type', deliveryMode);
      formData.append('tip_percentage', tipValue);

      fetchAPI('/order/pay', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token ? token : guestToken}`,
        },
        body: formData,
      })
        .then((res) => {
          dispatch(setUserInfo({ totalOrders: +userInfo.totalOrders + 1 }));
          dispatch(cancelOrder());
          NavigationService.reset('OrderSuccess', {
            orderId: res.data.order_id,
          });
        })
        .catch((err) => {
          dispatch(showNotification({ type: 'error_card', message: err.message}));
          NavigationService.navigate('Account/CreditCard', {
            deliveryMode: deliveryMode,
            tip_percentage: tipValue,
          });
        })
        .finally(() => setLoading(false));
    } else {
      NavigationService.navigate('Account/CreditCard', {
        deliveryMode: deliveryMode,
        tip_percentage: tipValue,
      });
    }
  }, [userInfo, deliveryMode, tipValue, orderDetail]);

  const updateQuantity = useCallback((item, qty) => {
    setLoading(true);

    const formData = new FormData();
    // formData.append('product_id', item.pid);
    // formData.append('option_sku', item.option_sku);
    formData.append('order_product_id', +item.opid);
    formData.append('quantity', qty);

    // if(item.extras){
    //   for (var key in item.extras) {
    //     let addOn = item.extras[key];
    //     let addOnSKU = key;

    //     for (var optionKey in addOn.options){
    //       let addOnValue = optionKey;
    //       formData.append('extra_'+addOnSKU+'[]', addOnValue);
    //     }
    //   }
    // }

    fetchAPI('/order/update_product_quantity', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
      body: formData,
    })
      .then((res) => {
        dispatch(setOrder(res.data));
        getOrderDetails();
      })
      .catch((err) => dispatch(showNotification(err.message)))
      .finally(() => setLoading(false));
  }, []);

  const removeProduct = useCallback((item) => {
    setLoading(true);

    const formData = new FormData();
    // formData.append('product_id', item.pid);
    // formData.append('option_sku', item.option_sku);
    formData.append('order_product_id', item.opid);

    fetchAPI('/order/remove_product', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
      body: formData,
    })
      .then((res) => {
        dispatch(setOrder(res.data));
        getOrderDetails();
      })
      .catch((err) => dispatch(showNotification({ type: 'error', message: err.message })))
      .finally(() => setLoading(false));
  }, []);

  // get Order Details
  const getOrderDetails = useCallback(() => {
    setNoteLink("+ Add A Note");
    setNote('');
    dispatch(updatePromoCode(''));
    setLoading(true);
    
    fetchAPI('/order/details', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
    })
      .then((res) => {        
        dispatch(setOrder(res.data));
        setOrderDetail(res.data);
        if(res.data.cart_quantity == '0'){
          NavigationService.reset('Home');
          NavigationService.navigate('Sellers');
        }
        dispatch(updatedNotes(res.data.notes));
        setNote(res.data.notes);
        dispatch(setTerritory(res.data.territory));        
        setDeliveryDisabled(
          +res.data.territory_distance >
            +res.data.territory.delivery_area_radius,
        );
        setPickupDisabled(+res.data.territory.offer_pickup == 0);
        setDeliveryMode(
          +res.data.territory_distance >
            +res.data.territory.delivery_area_radius
            ? 'pickup'
            : 'deliver',
        );
        MyOrderScreen.navigationOptions = ({ navigation }) =>
        MainNavigationOptions({
          navigation,
          options: {
            headerTitle: res.data.has_subscription_products == true ? 'subscription' : 'My cart',
            headerTintColors: 'black',
          },
          headerTitleStyle: {
            color: 'black',
          },
        });
        GeoCoder.init(Config.googleAPIKey);

        GeoCoder.from(res.data.territory.warehouse_address)
          .then((json) => {
            const location = json.results[0].geometry.location;
            setGeoCode({
              latitude: location.lat,
              longitude: location.lng,
              latitudeDelta: 0.001,
              longitudeDelta: 0.001,
            });
          })
          .catch((err) =>
            dispatch(showNotification({ type: 'error', message: err.message })),
          );
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
        dispatch(cancelOrder())
      )
      .finally(() => setLoading(false));
  }, []);

  const _cancelOrder = useCallback(() => {
    setLoading(true);

    fetchAPI('/order/cancel', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
    })
      .then(async (res) => {
        console.log("order+=======================",order);
        dispatch(cancelOrder());
        console.log("order+=======================",order);
        const formDataa = new FormData();
        if(order){
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
            console.log("order+=======================",order);
            console.log("address_id++++++++++",order.address_id);
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
        NavigationService.navigate('Sellers');
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: res.message })),
      );
  }, [order]);

  useEffect(() => {
    navigation.setParams({ action: _pay, actionTitle: 'Pay' });
  }, [_pay]);

  useEffect(() => getOrderDetails(), [updated,updatedNote,addedPromoCode]);

  useEffect(() => {
    if(updatedNote != ''){
      setNote(updatedNote);
      setNoteLink('- Remove Note');
    }
  }, [updatedNote]);
  
  const removeNote = useCallback((note) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('notes', note);  
    fetchAPI('/order/notes', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
      body: formData,
    })
      .then((res) => {
        dispatch(updatedNotes(''));
        getOrderDetails();
        //NavigationService.navigate('MyOrder');
      })
      .catch((err) => dispatch({ type: 'error', message: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const payButtonText = useMemo(
    () =>
      (userInfo && orderDetail ? 'Pay' : 'Checkout') +
      (orderDetail &&
        ' - ' +
          orderDetail.currency_icon +
          (deliveryMode === 'deliver'
            ? +orderDetail.total_amount_with_delivery*(1+tipValue/100)
            : +orderDetail.total_amount_without_delivery*(1+tipValue/100)
          ).toFixed(2) + (orderDetail.has_subscription_products == true  ? (' ' + orderDetail.products[0].subscription_type_name_every): '')),
    [userInfo, orderDetail, deliveryMode, tipValue],
  );
  const showTaxLine = useMemo(() => {
    if (orderDetail === null) {
      return false;
    } else {
      if (deliveryMode === 'deliver') {
        return (+orderDetail.tax_amount_with_delivery).toFixed(2) > 0
          ? true
          : false;
      } else {
        return (+orderDetail.tax_amount_without_delivery).toFixed(2) > 0
          ? true
          : false;
      }
    }
  }, [orderDetail]);

  useEffect(() => {
    if(orderDetail){
      AppEventsLogger.logEvent('USER VIEWS THE CART',orderDetail.cart_total_amount,{
        NUM_ITEMS : orderDetail.cart_quantity,
        CURRENCY : orderDetail.currency
      })
    }
  },[orderDetail])

  return (
    <Screen hasList isLoading={isLoading} showHeaderOverLayOnScroll>
      <View style={styles.container}>
        {orderDetail && (
          <FlatList
            data={orderDetail.products}
            alwaysBounceVertical={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <CartItem
                orderDetail={orderDetail}
                product={item}
                
                updateQuantity={(e) => updateQuantity(item, e)}
                removeProduct={() => removeProduct(item)}
              />
            )}            
            ListHeaderComponent={() => (
              <>
                {orderDetail && (
                  <>
                    <View style={styles.orderInfo}>
                      <View style={styles.orderInfoWrapper}>
                        <View style={styles.orderInfoSeller}>
                          <View style={styles.imageWrapper}>
                            {orderDetail.territory && (
                              <Image
                                source={{
                                  uri: orderDetail.territory.app_image,
                                }}
                                style={styles.image}
                              />
                            )}
                          </View>
                          <View style={styles.locationWrapper}>
                            <AppText style={styles.sellerName} numberOfLines={1}>
                              {formatString(orderDetail.territory.name, 20)}
                            </AppText>
                            <AppText>
                              {((token && orderDetail.territory.type_slug != 'services') ? (+orderDetail.territory_distance_km).toFixed(2)+(`km away`) : (orderDetail.territory.warehouse_address))}                              
                            </AppText>
                          </View>
                        </View>
                      </View>
                      <View style={styles.orderInfoTotal}>
                        <AppText style={[styles.summaryTotal]}>
                          {orderDetail.currency_icon}
                          {(deliveryMode === 'deliver'
                            ? +orderDetail.total_amount_with_delivery
                            : +orderDetail.total_amount_without_delivery
                          ).toFixed(2)}
                        </AppText>
                      </View>
                    </View>

                    {!isDeliveryDisabled && !isPickupDisabled && (
                      <View style={styles.deliveryInfo}>
                        <DeliveryMode
                          name="Get it delivered"
                          price={`${orderDetail.currency_icon}${(
                            +orderDetail.delivery_amount || 0
                          ).toFixed(2)}`}
                          checked={deliveryMode === 'deliver'}
                          onPress={() => setDeliveryMode('deliver')}
                          disabled={isDeliveryDisabled}
                        />

                        <View style={styles.verticalSeparator} />
                        <DeliveryMode
                          name="Pick it up"
                          price={'Free'}
                          checked={deliveryMode === 'pickup'}
                          onPress={() => setDeliveryMode('pickup')}
                          disabled={isPickupDisabled}
                        />
                      </View>
                    )}
                  </>
                )}
                {orderDetail && geoCode && (
                  <View style={styles.mapContainer}>
                    <MapView
                      style={styles.map}
                      initialRegion={geoCode}
                      pointerEvents="none"
                    />

                    {deliveryMode === 'deliver' ? (
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpatity={0.8}
                        onPress={() => {
                          NavigationService.navigate('DeliveryLocation', {
                            addressId: orderDetail.address_id,
                          });
                        }}>
                        <View style={styles.locationInfo}>
                          <View style={styles.iconWrapper}>
                            <Icon name="map-marker" size={20} />
                          </View>
                          <View style={styles.locationWrapper}>
                            <StoredAddress address={orderDetail} />
                          </View>
                          <View style={styles.iconWrapper}>
                            <Icon name="chevron-right" size={30} />
                          </View>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpatity={0.8}
                        onPress={() => {
                          // NavigationService.navigate('SellerLocation', {
                          //   seller: orderDetail.territory,
                          //   distance: orderDetail.territory_distance_km,
                          // });
                          showLocation({
                            latitude:
                              orderDetail.territory.warehouse_address_lat,
                            longitude:
                              orderDetail.territory.warehouse_address_lng,
                            title: orderDetail.territory.name,
                            googleForceLatLon: true,
                          });
                        }}>
                        <View style={styles.locationInfo}>
                          <View style={styles.iconWrapper}>
                            <Icon name="sign-direction" size={30} />
                          </View>
                          <View style={styles.locationWrapper}>
                            <AppText style={styles.sellerName}>
                              Directions to Seller's Location
                            </AppText>
                          </View>
                          <View style={styles.iconWrapper}>
                            <Icon name="chevron-right" size={30} />
                          </View>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </>
            )}
            ListFooterComponent={() => (
              
              <View style={styles.footer}>
                <View style={styles.summary}>
                {territory && territory.activate_tip == '1' ? <View style={styles.tipTitle}>
                    <AppText style={styles.summaryKey}>
                      Add a Tip?                      
                    </AppText>
                    
                    {/* <RadioButton.Group style={styles.radio} onValueChange={newValue => {setChecked(newValue);setOther('notOther');}} value={tipValue}> */}
                      <View style={styles.radio}>
                        <CheckBox containerStyle={styles.radioBackground} title="10%" checkedColor={Theme.color.accentColor} checked={tipValue=='10' ? true : false} checkedIcon='dot-circle-o'  onPress = {() => {setChecked('10');setOther('notOther');}}  uncheckedIcon='circle-o'/>
                        <CheckBox containerStyle={styles.radioBackground} title="15%" checkedColor={Theme.color.accentColor} checked={tipValue=='15' ? true : false} checkedIcon='dot-circle-o'  onPress = {() => {setChecked('15');setOther('notOther');}}  uncheckedIcon='circle-o'/>
                        <CheckBox containerStyle={styles.radioBackground} title="20%" checkedColor={Theme.color.accentColor} checked={tipValue=='20' ? true : false} checkedIcon='dot-circle-o'  onPress = {() => {setChecked('20');setOther('notOther');}}  uncheckedIcon='circle-o'/>
                        <CheckBox containerStyle={styles.radioBackground} title="Other"  checkedIcon='dot-circle-o'  uncheckedIcon='circle-o' checkedColor={Theme.color.accentColor} checked={checked == 'other' ? true : false}
                          onPress={() => {
                          NavigationService.navigate('SelectorPercentPage', {
                            title: 'Tip',
                            header: 'HOW MUCH WOULD YOU LIKE TO TIP?',
                            options: [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100].map((item) => ({
                              label: item+'%',
                              value: item,
                              selected: tipValue == item ? 'selected' : '',
                            })),
                            action: (value) => {
                              setChecked(value);
                              setOther('other');
                            },
                            noOptionsText: 'No Options Available',
                          });
                        }} />                       
                       </View> 
                  </View> : <></>
                }
                 { territory &&  territory.activate_tip == '1' && <DashedLine styleContainer={{ marginBottom: 15,borderRadius: 1, }}/>}
                 {orderDetail &&  orderDetail.promo_code_used == true ? <View style={styles.summaryRow}>
                    <AppText style={styles.summaryKey}>
                      Discount
                      {/* ({orderDetail.taxes_percentage}%) */}
                    </AppText>
                    <AppText style={styles.summaryValue}>
                      { `${orderDetail.currency_icon + '-'
                            } ${(+orderDetail.promo_code_amount).toFixed(2)}`}
                    </AppText>
                  </View>: <></> }
                 {orderDetail.territory.type_slug != 'services' && <View style={styles.summaryRow}>
                    <AppText style={styles.summaryKey}>
                      {deliveryMode === 'deliver' ? 'Delivery ' : 'Pick up '}
                      {/* {orderDetail.delivery_time && "("+orderDetail.delivery_time+")"} */}
                    </AppText>
                    <AppText style={styles.summaryValue}>
                      {
                        deliveryMode === 'deliver'
                          ? `${
                              orderDetail.currency_icon
                            } ${(+orderDetail.delivery_amount).toFixed(2)}`
                          : 'Free'
                        // `${orderDetail.currency_icon} ${(+orderDetail.pickup_total_amount).toFixed(2)}`
                      }
                    </AppText>
                  </View> }              
                  <View style={styles.summaryRow}>
                    <AppText style={styles.summaryKey}>
                      Tax
                      {/* ({orderDetail.taxes_percentage}%) */}
                    </AppText>
                    <AppText style={styles.summaryValue}>
                      {deliveryMode === 'deliver'
                        ? `${
                            orderDetail.currency_icon
                          } ${(+orderDetail.tax_amount_with_delivery).toFixed(
                            2,
                          )}`
                        : `${
                            orderDetail.currency_icon
                          } ${(+orderDetail.tax_amount_without_delivery).toFixed(
                            2,
                          )}`}
                    </AppText>
                  </View>
                  {territory &&  territory.activate_tip == '1' ? <View style={styles.summaryRow}>
                    <AppText style={styles.summaryKey}>
                      Tip({tipValue}%)
                      {/* ({orderDetail.taxes_percentage}%) */}
                    </AppText>
                    <AppText style={styles.summaryValue}>
                      {deliveryMode === 'deliver'
                        ? `${
                            orderDetail.currency_icon
                          } ${(+orderDetail.total_amount_with_delivery*tipValue/100).toFixed(
                            2,
                          )}`
                        : `${
                            orderDetail.currency_icon
                          } ${(+orderDetail.total_amount_without_delivery*tipValue/100).toFixed(
                            2,
                          )}`}
                    </AppText>
                  </View>: <></> }
                </View>
                <View>
                  <View style={{flexDirection:'row'}}>
                    <TouchableOpacity
                      activeOpacity={0.2}
                      style={{width:'60%', paddingLeft:20}}
                      onPress={() => noteLink == '- Remove Note' ? (setNoteLink('+ Add A Note'), setNote(''), removeNote('')) : NavigationService.navigate('OrderNoteEdit')}>
                      <AppText style={styles.specialNote} >
                        {noteLink}
                      </AppText> 
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.2}
                      style={{width:'40%', paddingRight:20}}
                      onPress={() =>  NavigationService.navigate('PromoCodeEdit')}>
                      <AppText style={styles.specialPromoCode} >
                        {'+ Promo Code'}
                      </AppText> 
                    </TouchableOpacity>
                  </View>
                  <View style={{flexDirection:'row',width:'100%'}}>
                    <AppText style={styles.specialNoteText} numberOfLines={2}>
                      {note}
                    </AppText> 
                    <AppText style={styles.promoCodeText} numberOfLines={1}>
                      {orderDetail.promo_code_name}
                    </AppText> 
                  </View>
                </View>               
                <View style={styles.actions}>
                  <Button
                    style={GlobalStyles.formControl}
                    type="accent"
                    onClick={_pay}>
                    {payButtonText}
                  </Button>
                  {order.has_subscription_products != true &&
                  <Button
                    style={GlobalStyles.formControl}
                    type="bordered-dark"
                    onClick={() => {
                      dispatch(setOrderProduct(false));
                      NavigationService.navigate('Products');
                    }}>
                    Keep Shopping
                  </Button>}
                  <Button
                    style={GlobalStyles.formControl}
                    type="borderless"
                    onClick={_cancelOrder}>
                    Cancel This Order
                  </Button>
                </View>
              </View>
            )}
          />       
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 110 : 80,
    paddingBottom: Theme.layout.screenPaddingBottom,
    flex: 1,
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: 'grey',
  },

  radio: {
    flexDirection: 'row',
  },

  radioBackground: {
    backgroundColor: Theme.color.container,
    borderWidth: 0,
    marginLeft: 0,
    paddingHorizontal:0
  },

  summary: {
    paddingVertical: 10,
  },

  summaryRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },

  summaryKey: {
    fontSize: 16,
  },

  tipTitle: {
    fontSize: 16,
    flexDirection: 'column',
    marginBottom: 5,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  separator: {
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
  },
  summaryTotal: {
    fontSize: 24,
    textAlign: 'center',
  },

  actions: {
    paddingHorizontal: 20,
  },

  deliveryInfo: {
    flexDirection: 'row',

    borderTopWidth: 1,
    borderTopColor: Theme.color.borderColor,
    borderBottomWidth: 1,
    borderBottomColor: Theme.color.borderColor,
  },

  verticalSeparator: {
    borderLeftWidth: 1,
    borderLeftColor: Theme.color.borderColor,
  },

  mapContainer: {
    height: 130,
    position: 'relative',
  },

  map: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  locationInfo: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    top: 35,
    left: 20,
    right: 20,
    bottom: 35,
    backgroundColor: 'white',

    flexDirection: 'row',
    alignItems: 'center',
  },

  locationWrapper: {
    flex: 1,
  },

  imageWrapper: {
    width: 60,
    alignItems: 'center',
  },

  image: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth:1,
    borderColor:'#EFEFEF'
  },

  iconWrapper: {
    width: 40,
    alignItems: 'center',
  },

  sellerName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  distance: {
    color: 'red',
    fontSize: 14,
  },

  orderInfo: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 10,
    marginBottom: 10,
  },

  orderInfoWrapper: {
    flex: 6,
    flexDirection: 'column',
  },

  orderInfoSeller: {
    flex: 2,
    flexDirection: 'row',
  },

  specialNote: {
    color:Theme.color.accentColor,
    fontSize:17,
    paddingVertical:10
  },

  specialPromoCode: {
    color:Theme.color.accentColor,
    fontSize:17,
    paddingVertical:10,
    textAlign:'right',
  },

  specialNoteText: {
    width: '60%',
    color:'black',
    fontSize:14,
    paddingVertical:10,
    paddingLeft: 20,
    marginTop:-15
  },

  promoCodeText: {
    width: '40%',
    color:'black',
    fontSize:16,
    textAlign:'right',
    paddingVertical:10,
    marginLeft:0,
    paddingRight:20,
    marginTop:-15
  },

  orderInfoTotal: {
    flex: 4,
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

MyOrderScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'My Cart',
      headerTintColors: 'black',
    },
    headerTitleStyle: {
      color: 'black',
    },
  });
