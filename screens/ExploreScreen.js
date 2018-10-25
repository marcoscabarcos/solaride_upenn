import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import * as api from '../firebase/api';
import { Constants } from 'expo';
import { RestaurantRow } from '../components';
import { Ionicons } from '@expo/vector-icons';

class ExploreScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      restaurants: [],
      isRefreshing: false
    };
  }

  static navigationOptions = {
    title: 'EXPLORE',
    tabBarIcon: ({ focused, tintColor }) => (
      <Ionicons
        name={`ios-menu${focused ? '' : '-outline'}`}
        size={25}
        color={tintColor}
      />
    )
  };

  async componentDidMount() {
    this._loadData();
  }

  _changeToOther = async () => {};

  _renderItem = ({ item }) => <RestaurantRow {...item} />;

  _loadData = async () => {
    this.setState({
      isRefreshing: true
    });
    const restaurants = await api.getRestaurants();
    this.setState({
      isRefreshing: false,
      restaurants: restaurants
    });
  };

  componentWillUnmount() {
    // TODO: Cancel async calls to prevent memory leakage
  }

  render() {
    return (
      <View style={myStyles.container}>
        {this.state.restaurants !== [] && (
          <FlatList
            renderItem={this._renderItem}
            data={this.state.restaurants}
            onRefresh={() => this._loadData()}
            keyExtractor={(_, index) => index.toString()}
            refreshing={this.state.isRefreshing}
          />
        )}
      </View>
    );
  }
}

const myStyles = StyleSheet.create({
  container: {
    padding: Constants.statusBarHeight,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default ExploreScreen;
