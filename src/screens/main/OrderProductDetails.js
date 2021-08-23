import React, { useEffect, useMemo,useCallback, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { Screen, PastOrder, AppText,Button, OrderItem } from '~/components';
import { Theme, MainNavigationOptions } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setOrder, updatedInstructions, setOrderProduct } from '~/store/actions';
import { DashedLine } from '../../components';
import { NavigationService } from '~/core/services';
import { renderHTML } from '~/core/utility';
export const OrderProductDetailsScreen = ({ navigation }) => {
  const [isLoading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);

  const orderId = useMemo(() => navigation.getParam('orderId'), []);
  const product = useSelector((state) => state.order.orderProduct);

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
    console.log("$products********",product);
    return products_extra_array;
  }, [product]);
  
  const removeProduct = useCallback(() => {
    setLoading(true);

    const formData = new FormData();
    // formData.append('product_id', item.pid);
    // formData.append('option_sku', item.option_sku);
    formData.append('order_product_id', product.opid);

    fetchAPI('/order/remove_product', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
      body: formData,
    })
      .then((res) => {
        console.log(res.data);
        dispatch(setOrder(res.data));
        dispatch(setOrderProduct(false));
        dispatch(updatedInstructions("cart product removed"));
        NavigationService.goBack();
      })
      .catch((err) => dispatch(showNotification({ type: 'error', message: err.message })))
      .finally(() => setLoading(false));
  }, []);


  return (
    <Screen hasList isLoading={isLoading}>
      
        <View style={styles.container}>
          
          <View style={styles.orderInfo}>
            <View style={styles.part}>
              <AppText numberOfLines={1} style={styles.boldtext}>{product.product_name}
                <AppText style={styles.text}>
                     - {product.option_name}
                  </AppText></AppText>
              <AppText style={styles.text}>{renderHTML(product.long_description)}</AppText>
            </View>
          </View>
          <DashedLine></DashedLine>
          {products_extra.length > 0 && (
              products_extra.map((extra_option) => {
                let products_choosen_options_array = [];

                if (extra_option.options) {
                  for (var key in extra_option.options) {
                    if (extra_option.options.hasOwnProperty(key)) {
                      let product_options = extra_option.options[key];
                      products_choosen_options_array.push(product_options);
                    }
                  }
                }
                return <View style={styles.orderInfo}>
                <View style={styles.part}>
                  <AppText numberOfLines={0} style={styles.boldtext}>{extra_option.name}: {products_choosen_options_array.map((item,index)=>{
                    return <AppText style={styles.text}>{index > 0 && ', '}{item.name} (+ {item['price']}) </AppText>
                  })}</AppText>               
                </View>              
              </View>
              }
            )           
            )}
           {products_extra.length > 0 &&  <DashedLine></DashedLine>}
          {product.instructions != "" && <View style={styles.orderInfo}>
            <View style={styles.part}>
              <AppText numberOfLines={1} style={styles.specialInstrunction}>Special Instructions</AppText>
              <AppText style={styles.text}>
                {product.instructions}
              </AppText>
            </View>
          </View>}
          {product.instructions != "" && <DashedLine></DashedLine>}
          <Button 
              type="bordered-dark" 
              style={styles.button}
              onClick={()=>{ NavigationService.reset("ProductEdit", {
                productId: product.pid,
              });}}>
              EDIT</Button>
              <Button 
              type="bordered-dark" 
              style={styles.button}
              onClick={removeProduct}>
              DELETE</Button>
        </View>
      
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Theme.layout.screenPaddingTop,
    paddingBottom: Theme.layout.screenPaddingBottom,
    
  },

  button : {
    marginTop : 10,
    height: 60,
    marginHorizontal: Theme.layout.screenPaddingHorizontal,
    marginTop:30
  },

  list: {
    marginTop: 10,
  },

  action: {
    marginBottom: 40,
    marginHorizontal: 40,
  },

  sellerTitle: {
    alignItems: 'center',
  },

  orderTitle: {
    marginTop: 20,
    alignItems: 'center',
  },

  orderNumber: {
    fontSize: 25,
  },

  status: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  field: {
    fontSize: 16,
    marginBottom: 10,
    color: Theme.color.accentColor,
  },

  boldtext: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom:10
  },
  text: {
    fontSize: 15,
    color: 'grey'
  },

  orderInfo: {
    paddingVertical: 10,
    flexDirection: 'row',    
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
  },

  specialInstrunction: {
    color:Theme.color.accentColor,
    fontSize:15,
    paddingVertical:10
  },
  
  part: {
    flex: 1,
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: Theme.color.borderColor,
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

  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  separator: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.color.borderColor,
  },
  summaryTotal: {
    marginVertical: 15,
    fontSize: 24,
    textAlign: 'center',
  },
});

OrderProductDetailsScreen.navigationOptions = ({ navigation }) =>
MainNavigationOptions({
  navigation,
  options: {
    headerTitle: 'Details',
  },
  });
