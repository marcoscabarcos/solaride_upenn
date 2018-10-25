import {
  createSwitchNavigator,
  createBottomTabNavigator,
  createStackNavigator
} from 'react-navigation';
import AuthLoadingScreen from './screens/AuthLoadingScreen';
import ExploreScreen from './screens/ExploreScreen';
import SignInScreen from './screens/SignInScreen';
import MapScreen from './screens/MapScreen';
import MeScreen from './screens/MeScreen';

const MainTabs = createBottomTabNavigator(
  {
    Explore: ExploreScreen,
    Map: MapScreen,
    Me: MeScreen
  },
  {
    tabBarOptions: {
      activeTintColor: 'red'
    }
  }
);
const AuthStack = createStackNavigator({ SignIn: SignInScreen });

export default createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    Auth: AuthStack,
    App: MainTabs
  },
  {
    initialRouteName: 'AuthLoading'
  }
);
