import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import MainTab from './navigation/MainTab';
import QRCodeScannerScreen from './screens/QRCodeScannerScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={MainTab} options={{ headerShown: false }} />
        <Stack.Screen name="QRCodeScanner" component={QRCodeScannerScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        
      </Stack.Navigator>
      
    </NavigationContainer>
  );
};

export default App;
