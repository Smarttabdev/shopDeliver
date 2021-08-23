import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

import { AppText } from '~/components';


export const OrderItem = ({ 
    order, onPress
 }) => (
    <View style={{backgroundColor: "#EFEFEF", flexDirection: "row", padding: 10, justifyContent:"space-between",marginTop: 10}}>
        <View style={{flexDirection: "row",flex: 8}}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ 
                            uri: 
                                order.territory.app_image ||
                                'https://via.placeholder.com/450?text=Image%20is%20not%20available',
                            }}
                    style={styles.image}
                />
            </View>

            <View style={{marginLeft: 15}}>
                <View style={{flexDirection: "row"}}>
                    <AppText style={{fontWeight: 'bold',paddingRight:10}} numberOfLines={1}> {order.territory.name} </AppText>
                </View>
                <View style={{marginTop: 3}}>
                    <AppText style={{fontSize: 12, color: '#777', height: 16}} numberOfLine={1}> {order.time_ago} </AppText>
                </View>
            </View>
        </View>
               
        <View style={{flex:2}}>
            <View style={{flex: 1}}><AppText style={{fontSize: 13, fontWeight: 400, textAlign: 'right'}}> {"#"+order.order_id} </AppText></View>
            <View style={{flex: 1}}></View><AppText style={{fontSize: 13, color: '#31D457', fontWeight: 400, textAlign: 'right'}}> {order.total_amount_formatted} </AppText>
        </View>             
    </View>
  );

  const styles = StyleSheet.create({
    created: {
        fontSize: 8,
        marginBottom: 10,
        opacity: 0.8,
        paddingHorizontal: 60
    },
    content_left: {
        flexDirection: 'row'
    },
    messageContainer: {
        borderRadius: 20,
        padding: 10,
        backgroundColor: '#EFEFEF',
        maxWidth: '80%',
        marginLeft: 10,
        marginRight: 10,
    },
    message: {
        textAlign: 'right',
        color: '#808080'
    },
    imageContainer: {
        width: 40,
        height: 40,
        alignItems: 'center',
        borderColor: '#DDD',
        borderWidth: 3,
        borderRadius: 40,
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 40,
    }
  });