import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { Screen, Input, Button, MessageTerritoryItem, LoadingGIF } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setUserInfo, setPhone, setToken, setTerritory,enterMessageRoom } from '~/store/actions';
import { NavigationService } from '~/core/services';
import { DashedLine, AppText} from '../../components';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HeaderStyleInterpolators } from 'react-navigation-stack';

export const MessageTerritoryListScreen = ({ navigation }) => {
  const userinfo =  useSelector((state) => state.account.userInfo);
  const enterMessageRoomValue =  useSelector((state) => state.notification.enterMessageRoom);
  const [isLoading, setLoading] = useState(false);
  const [territoryList, setTerritoryList] = useState(false);

  const dispatch = useDispatch();

  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);
  
  const windowHeight = Dimensions.get('window').height;

  useEffect(() => {
    fetchAPI(`/messages/list?size=10&page=0`, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
    })
    .then((res) => {
      console.log("chats data ++ ",res.data.chats);
      setTerritoryList(res.data.chats);
    })
    .catch((err) =>
      dispatch(showNotification({ type: 'error', message: err.message })),
    )
  },[enterMessageRoomValue]);


  return (
    <Screen isLoading={isLoading} keyboardAware={true}>
      <View style={styles.container}>
        {territoryList && territoryList.length > 0 && (
            <ScrollView
              style={{height: windowHeight - Theme.header.height - 50}}
            >
            {
                territoryList.map((item, index)=> (
                <TouchableOpacity
                    onPress={() => {
                        console.log("+++territory clicked+++",item);
                        console.log("++territory++",item.territory);
                        dispatch(enterMessageRoom(false));
                        dispatch(setTerritory(item.territory));
                        NavigationService.navigate('MessageRoom',{
                            token: token,
                            territory: item.tid,
                        });
                    }}>
                <MessageTerritoryItem
                  key= {index}
                  message={item.last_message}
                  created={item.last_message_date}
                  territory_image={item.territory_image}
                  territory_title={item.territory_name}
                  unread = {item.total_unread_messages}
                />
                </TouchableOpacity>
              ))
            }
            </ScrollView>
        )}
      {
        territoryList === false && (
          <LoadingGIF/>
        )
      }
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: 90
  },
});

MessageTerritoryListScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'MESSAGES',
    },
  });