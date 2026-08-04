/**
 * Settings Screen
 * شاشة الإعدادات - تصميم مطابق للويب
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Modal,
    FlatList,
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { usePlayerStore } from '../store/playerStore';
import { RECITERS } from '../config/reciters';

// Setting Item Component
const SettingItem = ({ 
    icon, 
    title, 
    value, 
    onPress,
    showArrow = true,
}: { 
    icon: string;
    title: string;
    value: string;
    onPress?: () => void;
    showArrow?: boolean;
}) => (
    <TouchableOpacity 
        style={styles.settingItem} 
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
    >
        <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>{icon}</Text>
            <Text style={styles.settingTitle}>{title}</Text>
        </View>
        <View style={styles.settingRight}>
            <Text style={styles.settingValue}>{value}</Text>
            {showArrow && onPress && <Text style={styles.settingArrow}>‹</Text>}
        </View>
    </TouchableOpacity>
);

// Section Component
const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionContent}>
            {children}
        </View>
    </View>
);

const SettingsScreen = () => {
    const navigation = useNavigation<any>();
    const { 
        currentReciter, 
        setCurrentReciter,
        repeatMode, 
        cycleRepeatMode,
        playbackSpeed,
        setPlaybackSpeed,
    } = usePlayerStore();

    const [showReciterModal, setShowReciterModal] = useState(false);
    const [showSpeedModal, setShowSpeedModal] = useState(false);

    const currentReciterData = RECITERS.find(r => r.id === currentReciter);

    const repeatModeText = {
        'none': 'إيقاف',
        'one': 'تكرار سورة',
        'all': 'تكرار الكل',
    };

    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerIcon}>⚙️</Text>
                    <Text style={styles.headerTitle}>الإعدادات</Text>
                </View>
                <TouchableOpacity 
                    style={styles.menuButton}
                    onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                >
                    <Text style={styles.menuIcon}>☰</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* إعدادات المشغل */}
                <SettingSection title="🎵 إعدادات المشغل">
                    <SettingItem
                        icon="🎙️"
                        title="القارئ"
                        value={currentReciterData?.name || 'مشاري العفاسي'}
                        onPress={() => setShowReciterModal(true)}
                    />
                    <SettingItem
                        icon="🔁"
                        title="وضع التكرار"
                        value={repeatModeText[repeatMode]}
                        onPress={cycleRepeatMode}
                    />
                    <SettingItem
                        icon="⏩"
                        title="سرعة التشغيل"
                        value={`${playbackSpeed || 1}x`}
                        onPress={() => setShowSpeedModal(true)}
                    />
                </SettingSection>

                {/* معلومات التطبيق */}
                <SettingSection title="📱 معلومات التطبيق">
                    <SettingItem
                        icon="📦"
                        title="الإصدار"
                        value="1.0.0"
                        showArrow={false}
                    />
                    <SettingItem
                        icon="👨‍💻"
                        title="المطور"
                        value="Quran Player Team"
                        showArrow={false}
                    />
                </SettingSection>

                {/* مصادر الصوت */}
                <SettingSection title="🔊 مصادر الصوت">
                    <SettingItem
                        icon="🌐"
                        title="مصدر الصوت"
                        value="mp3quran.net"
                        showArrow={false}
                    />
                    <SettingItem
                        icon="📖"
                        title="مصدر النصوص"
                        value="alquran.cloud"
                        showArrow={false}
                    />
                </SettingSection>

                {/* Spacer */}
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Reciter Selection Modal */}
            <Modal
                visible={showReciterModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowReciterModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>اختر القارئ</Text>
                            <TouchableOpacity onPress={() => setShowReciterModal(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={RECITERS}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.modalItem,
                                        currentReciter === item.id && styles.modalItemActive
                                    ]}
                                    onPress={() => {
                                        setCurrentReciter(item.id);
                                        setShowReciterModal(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        currentReciter === item.id && styles.modalItemTextActive
                                    ]}>
                                        {item.name}
                                    </Text>
                                    {currentReciter === item.id && (
                                        <Text style={styles.modalItemCheck}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Speed Selection Modal */}
            <Modal
                visible={showSpeedModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowSpeedModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>سرعة التشغيل</Text>
                            <TouchableOpacity onPress={() => setShowSpeedModal(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={speeds}
                            keyExtractor={item => item.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.modalItem,
                                        (playbackSpeed || 1) === item && styles.modalItemActive
                                    ]}
                                    onPress={() => {
                                        setPlaybackSpeed(item);
                                        setShowSpeedModal(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        (playbackSpeed || 1) === item && styles.modalItemTextActive
                                    ]}>
                                        {item}x {item === 1 ? '(عادي)' : ''}
                                    </Text>
                                    {(playbackSpeed || 1) === item && (
                                        <Text style={styles.modalItemCheck}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    header: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    headerLeft: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },
    headerIcon: {
        fontSize: 28,
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#F8FAFC',
    },
    menuButton: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuIcon: {
        fontSize: 22,
        color: '#F8FAFC',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 16,
        textAlign: 'right',
    },
    sectionContent: {
        backgroundColor: '#1E293B',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#334155',
    },
    settingItem: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    settingLeft: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },
    settingIcon: {
        fontSize: 20,
        marginLeft: 12,
    },
    settingTitle: {
        fontSize: 15,
        color: '#F8FAFC',
        fontWeight: '500',
    },
    settingRight: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },
    settingValue: {
        fontSize: 14,
        color: '#64748B',
    },
    settingArrow: {
        fontSize: 20,
        color: '#64748B',
        marginRight: 8,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1E293B',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#F8FAFC',
    },
    modalClose: {
        fontSize: 20,
        color: '#64748B',
        padding: 4,
    },
    modalItem: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    modalItemActive: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    modalItemText: {
        fontSize: 16,
        color: '#F8FAFC',
        textAlign: 'right',
    },
    modalItemTextActive: {
        color: '#10B981',
        fontWeight: '600',
    },
    modalItemCheck: {
        fontSize: 18,
        color: '#10B981',
    },
});

export default SettingsScreen;
