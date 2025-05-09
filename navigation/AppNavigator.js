import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";

// Auth screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

// Tab Navigator
import TabNavigator from "./TabNavigator";

// Stack Screens
import AllPlacesScreen from "../screens/places/AllPlacesScreen";
import PlaceDetailsScreen from "../screens/places/PlaceDetailsScreen";
import AllReviewsScreen from "../screens/places/AllReviewsScreen";
import BookingRequestScreen from "../screens/booking/BookingRequestScreen";
import BookingDetailsScreen from "../screens/booking/BookingDetailsScreen";
import PaymentResultScreen from "../screens/booking/PaymentResultScreen"
// Search screens
import SearchScreen from "../screens/search/SearchScreen";
import SearchResultsScreen from "../screens/search/SearchResultsScreen";
import RecentlyViewedScreen from "../screens/search/RecentlyViewedScreen";

import PersonalInfoScreen from "../screens/profile/PersonalInfoScreen";

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TabNavigator" component={TabNavigator} />
      {console.log("reload")}
      <Stack.Screen name="AllPlaces" component={AllPlacesScreen} />
      <Stack.Screen name="PlaceDetails" component={PlaceDetailsScreen} />
      <Stack.Screen name="AllReviews" component={AllReviewsScreen} />
      <Stack.Screen
        name="BookingDetails"
        component={BookingDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookingRequest"
        component={BookingRequestScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          animationEnabled: true,
          presentation: "modal",
          cardStyle: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
        }}
      />
      <Stack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={{
          animationEnabled: true,
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="RecentlyViewed"
        component={RecentlyViewedScreen}
        options={{
          animationEnabled: true,
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="PersonalInfo"
        component={PersonalInfoScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="PaymentResult"
        component={PaymentResultScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { token, loading } = useAuth();

  if (loading) {
    // You could return a loading screen here
    return null;
  }

  return token ? <AppStack /> : <AuthStack />;
};

export default AppNavigator;
