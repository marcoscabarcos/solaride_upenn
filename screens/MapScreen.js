import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Image,
  Dimensions
} from 'react-native';
import * as api from '../firebase/api';
import { MapView } from 'expo';
import { Ionicons } from '@expo/vector-icons';

const Images = [
  { uri: 'https://i.imgur.com/sNam9iJ.jpg' },
  { uri: 'https://i.imgur.com/N7rlQYt.jpg' },
  { uri: 'https://i.imgur.com/UDrH0wm.jpg' },
  { uri: 'https://i.imgur.com/Ka8kNST.jpg' }
];

const { width, height } = Dimensions.get('window');

const CARD_HEIGHT = height / 4;
const CARD_PADDING = 10;
const CARD_WIDTH = width - CARD_PADDING * 2; // Make card cover all screen TODO: Make card a bit smaller so we can see the other card's borders
const DEFAULT_MARKER_COLOR = 'red'; // Color for when marker is not selected
const SELECTED_MARKER_COLOR = 'maroon'; // Color for when marker is selected
const ANIMATION_TIME = 100; // Time it takes for map to switch to other pin.

// Follow https://codedaily.io/tutorials/9/Build-a-Map-with-Custom-Animated-Markers-and-Region-Focus-when-Content-is-Scrolled-in-React-Native
export default class MapScreen extends React.Component {
  state = {
    restaurants: [],
    markers: [],
    location: null,
    currentIndex: null,
    currentRegion: {
      latitude: 40.75,
      longitude: -74,
      latitudeDelta: 0.092,
      longitudeDelta: 0.092
    }
  }; // Important variable: Index of restaurant/marker that is currently selected. Make sure to set update it when we need to. // TODO: set region by location... (by getting location from parent component) // currentRegion can change as user scrolls through the map..

  static navigationOptions = {
    title: 'MAP',
    tabBarIcon: ({ focused, tintColor }) => (
      <Ionicons
        name={`ios-pin${
          focused ? '' : '-outline' // TODO: load icons at start of app...
        }`}
        size={25}
        color={tintColor}
      />
    )
  };

  _getRestaurantsAsync = async () => {
    var restaurants = await api.getRestaurants();
    markers = [];
    restaurants.map((rest, index) => {
      markers[index] = {
        pinColor: 'red',
        latitude: rest.coordinates._lat,
        longitude: rest.coordinates._long
      };
    });
    this.setState({ restaurants, markers });
  };

  // TODO: ask permission for location/get location in root, so we can set
  // center of map based on the user's location,
  /**
   * Ask for location permissions if the user has not been asked.
   * TODO: Deal with stuff when user says no to permission requests.
   *
   * Also sets the location state variable. TODO: make this function cleaner...
   */
  _askPermissionAsync = async () => {
    console.log('PERMISSION');
    const { status } = await Expo.Permissions.askAsync(
      Expo.Permissions.LOCATION
    );
    if (status != 'granted') {
      console.log('PERMISSION NOT GRANTED!');
    } else {
      const location = await Expo.Location.getCurrentPositionAsync({});
      this.setState(
        prevState => ({
          location: location,
          currentRegion: {
            ...prevState.currentRegion,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          }
        }),
        () => {
          // TODO: This does not do anything as of now, figure out how to center based on location.
          console.log('LOCATION: ');
          console.log(location);
        }
      );
    }
  };

  /**
   * Scroll to the index'th card in the horizontal ScrollView.
   */
  _scrollToMarker(index) {
    this.scrollView.getNode().scrollTo({
      x: (CARD_WIDTH + 2 * CARD_PADDING) * index,
      y: 0,
      animated: true
    });
  }

  /**
   * Updates the color of the marker at index newIndex to the SELECTED_MARKER_COLOR if
   * newIndex is not null.
   *
   * Also resets the previously selected marker to the DEFAULT_MARKER_COLOR
   */
  _updateMarkerColors(newIndex) {
    if (this.state.currentIndex == newIndex) return;
    markers = this.state.markers;
    if (newIndex != null) {
      markers[newIndex] = {
        ...markers[newIndex],
        pinColor: SELECTED_MARKER_COLOR
      };
    }
    if (this.state.currentIndex != null) {
      markers[this.state.currentIndex] = {
        ...markers[this.state.currentIndex],
        pinColor: DEFAULT_MARKER_COLOR
      };
    }
    this.setState({ markers });
  }

  /**
   * Called when marker is pressed. We get the index from the marker identifier (id),
   * and scroll the map to be centered at the coordinates of that marker.
   */
  _onMarkerPress(e) {
    let newIndex = e.nativeEvent.id;
    this._scrollToMarker(newIndex);
    this._updateMarkerColors(newIndex);
    this.setState({ currentIndex: newIndex });
  }

  /**
   * Called when MapView region is changed (either by user or any of our
   * animations.
   *
   * Update currentRegion state variable to store the new center (region).
   */
  _onRegionChangeComplete(region) {
    this.setState({
      currentRegion: { ...region }
    });
  }

  componentWillMount() {
    this.animation = new Animated.Value(0);
  }

  async componentDidMount() {
    await this._getRestaurantsAsync();
    await this._askPermissionAsync();
  }

  /**
   * When called, it recenters the map to the marker that corresponds to this.state.currentIndex.
   */
  _recenterMapToCurrentIndex() {
    this.map.animateToRegion(
      {
        ...this.state.currentRegion,
        latitude: this.state.restaurants[this.state.currentIndex].coordinates
          ._lat,
        longitude: this.state.restaurants[this.state.currentIndex].coordinates
          ._long
      },
      ANIMATION_TIME
    );
  }

  /**
   *
   * Called after scrollView is moved (by user or by us) and finishes moving, thus we have a set location.
   * This helps us figure out the index of the card, which we use to update the currentIndex, and select the
   * marker that corresponds to that index and update the map view accordingly.
   *
   * For now we recenter the map to the current marker, but TODO: we want to recenter ONLY when the marker is outside the screen.
   */
  _onMomentumScrollEnd(e) {
    let x = e.nativeEvent.contentOffset.x;
    let index = Math.floor(x / (CARD_WIDTH + 2 * CARD_PADDING) + 0.5);
    if (index >= this.state.restaurants.length) {
      index = this.state.restaurants.length - 1;
    }
    if (index <= 0) index = 0;
    if (index >= this.state.restaurants.length)
      index = this.state.restaurants.length - 1;
    if (this.state.currentIndex != index) {
      this._updateMarkerColors(index);
      this.setState(
        {
          currentIndex: index
        },
        () => this._recenterMapToCurrentIndex()
      );
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <MapView
          onRegionChangeComplete={region =>
            this._onRegionChangeComplete(region)
          }
          style={styles.container}
          ref={map => (this.map = map)}
          provider="google"
          showsUserLocation={true}
          initialRegion={this.state.currentRegion}
        >
          {this.state.markers.map((marker, index) => {
            return (
              <MapView.Marker
                identifier={index.toString()}
                key={index}
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude
                }}
                pinColor={marker.pinColor}
                onPress={e => this._onMarkerPress(e)}
              />
            );
          })}
        </MapView>
        <Animated.ScrollView
          ref={ref => (this.scrollView = ref)}
          horizontal
          scrollEventThrottle={1}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 2 * CARD_PADDING}
          decelerationRate="fast"
          onMomentumScrollEnd={e => this._onMomentumScrollEnd(e)}
          style={styles.scrollView}
          contentContainerStyle={styles.endPadding}
        >
          {this.state.restaurants.map((restaurant, index) => (
            <View style={styles.card} key={index}>
              <Image
                source={Images[index]}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.textContent}>
                <Text numberOfLines={1} style={styles.cardtitle}>
                  {restaurant.name}
                </Text>
                <Text numberOfLines={1} style={styles.cardDescription}>
                  {restaurant.description}
                </Text>
              </View>
            </View>
          ))}
        </Animated.ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollView: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingVertical: 10
  },
  endPadding: {
    paddingRight: width - CARD_WIDTH
  },
  card: {
    padding: CARD_PADDING,
    elevation: 2,
    backgroundColor: '#FFF',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: { x: 2, y: -2 },
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    overflow: 'hidden'
  },
  cardImage: {
    flex: 3,
    width: '100%',
    height: '100%',
    alignSelf: 'center'
  },
  textContent: {
    flex: 1
  },
  cardtitle: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: 'bold'
  },
  cardDescription: {
    fontSize: 12,
    color: '#444'
  }
});
