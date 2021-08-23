import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Text,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Rating } from 'react-native-ratings';
import { SliderBox } from 'react-native-image-slider-box';
import {
  Screen,
  Selector,
  Button,
  AppText,
  Price,
  DashedLine,
} from '~/components';
import { NavigationService } from '~/core/services/NavigationService';
import { MainNavigationOptions, GlobalStyles, Theme } from '~/styles';

import { fetchAPI, renderHTML } from '~/core/utility';
import {
  showNotification,
  clearNotification,
  setOrder,
  setGuestToken,
  cancelOrder,
  updatedNotes
} from '~/store/actions';
import { Controls } from '~/styles';

import { AppEventsLogger } from "react-native-fbsdk-next";

export const ProductScreen = ({ navigation }) => {
  const [isLoading, setLoading] = useState(false);
  const [product, setProduct] = useState();
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState('');
  const [extras, setExtras] = useState({});
  const [extrasChosen, chooseExtras] = useState({});
  const [productReview, setProductReview] = useState({});
  
  const [product_id, setProductId] = useState();
  const option = useMemo(() => {
    return product && product.options.find((opt) => opt.sku === sku);
  }, [product, sku]);

  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);
  const order = useSelector((state) => state.order.order);
  const territory = useSelector((state) => state.order.territory);
  const reviewUpdated = useSelector((state) =>  state.notification.updatedReview);
  const instructionUpdated = useSelector((state) => state.notification.updated);
  const [instructions, setInstruction] =  useState();
  const [instructionsLink, setInstructionLink] =  useState();
  const [available, setAvailable] =  useState();
  const orderFreeDeliveryCutoff = useMemo(() => {
    let freeDeliveryNotice = false;
    const free_delivery_cutoff = Number(territory.free_delivery_cutoff);

    if (order && territory) {
      if (order.delivery_type === 'deliver' && free_delivery_cutoff > 0) {
        return free_delivery_cutoff;
      }
    }

    return freeDeliveryNotice;
  }, [order, territory]);

  useEffect(() => {
    const productId = navigation.getParam('productId');
    setLoading(true);
    setAvailable(false);
    fetchAPI(`/product_reviews/user_can_review?product=${productId}`, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
      })
    .then((res) => {
        if(res.success == true)
        {
          setAvailable(true);
        } else {
          setAvailable(false);
        }
      })
      .finally(() => setLoading(false)); 
  },[reviewUpdated]);

  useEffect(() => {
    setInstruction(instructionUpdated); 
    setInstructionLink('- Remove Special Instructions');
  },[instructionUpdated]);

  useEffect(() => {
    
    dispatch(clearNotification());
    setInstruction(''); 
    setInstructionLink('+ Add Special Instructions');
    setProductReview(false);
    const productId = navigation.getParam('productId');
    setLoading(true);

    const getProduct = fetchAPI(`/product?product=${productId}`, {
      method: 'GET',
    })
    .then((res) => {
      navigation.setParams({ productName: res.data.product.name });
      setProduct(res.data.product);
      setQuantity(1);
      
      if(res.data.product.options.length > 0 ){
        setSku(res.data.product.options[0].sku);
      }
    })
   
    const getProductReviews = fetchAPI(`/product_reviews?product=${productId}`, {
      method: 'POST',
    })
    .then((res) => {
      setProductReview(res.data);      
      setProductId(productId);
    })
    
    Promise.all([getProduct, getProductReviews])
    .catch((err) => {
      dispatch(showNotification({ type: 'error', message: err.message, options: { align: 'right' }, }));
    })
    .finally(() => setLoading(false));     
  }, [dispatch, reviewUpdated]);

  const Closed = () => {
    const territoryState = territory.operation_state;
    return territoryState == 'closed' ? (
      <View style={styles.closedStore}>
        <Image
            style={styles.closedImage}
            source={require('~/assets/images/closed.png')
            }
          />
          <View style={styles.closedTextContainer}>
            <AppText style={styles.closedText}>
              Sorry We're Closed
            </AppText>
            <AppText style={styles.closedTime}>
              We open at {territory.operation_time}
            </AppText> 
          </View>
      </View>
    ) : (
      <></>
    );
  };


  const _cancelOrder = useCallback(() => {
    setLoading(true);
    fetchAPI('/order/cancel', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
    })
      .then(async (res) => {
        if(res.success == true) {
        dispatch(cancelOrder());
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
                console.log('canceled address++++++',order.address);
                console.log('cancelled order id',res.data.order_id);
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
        NavigationService.navigate('Sellers');
        }
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: res.message })),
      );

  }, [dispatch,order]);
  ///////////added
  const addToCart = useCallback(
    (pid, optionSku, optionQuantity, extraOptions,instructions,price) => {
      // if(territory.type_slug === 'restaurants'){
      //     NavigationService.navigate('ProductInstruction', {
      //       pid ,optionSku, optionQuantity, extraOptions, orderFreeDeliveryCutoff
      //     });
      // } else {
        setLoading(true);
        const formData = new FormData();
        formData.append('as_guest', token ? 0 : 1);
        formData.append('product_id', pid);
        formData.append('option_sku', optionSku);
        formData.append('quantity', optionQuantity);
        formData.append('instructions', instructions);
        
        console.log("+++++++++",order);
        if (order) {
          if(order.cancelled == 0){
            formData.append('order_id', order.order_id);
            console.log('------------------------',order.order_id);
            console.log('------------------------',order.cart_amount);
          } else { 
            formData.append('order_id', order.order_id);        
          }
        }

        if (extraOptions.length > 0) {
          extraOptions.map((extraOption) => {
            let main_sku = extraOption.main_sku;
            if (extraOption.items.length == 1) {
              formData.append('extra_' + main_sku, extraOption.items[0].sku);
            } else {
              extraOption.items.map((item) => {
                formData.append('extra_' + main_sku + '[]', item.sku);
              });
            }
          });
        }      
        let headers = {};

        if (token || guestToken) {
          headers = {
            authorization: `Bearer ${token ? token : guestToken}`,
          };
        }
          fetchAPI('/order/add_product', {
            method: 'POST',
            headers: headers,
            body: formData,
          })
            .then(async (res) => {
              const orderData = res.data;
              if(typeof orderData.currency != 'undefined')
                 AppEventsLogger.logEvent('Add to Cart',price,{
                Currency : orderData.currency
              })

              if (!token && orderData.token) {
                dispatch(setGuestToken(orderData.token));
              }
              console.log('order data++++++++++++++++++++',orderData);
              dispatch(setOrder(orderData));

              if (extraOptions.length > 0) {
                chooseExtras({});
              }
              let freeDeliveryNotice = null;
              const cart_amount = Number(orderData.cart_amount);

              if (cart_amount < orderFreeDeliveryCutoff) {
                freeDeliveryNotice = (
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingHorizontal: 30,
                      paddingVertical: 10,
                      marginTop: 20,
                      marginBottom: 10,
                      borderColor: '#777',
                      borderWidth: 3,
                      borderRadius: 10,
                    }}>
                    <View
                      style={{
                        flex: 2,
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}>
                      <Icon
                        size={36}
                        color={Theme.color.accentColor}
                        name="truck"
                      />
                    </View>
                    <View
                      style={{
                        flex: 8,
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                      }}>
                      <AppText
                        style={{
                          fontSize: 16,
                          color: Theme.color.accentColor,
                          fontWeight: '700',
                          textAlign: 'left',
                        }}>
                        Spend {(orderFreeDeliveryCutoff - cart_amount).toFixed(2)}{' '}
                        more to get free delivery
                      </AppText>
                    </View>
                  </View>
                );
              }
              console.log("added order++++++++++++++++++++++++++++++++",order)
            if(res.success == false && res.data.show_checkout_button == true)
              {
                dispatch(
                  showNotification({
                    type: 'fullScreen',
                    autoHide: false,
                    options: { align: 'right' },
                    message: (
                      <>
                        {/* <View style={{ position: 'absolute', top: 5, right: -20 }}>
                          <Price style={{ height: 35, width: 120 }} />
                        </View> */}
                        <Icon size={120} color='red' name={'alert'}/>
                          <AppText
                          style={{
                            fontSize: 15,
                            color: 'white',                          
                            textAlign: 'center',
                            marginTop: 10,
                          }}>
                          {res.message}
                        </AppText>
                        <Button
                          type="accent"
                          style={{ marginBottom: 10, marginTop: 20 }}
                          fullWidth
                          onClick={() => {
                            dispatch(clearNotification());
                            NavigationService.navigate('MyOrder');
                          }}>
                          Checkout
                        </Button>
                        <Button
                          type="white"
                          fullWidth
                          onClick={() => {
                            _cancelOrder();
                            dispatch(clearNotification());
                          }}>
                          Cancel Order
                        </Button>                    
                      </>
                    ),
                  }),
                )
              } else if(product.is_subscription == true){
                NavigationService.navigate('MyOrder');
              } else {
                dispatch(
                  showNotification({
                    type: 'fullScreen',
                    autoHide: false,
                    options: { align: 'right' },
                    message: (
                      <>
                        {/* <View style={{ position: 'absolute', top: 5, right: -20 }}>
                          <Price style={{ height: 35, width: 120 }} />
                        </View> */}
                        <View>
                          <Icon size={60} color="white" name="cart" />
                        </View>
                        <AppText
                          style={{
                            fontSize: 18,
                            color: 'white',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            marginTop: 10,
                          }}>
                          ITEM ADDED TO YOUR ORDER
                        </AppText>
                        {freeDeliveryNotice}
                        <Button
                          type="white"
                          style={{ marginBottom: 10, marginTop: 20 }}
                          fullWidth
                          onClick={() => {
                            dispatch(clearNotification());
                            NavigationService.navigate('MyOrder');
                          }}>
                          Checkout
                        </Button>

                        <Button
                          type="white"
                          style={{ marginBottom: 10 }}
                          fullWidth
                          onClick={() => {
                            dispatch(clearNotification());
                            NavigationService.goBack();
                          }}>
                          View all Products
                        </Button>

                        <Button
                          type="white"
                          fullWidth
                          onClick={() => {
                            dispatch(clearNotification());
                          }}>
                          Back
                        </Button>
                      </>
                    ),
                  }),
                );
              }
            })
            .catch((err) =>{
              dispatch(
                showNotification({
                  type: 'error',
                  message: err.message,
                  options: { align: 'right' },
                }),
              );
             }
            )
            .finally(() => setLoading(false));
         
    },  
    [dispatch, token, guestToken, extraOptions,product],
  );
    
  const products_extra = useMemo(() => {
    let products_extra_array = [];
    if (product && product.extras) {
      for (var key in product.extras) {
        if (product.extras.hasOwnProperty(key)) {
          let product_extra = product.extras[key];
          products_extra_array.push(product_extra);
        }
      }
    }    
    return products_extra_array;
  }, [product]);

  const products_extra_keys = useMemo(() => {
    let products_extra_array = {};

    if (product && product.extras) {
      for (var key in product.extras) {
        if (product.extras.hasOwnProperty(key)) {
          let product_extra = product.extras[key];
          products_extra_array[product_extra.sku] = product_extra;
        }
      }
    }
    return products_extra_array;
  }, [product]);

  const extraOptions = useMemo(() => {
    if (extrasChosen) {
      let extra_options = [];
      for (var key in extrasChosen) {
        let main_sku = key;
        if (extrasChosen.hasOwnProperty(key)) {
          let product_extra_key = extrasChosen[key];
          let extraOption = products_extra_keys.hasOwnProperty(key)
            ? products_extra_keys[key]
            : false;
          if (extraOption) {
            let options = [];
            options.main_sku = main_sku;
            options.price_per_option = products_extra_keys[key].price_per_option;
            if (typeof product_extra_key === 'object') {
              let items = [];
              product_extra_key.map((key) => {
                let option = extraOption.options.filter(
                  (option) => option.sku === key,
                );
                items.push(option[0]);
              });
            
              options.items = items;
            } else {
              let items = [];
              let option = extraOption.options.filter(
                (option) => option.sku === product_extra_key,
              );
              items.push(option[0]);              
              options.items = items;
            }
            extra_options.push(options);
          }
        }
        //console.log("choosed extras*****************",extra_options[0].items);
      }
      
      return extra_options;
    } else {
      return [];
    }
  }, [extrasChosen]);

  const sale_price = useMemo(() => {
    if (product) {
      const opt = product.options.find((op) => op.sku === sku);
      let extrasPrice = 0;
      if (extraOptions.length > 0) {
        console.log("extraoptions!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",product.options);
        extraOptions.map((extraOption) => {          
          extraOption.items.map((item) => {
            if(extraOption.price_per_option ==  true){
              extrasPrice += +item['option_'+sku+'_original_price'];
            } else {
              extrasPrice += +item['original_price'];
            }
          });
        });
      }

      if (opt) {
        return +opt.original_price * +quantity + extrasPrice;
      }
    }
    return 0;
  }, [sku, quantity, product, extraOptions]);
  const price = useMemo(() => {
    if (product) {
      const opt = product.options.find((op) => op.sku === sku);

      let extrasPrice = 0;
      if (extraOptions.length > 0) {
        extraOptions.map((extraOption) => {
          extraOption.items.map((item) => {
            if(extraOption.price_per_option ==  true){
              extrasPrice += +item['option_'+sku+'_price'];
            } else {
              extrasPrice += +item['price'];
            }
          });
        });
      }

      if (opt) {
        return +opt.price * +quantity + extrasPrice;
      }
    }
    return 0;
  }, [sku, quantity, product, extraOptions]);

  useEffect(() => {
    if (product && !product.images.length) {
      navigation.setParams({ darkContent: true });
    }
  }, [product]);
  return (
    <Screen
      isLoading={isLoading}
      hasList
      statusBar={
        product && product.images.length ? 'light-content' : 'dark-content'
      }
      headerOverLayAlwaysVisible={
        product && product.images.length ? true : false
      }
      stickyBottom={
        territory.type_slug === 'restaurants' && territory.operation_state == 'closed' ? <Closed/> : 
        product && (
          <View
            style={[
              styles.flexRowBetween,
              GlobalStyles.formControl,
              styles.stickyBottom,
            ]}>
            <Selector
              style={[styles.option, { flex: 2 }, styles.optionLeft]}
              value={quantity}
              title="Quantity"
              header="How many do you want"
              options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => ({
                label: item,
                value: item,
              }))}
              onChange={setQuantity}
            />
            <TouchableOpacity
              style={{
                backgroundColor: Theme.color.accentColor,
                alignSelf: 'flex-end',
                paddingLeft: 10,
                justifyContent: 'flex-start',
                flex: 3,
                height: '100%',
                paddingVertical:8,
                flexDirection:'row'
              }}
              // rightText={`${product.currency_icon}${price.toFixed(2)}`}
              onPress={() =>
                addToCart(product.pid, sku, quantity, extraOptions,instructions, price.toFixed(2))
              }>
                {product.is_subscription == true ? (
              <View style={{flexDirection:'row'}}>
                {/* <Icon style={{marginTop:8}} size={22} color={'#fff'} name="cart-outline" />*/}
                <Text  style={{color:'#FFFFFF',fontSize:16,marginLeft:5,marginTop:8,fontWeight: 'bold'}} >SUBSCRIBE </Text>
                       
                <Text style={{color:'#FFFFFFA5',fontSize:17,marginLeft:10}}>
                  <AppText  style={{fontWeight:'bold'}}>{`${product.currency_icon}${price.toFixed(2)}`}</AppText>
                  <AppText style={{fontSize:11,fontWeight:'bold',letterSpacing: -0.5,}}>{`\n`}{product.subscription_type_name_every}</AppText>
                </Text>
              </View> )   
                 :(<View style={{flexDirection:'row',paddingVertical:5, }}>
                   <Icon  style={{marginTop:3}} size={22} color={'#fff'} name="cart-outline" />       
                 <Text  style={{color:'#FFFFFF',fontSize:20,marginLeft:10,fontWeight: 'bold'}} >ADD </Text>
                 <Text  style={{color:'#FFFFFFDD',fontSize:17, marginTop:2}}>{`${product.currency_icon}${price.toFixed(2)}`}</Text> 
                 </View>
                 )
            }
            </TouchableOpacity>
          </View>
        )
      }>
      {product && (
        <ScrollView style={styles.container} alwaysBounceVertical={false}>
          {product.images.length ? (
            <View style={styles.imageWrapper}>
              <View style={styles.image}>
                <SliderBox
                  sliderBoxHeight={'100%'}
                  images={product.images}
                  ImageComponentStyle={{ width: '110%' }}
                />
                {product.on_sale === '1' ? (
                  <Image
                    source={require('~/assets/images/sale.png')}
                    style={styles.image_sale}
                    resizeMode="cover"
                  />
                ) : null}
              </View>
            </View>
          ) : null}

          <View style={styles.content}>
          
            {!!available && available === true && productReview.total == 0 &&
              <View style={styles.sincecontent}>
                <AppText style={styles.reason} numberOfLines={2}>
                  Since you purchased this item previously,            
                <AppText style={styles.reason1} onPress={() => NavigationService.navigate('MyReview',{productId: navigation.getParam('productId'),reviewCnt: 0})}>
                  {' add a review'}
                </AppText>  
                </AppText>  
              </View>
            } 
            <AppText
              style={[
                styles.productName,
                { marginTop: product && !product.images.length ? 40 : 0 },
              ]}
              numberOfLines={2}>
              {product.name}
            </AppText>
            {product.short_description !== '' && (
              <AppText style={styles.description} numberOfLines={3}>
                {product.short_description}
              </AppText>
            )}
            {product.is_subscription == true && 
            <View style={styles.subscriptionView}>
               <AppText
              style={
                styles.subscriptionButtonName
              }>
              {product.subscription_type_name}
            </AppText>
             <AppText
              style={
                styles.subscriptionName
              }
              numberOfLines={1}>
              Subscription
            </AppText>
            </View>
            }
            {product.is_subscription == true && <AppText
              style={styles.subscriptionDetail}
              numberOfLines={2}>
              Renews on the 1st of { <AppText style={{ textTransform: 'lowercase'}}>{product.subscription_type_name_every_full}</AppText>}. Cancel any time.
            </AppText>}
           {productReview !== false && productReview.total != 0 &&
            <TouchableOpacity
            style={{ marginRight: 10, width:'50%' }}
            onPress={() => NavigationService.navigate('Reviews',{reviewsPageTitle : productReview.total + (productReview.total < 2 ? ' Review' : ' Reviews') , product_id})}>
              <View style={styles.reviewContainer} >
                <Rating
                  type='star'
                  ratingCount={5}
                  imageSize={17}
                  readonly={true}
                  style={styles.ratingStyle}
                  startingValue={productReview.ave_rating}
                  fractions = {1}
                  ratingBackgroundColor={{color:'#FFF'}}
                />
                <AppText style={styles.reviewText} numberOfLines={1}>
                  {productReview.total} {productReview.total < 2 ? 'Review' : 'Reviews'}
                </AppText>
              </View>
            </TouchableOpacity>          
            }
           
            {Boolean(product.long_description) &&
              territory.type_slug === 'restaurants' && (
                <View style={styles.moreInfo}>
                  <AppText style={styles.moreInfoDescription}>
                    {renderHTML(product.long_description)}
                  </AppText>
                </View>
              )}
             
            {product.options.length > 1 && (
              <>
                <View style={[styles.flexRowBetween, GlobalStyles.formControl]}>
                  <Selector
                    nameSelector={product.options_name == "" ? "Option" : product.options_name}
                    style={styles.option}
                    value={sku}
                    title={product.options_name == "" ? "Options" : product.options_name}
                    header="Select an available option"
                    options={product.options.map((item) => ({
                      label: item.name,
                      value: item.sku,
                    }))}
                    onChange={setSku}
                  />
                </View>
              </>
            )}

            {products_extra &&
              products_extra.length > 0 &&
              products_extra.map((product_extra) => {
                let product_extra_options = product_extra.options.map(
                  (item) => {
                    let hide = false;
                    if (
                      product_extra.multiple === true &&
                      product_extra.multipletimes === false
                    ) {
                      if (extrasChosen.hasOwnProperty(product_extra.sku)) {
                        if (
                          extrasChosen[product_extra.sku].indexOf(item.sku) > -1
                        ) {
                          hide = true;
                        }
                      }
                    }

                    if (!hide) {
                      return {
                        label:
                          item.name +
                          (+product_extra.price_per_option == true ?(item['option_'+sku+'_price'] > 0
                          ? ' +' +
                            territory.currency.icon +
                            (+item['option_'+sku+'_price']).toFixed(2)
                          : '') :
                          (item['price'] > 0
                          ? ' +' +
                            territory.currency.icon +
                            (+item['price']).toFixed(2)
                          : '')),
                        value: item.sku,
                      };
                    }
                  },
                );

                product_extra_options = product_extra_options.filter(
                  (product_extra_option) => {
                    return product_extra_option ? true : false;
                  },
                );

                const allowNoMoreOptions =
                  product_extra_options.length == 0 &&
                  product_extra.multiple === true &&
                  product_extra.multipletimes === false;

                return (
                  <>
                    <View
                      style={[styles.flexRowBetween, GlobalStyles.formControl]}>
                      <Selector
                        hideSelector={allowNoMoreOptions}
                        noOptionsText={
                          allowNoMoreOptions &&
                          'You have already selected all the options'
                        }
                        nameSelector={
                          product_extra.name ? product_extra.name : null
                        }
                        style={[styles.option]}
                        value={
                          product_extra.multiple
                            ? extras.hasOwnProperty(product_extra.sku) &&
                              extras[product_extra.sku]
                            : extrasChosen.hasOwnProperty(product_extra.sku) &&
                              extrasChosen[product_extra.sku]
                        }
                        title={product_extra.name}
                        placeholder={
                          'Select' + (product_extra.multiple ? ' & Add' : '')
                        }
                        header={'Select an available option'}
                        options={product_extra_options}
                        onChange={(value) => {
                          // let existingExtras = extras;
                          // setExtras({...existingExtras,  [product_extra.sku]: value,
                          // })

                          let existingChosenExtras = extrasChosen;

                          if (product_extra.multiple === true) {
                            let previousVal = existingChosenExtras.hasOwnProperty(
                              product_extra.sku,
                            )
                              ? existingChosenExtras[product_extra.sku]
                              : [];

                            previousVal.push(value);

                            chooseExtras({
                              ...existingChosenExtras,
                              [product_extra.sku]: previousVal,
                            });
                          } else {
                            chooseExtras({
                              ...existingChosenExtras,
                              [product_extra.sku]: value,
                            });
                          }
                        }}
                      />
                      {/* {product_extra.multiple &&
                          <Button
                          disabled={allowNoMoreOptions ? true : false}
                          type="black"
                          style={{
                            paddingHorizontal : 10,
                            height: 40,
                            alignSelf: 'flex-end'
                          }}
                          onClick={() => {
                            let value = extras.hasOwnProperty(product_extra.sku) ? extras[product_extra.sku] : false;

                            if(value){
                              let existingChosenExtras = extrasChosen;

                              let previousVal = existingChosenExtras.hasOwnProperty(product_extra.sku) ? existingChosenExtras[product_extra.sku] : [];
                              previousVal.push(value);

                              chooseExtras({...existingChosenExtras,
                                [product_extra.sku]: previousVal,
                              });

                              let existingExtras = extras;

                              setExtras({...existingExtras,  [product_extra.sku]: '',
                              })
                            }

                          }}><Icon
                          size={15}
                          color="white"
                          name="plus"
                          />Add</Button>} */}
                    </View>
                    {extraOptions.length > 0 &&
                      extraOptions.map((extraOption) => {
                        if (
                          product_extra.multiple &&
                          product_extra.sku === extraOption.main_sku
                        ) {
                          return extraOption.items.map((item, index) => {
                            return (
                              <View
                                style={[
                                  styles.flexRowBetween,
                                  GlobalStyles.formControl,
                                  styles.option,
                                  styles.addOnItem,
                                ]}>
                                <AppText
                                  style={[styles.itemName, styles.itemPadding]}>
                                  {item.name}
                                  {+ product_extra.price_per_option == true ?(item['option_'+sku+'_price'] > 0
                                    ? ' +' +
                                      territory.currency.icon +
                                      (+item['option_'+sku+'_price']).toFixed(2)
                                    : '') :
                                    (item['price'] > 0
                                    ? ' +' +
                                      territory.currency.icon +
                                      (+item['price']).toFixed(2)
                                    : '')}
                                </AppText>
                                <TouchableOpacity
                                  style={styles.itemRemove}
                                  onPress={() => {
                                    Alert.alert(
                                      '',
                                      'Do you really want to remove this add-on ?',
                                      [
                                        {
                                          text: 'OK',
                                          onPress: () => {
                                            let existingChosenExtras = extrasChosen;
                                            let main_sku = product_extra.sku;
                                            let index_to_delete = index;

                                            if (
                                              existingChosenExtras.hasOwnProperty(
                                                main_sku,
                                              )
                                            ) {
                                              existingChosenExtras[
                                                main_sku
                                              ] = existingChosenExtras[
                                                main_sku
                                              ].filter(
                                                (option, index) =>
                                                  index !== index_to_delete,
                                              );
                                            }

                                            chooseExtras({
                                              ...existingChosenExtras,
                                              existingChosenExtras,
                                            });
                                          },
                                          style: 'ok',
                                        },
                                        {
                                          text: 'Cancel',
                                          style: 'cancel',
                                        },
                                      ],
                                    );
                                  }}>
                                  <Icon
                                    size={20}
                                    color="black"
                                    name="close"
                                    style={[
                                      styles.itemPadding,
                                      { paddingRight: 6 },
                                    ]}
                                  />
                                </TouchableOpacity>
                              </View>
                            );
                          });
                        }
                      })}
                  </>
                );
              })}
            { territory.type_slug === 'restaurants' &&
              <View>
                <TouchableOpacity
                activeOpacity={0.2}
                style={{width:'70%'}}
                onPress={() => instructionsLink == '- Remove Special Instructions' ? (setInstructionLink('+ Add Special Instructions'), setInstruction('')) : NavigationService.navigate('ProductInstruction')}>
                <AppText style={styles.specialInstrunction} >
                  {instructionsLink}
                </AppText> 
              </TouchableOpacity>
                <AppText style={styles.specialInstrunctionText} numberOfLines={2}>
                {instructions}
              </AppText> 
             </View>
            }
            {product.on_sale === '1' && sale_price !== 0 ? (
              <View style={styles.price_flexRow}>
                <AppText style={styles.old_price}>
                  {territory.currency.icon}
                  {sale_price.toFixed(2)}{' '}
                </AppText>
                <AppText style={styles.sale_price}>
                  {territory.currency.icon}
                  {price.toFixed(2)}
                </AppText>
              </View>
            ) : (
              <AppText style={styles.price}>
                {territory.currency.icon}
                {price.toFixed(2)}
              </AppText>
            )}
            {/* {Boolean(option) && (
              <View style={[styles.flexRowBetween, GlobalStyles.formControl]}>
                <AppText style={styles.priceDescription}>
                  Approx Weight {'' + option.weight}lb
                </AppText>
                <AppText style={styles.priceDescription}>
                  {territory.currency.icon}{ {(+option.price / (+('' + option.weight) || 1)).toFixed(2)}
                  {+option.weight ? '' : ''}
                </AppText>
                <AppText style={styles.priceDescription}>
                  Ready in {option.delivery_time}
                </AppText>
              </View>
            )} */}

            {/* {((order && order.cart_amount) || 0) > 0 && (
              <View style={[styles.flexRowBetween, GlobalStyles.formControl]}>
                <Button
                  type="borderless"
                  titleStyle={styles.navigateButton}
                  onClick={() => NavigationService.goBack()}>
                  Back To Products
                </Button>

                <Button
                  type="borderless"
                  titleStyle={styles.navigateButton}
                  onClick={() => NavigationService.navigate('MyOrder')}>
                  Checkout
                </Button>
              </View>
            )} */}
            {Boolean(product.long_description) &&
              territory.type_slug === 'shops' && (
                <>
                  <DashedLine styleContainer={{ marginHorizontal: -20 }} />
                  <View style={styles.moreInfo}>
                    {/* <AppText style={styles.moreInfoTitle}>More Info</AppText> */}
                    <AppText style={styles.moreInfoDescription}>
                      {renderHTML(product.long_description)}
                    </AppText>
                  </View>
                </>
              )}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 60,
  },

  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },

  gradient: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,

    opacity: 0.5,
  },

  image: {
    flex: 1,
    aspectRatio: 1,
  },

  image_sale: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 70,
    height: 70,
  },

  headerBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 20,
  },

  content: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 5,
  },

  flexRowBetween: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',

    marginBottom: 10,
  },

  flexRowCenter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 10,
  },

  option: {
    flex: 5,
    borderWidth: 0,
    backgroundColor: '#eee',
  },

  optionLeft: {
    marginRight: 10,
  },

  optionWithoutButton: {
    marginRight: 0,
  },

  quantity: {
    flex: 1,
  },
  price_flexRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },

  old_price: {
    fontSize: 20,
    
    textAlign: 'left',
    paddingHorizontal: 5,
    paddingVertical: 10,
    textDecorationLine: 'line-through',
  },

  sale_price: {
    fontSize: 20,
    textAlign: 'left',
    paddingHorizontal: 5,
    paddingVertical: 10,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 20,
    paddingVertical: 10,
    textAlign: 'left',
    fontWeight: 'bold',
  },

  productName: {
    fontWeight: 'bold',
    fontSize: 24,
    letterSpacing: 1,
    marginBottom: 10,
    color: 'black',
    width: '100%',
  },

  subscriptionName: {
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
    marginBottom: 10,
    color: 'black',
    marginLeft: 10,
  },

  subscriptionDetail: {
    fontSize: 12,
    color: 'grey',
    marginLeft: 0,
    fontStyle:'italic',
  },

  subscriptionView:{
    flexDirection:'row'
  },

  subscriptionButtonName: {    
    fontWeight: 'bold',
    paddingHorizontal:15,
    paddingVertical:5,
    fontSize: 12,
    backgroundColor: '#FFDD00',
    letterSpacing: 0.5,
    marginBottom: 10,
    color: 'black',
    textTransform: 'uppercase',
    borderRadius: 10
    }, 

  productNameWrapper: {
    height: 80,
    justifyContent: 'flex-end',
    marginTop: -100,
  },

  description: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 0.5,
    // paddingHorizontal: 25,
    marginBottom: 10,
  },

  reviewText: {
    textAlign: 'right',
    paddingHorizontal: 10,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.7,    
    paddingTop:1
  },

  reviewContainer:{
    flexDirection: 'row'
  },
  priceDescription: {
    fontSize: 11,
    fontWeight: '300',
  },

  moreInfo: {
    paddingTop: 15,
  },

  moreInfoTitle: {
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 20,
    letterSpacing: 1,
  },

  moreInfoDescription: {
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  navigateButton: {
    fontSize: 12,
  },

  picker: {
    borderWidth: 0,
    backgroundColor: Controls.input.backgroundColor,
  },

  addOnItem: {
    backgroundColor: 'transparent',
    marginTop: 0,
    marginBottom: 0,
    alignItems: 'center',
  },
  itemName: {
    flex: 2,
  },
  itemPrice: {
    flex: 3,
    alignItems: 'flex-start',
  },
  itemRemove: {
    flex: 1,
    alignItems: 'flex-end',
  },
  itemPadding: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  stickyBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    backgroundColor: 'rgba(256,256,256,0.9)',
    paddingHorizontal: 20,
    marginBottom: 0,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },

  dashedLine: {
    flexDirection: 'row',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: -15,
    marginBottom: -1,
    height: 1,
  },

  ratingStyle:{
    alignItems: 'flex-start'
  },

  reason: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 3,
    color:'grey',
    fontStyle:'italic',
    fontSize:12
  },

  reason1: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 3,
    color:'black',
    fontSize:12,
    fontWeight: 'bold'
  },

  specialInstrunction: {
    color:Theme.color.accentColor,
    fontSize:15,
    paddingVertical:10
  },

  specialInstrunctionText: {
    color:'black',
    fontSize:14,
    paddingVertical:10,
    marginLeft: 0,
    marginTop:-15
  },

  sincecontent: {
    flexDirection:'row'
  },
  
  closedTextContainer: {
    flexDirection: 'column'
  },

  closedText: {
    textTransform: 'uppercase',
    color: 'white',
    fontSize: 17,
    marginLeft: 25,
    fontWeight: 'bold',
  },

  closedTime: {
    color: 'grey',
    fontSize: 15,
    marginLeft: 25,
    fontWeight: 'bold',
  },

  closedImage:{
    flex:1,
    marginLeft:20,
    maxWidth: 90,
    display: 'flex',
    height: 50
  },

  closedStore: {    
    height:90,
    paddingTop:20,
    backgroundColor: 'black',
    flexDirection: 'row'
  },
});

ProductScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: '',
      headerBackground: () => <View style={[styles.headerBackground]} />,
      headerRight: () => <Price />,
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={() => navigation.goBack()}>
          <Icon
            size={24}
            color={navigation.getParam('darkContent') ? 'black' : 'white'}
            name="chevron-left"
          />
        </TouchableOpacity>
      ),
    },

    headerTitleStyle: {
      color: 'white',
    },
  });
