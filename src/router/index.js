import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import {
  SplashScreen,
  GetAccessScreen,
  GetAccessScreen2,
  VerifyPhoneScreen,
  VerifyPhoneScreen2,
  CheckPasswordScreen,
  ResetPasswordEmailScreen,
  CheckEmailScreen,
  ResetPasswordScreen,
  ResetPasswordEmailGuestScreen,
  CheckEmailGuestScreen,
  ResetPasswordGuestScreen,
  UserInfoScreen,
  SetPasswordScreen,
  GetAccessGuestScreen,
  CheckPasswordGuestScreen,
  VerifyPhoneGuestScreen,
  ProfileGuestScreen,
  CreditCardScreen,
  HomeScreen,
  MoreScreen,
  LocationScreen,
  LocationTypeScreen,
  LocationInstructionScreen,
  ProductInstructionScreen,
  ProductInstructionEditScreen,
  OrderNoteEditScreen,
  PromoCodeEditScreen,
  ReviewsScreen,
  MyReviewScreen,
  BrowseScreen,
  CategoryScreen,
  SellersScreen,
  SellerInfoScreen,
  ProductsScreen,
  ProductScreen,
  ProductEditScreen,
  MyOrderScreen,
  OpenOrder,
  OrderSuccessScreen,
  MyAccountScreen,
  UpdatePasswordScreen,
  ProfileScreen,
  UpdateCreditCardScreen,
  PastOrdersScreen,
  OrderDetailsScreen,
  SellerNoticeScreen,
  ContactUsScreen,
  SelectorPageScreen,
  SelectorPercentPageScreen,
  SellerLocationScreen,
  DeliveryLocationScreen,
  TextInfoScreen,
  InviteScreen,
  InviteOptionsScreen,
  InvitationSuccessScreen,
  StartSellingScreen,
  StartSellingSuccessScreen,
  ContactSellerScreen,
  MessageRoomScreen,
  MessageTerritoryListScreen,
  DealListScreen,
  SelectDeliveryScreen1,
  SelectDeliveryScreen2,
  SelectDeliveryScreen3,
  SubscriptionScreen,
  CountryErrorScreen,
  OrderProductDetailsScreen,
  PromoCodeCopyScreen,
} from '../screens';

const AppNavigator = createStackNavigator(
  {
    Splash: {
      screen: SplashScreen,
    },

    // Auth Screens
    GetAccess: {
      screen: GetAccessScreen,
    },
    GetAccessScreen2 : {
      screen: GetAccessScreen2,
    },

    VerifyPhone: {
      screen: VerifyPhoneScreen,
    },

    VerifyPhone2: {
      screen: VerifyPhoneScreen2,
    },

    CheckPassword: {
      screen: CheckPasswordScreen,
    },

    // Reset Password

    ResetPasswordEmail: {
      screen: ResetPasswordEmailScreen,
    },

    CheckEmail: {
      screen: CheckEmailScreen,
    },

    ResetPassword: {
      screen: ResetPasswordScreen,
    },
    // Reset Password as a Guest

    ResetPasswordEmailGuest: {
      screen: ResetPasswordEmailGuestScreen,
    },

    CheckEmailGuest: {
      screen: CheckEmailGuestScreen,
    },

    ResetPasswordGuest: {
      screen: ResetPasswordGuestScreen,
    },
    // Register Screens
    'Register/UserInfo': {
      screen: UserInfoScreen,
    },

    'Register/SetPassword': {
      screen: SetPasswordScreen,
    },
    
    'Register/CreditCard': {
      screen: CreditCardScreen,
    },

    SellerNotice: {
      screen: SellerNoticeScreen,
    },

    GetAccessGuest: {
      screen: GetAccessGuestScreen,
    },
    
    VerifyPhoneGuest: {
      screen: VerifyPhoneGuestScreen,
    },

    CheckPasswordGuest: {
      screen: CheckPasswordGuestScreen,
    },

    ProfileGuest: {
      screen: ProfileGuestScreen,
    },

    // Main Screens
    Home: {
      screen: HomeScreen,
    },
    More: {
      screen: MoreScreen,
    },
    Location: {
      screen: LocationScreen,
    },
    LocationType: {
      screen: LocationTypeScreen,
    },
    LocationInstruction: {
      screen: LocationInstructionScreen,
    },
    ProductInstruction: {
      screen: ProductInstructionScreen,
    },
    ProductInstructionEdit: {
      screen: ProductInstructionEditScreen,
    },
    OrderNoteEdit: {
      screen: OrderNoteEditScreen,
    },
    
    PromoCodeEdit: {
      screen: PromoCodeEditScreen,
    }, 

    Reviews: {
      screen: ReviewsScreen,
    },
    MyReview: {
      screen: MyReviewScreen,
    },
    Browse: {
      screen: BrowseScreen,
    },
    Category: {
      screen: CategoryScreen,
    },
    Sellers: {
      screen: SellersScreen,
    },
    SellerInfo : {
      screen : SellerInfoScreen,
    },
    Products: {
      screen: ProductsScreen,
    },
    Product: {
      screen: ProductScreen,
    },
    ProductEdit: {
      screen: ProductEditScreen,
    },
    MyOrder: {
      screen: MyOrderScreen,
    },
    OpenOrder: {
      screen: OpenOrder,
    },
    OrderSuccess: {
      screen: OrderSuccessScreen,
    },
    PastOrders: {
      screen: PastOrdersScreen,
    },
    OrderDetails: {
      screen: OrderDetailsScreen,
    },
    OrderProductDetails: {
      screen: OrderProductDetailsScreen,
    },
    ContactUs: {
      screen: ContactUsScreen,
    },
    SellerLocation: {
      screen: SellerLocationScreen,
    },
    DeliveryLocation: {
      screen: DeliveryLocationScreen,
    },

    Invite : {
      screen : InviteScreen,
    },
    InviteOptions : {
      screen : InviteOptionsScreen,
    },
    
    InvitationSucess : {
      screen : InvitationSuccessScreen,
    },
    StartSelling : {
      screen : StartSellingScreen,
    },
    StartSellingSucess : {
      screen : StartSellingSuccessScreen,
    },
    ContactSeller : {
      screen : ContactSellerScreen,
    },
    MessageRoom : {
      screen : MessageRoomScreen,
    },
    MessageTerritoryList : {
      screen : MessageTerritoryListScreen,
    },
    Subscription : {
      screen : SubscriptionScreen,
    },
    DealList : {
      screen : DealListScreen,
    },
    SelectDelivery1 : {
      screen : SelectDeliveryScreen1,
    },
    SelectDelivery2 : {
      screen : SelectDeliveryScreen2,
    },
    SelectDelivery3 : {
      screen : SelectDeliveryScreen3,
    },
    CountryError : {
      screen : CountryErrorScreen,
    },
    // Account Screens
    'Account/MyAccount': {
      screen: MyAccountScreen,
    },
    'Account/Profile': {
      screen: ProfileScreen,
    },
    'Account/CreditCard': {
      screen: UpdateCreditCardScreen,
    },
    'Account/UpdatePassword': {
      screen: UpdatePasswordScreen,
    },
    
    // shared

    SelectorPage: {
      screen: SelectorPageScreen,
    },
    SelectorPercentPage: {
      screen: SelectorPercentPageScreen,
    },
    TextInfoPage : {
      screen : TextInfoScreen
    },
    PromoCodeCopy: {
      screen : PromoCodeCopyScreen
    }
  },

  {
    initialRouteName: 'Splash',
    defaultNavigationOptions: {
      headerBackTitle: ' ',
      gestureEnabled: false,
    },
  },
);

export default createAppContainer(AppNavigator);
