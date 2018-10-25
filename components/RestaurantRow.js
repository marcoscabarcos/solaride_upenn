import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  row: { padding: 20 }
});

export default class RestaurantRow extends React.Component {
  render() {
    return (
      <View style={styles.row}>
        <Text>Name: {this.props.name}</Text>
        <Text>Description: {this.props.description}</Text>
        <Text>Region: {this.props.region}</Text>
      </View>
    );
  }
}

RestaurantRow.propTypes = {
  name: PropTypes.string,
  description: PropTypes.string,
  region: PropTypes.string
};
