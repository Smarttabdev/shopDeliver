import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';

import { Screen, Input, Button } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification } from '~/store/actions';

export const ContactUsScreen = ({ navigation }) => {
  const [isLoading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const dispatch = useDispatch();

  const send = useCallback(() => {
    setLoading(true);

    const formData = new FormData();

    if(!subject){
      dispatch(showNotification({ type: 'error', message: 'Please enter subject' }))
      setLoading(false);
      return
    }

    if(!message){
      dispatch(showNotification({ type: 'error', message: 'Please enter Message' }))
      setLoading(false);
      return
    }

    formData.append('subject', subject);
    formData.append('message', message);

    fetchAPI(`/platform/email`, {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        dispatch(showNotification({ type: 'success', message: res.message }));
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, [subject, message]);

  useEffect(() => {
    navigation.setParams({
      action: send,
      actionTitle: 'Send',
      actionColor: 'black',
    });
  }, [send]);

  return (
    <Screen isLoading={isLoading} keyboardAware={true}>
      <View style={styles.container}>
        <Input
          style={GlobalStyles.formControl}
          title="Subject"
          placeholder="Subject"
          value={subject}
          onChange={setSubject}
        />

        <Input
          style={GlobalStyles.formControl}
          type="textarea"
          title="Message"
          placeholder="Type your message here ..."
          value={message}
          onChange={setMessage}
        />

        <Button 
        type="accent" 
        style={styles.button}
        onClick={send}>
          Send</Button>
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

  description: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
  },

  button : {
    marginTop : 10
  }
});

ContactUsScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Contact',
    },
  });
