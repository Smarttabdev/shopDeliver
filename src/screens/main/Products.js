import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import parseAddress from 'parse-address-string';

import { Screen, Product, AppText, Button } from '~/components';
import { NavigationService } from '~/core/services';
import { formatPhoneNumber } from '~/core/utility'
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification } from '~/store/actions';
import { LoadingGIF } from '../../components';
import DeliverySVG from '~/assets/images/delivery-truck.svg';
import PickupSVG from '~/assets/images/package.svg';
import OrderSVG from '~/assets/images/invoice.svg';

import LinearGradient from 'react-native-linear-gradient';

export const ProductsScreen = ({ navigation }) => {
  const [products, setProducts] = useState(false);
  const [categories, setCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [parsedAddress, setParsedAddress] = useState();

  // store
  const dispatch = useDispatch();

  const token = useSelector((state) => state.account.token);
  const order = useSelector((state) => state.order && state.order.order);
  const territory = useSelector((state) => state.order.territory);
  const explorer = useSelector((state) => state.explorer);

  useEffect(() => {
    console.log("territtory__+++++++++++",territory);
    territory &&
      territory.warehouse_address &&
      parseAddress(territory.warehouse_address, (err, addressObj) => {
        setParsedAddress(addressObj);
      });
  }, [territory]);

  // get products
  const size = 20;
  const categoriesSize = 5;

  useEffect(() => {
    navigation.setParams({ order });
  }, [order]);

  const openMenu = useCallback(() => {
    navigation.navigate('SellerInfo', {
      title: territory.name,
      territory: territory,
    });
  }, [territory]);

  useEffect(() => {
    navigation.setParams({
      action: openMenu,
      actionTitle: <Icon size={40} color={'white'} name="menu" />,
    });
  }, [openMenu]);

  useEffect(() => {
    const category = navigation.getParam('category');

    let query = '';

    if (token) {
      navigation.setParams({
        territory: territory.name,
        category: category,
      });

      const params = {
        territory: territory ? territory.tid : null,
        category: category ? category.cid : null,
        out_stock: 0
      };

      query = Object.keys(params)
        .filter((k) => params[k] !== null)
        .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
    } else {
      navigation.setParams({
        territory: explorer.territory.name,
        category: category,
      });

      const params = {
        territory: explorer ? explorer.territory.tid : null,
        category: category ? category.cid : null,
        out_stock: 0
      };

      query = Object.keys(params)
        .filter((k) => params[k] !== null)
        .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
    }

    fetchAPI(`/products/count?${query}`, {
      method: 'GET',
    })
      .then((res) => {
        setTotalCount(res.data.total);
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => {
        setLoading(false);
        if (territory.type_slug === 'restaurants') {
          getCategory(0);
        } else {
          if(territory.app_overview_display == 'products'){
           getProducts(0);
           getCategory(0);
          } else {getCategory(0);}
        }
      });
  }, []);

  const getProducts = useCallback((page) => {
    setLoading(true);
   
    const category = navigation.getParam('category');

    let query = '';
    if (token) {
      navigation.setParams({
        territory: territory.name,
        category: category,
      });

      const params = {
        territory: order ? territory.tid : null,
        category: category ? category.cid : null,
        page,
        size,
      };

      query = Object.keys(params)
        .filter((k) => params[k] !== null)
        .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
    } else {
      navigation.setParams({
        territory: explorer.territory.name,
        category: category,
      });

      const params = {
        territory: explorer ? explorer.territory.tid : null,
        category: category ? category.cid : null,
        page,
        size,
      };

      query = Object.keys(params)
        .filter((k) => params[k] !== null)
        .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
    }

    fetchAPI(`/products?${query}`, {
      method: 'GET',
    })
      .then((res) => {
         const productsData = res.data.products.filter(
           (item) => !item.out_stock,
        );
        console.log("____________________",productsData);
        setTotalPages(res.data.total_pages);
        if (page === 0) {
          setProducts(productsData);
        } else {
          setProducts((existingProducts) => [
            ...existingProducts,
            ...productsData,
          ]);
        }
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, []);

  // get categories
  const getCategory = useCallback((page) => {
    fetchAPI(
      `/categories?territory=${
        token ? territory.tid : explorer.territory.tid
      }&with_products=1&size=${categoriesSize}&page=${page}&out_stock=0`,
      {
        method: 'GET',
      },
    )
      .then((res) => {
        setTotalPages(res.data.total_pages);
        if (page === 0) {          
          setCategories(res.data.categories);
        } else {
          const filtered = res.data.categories.filter((item) => item.order != 999);
          setCategories((existingCategories) => [
            ...existingCategories,
            ...filtered,
          ]);
        }
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => {
        console.log('fnially ');
        setLoading(false);
      });
  }, []);

  const renderControllers = useMemo(() => {
    return (
      <View style={styles.controllerWrapper}>
        {categories.length ? (
          <View style={{ flex: 1, marginRight: 0 }}>
            <TouchableOpacity
              style={styles.controller}
              onPress={() => {
                NavigationService.navigate('SelectorPage', {
                  title: 'CATEGORY',
                  header: 'Select a category',
                  options: categories.filter((item) => item.show_name == true).map((item) => ({
                    label: `${item.name} ${item.total_products}`,
                    value: item.slug,
                  })),
                  action: (value) => {
                    setSelectedCategory(value);
                  },
                  noOptionsText: 'No Options Available',
                });
              }}>
              <AppText style={styles.controllerText}>Categories</AppText>
              <Icon name="menu-down" color="#AAA" size={30} />
            </TouchableOpacity>
          </View>
        ) : null}
        {/* <View style={{ flex: 1 }}>
          <TouchableOpacity style={styles.controller}>
            <AppText style={styles.controllerText}>Search</AppText>
            <Icon
              name="magnify"
              color="#AAA"
              size={25}
              style={{ paddingHorizontal: 5 }}
            />
          </TouchableOpacity>
        </View> */}
      </View>
    );
  }, [categories]);

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

  const sellerInfo = useMemo(() => {
    return territory ? (
      <View>
        <View style={styles.sellerInfo}>
          <Image
            style={styles.sellerBackground}
            source={
              territory && territory.cover_image
                ? { uri: territory.cover_image }
                : require('~/assets/images/darkwood.jpg')
            }
          />
          <View style={[styles.sellerBackground, styles.overlay]} />

          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)', 'rgba(256,256,256,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            locations={[0, 0.8, 1]}
            useAngle
            angle={180}
            style={{ flex: 1 }}>
            <View style={styles.sellerContent}>
              <Image
                style={styles.sellerImage}
                source={{ uri: territory.app_image }}
              />

              <AppText style={styles.sellerName}>{territory.name}</AppText>
              {parsedAddress && (
                <AppText style={styles.sellerAddress}>
                  {parsedAddress.city}, {parsedAddress.state},{' '}
                  {parsedAddress.country}
                </AppText>
              )}
            </View>
          </LinearGradient>
        </View>
        {territory.type_name != 'Services' ? (
        <View>
          <View style={styles.sellerDetails}>
            <View style={styles.sellerDetail}>
              <View style={styles.detailValueWrapper}>
                <AppText style={styles.detailValue}>
                  {(+territory.address_distance_km || 0).toFixed(0)}
                </AppText>
              </View>
              <AppText style={styles.detailName}>km away</AppText>
            </View>
            <View style={styles.sellerDetail}>
              <View style={styles.detailValueWrapper}>
                {+territory.address_distance <=
                +territory.delivery_area_radius ? (
                  <DeliverySVG width={35} height={35} />
                ) : (
                  <PickupSVG width={35} height={35} />
                )}
              </View>
              <AppText style={styles.detailName}>
                {+territory.address_distance <= +territory.delivery_area_radius
                  ? 'We Deliver'
                  : 'Pickup Only'}
              </AppText>
            </View>
            <View style={styles.sellerDetail}>
              <View style={styles.detailValueWrapper}>
                <AppText style={styles.detailValue}>
                  {totalCount}
                </AppText>
              </View>
              <AppText style={styles.detailName}>
                {territory.total_products > 1 ? territory.type_slug == 'restaurants' ? 'Menu Items': territory.type_slug == 'services'? 'Services':'Products' : territory.type_slug == 'restaurants' ? 'Menu Item' : territory.type_slug == 'services' ? 'Service' : 'Product'}
              </AppText>
            </View>
          </View>
          <View>
          {/* commeted by chris because jaco waht to remove this button for restauratns and services for now before build live chat
           <Button
              type="bordered_light"
              style={[GlobalStyles.formControl,styles.quoteButton]}
              onClick={() => navigation.navigate('ContactSeller',{
                  sellerID : territory.tid
              })}>
          Contact Us
          </Button>  */}
         </View>
        </View>
        ) :
        <View>
          {
         token && territory && typeof territory.support_mail === 'string' && territory.support_mail.trim().length > 0 && <Button
         type="bordered-dark"
         style={[GlobalStyles.formControl,styles.quoteButton]}
         onClick={() => navigation.navigate('ContactSeller',{
             sellerID : territory.tid
         })}>
         Contact Us
         </Button>  } 
         </View> 
         }
        {categories.length == 1 ? <></> : renderControllers}
      </View>
    ) : null;
  }, [territory, parsedAddress, renderControllers]);
 
  if (territory && territory.type_slug === 'restaurants') {
    return (
      <Screen
        hasList
        statusBar="light-content"
        showHeaderOverLayOnScroll
        stickyBottom={territory.operation_state == 'closed' ? <Closed/> : <MyCart />}>
        <View style={styles.container}>
          {territory && categories ? (
            <FlatList
              style={{ flex: 1 }}
              contentContainerStyle={styles.wrapper}
              alwaysBounceVertical={false}
              keyExtractor={(item, index) => index.toString()}
              onEndReached={() => {
                if (page < totalPages-1) {
                  getCategory(page + 1);                
                  setPage(page + 1);                
                }}}
              onEndReachedThreshold={0.1}
              data={categories.filter((item) => item.show_name == true)}
              extraData={categories.filter((item) => item.show_name == true)}
              ListHeaderComponent={() => sellerInfo}
              ListEmptyComponent={() => (
                <AppText style={{ textAlign: 'center' }}>No Products.</AppText>
              )}
              renderItem={({ item, index }) =>
                (!selectedCategory || item.slug === selectedCategory) &&
                item.products.length ? (
                  <View
                    style={territory.app_overview_display != 'products'? {
                      flexDirection: 'column',
                      paddingTop: index === 0 ? 20 : 40,
                    }:{
                      flexDirection: 'column',
                      paddingTop: index === 0 ? 20 : 10,
                    }}
                    >
                    {territory.app_overview_display != 'products'? <AppText style={styles.categorytitle}>{item.name}</AppText> : <></> }
                    <View>
                      {item.products.map((product, index) => {
                        return !product.out_stock ? (
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() =>
                              NavigationService.navigate('Product', {
                                productId: product.pid,
                              })
                            }>
                            <Product
                              territory={territory}
                              product={product}
                              style="category-item"
                              first={index === 0}
                              last={item.products.length === index + 1}
                              length={item.products.length}
                            />
                          </TouchableOpacity>
                        ) : null;
                      })}
                    </View>
                  </View>
                ) : null
              }
            />
          ) : (
            <>
              {sellerInfo}
              <LoadingGIF />
            </>
          )}
        </View>
      </Screen>
    );
  } else {
    
    return (       
      <Screen
        hasList
        statusBar="light-content"
        showHeaderOverLayOnScroll
        stickyBottom={<MyCart />}>
        <View style={styles.container}>
          {territory && (categories || products) ? ( 
            territory.app_overview_display != 'products' ?
            <FlatList
              contentContainerStyle={styles.wrapper}
              alwaysBounceVertical={false}
              keyExtractor={(item, index) => index.toString()}
              onEndReached={() => {
                if (page < totalPages-1) {                 
                  getCategory(page + 1);                 
                  setPage(page + 1);                
                }
              }}
              onEndReachedThreshold={0.1}
              data={categories.length != 1 ? categories.filter((item) =>item.show_name == true) : categories}
              extraData={categories.length != 1 ? categories.filter((item) =>item.show_name == true) : categories}
              ListHeaderComponent={() =>  sellerInfo}
              ListEmptyComponent={() => (
                <AppText style={{ textAlign: 'center' }}>No Products.</AppText>
              )}
              renderItem={({ item, index }) =>
                (!selectedCategory || item.slug === selectedCategory) &&
                item.products.length ?  (
                <View
                    style={{
                      flexDirection: 'column',
                      paddingTop: index === 0 ? 20 : 40,
                    }}>
                      {territory.type_slug == 'services' ?  <AppText style={styles.categorytitle4Services}>All Services</AppText>
                      :
                       <AppText style={styles.categorytitle}>{item.name}</AppText> }
                    
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      { item.products.filter((item)=> item.out_stock == false ).map((product, index) => {
                        return !product.out_stock ? (
                          <TouchableOpacity
                            style={styles.productWrapper}
                            activeOpacity={0.8}
                            onPress={() =>
                              NavigationService.navigate('Product', {
                                productId: product.pid,
                              })
                            }>
                            <Product territory={territory} product={product} />
                          </TouchableOpacity>
                        ) : null;
                      })}
                    </View>
                  </View>                        
                ) : null}
            /> :
            <FlatList
              contentContainerStyle={styles.wrapper}
              alwaysBounceVertical={false}
              keyExtractor={(item, index) => index.toString()}
              onEndReached={() => {
                if (page < totalPages-1) {                
                  getProducts(page+1);                
                  setPage(page + 1);                
                }
              }}
              onEndReachedThreshold={0.1}
              data={products}
              numColumns={2}
              extraData={products}
              ListHeaderComponent={() => sellerInfo}
              ListEmptyComponent={() => (
                <AppText style={{ textAlign: 'center' }}>No Products.</AppText>
              )}
              renderItem={({ item }) =>
                   !item.out_stock ? (
                      <TouchableOpacity
                        style={styles.productWrapper}
                        activeOpacity={0.8}
                        onPress={() =>
                          NavigationService.navigate('Product', {
                            productId: item.pid,
                          })
                        }>
                        <Product territory={territory} product={item} />
                      </TouchableOpacity>
                    ) : <></>               
               }
            />
          ) : (
            <>
              {sellerInfo}
              <LoadingGIF />
            </>
          )}
        </View>
      </Screen>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  list: {
    marginHorizontal: -10,
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingBottom: Theme.layout.screenPaddingBottom,
  },
  
  productWrapper: {
    flexDirection:'row',
    flexDirection: 'row', flexWrap: 'wrap',
    maxWidth: '50%',
    padding: 10,
  },

  sellerInfo: {
    position: 'relative',
  },

  sellerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },

  sellerContent: {
    alignItems: 'center',
    marginTop: 50,
  },

  sellerImage: {
    width: 90,
    height: 90,
    borderRadius: 5,
    backgroundColor: '#fff',
  },

  sellerName: {
    fontWeight: 'bold',
    marginTop: 10,
    paddingHorizontal: 20,
    textAlign: 'center',
  },

  sellerAddress: {
    color: 'grey',
    marginTop: 5,
    marginBottom: 10,
  },

  sellerDetails: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },

  sellerDetail: {
    justifyContent: 'center',
    flex: 1,
    marginVertical: 10,
  },

  detailValue: {
    fontSize: 30,
    textAlign: 'center',
    fontWeight: '400',
  },
  detailValueWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    // backgroundColor : '#000'
  },

  detailName: {
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
    fontWeight: '500',
  },

  overlay: {
    backgroundColor: 'black',
    opacity: 0.5,
  },

  shareButton: {
    marginHorizontal: 10,
    marginBottom: 10,
  },

  categorytitle: {
    fontSize: 20,
    fontWeight: '500',
    paddingHorizontal: 10,
  },

  categorytitle4Services: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 10,
  },

  myCartButton: {
    marginHorizontal: 20,    
    marginVertical: 15,  
    position:'absolute',
    bottom:0,
    display: 'flex',
    right:0,
    left:0  
  },

  controllerWrapper: {
    paddingHorizontal: 10,
    marginVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  controller: {
    width: '100%',
    height: 50,
    backgroundColor: '#EEE',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },

  controllerText: {
    color: 'black',
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
  },

  closedTextContainer: {
    flexDirection: 'column'
  },

  closedText: {
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

  quoteButton: {
    marginHorizontal: 10
  },
});

ProductsScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      // headerRight: () => <Price />,

      headerLeft: () => (
        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={() => navigation.goBack()}>
          <Icon size={30} color="white" name="chevron-left" />
        </TouchableOpacity>
      ),

      headerTitle: '',

      headerTintColor: 'white',
    },
  });
