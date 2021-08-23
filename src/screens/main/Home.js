import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';

import { useSelector, useDispatch } from 'react-redux';
import Carousel from 'react-native-snap-carousel';
import { NavigationService } from '~/core/services';
import { Screen, AppText,Button } from '~/components';
import { Theme, MainNavigationOptions } from '~/styles';
import { truncateAddress } from '~/core/utility';
import { fetchAPI } from '~/core/utility';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {setTerritoryType} from '~/store/actions';
import OrderSVG from '~/assets/images/invoice.svg';
import ShopSVG from '~/assets/images/shop.svg';
import FoodSVG from '~/assets/images/burger.svg';
import ServiceSVG from '~/assets/images/services.svg';
import GiveawaysSVG from '~/assets/images/gift-outline.svg';
import InviteSVG from '~/assets/images/invite.svg';
import DealSVG from '~/assets/images/deal.svg';
import UserSVG from '~/assets/images/user.svg';
import ChatSVG from '~/assets/images/chat.svg';

import {
  showNotification,
  setAddress as setAddressAction,
} from '~/store/actions';


import { AppEventsLogger } from "react-native-fbsdk-next";

export const HomeScreen = ({ navigation }) => {
  const userInfo = useSelector(
    (state) => state.account && state.account.userInfo,
  );

  // const [orderDetail, setOrderDetail] = useState(null);
  
  const [isLoading, setLoading] = useState(false);
  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);
  const order = useSelector((state) => state.order.order);
  const explorer = useSelector((state) => state.explorer);
  const [address, setAddress] = useState('');
  const windowWidth = Dimensions.get('window').width;
  const [indexButton,setIndexButton] = useState('');
  const [unread, setUnread] = useState('');
  const enterMessageRoomValue =  useSelector((state) => state.notification.enterMessageRoom);
  const renderHome = ({item, index}) => {    
    if(index == 0)
    {
      return (
    <TouchableOpacity style={styles.menuButton}
      onPress={() => chooseSellerCategory('shops')}>
      <View style={styles.menuButtonTextWrap}>
        <ShopSVG height={50} width={50} />
        <AppText style={styles.menuButtonTitle}>Shops</AppText>
      </View>
    </TouchableOpacity>);
    } else if(index == 1)
    {
      return (
      <TouchableOpacity style={styles.menuButton}
        onPress={() => chooseSellerCategory('restaurants')}>
        <View style={styles.menuButtonTextWrap}>
          <FoodSVG width={50} height={50} />
          <AppText style={styles.menuButtonTitle}>Food</AppText>
        </View>
      </TouchableOpacity>  
      );
    } else if(index == 2)
    {
      return (
        <TouchableOpacity style={styles.menuButton}
        onPress={() => chooseSellerCategory('services')}>
        <View style={styles.menuButtonTextWrap}>
          <ServiceSVG width={50} height={50} />        
          {/* <Icon size={57} color={'#ffffff'} name="clipboard-list-outline" style={styles.menuButtonIcon} /> */}
          <AppText style={styles.menuButtonTitle}>
            Services
          </AppText>
        </View>
      </TouchableOpacity> 
         
      ); 
    } else if(index == 3)
    {
      return(
        <TouchableOpacity style={styles.menuButton}
        onPress={() => chooseDealsList()}>
        <View style={styles.menuButtonTextWrap}>
          <DealSVG height={50} width={60} />
          {/* <Icon size={50} color={'#ffffff'} name="gift-outline" style={styles.menuButtonIcon} /> */}
          <AppText style={styles.menuButtonTitle}>
            Deals
          </AppText>
        </View>
      </TouchableOpacity>     
      );
    } else if(index == 4)
    {
       return(
        <TouchableOpacity style={styles.menuButton}
        onPress={() => NavigationService.navigate('Invite')}>
        <View style={styles.menuButtonTextWrap}>
          <InviteSVG height={50} width={60}/>
          {/* <Icon size={50} color={'#ffffff'} name="gift-outline" style={styles.menuButtonIcon} /> */}
          <AppText style={styles.menuButtonTitle}>
          Invite
          </AppText>
        </View>
      </TouchableOpacity> 
      );
    } else if(index == 5)
    {
      return(
        <TouchableOpacity style={styles.menuButton}
        onPress={() => chooseOrderList()}>
        <View style={styles.menuButtonTextWrap}>
          <OrderSVG height={50} width={50} />
          <AppText style={styles.menuButtonTitle}>My Orders</AppText>
        </View>
      </TouchableOpacity>     
      );
    } else if(index == 6)
    {
       return(
        <TouchableOpacity style={styles.menuButton}
        onPress={() => chooseMyAccount()}>
        <View style={styles.menuButtonTextWrap}>
          <UserSVG height={50} width={60} />
          {/* <Icon size={50} color={'#ffffff'} name="gift-outline" style={styles.menuButtonIcon} /> */}
          <AppText style={styles.menuButtonTitle}>
            My Account
          </AppText>
        </View>
      </TouchableOpacity> 
      );
    }
  };

  const homeData = [
    {
      data: 1
    },
    {
      data: 2
    },
    {
      data: 3
    },
    {
      data: 4
    },
    {
      data: 5
    },
    {
      data: 6
    },
    {
      data: 7
    },
    // {
    //   data: 5
    // }
    ];
    
  const territory_type_initial = useSelector(
    (state) =>
      (state.order.territory_type &&
        state.order.territory_type.territory_type) ||
      'shops',
  );
  const MyCart = () => {
    const price = useSelector(
      (state) => state.order.order && state.order.order.cart_amount,
    );
    return (+price || 0) > 0 ? (
      <Button
        type="accent"
        style={styles.myCartButton}
        icon="cart-outline"
        rightText={`${order.currency_icon}${(+price || 0).toFixed(2)}`}
        onClick={() => NavigationService.navigate('MyOrder')}>
        My Cart
      </Button>
    ) : (
      <></>
    );
  };
  // const getOrderDetails = useCallback(() => {
  //   console.log('+++++++++++++++++++++++++++++++++++++++++++++',token);
  //   fetchAPI(`/order/details`, {
  //     method: 'POST',
  //     headers: {
  //       authorization: `Bearer ${token ? token : guestToken}`,
  //     },
  //   })
  //     .then((res) => {
  //       dispatch(setOrder(res.data));
  //       setOrderDetail(res.data);
  //       console.log('+++++++++++++++++++++++++++++++++++++++++++++',res.data.territory);
  //       dispatch(setTerritory(res.data.territory));
  //       setDeliveryMode(
  //         +res.data.territory_distance >
  //           +res.data.territory.delivery_area_radius
  //           ? 'pickup'
  //           : 'deliver',
  //       );
  //     })
  //     .catch((err) =>
  //       {
  //         NavigationService.navigate('Home');
  //       }
  //     );
  // }, []);
  

  const dispatch = useDispatch();

  const chooseSellerCategory = (category) => {  
    AppEventsLogger.logEvent('USER TAPS ON '+category.toUpperCase())
    dispatch(setTerritoryType({ territory_type: category }));
    if (openOrder) {
      NavigationService.navigate('OpenOrder', { orderId: openOrder });
    } else {
      if (token) {
        setLoading(true);
        fetchAPI(`/myaccount/addresses`, {
          method: 'GET',
          headers: {
            authorization: `Bearer ${token}`,
          },
        })
          .then((res) => { 
            if(res.data.addresses.length == 0)
            {              
              NavigationService.navigate("SelectDelivery1",{addressCnt: 0});
            } else {
              NavigationService.navigate(lastAddress ? 'Sellers' : 'Location', {
                title: category === 'restaurants' ? 'restaurants' : 'shops',
              });
            }
          })
          .catch((err) =>
            dispatch(showNotification({ type: 'error', message: err.message })),
          )
          .finally(() => setLoading(false));
      } else {
        if(lastAddress){
          NavigationService.navigate("Sellers");
        } else {
          NavigationService.navigate("SelectDelivery1");
        }
      }     
    }
  };

  const chooseDealsList = () => {
    console.log(lastAddress);
    if(userInfo && userInfo.user_verified == true)
    {      
      if(!lastAddress){
        dispatch(showNotification({type : "error", message : "Please add a delivery address"}));      
      } else {
        NavigationService.navigate("DealList")
      }
    } else {
      dispatch(showNotification({type : "error", message : "Please Sign In to see deals"}));      
    }
  };

  
  const chooseMyAccount = () => {
    console.log(lastAddress);
    if(userInfo && userInfo.user_verified == true)
    {      
        NavigationService.navigate('Account/MyAccount')
    } else {
      dispatch(showNotification({type : "error", message : "Please Sign In to see account information"}));      
    }
  };
  const chooseOrderList = () => {
    console.log(lastAddress);
    if(userInfo && userInfo.user_verified == true)
    {     
       NavigationService.navigate('PastOrders')
    } else {
      dispatch(showNotification({type : "error", message : "Please Sign In to see orders"}));      
    }
  };

  const openMenu = useCallback(() => {
    navigation.navigate('More');
  }, []);

  useEffect(() => {
    dispatch(setTerritoryType({ territory_type: territory_type_initial }));
    navigation.setParams({
      action: openMenu,
      actionTitle: (
        <Icon size={40} color={Theme.color.accentColor} name="menu" />
      ),
    });
  }, [openMenu, territory_type_initial]);

  const openOrder = useSelector((state) => {
    if (state.order.order && (+state.order.order.cart_amount).toFixed(2) > 0) {
      return state.order.order.order_id;
    } else {
      return false;
    }
  });

  const lastAddress = useMemo(() => {   
    if (order && order.address && order.cancelled == 0) {      
      return order.address;
    } else if (explorer && explorer.address) {
      return explorer.address;
    } else if (address) {
      return address;
    } else {
      return false;
    }
  }, [order, explorer, address]);

  useEffect(() => {
    if (token) {
      console.log(order);
      setLoading(true)
      setAddress(false);
      fetchAPI('/myaccount/default_address', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          setAddress(res.data.address);
          dispatch(setAddressAction(res.data.full_address));
        })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        );       

      fetchAPI('/messages/unopened', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        //console.log("console log data ++++++++++++++",res.data);
        setUnread(res.data.total);          
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
    }
    

  }, [dispatch,enterMessageRoomValue]);

  return (
    <Screen
      align="bottom"
      backgroundImage={require('~/assets/images/back5.png')}>
      <View style={styles.container}>
        <View style={styles.logoWrapper}>
          <Image
            source={require('~/assets/images/logo-light.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <AppText style={styles.subheading}>SHOP LOCAL ONLINE™</AppText>
        </View>
       
        <View style={styles.menuWrapper}>
          <View style = {{maxWidth: windowWidth, flexDirection: 'row',  marginBottom: 10,}}>
            <Carousel    
             data={homeData}
             layout='default'    
             inactiveSlideScale={1}             
             activeSlideAlignment={'start'}
             contentContainerCustomStyle={{overflow: 'hidden', width: (windowWidth-40)/3*7}}
             inactiveSlideOpacity={1}     
             renderItem= {renderHome}
             sliderWidth={windowWidth-40}
             itemWidth={(windowWidth-40)/3}
            > 
            </Carousel>
            </View>
          {lastAddress && (
            <View style={[styles.menuRow, styles.menuRowLastItem]}>
              <TouchableOpacity
                style={[
                  styles.menuButton,
                  {
                    height: 50,
                    alignItems: 'flex-start',
                    paddingLeft: 20,
                    flex: 5,
                  },
                ]}
                onPress={() => {
                  dispatch(setTerritoryType({ territory_type: 'address' }));
                  NavigationService.navigate('Location');
                }}>
                <View style={styles.menuButtonTextWrap}>
                  {/* <Icon size={58} color={'#ffffff'} name="account-circle-outline" style={styles.menuButtonIcon} /> */}
                  <AppText style={{ color: '#FFF' }}>
                    Deliver to:{' '}
                    <AppText style={[{ fontWeight: 'bold' }]}>
                      {truncateAddress(lastAddress)}
                    </AppText>
                  </AppText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.menuButton,
                  {
                    backgroundColor: 'rgba(0,0,0,0.60)',
                    height: 50,
                    width: 50,
                    alignItems: 'center',
                  },
                ]}
                onPress={() => {
                  NavigationService.navigate('MessageTerritoryList');
                }}>
                
                <ChatSVG height={25} width={25}/>
                { unread > 0 &&<AppText style={styles.unreadDot}>{unread}</AppText> }
              </TouchableOpacity>
            </View>
          )}
        </View>
        {openOrder > 0 && (<MyCart />)}        
      </View>      
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: Theme.layout.screenPaddingTop,
    paddingBottom: Theme.layout.screenPaddingBottom,

    display: 'flex',
    minHeight: '100%',
  },

  logoWrapper: {
    paddingTop: 50,
    paddingHorizontal: 40,
    marginBottom: 50,
    flex: 1,
    justifyContent: 'flex-end',
  },

  marginBottom: {
    marginBottom: 15,
  },

  logo: {
    width: '100%',
    height: 60,
  },

  menuWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },

  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,

  },

  menuRowLastItem: {
    marginBottom: 0,
  },

  menuButton: {    
    height: 130,
    marginHorizontal:5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.60)',
    borderRadius: 10,
  },

  menuButtonTextWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuButtonIcon: {
    marginBottom: 5,
    width: 50,
    height: 50,    
  },

  menuButtonTitle: {
    fontSize: 14,
    textAlign: 'center',
    letterSpacing: 0.5,
    color: '#ffffff',
    marginTop: 10,
  },
  subheading: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  myCartButton: {
    marginHorizontal: 10,
    marginVertical: 20,
  },

  unreadDot: {
    borderRadius: 3,
    textAlign:"center", 
    fontSize: 10,
    color: "#fff",
    backgroundColor: "#f00",
    height: 15,
    minWidth: 13,
    paddingLeft:2, 
    paddingRight: 2, 
    fontWeight: "bold", 
    borderRadius: 25, 
    position: 'absolute',
    right: 10,
    top: 5    
  }
});

// HomeScreen.navigationOptions = {
//   headerShown: false,
//   options: {
//     headerRight: () => <Price />, //hidden as filter Sellers option takes over Right side of Header
//   }
// };

HomeScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: '',
    },
  });
