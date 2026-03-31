import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: 'Hangr',
        headerTitleStyle: { fontSize: 30, fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => {
            const iconSize = focused ? size + 2 : size;
            return <FontAwesome5 name="home" size={iconSize} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => {
            const iconSize = focused ? size + 2 : size;
            return <FontAwesome5 name="calendar-alt" size={iconSize} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="add-item"
        options={{
          title: 'Add Item',
          headerTitle: 'Add Item',
          tabBarIcon: ({ color, size, focused }) => {
            const iconSize = focused ? size + 2 : size;
            return <FontAwesome5 name="plus-square" size={iconSize} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="reels"
        options={{
          title: 'Community',
          headerTitle: 'Community',
          tabBarIcon: ({ color, size, focused }) => {
            const iconSize = focused ? size + 2 : size;
            return <FontAwesome5 name="users" size={iconSize} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'Profile',
          tabBarIcon: ({ color, size, focused }) => {
            const iconSize = focused ? size + 2 : size;
            return <FontAwesome5 name="user-circle" size={iconSize} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          href: null,
          headerTitle: 'Collections',
        }}
      />
    </Tabs>
  );
}
