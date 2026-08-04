/**
 * Library Screen
 * شاشة المكتبة - عرض السور للقارئ المختار
 */

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    TextInput,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { SURAHS, Surah, searchSurahs } from '../config/surahs';
import { RECITERS } from '../config/reciters';
import { usePlayerStore } from '../store/playerStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 12) / 2;

// Popular Surahs
const POPULAR_SURAHS = [
    SURAHS[0],   // الفاتحة
    SURAHS[35],  // يس
    SURAHS[17],  // الكهف
    SURAHS[54],  // الرحمن
    SURAHS[67],  // الملك
    SURAHS[77],  // النبأ
];

interface SurahCardProps {
    surah: Surah;
    onPress: () => void;
    isFavorite: boolean;
    onFavorite: () => void;
    isPlaying: boolean;
    compact?: boolean;
}

// Wave Animation Component
const WaveAnimation = ({ color = '#10B981' }: { color?: string }) => (
    <View style={styles.waveContainer}>
        <View style={[styles.waveBar, styles.waveBar1, { backgroundColor: color }]} />
        <View style={[styles.waveBar, styles.waveBar2, { backgroundColor: color }]} />
        <View style={[styles.waveBar, styles.waveBar3, { backgroundColor: color }]} />
        <View style={[styles.waveBar, styles.waveBar4, { backgroundColor: color }]} />
    </View>
);

// Surah Card Component
const SurahCard = ({ surah, onPress, isFavorite, onFavorite, isPlaying, compact }: SurahCardProps) => {
    const isMeccan = surah.revelationType === 'Meccan';
    
    const typeColors = isMeccan
        ? { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', accent: '#3B82F6' }
        : { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', accent: '#10B981' };

    if (compact) {
        return (
            <TouchableOpacity
                style={[
                    styles.compactCard,
                    { backgroundColor: typeColors.bg, borderColor: typeColors.border },
                    isPlaying && styles.activeCompactCard
                ]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={[styles.compactThumbnail, isPlaying && styles.activeThumbnail]}>
                    <Text style={[styles.compactName, { color: typeColors.accent }]}>{surah.name}</Text>
                    <Text style={styles.compactNameEn}>{surah.nameEn}</Text>
                    {isPlaying && (
                        <View style={styles.waveBadge}>
                            <WaveAnimation color="#fff" />
                        </View>
                    )}
                </View>
                <View style={styles.compactInfo}>
                    <Text style={styles.compactTitle}>سورة {surah.name}</Text>
                    <Text style={styles.compactMeta}>
                        {surah.verses} آية • {isMeccan ? 'مكية' : 'مدنية'}
                    </Text>
                </View>
                {isPlaying && <View style={styles.playingIndicator} />}
            </TouchableOpacity>
        );
    }

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
                <View style={[styles.thumbnail, isPlaying && styles.activeThumbnail]}>
                    <Text style={[styles.surahNameArabic, { color: typeColors.accent }]}>
                        {surah.name}
                    </Text>
                    <Text style={styles.surahNameEnSmall}>{surah.nameEn}</Text>
                    {isPlaying && (
                        <View style={styles.waveBadge}>
                            <WaveAnimation color="#fff" />
                        </View>
                    )}
                </View>

                <View style={styles.surahInfo}>
                    <Text style={[styles.surahTitle, isPlaying && styles.activeText]}>
                        سورة {surah.name}
                    </Text>
                    <Text style={[styles.surahMeta, isPlaying && styles.activeTextSub]}>
                        {surah.verses} آية • {isMeccan ? 'مكية' : 'مدنية'}
                    </Text>
                </View>

                <TouchableOpacity onPress={onFavorite} style={styles.favoriteBtn}>
                    <Text style={{ fontSize: 20, color: isFavorite ? '#E74C3C' : '#4A5568' }}>
                        {isFavorite ? '♥' : '♡'}
                    </Text>
                </TouchableOpacity>

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

// Section Header
const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
);

const LibraryScreen = () => {
    const navigation = useNavigation<any>();
    const {
        currentReciter,
        setCurrentSurah,
        setIsPlaying,
        toggleFavorite,
        isFavorite,
        currentSurah,
        isPlaying,
        recentlyPlayed,
    } = usePlayerStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [showAllSurahs, setShowAllSurahs] = useState(false);

    const currentReciterData = RECITERS.find(r => r.id === currentReciter);

    const filteredSurahs = useMemo(() => {
        if (!searchQuery) return SURAHS;
        return searchSurahs(searchQuery);
    }, [searchQuery]);

    const recentSurahs = useMemo(() => {
        return recentlyPlayed?.slice(0, 6) || [];
    }, [recentlyPlayed]);

    const handlePlay = (surah: Surah) => {
        setCurrentSurah(surah);
        setIsPlaying(true);
        navigation.navigate('Player');
    };

    const renderCompactItem = ({ item }: { item: Surah }) => {
        const isCurrent = currentSurah?.number === item.number;
        return (
            <SurahCard
                surah={item}
                onPress={() => handlePlay(item)}
                isFavorite={isFavorite(item)}
                onFavorite={() => toggleFavorite(item)}
                isPlaying={isCurrent && isPlaying}
                compact
            />
        );
    };

    const renderFullItem = ({ item }: { item: Surah }) => {
        const isCurrent = currentSurah?.number === item.number;
        return (
            <SurahCard
                surah={item}
                onPress={() => handlePlay(item)}
                isFavorite={isFavorite(item)}
                onFavorite={() => toggleFavorite(item)}
                isPlaying={isCurrent && isPlaying}
            />
        );
    };

    // Search mode
    if (searchQuery) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.greeting}>🔍 البحث</Text>
                        <Text style={styles.headerTitle}>{filteredSurahs.length} نتيجة</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.menuButton}
                        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                    >
                        <Text style={styles.menuIcon}>☰</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ابحث عن سورة..."
                            placeholderTextColor="#64748B"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            textAlign="right"
                        />
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Text style={styles.clearIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <FlatList
                    data={filteredSurahs}
                    renderItem={renderFullItem}
                    keyExtractor={item => item.number.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header with Current Reciter */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.greeting}>
                            🎙️ {currentReciterData?.name || 'مشاري العفاسي'}
                        </Text>
                        <Text style={styles.headerTitle}>مكتبة السور</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.menuButton}
                        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                    >
                        <Text style={styles.menuIcon}>☰</Text>
                    </TouchableOpacity>
                </View>

                {/* Reciter Info Banner */}
                <TouchableOpacity 
                    style={styles.reciterBanner}
                    onPress={() => navigation.navigate('Home')}
                    activeOpacity={0.8}
                >
                    <View style={styles.reciterBannerAvatar}>
                        <Text style={styles.reciterBannerAvatarText}>
                            {currentReciterData?.name.charAt(0) || 'م'}
                        </Text>
                    </View>
                    <View style={styles.reciterBannerInfo}>
                        <Text style={styles.reciterBannerName}>
                            {currentReciterData?.name || 'مشاري العفاسي'}
                        </Text>
                        <Text style={styles.reciterBannerMeta}>
                            {currentReciterData?.country || 'الكويت'} • {currentReciterData?.style || 'مرتل'}
                        </Text>
                    </View>
                    <Text style={styles.reciterBannerChange}>تغيير ←</Text>
                </TouchableOpacity>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ابحث عن سورة..."
                            placeholderTextColor="#64748B"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            textAlign="right"
                        />
                    </View>
                </View>

                {/* Recently Played */}
                {recentSurahs.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeader title="🎧 المستمع إليها مؤخراً" />
                        <FlatList
                            data={recentSurahs}
                            renderItem={renderCompactItem}
                            keyExtractor={item => `recent-${item.number}`}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalList}
                            inverted
                        />
                    </View>
                )}

                {/* Popular Surahs */}
                <View style={styles.section}>
                    <SectionHeader title="⭐ السور الأكثر استماعاً" />
                    <FlatList
                        data={POPULAR_SURAHS}
                        renderItem={renderCompactItem}
                        keyExtractor={item => `popular-${item.number}`}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                        inverted
                    />
                </View>

                {/* All Surahs */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <SectionHeader title="📖 جميع السور" subtitle="114 سورة" />
                        <TouchableOpacity onPress={() => setShowAllSurahs(!showAllSurahs)}>
                            <Text style={styles.showAllBtn}>
                                {showAllSurahs ? 'إخفاء' : 'عرض الكل'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
                    {showAllSurahs ? (
                        <View style={styles.allSurahsList}>
                            {SURAHS.map(surah => {
                                const isCurrent = currentSurah?.number === surah.number;
                                return (
                                    <SurahCard
                                        key={surah.number}
                                        surah={surah}
                                        onPress={() => handlePlay(surah)}
                                        isFavorite={isFavorite(surah)}
                                        onFavorite={() => toggleFavorite(surah)}
                                        isPlaying={isCurrent && isPlaying}
                                    />
                                );
                            })}
                        </View>
                    ) : (
                        <FlatList
                            data={SURAHS.slice(0, 10)}
                            renderItem={renderFullItem}
                            keyExtractor={item => `all-${item.number}`}
                            scrollEnabled={false}
                            contentContainerStyle={styles.verticalList}
                        />
                    )}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 12,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerLeft: {
        flex: 1,
    },
    greeting: {
        fontSize: 14,
        color: '#10B981',
        fontWeight: '600',
        textAlign: 'right',
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#F8FAFC',
        textAlign: 'right',
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
    reciterBanner: {
        marginHorizontal: 24,
        marginBottom: 20,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    reciterBannerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    reciterBannerAvatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    reciterBannerInfo: {
        flex: 1,
        alignItems: 'flex-end',
    },
    reciterBannerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F8FAFC',
        marginBottom: 2,
    },
    reciterBannerMeta: {
        fontSize: 13,
        color: '#64748B',
    },
    reciterBannerChange: {
        fontSize: 13,
        color: '#10B981',
        fontWeight: '500',
    },
    searchContainer: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    searchBar: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 52,
        borderWidth: 1,
        borderColor: '#334155',
    },
    searchIcon: {
        fontSize: 16,
        marginLeft: 12,
        opacity: 0.6,
    },
    clearIcon: {
        fontSize: 16,
        color: '#64748B',
        padding: 8,
    },
    input: {
        flex: 1,
        color: '#F8FAFC',
        fontSize: 15,
        textAlign: 'right',
        height: '100%',
    },
    section: {
        marginBottom: 28,
    },
    sectionHeader: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionHeaderRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#F8FAFC',
        textAlign: 'right',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'right',
        marginTop: 2,
    },
    showAllBtn: {
        fontSize: 14,
        color: '#10B981',
        fontWeight: '600',
    },
    horizontalList: {
        paddingHorizontal: 24,
        gap: 12,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 120,
    },
    verticalList: {
        paddingHorizontal: 24,
    },
    allSurahsList: {
        paddingHorizontal: 24,
    },

    // Compact Card
    compactCard: {
        width: CARD_WIDTH,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        marginLeft: 12,
    },
    activeCompactCard: {
        borderColor: '#10B981',
        borderWidth: 2,
    },
    compactThumbnail: {
        height: 80,
        backgroundColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    activeThumbnail: {
        backgroundColor: '#064E3B',
    },
    compactName: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    compactNameEn: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    compactInfo: {
        padding: 12,
        alignItems: 'flex-end',
    },
    compactTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#F8FAFC',
        marginBottom: 4,
    },
    compactMeta: {
        fontSize: 11,
        color: '#64748B',
    },
    playingIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: '#10B981',
    },

    // Full Card
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
        position: 'relative',
    },
    surahNameArabic: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    surahNameEnSmall: {
        fontSize: 9,
        color: '#64748B',
        marginTop: 2,
    },
    waveBadge: {
        position: 'absolute',
        bottom: -6,
        left: -6,
        backgroundColor: '#10B981',
        borderRadius: 10,
        padding: 4,
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
    favoriteBtn: {
        padding: 8,
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

    // Wave Animation
    waveContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 12,
        gap: 2,
    },
    waveBar: {
        width: 3,
        borderRadius: 2,
    },
    waveBar1: { height: 6 },
    waveBar2: { height: 10 },
    waveBar3: { height: 8 },
    waveBar4: { height: 12 },
});

export default LibraryScreen;
