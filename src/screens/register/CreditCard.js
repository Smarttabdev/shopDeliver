import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Platform, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { CardIOModule, CardIOUtilities } from 'react-native-awesome-card-io';

import { NavigationService } from '~/core/services';
import { Screen, Input, Button, AppText } from '~/components';
import { GlobalStyles, RegisterNavigationOptions, Theme } from '~/styles';

import { fetchAPI, formatCCExpiry } from '~/core/utility';
import { showNotification, setUserInfo } from '~/store/actions';

export const CreditCardScreen = ({ navigation }) => {
  const [card, setCard] = useState({});
  const [isLoading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);
  const userInfo = useSelector((state) => state.account.userInfo);

  const _continue = useCallback(() => {
    setLoading(true);

    const expDate = card.expDate.split('/');

    const formData = new FormData();
    formData.append('name', card.name);
    formData.append('number', card.number);
    formData.append('exp_month', expDate[0].trim());
    formData.append('exp_year', expDate[1].trim());
    formData.append('cvc', card.cvc);
    formData.append('postal_code', card.postalCode);

    fetchAPI(`/myaccount/update_card`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => {
        dispatch(
          setUserInfo({
            ...userInfo,
            creditcard: res.data.creditcard,
          }),
        );

        NavigationService.reset('Home');
      })
      .catch((err) => {
        dispatch(showNotification({ type: 'error', message: err.message }));
      })
      .finally(() => setLoading(false));
  }, [card, token, userInfo]);

  useEffect(() => {
    navigation.setParams({ action: _continue });
  }, [_continue]);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      CardIOUtilities.preload();
    }
  }, []);

  return (
    <Screen
      isLoading={isLoading}
      backgroundImage={require('~/assets/images/back5.png')}
      showHeaderOverLayOnScroll>
      <View style={styles.container}>
        <Input
          title="Card Number"
          placeholder="XXXX XXXX XXXX XXXX"
          value={card.number}
          type="creditCard"
          onChange={(e) => setCard({ ...card, number: e })}
          style={GlobalStyles.formControl}
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
                });
              })
              .catch(() => {
                // the user cancelled
              });
          }}
        />
        <Input
          title="Name on Card"
          type="creditCard"
          value={card.name}
          onChange={(e) => setCard({ ...card, name: e })}
          style={GlobalStyles.formControl}
        />
        <Input
          title="Expiry Date"
          placeholder="XX / XXXX"
          type="creditCard"
          value={card.expDate}
          onChange={(e) => setCard({ ...card, expDate: formatCCExpiry(e) })}
          style={GlobalStyles.formControl}
        />
        <Input
          title="CVC Number"
          placeholder="CVC"
          type="creditCard"
          value={card.cvc}
          onChange={(e) => setCard({ ...card, cvc: e })}
          style={GlobalStyles.formControl}
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
          type="bordered-light"
          style={GlobalStyles.formControl}
          onClick={_continue}>
          Continue
        </Button>
        <Button
          type="borderless"
          style={GlobalStyles.formControl}
          onClick={() => NavigationService.reset('Home')}>
          I'll add my card later
        </Button>
        <View style={GlobalStyles.formControl}>
          <Image
            style={styles.image}
            source={require('~/assets/images/payment-white.png')}
            resizeMode="contain"
          />
        </View>
        <View style={GlobalStyles.formControl}>
          <AppText style={styles.description}>
            Payments processed by Stripe.com
          </AppText>
          <AppText style={styles.description}>
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
    height:900,
  },

  image: {
    width: 200,
    height: 30,
    marginTop: 10,
  },

  description: {
    marginTop: 10,
    fontSize: 15,
    color: '#ccc',
  },
});

CreditCardScreen.navigationOptions = ({ navigation }) =>
  RegisterNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Credit Card',
    },
  });
