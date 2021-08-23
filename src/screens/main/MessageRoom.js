import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView, Dimensions, Animated, KeyboardAvoidingView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';

import { Screen, Input, Button, MessageItem } from '~/components';
import { GlobalStyles, MessageRoomNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setUserInfo, setPhone, setToken, enterMessageRoom } from '~/store/actions';
import { NavigationService } from '~/core/services';
import { DashedLine, AppText} from '../../components';
import { Constants } from '~/core/constant';

import { Easing } from 'react-native-reanimated';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
export const MessageRoomScreen = ({ navigation }) => {
  const territory = useSelector((state) => state.explorer.territory);
  const userinfo =  useSelector((state) => state.account.userInfo);
  const [userImage, setUserImage] = useState(Constants.userDefaultAvatar);
  const [territoryImage, setTerritoryImage] = useState('');
  const [messagePage, setMessagePage] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [isPrev, setIsPrev] = useState(false);
  const [is_started, setIsStart] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();

  const scrollRef = useRef();
  const [isLoading, setLoading] = useState(false);
  const [messageList, setMessageList] = useState([]);

  const [img, setImg] = useState(null);
  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 200,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const fadeOut = () => {
    // Will change fadeAnim value to 0 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const profile = useCallback(() => {
    NavigationService.navigate('Products');
  }, []);


  const uploadProfilePic = async (image_src) => {
    if (image_src != null) {
      //If file selected then create FormData
      const fileToUpload = image_src;
      let data = new FormData();
      const file =  {
        uri : fileToUpload.path,    
        name: 'avatar.jpg',
        type :   fileToUpload.mime
      }
      data.append('avatar', file);
      setLoading(true);
      fetchAPI('/myaccount/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data; ',
          authorization: `Bearer ${token ? token : guestToken}`,
        },
        body : data     
      }) 
      .then(async (res) => {
        setLoading(false);
        if (res.success == 1) {
          setUserImage(res.data.avatar_url);
          dispatch(showNotification({type: 'success', message: 'Profile photo successfully uploaded'}))
        }
      })
      .catch((err) =>{
        console.log(err);
        setLoading(false);
        dispatch(showNotification({ type: 'error', message: err.message }))
      }
      )
      .finally(() => setLoading(false));     
    } else {
      //if no file selected the show alert
      dispatch(showNotification({ type: 'error', message: 'Please Select File first' }));
    }
    console.log("loadProfilePic");
  }

  const launchImageLibrary = () => {
    setModalVisible(false);
    ImagePicker.openPicker({}).then(image => {
      console.log(image);
      uploadProfilePic(image);
    });
  }

  const launchCamera = () => {
    setModalVisible(false);
    ImagePicker.openCamera({
      cropping: true
    }).then(image => {
      console.log(image);
      uploadProfilePic(image);
    });

  }

  const getMoreMessages = () => {
    setLoadingMessage(true);
    setLoading(true);
    console.log("+++getMoreMessage+++");
    setMessagePage(messagePage + 1);
    fetchAPI(`/messages?territory=${territory.tid}&size=10&page=${messagePage + 1}`, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
    })
      .then((res) => {
        console.log("+++messages+++",res.data);
        setLoading(false);
        setLoadingMessage(false);
        setMessageList(res.data.messages.reverse().concat(messageList));
        setIsPrev(res.data.has_next_page);
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    dispatch(enterMessageRoom(true));
    setLoading(true);
    fetchAPI(`/messages?territory=${territory.tid}&size=10&page=0`, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
    })
      .then((res) => {
        console.log("+++messages+++",res.data.messages);
        
        setMessageList(res.data.messages.reverse());
        if(res.data.user_image){
          setUserImage(res.data.user_image);
          console.log("+++userimage+aaaaaaaaaaa++",userImage);
        }
          setTerritoryImage(res.data.territory_image);
          setIsPrev(res.data.has_next_page);        
          setIsStart(res.data.is_started);
          setTimeout(()=>{setLoading(false); scrollRef.current.scrollToEnd({animated: true})}, 100);
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  },[]);

  useEffect(() => {
    navigation.setParams({
      /*
      action: profile,
      actionTitle: 'Profile',
      actionColor: 'white',
      actionBackground: '#31D457',
      */

      territoryTitle: territory.name,
      territoryImage: territory.app_image,
      territoryAddress: territory.warehouse_address_city + " " + territory.warehouse_address_province
    });

  }, [profile]);

  return (
   
    <Screen isLoading={isLoading}  keyboardAware={true} messageInputKeyboardAware={true}
    stickyBottom = { 
        modalVisible ? 
        (
          <Animated.View
              style={[
              styles.fadingContainer,
              {
                maxHeight: fadeAnim // Bind opacity to animated value
              }
            ]}
          >
          <View style={{backgroundColor: "transparent",flexDirection:'column'}}>
          <View style={{marginBottom: 2, marginTop: 3}}>
              <Button
                type="accent"
                style={{...styles.myCartButton, borderBottomLeftRadius: 0, borderBottomRightRadius : 0}}
                onClick={() => launchImageLibrary()}>
                <AppText style={styles.buttonText}>Photo Library</AppText>
              </Button>
          </View>
          <View>
                <Button
                type="accent"
                style={{...styles.myCartButton, borderTopLeftRadius: 0, borderTopRightRadius : 0}}
                onClick={() => {
                  launchCamera();
                }
                }>
                <AppText style={styles.buttonText}> Take Photo</AppText>
              </Button>
          </View>
        </View> 
        <View style={{backgroundColor: "transparent", paddingVertical:13, paddingBottom: 10}}>
            <Button
            type="accent"
            style={styles.myCartButton}
            onClick={() => setModalVisible(false)}>
            <AppText style={styles.buttonText}>Cancel</AppText>
          </Button>
        </View>
          </Animated.View>
        )
        : (
        <View style={{flexDirection: "row", backgroundColor: "#EFEFEF"}}>
          <Input
            type="textarea"
            placeholder="Type message here"
            value={newMessage}
            onChange={setNewMessage}
            style={styles.footer}
          />
          <TouchableOpacity
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' ,marginTop:-15}}
            onPress={() => {
              if(!newMessage) {
                return;
              }
              console.log("+++newMessage+++",newMessage);

              setLoading(true);
              const formData = new FormData();

              formData.append('territory',territory.tid);
              formData.append('message', newMessage);
              if(userinfo)
              formData.append('first_name', userinfo.firstName);
              if(userinfo)
              formData.append('last_name', userinfo.lastName);
              if(userinfo)
              formData.append('email', userinfo.email);

              // fetchAPI(`/territory/contact`, {
              
              fetchAPI(`/message/create`, {
                  method: 'POST',
                  headers: {
                    authorization: `Bearer ${token ? token : guestToken}`,
                  },
                  body: formData,
                })     
                .then((res) => {
                  setNewMessage('');
                  const msg = [{"by": "user", "date_created": res.data.message_date, "date_opened": "","is_new": false, "message": res.data.message, "mid" : res.data.message_id, "opened": false, "tid": territory.tid}];
                  setMessageList(messageList.concat(msg));
                  setTimeout(()=>{ scrollRef.current.scrollToEnd({animated: true})}, 500);
                  console.log("created response+++",res.data);
                  dispatch(enterMessageRoom(newMessage));
                })
                .catch((err) =>
                  dispatch(showNotification({ type: 'error', message: err.message })),
                )
                .finally(() => setLoading(false));
            }}>
            <Icon size={25} color={'#000'} name="send" style={{ transform: [{ rotate: '-30deg'}]}} />
          </TouchableOpacity>
        </View>
      )}
    >
      <View>
        {messageList && messageList.length > 0 && (
            <ScrollView
              ref={scrollRef}
              style={{maxHeight: (userinfo.user_active == false || userImage == Constants.userDefaultAvatar || userImage == '' ) ? (windowHeight - Theme.header.height - 200) : (windowHeight - Theme.header.height - 100)}}
              onScroll={(event)=>{
                console.log("++onscroll++",event.nativeEvent.contentOffset.y);
                if(event.nativeEvent.contentOffset.y == 0 && !loadingMessage && isPrev) {
                  getMoreMessages();
                }
              }}
            >
            {
              messageList.map((item, index)=> (
                <MessageItem
                  key= {index}
                  by={item.by}
                  message={item.message}
                  created={item.date_created}
                  is_new={item.is_new}
                  opened={item.opened}
                  user_image={userImage}
                  territory_image={territoryImage}
                  onAvatar = {()=>{ setModalVisible(true); fadeIn(); }}
                />
              ))
            }
            </ScrollView>
        )}
        {
          //messageList.find( ({ is_new }) => is_new == false ) && (
          messageList.length > 0 && (userinfo.user_active == false || userImage == Constants.userDefaultAvatar || userImage == '' ) && (
        <View style={styles.container}>
            <DashedLine/>
            <AppText style={{padding: 10, fontWeight: 400}}>While you are waiting for a reply</AppText>
            <View style={{flexDirection: 'row', paddingBottom: 10}}>
            {(userImage == Constants.userDefaultAvatar || userImage == '') && (
            <TouchableOpacity
              style={{ flex: 1, marginLeft: 10 ,alignItems: 'flex-start', justifyContent: 'center' }}
              onPress={() => {
                setModalVisible(true);
                fadeIn();
            }}>
            <View style={{backgroundColor: "#bbb", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10}}><AppText style={{color: "#fff",fontSize:12}}>UPLOAD A PROFILE PIC</AppText></View>
            </TouchableOpacity>)
            }
            {userinfo.user_active == false &&
            <TouchableOpacity
            style={{ flex: 1, marginLeft:10 , alignItems: 'flex-start', justifyContent: 'center' }}
            onPress={() => {
              NavigationService.navigate('Account/Profile',{message: true});
            }}>
            <View style={{backgroundColor: "#bbb", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10}}><AppText style={{color: "#fff",fontSize:12}}>SET UP A PASSWORD</AppText></View>
          </TouchableOpacity>}
            </View>
            <DashedLine/>
            
        </View>
        )
        }
      </View>
      { modalVisible && <View style={styles.overlay} /> }
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal
  },

  button : {
    marginTop : 10
  },

  footer : {
    width: '85%',
    backgroundColor: '#fff',
    height: 60,
    marginTop: 10,
    marginHorizontal: 5,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15
  },

  myCartButton: {
    marginHorizontal: 10,
    backgroundColor: "#FFF",
    borderWidth: 0,
    borderRadius: 10,
    height: 60
  },

  buttonText: {
    color: "#06f",
    fontWeight: "bold"
  },

  fadingContainer: {
    paddingLeft: 5,
    paddingRight: 5,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.2)'
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    opacity: 0.2,
  },
});

MessageRoomScreen.navigationOptions = ({ navigation }) =>
  MessageRoomNavigationOptions({
    navigation,
    options: {
      headerTitle: '',
    },
  });