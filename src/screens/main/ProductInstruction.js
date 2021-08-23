import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import { Screen, Input, Button, AppText, } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { fetchAPI } from '~/core/utility';
import {
  // showNotification,
  // clearNotification,
  // setOrder,
  // setGuestToken,
  updatedInstructions,
} from '~/store/actions';

export const ProductInstructionScreen = ({ navigation }) => {
  const [isLoading, setLoading] = useState(false);
  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);
  // const order = useSelector((state) => state.order.order);
  // const pid = useMemo(() => navigation.getParam('pid'), []);
  // const optionSku = useMemo(() => navigation.getParam('optionSku'), []);
  // const optionQuantity = useMemo(() => navigation.getParam('optionQuantity'), []);
  // const extraOptions = useMemo(() => navigation.getParam('extraOptions'), []);  
  // const orderFreeDeliveryCutoff = useMemo(() => navigation.getParam('orderFreeDeliveryCutoff'), []);
  const dispatch = useDispatch();
  
  const [instructions, setInstruction] = useState('');
  const addInstruction = useCallback((instructions) => {
    dispatch(updatedInstructions(instructions));
    NavigationService.goBack();
  },[dispatch]);
  // const addToCart = useCallback((instructions) => {
  //     setLoading(true);
  //     const formData = new FormData();
  //     formData.append('as_guest', token ? 0 : 1);
  //     formData.append('product_id', pid);
  //     formData.append('option_sku', optionSku);
  //     formData.append('quantity', optionQuantity);
  //     formData.append('instructions', instructions);
  //     console.log('form_data +++++++++++++++++++++++++',formData);
  //     if (order) {
  //       if(order.cancelled == 0){
  //         formData.append('order_id', order.order_id);
  //       } else { 
  //         formData.append('order_id', order.order_id);        
  //       }
  //     }

  //     if (extraOptions.length > 0) {
  //       extraOptions.map((extraOption) => {
  //         let main_sku = extraOption.main_sku;
  //         if (extraOption.items.length == 1) {
  //           formData.append('extra_' + main_sku, extraOption.items[0].sku);
  //         } else {
  //           extraOption.items.map((item) => {
  //             formData.append('extra_' + main_sku + '[]', item.sku);
  //           });
  //         }
  //       });
  //     }

  //     let headers = {};

  //     if (token || guestToken) {
  //       headers = {
  //         authorization: `Bearer ${token ? token : guestToken}`,
  //       };
  //     }

  //     fetchAPI('/order/add_product', {
  //       method: 'POST',
  //       headers: headers,
  //       body: formData,
  //     })
  //       .then(async (res) => {
  //         const order = res.data;

  //         if (!token && order.token) {
  //           dispatch(setGuestToken(order.token));
  //         }
  //         dispatch(setOrder(order));         

  //         if (extraOptions.length > 0) {
  //           chooseExtras({});
  //         }
  //         let freeDeliveryNotice = null;
  //         const cart_amount = Number(order.cart_amount);

  //         if (cart_amount < orderFreeDeliveryCutoff) {
  //           freeDeliveryNotice = (
  //             <View
  //               style={{
  //                 flexDirection: 'row',
  //                 paddingHorizontal: 30,
  //                 paddingVertical: 10,
  //                 marginTop: 20,
  //                 marginBottom: 10,
  //                 borderColor: '#777',
  //                 borderWidth: 3,
  //                 borderRadius: 10,
  //               }}>
  //               <View
  //                 style={{
  //                   flex: 2,
  //                   flexDirection: 'row',
  //                   justifyContent: 'center',
  //                 }}>
  //                 <Icon
  //                   size={36}
  //                   color={Theme.color.accentColor}
  //                   name="truck"
  //                 />
  //               </View>
  //               <View
  //                 style={{
  //                   flex: 8,
  //                   flexDirection: 'row',
  //                   justifyContent: 'flex-start',
  //                   alignItems: 'flex-start',
  //                 }}>
  //                 <AppText
  //                   style={{
  //                     fontSize: 16,
  //                     color: Theme.color.accentColor,
  //                     fontWeight: '700',
  //                     textAlign: 'left',
  //                   }}>
  //                   Spend {(orderFreeDeliveryCutoff - cart_amount).toFixed(2)}{' '}
  //                   more to get free delivery
  //                 </AppText>
  //               </View>
  //             </View>
  //           );
  //         }
  //         dispatch(
  //           showNotification({
  //             type: 'fullScreen',
  //             autoHide: false,
  //             options: { align: 'right' },
  //             message: (
  //               <>
  //                 {/* <View style={{ position: 'absolute', top: 5, right: -20 }}>
  //                   <Price style={{ height: 35, width: 120 }} />
  //                 </View> */}
  //                 <View>
  //                   <Icon size={60} color="white" name="cart" />
  //                 </View>
  //                 <AppText
  //                   style={{
  //                     fontSize: 18,
  //                     color: 'white',
  //                     fontWeight: 'bold',
  //                     textAlign: 'center',
  //                     marginTop: 10,
  //                   }}>
  //                   ITEM ADDED TO YOUR ORDER
  //                 </AppText>
  //                 {freeDeliveryNotice}
  //                 <Button
  //                   type="white"
  //                   style={{ marginBottom: 10, marginTop: 20 }}
  //                   fullWidth
  //                   onClick={() => {
  //                     dispatch(clearNotification());
  //                     dispatch(updatedInstructions(instructions));
  //                     NavigationService.navigate('MyOrder');
  //                   }}>
  //                   Checkout
  //                 </Button>

  //                 <Button
  //                   type="white"
  //                   style={{ marginBottom: 10 }}
  //                   fullWidth
  //                   onClick={() => {
  //                     dispatch(clearNotification());
  //                     NavigationService.goBack();
  //                     NavigationService.goBack();
  //                   }}>
  //                   View all Products
  //                 </Button>

  //                 <Button
  //                   type="white"
  //                   fullWidth
  //                   onClick={() => {
  //                     dispatch(clearNotification());
  //                   }}>
  //                   Back
  //                 </Button>
  //               </>
  //             ),
  //           }),
  //         );
  //       })
  //       .catch((err) =>
  //         dispatch(
  //           showNotification({
  //             type: 'error',
  //             message: err.message,
  //             options: { align: 'right' },
  //           }),
  //         ),
  //       )
  //       .finally(() => setLoading(false));
  //   },
  //   [dispatch, token, guestToken, extraOptions],
  // );

  return (
    <Screen isLoading={isLoading}>
      <View style={styles.container}>
        <View style={GlobalStyles.formControl}>
          <Input
            type="textarea"
            title="Special Instructions (optional)"
            placeholder="Type any special instructions you want the delivery person to see"
            value={instructions}
            onChange={setInstruction}
          />
        </View>
        <View style={GlobalStyles.formControl}>
          <Button
            type="accent"
            onClick={() => addInstruction(instructions)}>
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

ProductInstructionScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Instructions',
    },
  });
