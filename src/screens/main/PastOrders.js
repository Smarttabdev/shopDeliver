import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { Screen, OrderItem, SubscriptionItem, Button, AppText, Tabs, LoadingGIF} from '~/components';
import { MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { NavigationService } from '~/core/services';
import { showNotification,setTerritoryType} from '~/store/actions';


export const PastOrdersScreen = () => {

  const order = useSelector((state) => state.order.order);
  const explorer = useSelector((state) => state.explorer);

  const [isLoading, setLoading] = useState(false);
  const [pastOrders, setPastOrders] = useState(false);
  const [subscriptions, setSubscriptions] = useState(false);  
  const subscriptionCancelledUpdated = useSelector((state) => state.notification.subscriptionCancelledUpdated);

  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);

  const tabData = useMemo(() => {
    let tabData = [];
    
    tabData.push({
      title: 'Orders',
      content: (
        <View>
        {pastOrders && pastOrders.length > 0 ? (
          <>
          <AppText style={styles.heading}>YOU HAVE {pastOrders.length} PAST ORDERS</AppText>
          <FlatList
            data={pastOrders}
            style={styles.list}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <OrderItem
                order={item}
                onPress={() => {
                  NavigationService.navigate('OrderDetails', {
                    orderId: item.order_id,
                  });
                }}
              />
            )}
          />
          </>
        
      ) : 
          pastOrders === false? (
              <>
                <LoadingGIF />
              </>
          ) :
          <>
          <AppText style={styles.heading}>YOU HAVE NO PAST ORDERS</AppText>
          <AppText style={styles.subheading}>Once you complete an order you'll see it here.</AppText>
          </>
      }
      </View>
      ),
    });

    tabData.push({
        title: 'Subscriptions',
        content: (
          
        <View>
        {subscriptions && subscriptions.length > 0 ? (
          <>
          <AppText style={styles.heading}>YOU HAVE {subscriptions.length} SUBSCRIPTIONS</AppText>
          <FlatList
            data={subscriptions}
            style={styles.list}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <SubscriptionItem
                subscription={item}
                onPress={() => {
                  NavigationService.navigate('Subscription', {
                    //subscriptionId: item.subscription_id,
                    item: item
                  });                 
                  console.log("Subscription clicked");
                }}
              />
            )}
          />
          </>
        
      ) : 
          subscriptions === false? (
              <>
                <LoadingGIF />
              </>
          ) :
          <>
          <AppText style={styles.heading}>YOU HAVE NO SUBSCRIPTIONS</AppText>
          </>
      }
      </View>
      ),
    });

    return tabData;
  }, [pastOrders, subscriptions]);

  useEffect(() => {    
    if(token){
      console.log("aaaaaaaasdfsdfaaaaaaaaaaaaa",token);
      fetchAPI('/orders', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
      .then(async (res) => {
        /*
        setPastOrders(
          res.data.orders.filter((item) => item.status_name === 'Paid'),
        );
        */
        setPastOrders(res.data.orders);
        await fetchAPI('/subscriptions', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {         
          console.log(res.data.subscriptions);
          setSubscriptions(res.data.subscriptions);
        })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        )
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
    )
    
  }
  }, [token,subscriptionCancelledUpdated]);

  const navigateToSellers = (
    category
  ) => {
    dispatch(setTerritoryType({ territory_type : category }));

    NavigationService.navigate(lastAddress ? 'Sellers' : 'Location',{
      title : category == 'restaurants' ? 'restaurants' : 'shops' 
    })
  }

  const lastAddress = useMemo(
    () =>
      {
        if(order || explorer){
            if(order && order.address && order.address){
              return order.address
            }else if(explorer.address){
              return explorer.address
            }else{
              return false;
            }
        }else{
          return false;
        }
      },
    [order,explorer],
  );

  return (
    <Screen hasList isLoading={isLoading} fullScreen={true}>
      <View style={styles.container}>
      <Tabs tabs={tabData} />
      
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Theme.layout.screenPaddingTop,
    // paddingBottom: Theme.layout.screenPaddingBottom,
    paddingHorizontal: 20
  },

  heading : {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10
  },

  subheading : {
    textAlign: 'center',
    alignSelf: 'center',
    marginBottom: 30,
    width: '70%'
  },

  button: {
    marginBottom: 10
  },

  list: {},
});

PastOrdersScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'My Orders',
      headerTintColors: 'black',
    },
  });
