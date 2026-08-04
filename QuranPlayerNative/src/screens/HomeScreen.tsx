/**
 * Home Screen
 * الشاشة الرئيسية - عرض المقرئين
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    TextInput,
    Dimensions,
    ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { RECITERS, Reciter } from '../config/reciters';
import { usePlayerStore } from '../store/playerStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 16) / 2;

// الألوان المميزة لكل مقرئ
const RECITER_COLORS: Record<string, { primary: string; secondary: string; gradient: string }> = {
    mishary: { primary: '#10B981', secondary: '#059669', gradient: 'rgba(16, 185, 129, 0.2)' },
    abdulbasit: { primary: '#F59E0B', secondary: '#D97706', gradient: 'rgba(245, 158, 11, 0.2)' },
    husary: { primary: '#3B82F6', secondary: '#2563EB', gradient: 'rgba(59, 130, 246, 0.2)' },
    minshawi: { primary: '#8B5CF6', secondary: '#7C3AED', gradient: 'rgba(139, 92, 246, 0.2)' },
    sudais: { primary: '#EF4444', secondary: '#DC2626', gradient: 'rgba(239, 68, 68, 0.2)' },
    shuraim: { primary: '#EC4899', secondary: '#DB2777', gradient: 'rgba(236, 72, 153, 0.2)' },
    ghamadi: { primary: '#14B8A6', secondary: '#0D9488', gradient: 'rgba(20, 184, 166, 0.2)' },
    ajmi: { primary: '#F97316', secondary: '#EA580C', gradient: 'rgba(249, 115, 22, 0.2)' },
    dosari: { primary: '#6366F1', secondary: '#4F46E5', gradient: 'rgba(99, 102, 241, 0.2)' },
};

// أيقونات البلدان
const COUNTRY_FLAGS: Record<string, string> = {
    'الكويت': '🇰🇼',
    'مصر': '🇪🇬',
    'السعودية': '🇸🇦',
};

interface ReciterCardProps {
    reciter: Reciter;
    onPress: () => void;
    isSelected: boolean;
}

const ReciterCard = ({ reciter, onPress, isSelected }: ReciterCardProps) => {
    const colors = RECITER_COLORS[reciter.id] || RECITER_COLORS.mishary;
    const flag = COUNTRY_FLAGS[reciter.country] || '🌍';

    return (
        <TouchableOpacity
            style={[
                styles.reciterCard,
                { backgroundColor: colors.gradient, borderColor: isSelected ? colors.primary : '#334155' },
                isSelected && styles.selectedCard
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>
                    {reciter.name.charAt(0)}
                </Text>
                {isSelected && (
                    <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                )}
            </View>

            {/* Info */}
            <View style={styles.reciterInfo}>
                <Text style={styles.reciterName} numberOfLines={2}>
                    {reciter.name}
                </Text>
                <Text style={styles.reciterNameEn} numberOfLines={1}>
                    {reciter.nameEn}
                </Text>
            </View>

            {/* Meta */}
            <View style={styles.reciterMeta}>
                <View style={styles.metaItem}>
                    <Text style={styles.metaFlag}>{flag}</Text>
                    <Text style={styles.metaText}>{reciter.country}</Text>
                </View>
                {reciter.style && (
                    <View style={[styles.styleTag, { backgroundColor: colors.primary + '30' }]}>
                        <Text style={[styles.styleText, { color: colors.primary }]}>
                            {reciter.style}
                        </Text>
                    </View>
                )}
            </View>

            {/* Play indicator */}
            <View style={[styles.playIndicator, { backgroundColor: colors.primary }]}>
                <Text style={styles.playIcon}>▶</Text>
            </View>
        </TouchableOpacity>
    );
};

// Featured Reciter Card (كارت كبير)
const FeaturedReciterCard = ({ reciter, onPress, isSelected }: ReciterCardProps) => {
    const colors = RECITER_COLORS[reciter.id] || RECITER_COLORS.mishary;
    const flag = COUNTRY_FLAGS[reciter.country] || '🌍';

    return (
        <TouchableOpacity
            style={[
                styles.featuredCard,
                { borderColor: isSelected ? colors.primary : '#334155' },
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Gradient Background */}
            <View style={[styles.featuredGradient, { backgroundColor: colors.gradient }]}>
                {/* Large Avatar */}
                <View style={[styles.featuredAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.featuredAvatarText}>
                        {reciter.name.charAt(0)}
                    </Text>
                </View>

                {/* Info */}
                <View style={styles.featuredInfo}>
                    <Text style={styles.featuredName}>{reciter.name}</Text>
                    <Text style={styles.featuredNameEn}>{reciter.nameEn}</Text>
                    <View style={styles.featuredMeta}>
                        <Text style={styles.metaFlag}>{flag}</Text>
                        <Text style={styles.featuredCountry}>{reciter.country}</Text>
                        {reciter.style && (
                            <View style={[styles.featuredStyleTag, { backgroundColor: colors.primary }]}>
                                <Text style={styles.featuredStyleText}>{reciter.style}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Play Button */}
                <View style={[styles.featuredPlayBtn, { backgroundColor: colors.primary }]}>
                    <Text style={styles.featuredPlayIcon}>▶</Text>
                </View>

                {isSelected && (
                    <View style={[styles.featuredSelectedBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.featuredSelectedText}>القارئ الحالي ✓</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const HomeScreen = () => {
    const navigation = useNavigation<any>();
    const { currentReciter, setCurrentReciter } = usePlayerStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredReciters = RECITERS.filter(reciter => 
        reciter.name.includes(searchQuery) || 
        reciter.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reciter.country.includes(searchQuery)
    );

    const handleSelectReciter = (reciter: Reciter) => {
        setCurrentReciter(reciter.id);
        navigation.navigate('Library');
    };

    const featuredReciter = RECITERS.find(r => r.id === currentReciter) || RECITERS[0];
    const otherReciters = filteredReciters.filter(r => r.id !== featuredReciter.id);

    const renderReciterItem = ({ item, index }: { item: Reciter; index: number }) => (
        <ReciterCard
            reciter={item}
            onPress={() => handleSelectReciter(item)}
            isSelected={currentReciter === item.id}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            <FlatList
                data={otherReciters}
                renderItem={renderReciterItem}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <Text style={styles.greeting}>السلام عليكم 👋</Text>
                                <Text style={styles.headerTitle}>اختر قارئك المفضل</Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.menuButton}
                                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                            >
                                <Text style={styles.menuIcon}>☰</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar */}
                        <View style={styles.searchContainer}>
                            <View style={styles.searchBar}>
                                <Text style={styles.searchIcon}>🔍</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="ابحث عن قارئ..."
                                    placeholderTextColor="#64748B"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    textAlign="right"
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                                        <Text style={styles.clearIcon}>✕</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Featured Reciter */}
                        {!searchQuery && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>🎙️ القارئ المختار</Text>
                                <FeaturedReciterCard
                                    reciter={featuredReciter}
                                    onPress={() => handleSelectReciter(featuredReciter)}
                                    isSelected={currentReciter === featuredReciter.id}
                                />
                            </View>
                        )}

                        {/* Section Title */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                {searchQuery ? `🔍 نتائج البحث (${filteredReciters.length})` : '📚 جميع القراء'}
                            </Text>
                            <Text style={styles.sectionSubtitle}>
                                {RECITERS.length} قارئ متاح
                            </Text>
                        </View>
                    </>
                }
                ListFooterComponent={<View style={{ height: 120 }} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🔍</Text>
                        <Text style={styles.emptyText}>لم يتم العثور على قراء</Text>
                    </View>
                }
            />
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
        alignItems: 'flex-start',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 12,
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
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#F8FAFC',
        textAlign: 'right',
        marginBottom: 16,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#64748B',
    },
    listContent: {
        paddingBottom: 20,
    },
    row: {
        paddingHorizontal: 24,
        gap: 16,
        marginBottom: 16,
    },

    // Reciter Card
    reciterCard: {
        width: CARD_WIDTH,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1.5,
        position: 'relative',
        minHeight: 180,
    },
    selectedCard: {
        borderWidth: 2,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        alignSelf: 'flex-end',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    selectedBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#0F172A',
    },
    selectedBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    reciterInfo: {
        flex: 1,
        alignItems: 'flex-end',
    },
    reciterName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#F8FAFC',
        textAlign: 'right',
        marginBottom: 4,
        lineHeight: 22,
    },
    reciterNameEn: {
        fontSize: 11,
        color: '#64748B',
        textAlign: 'right',
    },
    reciterMeta: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    metaItem: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },
    metaFlag: {
        fontSize: 14,
        marginLeft: 4,
    },
    metaText: {
        fontSize: 11,
        color: '#94A3B8',
    },
    styleTag: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    styleText: {
        fontSize: 10,
        fontWeight: '600',
    },
    playIndicator: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playIcon: {
        color: '#fff',
        fontSize: 12,
    },

    // Featured Card
    featuredCard: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1.5,
    },
    featuredGradient: {
        padding: 24,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        position: 'relative',
    },
    featuredAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 20,
    },
    featuredAvatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    featuredInfo: {
        flex: 1,
        alignItems: 'flex-end',
    },
    featuredName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#F8FAFC',
        textAlign: 'right',
        marginBottom: 4,
    },
    featuredNameEn: {
        fontSize: 13,
        color: '#94A3B8',
        marginBottom: 12,
    },
    featuredMeta: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 8,
    },
    featuredCountry: {
        fontSize: 13,
        color: '#94A3B8',
    },
    featuredStyleTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    featuredStyleText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#fff',
    },
    featuredPlayBtn: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featuredPlayIcon: {
        color: '#fff',
        fontSize: 18,
    },
    featuredSelectedBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    featuredSelectedText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
    },
});

export default HomeScreen;
