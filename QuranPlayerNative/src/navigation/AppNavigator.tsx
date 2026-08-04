/**
 * App Navigation
 * نظام التنقل الرئيسي - تصميم مطابق للويب
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import PlayerScreen from '../screens/PlayerScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LibraryScreen from '../screens/LibraryScreen';
import MiniPlayer from '../components/MiniPlayer';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Custom Drawer Content - تصميم مثل الويب
const CustomDrawerContent = (props: any) => {
    const { state, navigation } = props;
    const currentRoute = state.routes[state.index].name;

    const menuItems = [
        { name: 'Home', label: 'القراء', icon: '🎤' },
        { name: 'Library', label: 'المكتبة', icon: '📚' },
        { name: 'Favorites', label: 'المفضلة', icon: '❤️' },
        { name: 'Playlists', label: 'قوائم التشغيل', icon: '🎵', disabled: true },
        { name: 'SmartSearch', label: 'بحث ذكي', icon: '✨', disabled: true },
        { name: 'Settings', label: 'الإعدادات', icon: '⚙️' },
    ];

    return (
        <View style={drawerStyles.container}>
            {/* Logo Header */}
            <View style={drawerStyles.header}>
                <View style={drawerStyles.logoContainer}>
                    <Text style={drawerStyles.logoIcon}>🕌</Text>
                </View>
                <Text style={drawerStyles.logoText}>مشغل القرآن</Text>
            </View>

            {/* Menu Items */}
            <DrawerContentScrollView {...props} contentContainerStyle={drawerStyles.scrollContent}>
                {menuItems.map((item) => {
                    const isActive = currentRoute === item.name;
                    const isDisabled = item.disabled;

                    return (
                        <TouchableOpacity
                            key={item.name}
                            style={[
                                drawerStyles.menuItem,
                                isActive && drawerStyles.menuItemActive,
                                isDisabled && drawerStyles.menuItemDisabled,
                            ]}
                            onPress={() => !isDisabled && navigation.navigate(item.name)}
                            disabled={isDisabled}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                drawerStyles.menuIcon,
                                isActive && drawerStyles.menuIconActive,
                                isDisabled && drawerStyles.menuIconDisabled,
                            ]}>
                                {item.icon}
                            </Text>
                            <Text style={[
                                drawerStyles.menuLabel,
                                isActive && drawerStyles.menuLabelActive,
                                isDisabled && drawerStyles.menuLabelDisabled,
                            ]}>
                                {item.label}
                            </Text>
                            {isDisabled && (
                                <Text style={drawerStyles.comingSoon}>قريباً</Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </DrawerContentScrollView>

            {/* Footer */}
            <View style={drawerStyles.footer}>
                <Text style={drawerStyles.footerText}>مشغل القرآن الكريم</Text>
                <Text style={drawerStyles.versionText}>الإصدار 1.0.0</Text>
            </View>
        </View>
    );
};

const drawerStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    header: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    logoContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    logoIcon: {
        fontSize: 24,
    },
    logoText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#F8FAFC',
    },
    scrollContent: {
        paddingTop: 16,
        paddingHorizontal: 12,
    },
    menuItem: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 4,
    },
    menuItemActive: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    menuItemDisabled: {
        opacity: 0.5,
    },
    menuIcon: {
        fontSize: 20,
        marginLeft: 12,
    },
    menuIconActive: {
        // Active state
    },
    menuIconDisabled: {
        opacity: 0.5,
    },
    menuLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: '#94A3B8',
        flex: 1,
        textAlign: 'right',
    },
    menuLabelActive: {
        color: '#10B981',
        fontWeight: '600',
    },
    menuLabelDisabled: {
        color: '#475569',
    },
    comingSoon: {
        fontSize: 10,
        color: '#64748B',
        backgroundColor: '#1E293B',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#1E293B',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 4,
    },
    versionText: {
        fontSize: 11,
        color: '#475569',
    },
});

const DrawerNavigator = () => {
    return (
        <View style={{ flex: 1 }}>
            <Drawer.Navigator
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                    headerShown: false,
                    drawerStyle: {
                        backgroundColor: '#0F172A',
                        width: '80%',
                    },
                    drawerPosition: 'right', // RTL support
                }}
            >
                <Drawer.Screen name="Home" component={HomeScreen} />
                <Drawer.Screen name="Library" component={LibraryScreen} />
                <Drawer.Screen name="Favorites" component={FavoritesScreen} />
                <Drawer.Screen name="Settings" component={SettingsScreen} />
            </Drawer.Navigator>

            <MiniPlayer />
        </View>
    );
};

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_bottom',
                }}>
                <Stack.Screen name="Main" component={DrawerNavigator} />
                <Stack.Screen
                    name="Player"
                    component={PlayerScreen}
                    options={{
                        presentation: 'modal',
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    // Add any necessary styles here
});

export default AppNavigator;
