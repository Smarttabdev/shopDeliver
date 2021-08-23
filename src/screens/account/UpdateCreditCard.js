import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, Platform, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { CardIOModule, CardIOUtilities } from 'react-native-awesome-card-io';

import { NavigationService } from '~/core/services';

import { Screen, Button, Input, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI, formatCCExpiry } from '~/core/utility';
import { showNotification, setUserInfo, setOrder, subscriptionAddressUpdated } from '~/store/actions';

export const UpdateCreditCardScreen = ({ navigation }) => {
  const deliveryMode = useMemo(() => navigation.getParam('deliveryMode'), []);
  const tip_percentage = useMemo(() => navigation.getParam('tip_percentage'), []);

  
  const editSubscription = useMemo(() => navigation.getParam('editSubscription'), []);
  const subscription_Sid = useMemo(() => navigation.getParam('subscription_id'), []);
  const [card, setCard] = useState({});

  const [orderDetail, setOrderDetail] = useState(null);

  const [isLoading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);
  const userInfo = useSelector((state) => state.account.userInfo);

  const _pay = useCallback(() => {
    setLoading(true);

    const expDate = card.expDate && card.expDate.split('/');

    const formData = new FormData();
    formData.append('name', card.name);
    formData.append('number', card.number);
    formData.append('exp_month', expDate && expDate[0].trim());
    formData.append('exp_year', expDate && expDate[1].trim());
    formData.append('cvc', card.cvc);
    formData.append('postal_code', card.postalCode);

    fetchAPI('/myaccount/update_card', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then(async (res) => {
        dispatch(
          setUserInfo({
            ...userInfo,
            creditcard: res.data.creditcard,
          }),
        );
        //dispatch(showNotification({ type: 'success', message: res.message }));

        const formData = new FormData();
        formData.append('delivery_type', deliveryMode);
        formData.append('tip_percentage', tip_percentage);

        await fetchAPI('/order/pay', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: formData,
        })
          .then((res) => {
            dispatch(setUserInfo({ totalOrders: +userInfo.totalOrders + 1 }));
            NavigationService.reset('OrderSuccess', {
              orderId: res.data.order_id,
            });
          })
          .catch((err) => {
            dispatch(showNotification({ type: 'error_card', message: err.message}));
            NavigationService.navigate('Account/CreditCard', {
              deliveryMode: deliveryMode,
              tip_percentage: tip_percentage,
            });
          })
          .finally(() => setLoading(false));
      })
      .catch((err) =>{
        dispatch(showNotification({ type: 'error', message: err.message}));
      }
        
      )
      .finally(() => setLoading(false));
  }, [userInfo, deliveryMode, card, token, userInfo, tip_percentage]);

  const getOrderDetails = useCallback(() => {
    setLoading(true);

    fetchAPI('/order/details', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        dispatch(setOrder(res.data));
        setOrderDetail(res.data);
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (openOrder) {
      getOrderDetails();
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      CardIOUtilities.preload();
    }
  }, []);

  const _save = useCallback(() => {
    setLoading(true);

    const expDate = card.expDate && card.expDate.split('/');

    const formData = new FormData();
    formData.append('name', card.name);
    formData.append('number', card.number);
    formData.append('exp_month', expDate && expDate[0].trim());
    formData.append('exp_year', expDate && expDate[1].trim());
    formData.append('cvc', card.cvc);
    formData.append('postal_code', card.postalCode);

    fetchAPI('/myaccount/update_card', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then(async (res) => {
        dispatch(
          setUserInfo({
            ...userInfo,
            creditcard: res.data.creditcard,
          }),
        );
        if(editSubscription == true)
        {
          setLoading(true);
          const formData = new FormData();
          formData.append('subscription_id', subscription_Sid);         
          formData.append('card_id',res.data.card_id);
          await fetchAPI('/subscription/update_card', {
            method: 'POST',
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: formData,
          })
            .then((res) => {
              dispatch(subscriptionAddressUpdated(true));         
              dispatch(showNotification({ type: 'success', message: res.message }));
              NavigationService.goBack();
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
          if (openOrder) {
            navigation.navigate('MyOrder');
          }
        }

        dispatch(showNotification({ type: 'success', message: res.message }));
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, [card, token, userInfo]);

  useEffect(() => {
    navigation.setParams({
      action: _save,
      actionTitle: openOrder ? 'Save' : 'Update',
      actionColor: 'black',
    });
  }, [_pay]);

  const openOrder = useSelector((state) => {
    if (state.order.order && (+state.order.order.cart_amount).toFixed(2) > 0) {
      return state.order.order.order_id;
    } else {
      return false;
    }
  });

  const payButtonText = useMemo(
    () =>
      userInfo && orderDetail
        ? 'Pay - ' +
          orderDetail.currency_icon +
          (deliveryMode === 'deliver'
            ? +orderDetail.total_amount_with_delivery
            : +orderDetail.total_amount_without_delivery
          ).toFixed(2)
        : 'Checkout',
    [userInfo, orderDetail, deliveryMode],
  );

  return (
    <Screen isLoading={isLoading} hasList
    showHeaderOverLayOnScroll keyboardAware={true}
    >
      <View style={styles.container}>
        {Boolean(userInfo.creditcard) && (
          <View style={GlobalStyles.formControl}>
            <AppText style={styles.description}>Credit card on file</AppText>
            <AppText style={styles.cardNumber}>{userInfo.creditcard}</AppText>
          </View>
        )}
        <Input
          style={GlobalStyles.formControl}
          title="Card Number"
          type="creditCard"
          placeholder="XXXX XXXX XXXX XXXX"
          keyboardType="number-pad"
          value={card.number}
          onChange={(e) => setCard({ ...card, number: e })}
          actionIcon="credit-card-scan"
          actionHandler={() => {
            CardIOModule.scanCard()
              .then((card) => {
                // the scanned card
                setCard({
                  name: card.cardholderName,
                  number: card.cardNumber.toString(),
                  expDate: formatCCExpiry(
                    `${card.expiryMonth.toString()}/${card.expiryYear.toString()}`,
                  ),
                  cvc: card.cvv,
                  postalCode: card.postalCode,
                });
              })
              .catch(() => {
                // the user cancelled
              });
          }}
        />
        <Input
          style={GlobalStyles.formControl}
          type="creditCard"
          title="Name on Card"
          placeholder="Name on Card"
          value={card.name}
          onChange={(e) => setCard({ ...card, name: e })}
        />
        <Input
          style={GlobalStyles.formControl}
          title="Expiry Date"
          type="creditCard"
          placeholder="XX / XXXX"
          value={card.expDate}
          keyboardType="number-pad"
          onChange={(e) => setCard({ ...card, expDate: formatCCExpiry(e) })}
        />
        <Input
          style={GlobalStyles.formControl}
          title="CVC Number"
          type="creditCard"
          placeholder="XXX"
          value={card.cvc}
          keyboardType="number-pad"
          onChange={(e) => setCard({ ...card, cvc: e })}
        />
        <Input
          style={GlobalStyles.formControl}
          title="ZIP/Postal Code"
          type="creditCard"
          placeholder="XXXX"
          value={card.postalCode}
          onChange={(e) => setCard({ ...card, postalCode: e })}
        />
        <Button
          type="bordered-dark"
          style={GlobalStyles.formControl}
          onClick={_save}>
          {openOrder ? 'Save & Go Back to my Cart' : 'Update'}
        </Button>
        {openOrder && (
          <Button style={GlobalStyles.formControl} type="accent" onClick={_pay}>
            {payButtonText}
          </Button>
        )}
        <View style={GlobalStyles.formControl}>
          <Image
            style={styles.image}
            source={require('~/assets/images/payment.png')}
            resizeMode="contain"
          />
        </View>
        <View style={GlobalStyles.formControl}>
          <AppText style={styles.stripeDescription}>
            Payments processed by Stripe.com
          </AppText>
          <AppText style={styles.stripeDescription}>
            Your credit card will only be charged if you place and order, when
            you checkout.
          </AppText>
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

  name: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 5,
  },

  number: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '300',
    marginBottom: 10,
    color: Theme.color.accentColor,
  },

  description: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  cardNumber: {
    marginTop: 5,
    color: Theme.color.accentColor,
  },

  image: {
    width: 200,
    height: 30,
    marginTop: 10,
    alignSelf: 'center',
  },

  stripeDescription: {
    marginTop: 10,
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
  },
});

UpdateCreditCardScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Credit Card',
    },
  });
