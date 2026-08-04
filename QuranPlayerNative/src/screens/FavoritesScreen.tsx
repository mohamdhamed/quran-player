/**
 * Favorites Screen
 * شاشة المفضلة - تصميم مطابق للويب
 */

import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { usePlayerStore } from '../store/playerStore';
import { Surah } from '../config/surahs';

// Surah Card Component
const SurahCard = ({ 
    surah, 
    onPress, 
    onRemove, 
    isPlaying 
}: { 
    surah: Surah; 
    onPress: () => void; 
    onRemove: () => void;
    isPlaying: boolean;
}) => {
    const isMeccan = surah.revelationType === 'Meccan';
    const typeColors = isMeccan
        ? { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', accent: '#3B82F6' }
        : { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', accent: '#10B981' };

    return (
        <TouchableOpacity
            style={[
                styles.surahCard,
                { backgroundColor: typeColors.bg, borderColor: typeColors.border },
                isPlaying && styles.activeCard
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.cardContent}>
                {/* Thumbnail */}
                <View style={[styles.thumbnail, isPlaying && styles.activeThumbnail]}>
                    <Text style={[styles.thumbnailText, { color: typeColors.accent }]}>
                        {surah.name}
                    </Text>
                    <Text style={styles.thumbnailTextEn}>{surah.nameEn}</Text>
                </View>

                {/* Info */}
                <View style={styles.surahInfo}>
                    <Text style={[styles.surahTitle, isPlaying && styles.activeText]}>
                        سورة {surah.name}
                    </Text>
                    <Text style={[styles.surahMeta, isPlaying && styles.activeTextSub]}>
                        {surah.verses} آية • {isMeccan ? 'مكية' : 'مدنية'}
                    </Text>
                </View>

                {/* Remove Button */}
                <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
                    <Text style={styles.removeIcon}>🗑️</Text>
                </TouchableOpacity>

                {/* Play Icon */}
                <View style={[styles.playIcon, isPlaying && styles.activePlayIcon]}>
                    <Text style={{ color: isPlaying ? '#000' : '#fff', fontSize: 14 }}>
                        {isPlaying ? '⏸' : '▶'}
                    </Text>
                </View>
            </View>

            {isPlaying && <View style={styles.cardProgress} />}
        </TouchableOpacity>
    );
};

const FavoritesScreen = () => {
    const navigation = useNavigation<any>();
    const { 
        favorites, 
        setCurrentSurah, 
        setIsPlaying, 
        toggleFavorite,
        currentSurah,
        isPlaying,
    } = usePlayerStore();

    const handlePlay = (surah: Surah) => {
        setCurrentSurah(surah);
        setIsPlaying(true);
        navigation.navigate('Player');
    };

    const renderItem = ({ item }: { item: Surah }) => {
        const isCurrent = currentSurah?.number === item.number;
        return (
            <SurahCard
                surah={item}
                onPress={() => handlePlay(item)}
                onRemove={() => toggleFavorite(item)}
                isPlaying={isCurrent && isPlaying}
            />
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerIcon}>❤️</Text>
                    <View>
                        <Text style={styles.headerTitle}>المفضلة</Text>
                        <Text style={styles.headerSubtitle}>{favorites.length} سورة محفوظة</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    style={styles.menuButton}
                    onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                >
                    <Text style={styles.menuIcon}>☰</Text>
                </TouchableOpacity>
            </View>

            {favorites.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>❤️</Text>
                    <Text style={styles.emptyTitle}>لا توجد سور في المفضلة</Text>
                    <Text style={styles.emptySubtitle}>
                        اضغط على أيقونة القلب لإضافة سورة إلى المفضلة
                    </Text>
                    <TouchableOpacity 
                        style={styles.browseBtn}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={styles.browseBtnText}>تصفح السور</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    renderItem={renderItem}
                    keyExtractor={item => item.number.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
        fontSize: 32,
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#F8FAFC',
        textAlign: 'right',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'right',
        marginTop: 2,
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
    listContent: {
        padding: 24,
        paddingBottom: 120,
    },
    surahCard: {
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    activeCard: {
        borderColor: '#10B981',
        borderWidth: 2,
    },
    cardContent: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        padding: 12,
    },
    thumbnail: {
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    activeThumbnail: {
        backgroundColor: '#064E3B',
    },
    thumbnailText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    thumbnailTextEn: {
        fontSize: 9,
        color: '#64748B',
        marginTop: 2,
    },
    surahInfo: {
        flex: 1,
        alignItems: 'flex-end',
    },
    surahTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F8FAFC',
        marginBottom: 4,
    },
    surahMeta: {
        fontSize: 12,
        color: '#64748B',
    },
    activeText: {
        color: '#fff',
    },
    activeTextSub: {
        color: 'rgba(255,255,255,0.7)',
    },
    removeBtn: {
        padding: 8,
    },
    removeIcon: {
        fontSize: 18,
    },
    playIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#334155',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    activePlayIcon: {
        backgroundColor: '#10B981',
    },
    cardProgress: {
        height: 3,
        backgroundColor: '#10B981',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyIcon: {
        fontSize: 80,
        marginBottom: 24,
        opacity: 0.5,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#F8FAFC',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    browseBtn: {
        backgroundColor: '#10B981',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
    },
    browseBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default FavoritesScreen;
