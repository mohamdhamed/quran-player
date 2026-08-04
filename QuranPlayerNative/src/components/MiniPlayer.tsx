/**
 * Mini Player
 * مشغل مصغر - تصميم مطابق للويب
 */

import React, { useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '../store/playerStore';

const { width } = Dimensions.get('window');

// Wave Animation Component
const WaveBar = ({ delay, isPlaying }: { delay: number; isPlaying: boolean }) => {
    const animValue = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        if (isPlaying) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animValue, {
                        toValue: 1,
                        duration: 250 + delay * 50,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animValue, {
                        toValue: 0.3,
                        duration: 250 + delay * 50,
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
                { transform: [{ scaleY: animValue }] },
            ]}
        />
    );
};

const WaveAnimation = ({ isPlaying }: { isPlaying: boolean }) => (
    <View style={styles.waveContainer}>
        {[0, 1, 2, 3].map((i) => (
            <WaveBar key={i} delay={i} isPlaying={isPlaying} />
        ))}
    </View>
);

const MiniPlayer = () => {
    const navigation = useNavigation<any>();
    const { 
        currentSurah, 
        isPlaying, 
        togglePlay, 
        nextSurah,
        previousSurah,
        currentTime, 
        duration 
    } = usePlayerStore();

    const slideAnim = useRef(new Animated.Value(100)).current;

    useEffect(() => {
        if (currentSurah) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 80,
                friction: 12,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 100,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [currentSurah]);

    if (!currentSurah) return null;

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const isMeccan = currentSurah.revelationType === 'Meccan';

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <Animated.View 
            style={[
                styles.container,
                { transform: [{ translateY: slideAnim }] }
            ]}
        >
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>

            <TouchableOpacity
                style={styles.content}
                onPress={() => navigation.navigate('Player')}
                activeOpacity={0.9}
            >
                {/* Surah Info */}
                <View style={styles.surahInfo}>
                    {/* Thumbnail with Wave */}
                    <View style={[
                        styles.thumbnail,
                        { borderColor: isMeccan ? 'rgba(59, 130, 246, 0.5)' : 'rgba(16, 185, 129, 0.5)' }
                    ]}>
                        <Text style={[
                            styles.thumbnailText,
                            { color: isMeccan ? '#3B82F6' : '#10B981' }
                        ]}>
                            {currentSurah.name}
                        </Text>
                        {isPlaying && (
                            <View style={styles.waveBadge}>
                                <WaveAnimation isPlaying={isPlaying} />
                            </View>
                        )}
                    </View>

                    {/* Text Info */}
                    <View style={styles.textContainer}>
                        <Text style={styles.surahName} numberOfLines={1}>
                            سورة {currentSurah.name}
                        </Text>
                        <Text style={styles.surahMeta} numberOfLines={1}>
                            {currentSurah.nameEn} • {formatTime(currentTime)} / {formatTime(duration)}
                        </Text>
                    </View>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity 
                        onPress={(e) => { e.stopPropagation(); previousSurah(); }} 
                        style={styles.controlBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={styles.controlIcon}>⏮</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={(e) => { e.stopPropagation(); togglePlay(); }} 
                        style={styles.playBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={styles.playIcon}>
                            {isPlaying ? '⏸' : '▶'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={(e) => { e.stopPropagation(); nextSurah(); }} 
                        style={styles.controlBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={styles.controlIcon}>⏭</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#334155',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    progressContainer: {
        height: 3,
        backgroundColor: '#334155',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#10B981',
    },
    content: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    surahInfo: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        flex: 1,
    },
    thumbnail: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
        borderWidth: 1,
        position: 'relative',
    },
    thumbnailText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    waveBadge: {
        position: 'absolute',
        bottom: -4,
        left: -4,
        backgroundColor: '#10B981',
        borderRadius: 8,
        padding: 3,
    },
    textContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    surahName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#F8FAFC',
        marginBottom: 2,
    },
    surahMeta: {
        fontSize: 12,
        color: '#64748B',
    },
    controls: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 4,
    },
    controlBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlIcon: {
        fontSize: 18,
        color: '#94A3B8',
    },
    playBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
    },
    playIcon: {
        fontSize: 18,
        color: '#0F172A',
    },

    // Wave Animation
    waveContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 10,
        gap: 2,
    },
    waveBar: {
        width: 2,
        height: 10,
        backgroundColor: '#fff',
        borderRadius: 1,
    },
});

export default MiniPlayer;
