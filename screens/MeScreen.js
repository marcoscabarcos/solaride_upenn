import React from 'react';
import styles from '../styles/styles';
import { AsyncStorage, Button, StatusBar, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

class MeScreen extends React.Component {
  static navigationOptions = {
    title: 'ME',
    tabBarIcon: ({ focused, tintColor }) => (
      <Ionicons
        name={`ios-person${focused ? '' : '-outline'}`}
        size={25}
        color={tintColor}
      />
    )
  };

  render() {
    return (
      <View style={styles.container}>
        <Button title="I'm done, sign me out" onPress={this._signOutAsync} />
        <StatusBar barStyle="default" />
      </View>
    );
  }

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  };
}

export default MeScreen;
