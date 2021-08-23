import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Theme } from '~/styles';

import {AppText} from '~/components';


export const Tabs = ({
    tabs,
    setPage,
}) => {
const [contentSizeChanged, setContentSizeChanged] = useState(false);
const [contentsize, setContentsize] = useState(0);
const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 500;
    console.log("this is content size+++++++", contentSize);    
    if(contentSize.height != contentsize){
        setContentsize(contentSize.height);
        setContentSizeChanged(true);
    }
    return layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;
    };
const [activeTabIndex, setActiveTabIndex] = useState(0);

  return (
    <ScrollView   onScroll={({nativeEvent}) => {
        
        if (isCloseToBottom(nativeEvent)) {
            if(contentSizeChanged){
                console.log("calling");
                setPage();
                setContentSizeChanged(false);          
            }
        }
      }} scrollEventThrottle={800}>
        {tabs.length > 1 && <View style={styles.tab}>
            {tabs.map((tab,index) => {
                return <TouchableOpacity
                style={[styles.tabButton,(index == activeTabIndex && styles.tabButtonActive)]}
                activeOpacity={0.8}
                onPress={() => setActiveTabIndex(index)}
                >
                    <AppText 
                    style={[styles.tabButtonText,(index == activeTabIndex && styles.tabButtonTextActive)]}
                    >{tab.title}</AppText>
                </TouchableOpacity>
            })}
        </View>}
        <View style={styles.tabContent}>{typeof tabs[activeTabIndex] != null && tabs[activeTabIndex].content}</View>
    </ScrollView>
    
  );
};

const styles = StyleSheet.create({
    tab : {
        flexDirection : 'row',
        justifyContent: 'center',
        paddingTop: 20
    },
    tabButton : {
        marginLeft: 10,
        marginRight: 10,
        padding: 10,
        backgroundColor: '#BBB',
        borderRadius: 5
    },
    tabButtonText : {
        color: '#E1E1E1',
        textAlign: 'center',
        textTransform: 'uppercase',
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 20
    },
    tabButtonActive : {
        backgroundColor: Theme.color.accentColor,
    },
    tabButtonTextActive : {
        color: '#FFF'
    },
    tabContent : {
        paddingTop: 10,
        flex: 1,
        minHeight: '100%'
    }
});
