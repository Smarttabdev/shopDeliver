import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { Screen, PastOrder, AppText, OrderItem } from '~/components';
import { Theme, MainNavigationOptions } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification } from '~/store/actions';

export const OrderDetailsScreen = ({ navigation }) => {
  const [isLoading, setLoading] = useState(false);
  const [orderDetail, setOrderDetail] = useState();

  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);

  const orderId = useMemo(() => navigation.getParam('orderId'), []);

  useEffect(() => {
    setLoading(true);

    const formData = new FormData();
    formData.append('order_id', orderId);

    fetchAPI('/order/details', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => {
        setOrderDetail(res.data);
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, [orderId]);

  console.log(orderDetail);

  return (
    <Screen hasList isLoading={isLoading}>
      {orderDetail && (
        <View style={styles.container}>
          <View style={styles.orderInfo}>
            <OrderItem
                  order={orderDetail}
                  rightTopText={orderDetail.status_name}
                  onPress={() => {}}
                />
          </View>
          <View style={styles.orderInfo}>
            <View style={styles.part}>
              <AppText style={styles.field}>Ordered By:</AppText>
              <AppText style={styles.value}>
                {orderDetail.user.name + '\n' + orderDetail.user.phone}
              </AppText>
            </View>
            <View style={styles.part}>
              <AppText style={styles.field}>Deliver To:</AppText>
              <AppText style={styles.value}>
                {orderDetail.address.address}
              </AppText>
            </View>
          </View>
          <View style={styles.orderInfo}>
            <View style={styles.part}>
              <AppText style={styles.field}>Credit Card</AppText>
              <AppText style={styles.value}>{orderDetail.card}</AppText>
            </View>
            <View style={styles.part}>
              <AppText style={styles.field}>Order Date</AppText>
              <AppText style={styles.value}>{orderDetail.payment_date}</AppText>
            </View>
          </View>
          <FlatList
            style={styles.list}
            alwaysBounceVertical={false}
            data={orderDetail.products}
            scrollEnabled={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <PastOrder orderDetail={orderDetail} product={item} />}
            ListFooterComponent={() => (
              <View style={styles.footer}>
                <View style={styles.summary}>
                  <View style={styles.summaryRow}>
                    <AppText style={styles.summaryKey}>Delivery</AppText>
                    <AppText style={styles.summaryValue}>
                      {orderDetail.currency_icon} {(+orderDetail.delivery_amount).toFixed(2)}
                    </AppText>
                  </View>
                  <View style={styles.summaryRow}>
                    <AppText style={styles.summaryKey}>Tax</AppText>
                    <AppText style={styles.summaryValue}>
                    {orderDetail.currency_icon} {(+orderDetail.tax_amount).toFixed(2)}
                    </AppText>
                  </View>
                </View>

                <View style={styles.separator} />
                <AppText style={styles.summaryTotal}>
                  {orderDetail.currency_icon} {(+orderDetail.total_amount).toFixed(2)}
                </AppText>
              </View>
            )}
          />
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Theme.layout.screenPaddingTop,
    paddingBottom: Theme.layout.screenPaddingBottom,

    flex: 1,
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

  value: {
    fontSize: 14,
  },

  orderInfo: {
    paddingVertical: 10,
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,

    flexDirection: 'row',
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

OrderDetailsScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: `Order #${navigation.getParam('orderId')}`,
      headerTintColors: 'black',
    },
    headerTitleStyle: {
      color: 'black',
    },
  });
