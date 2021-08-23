import React, {useMemo} from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import Share from 'react-native-share';
import { Screen, Button } from '~/components';
import { formatPhoneNumber } from '~/core/utility'
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';
import { showNotification } from '~/store/actions';
import { showLocation } from 'react-native-map-link'
import { useSelector } from 'react-redux';

export const SellerInfoScreen = ({navigation}) => {

    const territory = useMemo(() => navigation.getParam('territory'), []);
    const token = useSelector((state) => state.account.token);

    return (
        <Screen>
        <View style={styles.container}>

            {territory && typeof territory.delivery_instructions === 'string' && territory.delivery_instructions.trim().length > 0 && <Button
            type="bordered-dark"
            style={[GlobalStyles.formControl]}
            onClick={() => navigation.navigate('TextInfoPage',{
                title : 'Delivery Info',
                content : territory.delivery_instructions
            })}>
            Delivery Info
            </Button>}

            {territory && typeof territory.support_phone === 'string' && territory.support_phone.trim().length > 0 && <Button
            type="bordered-dark"
            style={[GlobalStyles.formControl]}
            onClick={() => {
                Linking.canOpenURL(`tel:${territory.support_phone}`).then((supported) => {
                if (supported) {
                    Linking.openURL(`tel:${territory.support_phone}`);
                } else {
                    dispatch(
                    showNotification({
                        type: 'error',
                        message: `Don't know how to open URI: ${territory.support_phone}`,
                    }),
                    );
                }
                });
            }}>
            Call {formatPhoneNumber(territory.support_phone)}
            </Button>}

            {token && territory && typeof territory.support_mail === 'string' && territory.support_mail.trim().length > 0 && <Button
            type="bordered-dark"
            style={[GlobalStyles.formControl]}
            onClick={() => navigation.navigate('ContactSeller',{
                sellerID : territory.tid
            })}>{territory.type_slug == 'services'? 'Contact' : 'E-Mail'}
            
            </Button>}

            <Button
            type="bordered-dark"
            style={[GlobalStyles.formControl]}
            onClick={() => showLocation({
            latitude: territory.warehouse_address_lat,
            longitude: territory.warehouse_address_lng,
            title: territory.name,
            googleForceLatLon : true,
            })}>
            Get Directions
            </Button>

            <Button
            type="bordered-dark"
            style={[GlobalStyles.formControl]}
            onClick={() => {
                Share.open({
                title: `Share ${territory.name}`,
                url: territory.profile_url,
                });
            }}>
            Share This
            </Button>

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
});

SellerInfoScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
        headerTitle: navigation.getParam('title'),
    },
  });
