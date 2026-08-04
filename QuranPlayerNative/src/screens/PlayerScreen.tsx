/**
 * Player Screen
 * شاشة المشغل المحسنة
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Animated,
    ScrollView,
    Modal,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '../store/playerStore';
import { RECITERS } from '../config/reciters';
import { SURAHS } from '../config/surahs';

const { width, height } = Dimensions.get('window');

// ألوان المقرئين
const RECITER_COLORS: Record<string, string> = {
    mishary: '#10B981',
    abdulbasit: '#F59E0B',
    husary: '#3B82F6',
    minshawi: '#8B5CF6',
    sudais: '#EF4444',
    shuraim: '#EC4899',
    ghamadi: '#14B8A6',
    ajmi: '#F97316',
    dosari: '#6366F1',
};

// Wave Animation Bar
const WaveBar = ({ delay, isPlaying, color }: { delay: number; isPlaying: boolean; color: string }) => {
    const animValue = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        if (isPlaying) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animValue, {
                        toValue: 1,
                        duration: 300 + delay * 80,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animValue, {
                        toValue: 0.3,
                        duration: 300 + delay * 80,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            Animated.timing(animValue, {
                toValue: 0.5,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [isPlaying]);

    return (
        <Animated.View
            style={[
                styles.waveBar,
                { backgroundColor: color, transform: [{ scaleY: animValue }] },
            ]}
        />
    );
};

// Circular Progress Component
const CircularProgress = ({ 
    progress, 
    size, 
    strokeWidth, 
    color,
    children 
}: { 
    progress: number; 
    size: number; 
    strokeWidth: number;
    color: string;
    children: React.ReactNode;
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress * circumference);

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                {/* Background Circle */}
                <View style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: '#1E293B',
                }} />
            </View>
            <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                {/* Progress Circle - simplified without SVG */}
                <View style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: 'transparent',
                    borderTopColor: color,
                    borderRightColor: progress > 0.25 ? color : 'transparent',
                    borderBottomColor: progress > 0.5 ? color : 'transparent',
                    borderLeftColor: progress > 0.75 ? color : 'transparent',
                    transform: [{ rotate: '-90deg' }],
                }} />
            </View>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                {children}
            </View>
        </View>
    );
};

const PlayerScreen = () => {
    const navigation = useNavigation<any>();
    const {
        currentSurah,
        currentReciter,
        isPlaying,
        togglePlay,
        nextSurah,
        previousSurah,
        currentTime,
        duration,
        toggleFavorite,
        isFavorite,
        repeatMode,
        cycleRepeatMode,
        setCurrentTime,
        playbackSpeed,
        setPlaybackSpeed,
        setCurrentSurah,
        setIsPlaying,
    } = usePlayerStore();

    const [showSpeedModal, setShowSpeedModal] = useState(false);
    const [showSurahList, setShowSurahList] = useState(false);

    const currentReciterData = RECITERS.find(r => r.id === currentReciter);
    const accentColor = RECITER_COLORS[currentReciter] || '#10B981';

    // Animations
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isPlaying) {
            // Pulse animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.05,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            // Rotate animation
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 20000,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            scaleAnim.setValue(1);
            rotateAnim.stopAnimation();
        }
    }, [isPlaying]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    if (!currentSurah) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <View style={styles.emptyArtwork}>
                        <Text style={styles.emptyIcon}>🎧</Text>
                    </View>
                    <Text style={styles.emptyTitle}>لا توجد سورة قيد التشغيل</Text>
                    <Text style={styles.emptySubtitle}>اختر سورة من المكتبة للاستماع</Text>
                    <TouchableOpacity
                        style={[styles.emptyButton, { backgroundColor: accentColor }]}
                        onPress={() => navigation.navigate('Library')}>
                        <Text style={styles.emptyButtonText}>📚 تصفح المكتبة</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const progress = duration > 0 ? (currentTime / duration) : 0;
    const isMeccan = currentSurah.revelationType === 'Meccan';

    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

    const handleSeek = (event: any) => {
        const { locationX } = event.nativeEvent;
        const progressBarWidth = width - 64;
        const newProgress = Math.max(0, Math.min(1, locationX / progressBarWidth));
        setCurrentTime(newProgress * duration);
    };

    const handlePlaySurah = (surah: any) => {
        setCurrentSurah(surah);
        setIsPlaying(true);
        setShowSurahList(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.headerBtn}
                >
                    <Text style={styles.headerBtnIcon}>↓</Text>
                </TouchableOpacity>
                
                <View style={styles.headerCenter}>
                    <Text style={styles.playingFrom}>يُشغَّل الآن</Text>
                    <TouchableOpacity onPress={() => setShowSurahList(true)}>
                        <Text style={[styles.headerTitle, { color: accentColor }]}>
                            {currentReciterData?.name || 'القارئ'} ▼
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => toggleFavorite(currentSurah)}
                    style={styles.headerBtn}
                >
                    <Text style={[
                        styles.favIcon, 
                        isFavorite(currentSurah) && { color: '#EF4444' }
                    ]}>
                        {isFavorite(currentSurah) ? '♥' : '♡'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Main Artwork */}
                <View style={styles.artworkSection}>
                    <Animated.View style={[
                        styles.artworkContainer,
                        { transform: [{ scale: scaleAnim }] }
                    ]}>
                        {/* Glow Effect */}
                        <View style={[styles.artworkGlow, { backgroundColor: accentColor }]} />
                        
                        {/* Main Circle */}
                        <Animated.View style={[
                            styles.artwork,
                            { 
                                borderColor: accentColor,
                                transform: isPlaying ? [{ rotate: spin }] : []
                            }
                        ]}>
                            {/* Inner Content */}
                            <View style={styles.artworkInner}>
                                <Text style={styles.surahNumber}>{currentSurah.number}</Text>
                                <Text style={[styles.surahNameArabic, { color: accentColor }]}>
                                    {currentSurah.name}
                                </Text>
                                <Text style={styles.surahNameEn}>{currentSurah.nameEn}</Text>
                            </View>

                            {/* Decorative Ring */}
                            <View style={[styles.decorativeRing, { borderColor: accentColor + '40' }]} />
                        </Animated.View>

                        {/* Wave Animation */}
                        {isPlaying && (
                            <View style={styles.waveContainer}>
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <WaveBar key={i} delay={i} isPlaying={isPlaying} color={accentColor} />
                                ))}
                            </View>
                        )}
                    </Animated.View>
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.surahTitle}>سورة {currentSurah.name}</Text>
                    <View style={styles.infoTags}>
                        <View style={[styles.infoTag, { backgroundColor: isMeccan ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)' }]}>
                            <Text style={[styles.infoTagText, { color: isMeccan ? '#3B82F6' : '#10B981' }]}>
                                {isMeccan ? '🕋 مكية' : '🕌 مدنية'}
                            </Text>
                        </View>
                        <View style={styles.infoTag}>
                            <Text style={styles.infoTagText}>📖 {currentSurah.verses} آية</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={styles.reciterTag}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <View style={[styles.reciterDot, { backgroundColor: accentColor }]} />
                        <Text style={styles.reciterTagText}>
                            {currentReciterData?.name || 'مشاري العفاسي'}
                        </Text>
                        <Text style={styles.reciterChangeText}>تغيير</Text>
                    </TouchableOpacity>
                </View>

                {/* Progress Section */}
                <View style={styles.progressSection}>
                    <TouchableOpacity 
                        style={styles.progressBarContainer}
                        onPress={handleSeek}
                        activeOpacity={1}
                    >
                        <View style={styles.progressBarBg}>
                            <Animated.View 
                                style={[
                                    styles.progressBarFill, 
                                    { width: `${progress * 100}%`, backgroundColor: accentColor }
                                ]} 
                            />
                        </View>
                        <View style={[
                            styles.progressKnob, 
                            { left: `${progress * 100}%`, backgroundColor: accentColor }
                        ]} />
                    </TouchableOpacity>
                    <View style={styles.timeRow}>
                        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                        <Text style={styles.timeText}>{formatTime(duration)}</Text>
                    </View>
                </View>

                {/* Main Controls */}
                <View style={styles.controlsSection}>
                    {/* Secondary Controls Row */}
                    <View style={styles.secondaryControls}>
                        <TouchableOpacity 
                            onPress={cycleRepeatMode} 
                            style={styles.secondaryBtn}
                        >
                            <Text style={[
                                styles.secondaryBtnIcon,
                                repeatMode !== 'none' && { color: accentColor }
                            ]}>
                                {repeatMode === 'one' ? '🔂' : repeatMode === 'all' ? '🔁' : '➡️'}
                            </Text>
                            <Text style={styles.secondaryBtnText}>
                                {repeatMode === 'none' ? 'بدون تكرار' : repeatMode === 'one' ? 'تكرار السورة' : 'تكرار الكل'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={() => setShowSpeedModal(true)} 
                            style={styles.secondaryBtn}
                        >
                            <Text style={styles.secondaryBtnIcon}>⚡</Text>
                            <Text style={styles.secondaryBtnText}>{playbackSpeed || 1}x</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Main Controls */}
                    <View style={styles.mainControls}>
                        <TouchableOpacity onPress={previousSurah} style={styles.skipBtn}>
                            <Text style={styles.skipIcon}>⏮</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={togglePlay} 
                            style={[styles.playBtn, { backgroundColor: accentColor }]}
                        >
                            <Text style={styles.playBtnIcon}>
                                {isPlaying ? '⏸' : '▶'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={nextSurah} style={styles.skipBtn}>
                            <Text style={styles.skipIcon}>⏭</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.quickAction}>
                        <View style={[styles.quickActionIcon, { backgroundColor: accentColor + '20' }]}>
                            <Text style={styles.quickActionEmoji}>📖</Text>
                        </View>
                        <Text style={styles.quickActionText}>قراءة النص</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.quickAction}
                        onPress={() => setShowSurahList(true)}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: accentColor + '20' }]}>
                            <Text style={styles.quickActionEmoji}>📋</Text>
                        </View>
                        <Text style={styles.quickActionText}>قائمة السور</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickAction}>
                        <View style={[styles.quickActionIcon, { backgroundColor: accentColor + '20' }]}>
                            <Text style={styles.quickActionEmoji}>🔗</Text>
                        </View>
                        <Text style={styles.quickActionText}>مشاركة</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickAction}>
                        <View style={[styles.quickActionIcon, { backgroundColor: accentColor + '20' }]}>
                            <Text style={styles.quickActionEmoji}>⬇️</Text>
                        </View>
                        <Text style={styles.quickActionText}>تحميل</Text>
                    </TouchableOpacity>
                </View>

                {/* Up Next */}
                <View style={styles.upNextSection}>
                    <Text style={styles.upNextTitle}>التالي في القائمة</Text>
                    {currentSurah.number < 114 && (
                        <TouchableOpacity 
                            style={styles.upNextCard}
                            onPress={() => handlePlaySurah(SURAHS[currentSurah.number])}
                        >
                            <View style={[styles.upNextNumber, { backgroundColor: accentColor + '20' }]}>
                                <Text style={[styles.upNextNumberText, { color: accentColor }]}>
                                    {currentSurah.number + 1}
                                </Text>
                            </View>
                            <View style={styles.upNextInfo}>
                                <Text style={styles.upNextName}>
                                    سورة {SURAHS[currentSurah.number].name}
                                </Text>
                                <Text style={styles.upNextMeta}>
                                    {SURAHS[currentSurah.number].nameEn} • {SURAHS[currentSurah.number].verses} آية
                                </Text>
                            </View>
                            <Text style={styles.upNextPlay}>▶</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {/* Speed Modal */}
            <Modal
                visible={showSpeedModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSpeedModal(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSpeedModal(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>سرعة التشغيل</Text>
                            <TouchableOpacity onPress={() => setShowSpeedModal(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.speedOptions}>
                            {speeds.map((speed) => (
                                <TouchableOpacity
                                    key={speed}
                                    style={[
                                        styles.speedOption,
                                        (playbackSpeed || 1) === speed && { backgroundColor: accentColor }
                                    ]}
                                    onPress={() => {
                                        setPlaybackSpeed(speed);
                                        setShowSpeedModal(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.speedOptionText,
                                        (playbackSpeed || 1) === speed && styles.speedOptionTextActive
                                    ]}>
                                        {speed}x
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Surah List Modal */}
            <Modal
                visible={showSurahList}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSurahList(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '80%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>اختر سورة</Text>
                            <TouchableOpacity onPress={() => setShowSurahList(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={SURAHS}
                            keyExtractor={item => item.number.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.surahListItem,
                                        currentSurah?.number === item.number && { backgroundColor: accentColor + '20' }
                                    ]}
                                    onPress={() => handlePlaySurah(item)}
                                >
                                    <View style={[
                                        styles.surahListNumber,
                                        { backgroundColor: currentSurah?.number === item.number ? accentColor : '#334155' }
                                    ]}>
                                        <Text style={styles.surahListNumberText}>{item.number}</Text>
                                    </View>
                                    <View style={styles.surahListInfo}>
                                        <Text style={styles.surahListName}>{item.name}</Text>
                                        <Text style={styles.surahListMeta}>
                                            {item.nameEn} • {item.verses} آية
                                        </Text>
                                    </View>
                                    {currentSurah?.number === item.number && (
                                        <Text style={{ color: accentColor, fontSize: 16 }}>▶</Text>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyArtwork: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyIcon: {
        fontSize: 48,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#F8FAFC',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#64748B',
        marginBottom: 24,
        textAlign: 'center',
    },
    emptyButton: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
    },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerBtnIcon: {
        color: '#F8FAFC',
        fontSize: 20,
    },
    headerCenter: {
        alignItems: 'center',
    },
    playingFrom: {
        color: '#64748B',
        fontSize: 12,
        marginBottom: 2,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    favIcon: {
        color: '#64748B',
        fontSize: 24,
    },

    // Artwork
    artworkSection: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    artworkContainer: {
        alignItems: 'center',
    },
    artworkGlow: {
        position: 'absolute',
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        opacity: 0.15,
        top: 20,
    },
    artwork: {
        width: width * 0.65,
        height: width * 0.65,
        borderRadius: width * 0.325,
        backgroundColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 20,
    },
    artworkInner: {
        alignItems: 'center',
    },
    surahNumber: {
        fontSize: 64,
        fontWeight: '800',
        color: '#334155',
        position: 'absolute',
        top: -30,
        opacity: 0.3,
    },
    surahNameArabic: {
        fontSize: 42,
        fontWeight: 'bold',
    },
    surahNameEn: {
        fontSize: 16,
        color: '#64748B',
        marginTop: 4,
    },
    decorativeRing: {
        position: 'absolute',
        width: '110%',
        height: '110%',
        borderRadius: 1000,
        borderWidth: 1,
    },
    waveContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 32,
        gap: 4,
        marginTop: 20,
    },
    waveBar: {
        width: 5,
        height: 32,
        borderRadius: 3,
    },

    // Info
    infoSection: {
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    surahTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#F8FAFC',
        marginBottom: 12,
    },
    infoTags: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    infoTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#1E293B',
    },
    infoTagText: {
        fontSize: 13,
        color: '#94A3B8',
    },
    reciterTag: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        gap: 8,
    },
    reciterDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    reciterTagText: {
        fontSize: 14,
        color: '#F8FAFC',
        flex: 1,
        textAlign: 'right',
    },
    reciterChangeText: {
        fontSize: 12,
        color: '#64748B',
    },

    // Progress
    progressSection: {
        paddingHorizontal: 32,
        marginBottom: 24,
    },
    progressBarContainer: {
        height: 24,
        justifyContent: 'center',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#334155',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressKnob: {
        width: 18,
        height: 18,
        borderRadius: 9,
        position: 'absolute',
        top: 3,
        marginLeft: -9,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    timeText: {
        color: '#64748B',
        fontSize: 13,
        fontVariant: ['tabular-nums'],
    },

    // Controls
    controlsSection: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    secondaryControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginBottom: 24,
    },
    secondaryBtn: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#1E293B',
        borderRadius: 12,
        minWidth: 100,
    },
    secondaryBtnIcon: {
        fontSize: 18,
        marginBottom: 2,
    },
    secondaryBtnText: {
        fontSize: 11,
        color: '#94A3B8',
    },
    mainControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
    },
    skipBtn: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipIcon: {
        fontSize: 24,
        color: '#F8FAFC',
    },
    playBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    playBtnIcon: {
        fontSize: 32,
        color: '#0F172A',
    },

    // Quick Actions
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    quickAction: {
        alignItems: 'center',
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    quickActionEmoji: {
        fontSize: 24,
    },
    quickActionText: {
        fontSize: 12,
        color: '#64748B',
    },

    // Up Next
    upNextSection: {
        paddingHorizontal: 24,
    },
    upNextTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F8FAFC',
        marginBottom: 12,
        textAlign: 'right',
    },
    upNextCard: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 16,
    },
    upNextNumber: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    upNextNumberText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    upNextInfo: {
        flex: 1,
        alignItems: 'flex-end',
    },
    upNextName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F8FAFC',
        marginBottom: 2,
    },
    upNextMeta: {
        fontSize: 13,
        color: '#64748B',
    },
    upNextPlay: {
        fontSize: 16,
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
        paddingBottom: 32,
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
    speedOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        padding: 20,
    },
    speedOption: {
        width: 70,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#334155',
        alignItems: 'center',
        justifyContent: 'center',
    },
    speedOptionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F8FAFC',
    },
    speedOptionTextActive: {
        color: '#0F172A',
    },
    surahListItem: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    surahListNumber: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    surahListNumberText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#F8FAFC',
    },
    surahListInfo: {
        flex: 1,
        alignItems: 'flex-end',
    },
    surahListName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F8FAFC',
        marginBottom: 2,
    },
    surahListMeta: {
        fontSize: 13,
        color: '#64748B',
    },
});

export default PlayerScreen;
