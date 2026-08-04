/**
 * useMediaSession - بيوصّل حالة المشغل بشاشة القفل وزراير السماعة
 *
 * الهوك ده بيتنادى مرة واحدة في App، وعن قصد مش بيشترك في أي state
 * بطريقة React: كل الاشتراك بيتم بـ `usePlayerStore.subscribe` جوّه
 * effect. السبب إن currentTime بيتحدّث 10 مرات في الثانية - لو اشتركنا
 * فيه بالطريقة العادية كان التطبيق كله هيعمل re-render بنفس المعدّل.
 * كده الـ listener بيتنادى بنفس المعدّل بس من غير ما يلمس شجرة React.
 */

import { useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import audioPlayer from '../services/audioPlayer';
import { getReciter } from '../services/reciterRegistry';
import { createArtwork } from '../services/surahArtwork';
import * as mediaSession from '../services/mediaSession';

/** الخطوة الافتراضية للتقديم والترجيع لو النظام ماحددش واحدة */
const SEEK_STEP_SECONDS = 10;

/**
 * كل قد إيه نبعت الموضع للنظام أثناء التشغيل العادي.
 *
 * المتصفح بيكمّل الشريط لوحده بالحساب من آخر موضع بعتناه ومن السرعة،
 * فمش محتاج تحديث كل 100ms. بنبعت كل ثانية عشان نصحّح أي زحلقة بس.
 */
const POSITION_SYNC_MS = 1000;

/**
 * فرق أكبر من كده بين قراءتين معناه إن المستخدم نطّ في التلاوة،
 * مش إن الوقت مشي عادي - ووقتها الشريط لازم يتصحّح فوراً.
 */
const SEEK_JUMP_SECONDS = 1.5;

/** اسم السورة والقارئ باللغة المعروضة في التطبيق */
function buildMetadata(state) {
  const surah = state.currentSurah;
  if (!surah) return null;

  const reciter = getReciter(state.currentReciter);
  const isEnglish = state.language === 'en';

  return {
    title: isEnglish ? `Surah ${surah.nameEn}` : `سورة ${surah.name}`,
    artist: isEnglish ? reciter.nameEn : reciter.name,
    album: isEnglish ? 'The Holy Quran' : 'القرآن الكريم'
  };
}

function playbackStateOf(state) {
  if (!state.currentSurah) return 'none';
  return state.isPlaying ? 'playing' : 'paused';
}

export function useMediaSession() {
  useEffect(() => {
    if (!mediaSession.isSupported()) return undefined;

    let lastPositionSync = 0;
    // رسم الغلاف بياخد وقت (بيستنى الخطوط)، والمستخدم ممكن يكون غيّر
    // السورة في الوقت ده - فبنرمي أي غلاف اتأخر عن دوره
    let metadataToken = 0;

    const applyMetadata = (state) => {
      const meta = buildMetadata(state);
      metadataToken += 1;
      const token = metadataToken;

      if (!meta) {
        mediaSession.setMetadata(null);
        return;
      }

      // بنبعت الأسماء فوراً بأيقونة التطبيق عشان مايفضلش فاضي،
      // وبنحدّثها بغلاف السورة أول ما يجهز
      mediaSession.setMetadata(meta);

      createArtwork(meta)
        .then((artwork) => {
          if (artwork && token === metadataToken) {
            mediaSession.setMetadata({ ...meta, artwork });
          }
        })
        .catch(() => {
          // الغلاف مش ضروري - أيقونة التطبيق اللي اتبعتت فوق كفاية
        });
    };

    const syncPosition = (state, force = false) => {
      const now = Date.now();
      if (!force && now - lastPositionSync < POSITION_SYNC_MS) return;
      lastPositionSync = now;

      mediaSession.setPositionState({
        duration: state.duration,
        position: state.currentTime,
        playbackRate: state.playbackSpeed
      });
    };

    /** تحريك الصوت نفسه + الـ store + شريط شاشة القفل مع بعض */
    const seekTo = (seconds) => {
      const state = usePlayerStore.getState();
      const limit = state.duration > 0 ? state.duration : seconds;
      const target = Math.min(Math.max(seconds, 0), limit);

      audioPlayer.seek(target);
      state.setCurrentTime(target);
      syncPosition({ ...state, currentTime: target }, true);
    };

    mediaSession.setActionHandlers({
      // بنغيّر الـ store بس، والـ effect بتاع PlayerBar هو اللي بيشغّل
      // ويوقّف فعلاً - فزرار السماعة بيمشي في نفس السكة بتاعة زرار الشاشة
      play: () => usePlayerStore.getState().setIsPlaying(true),
      pause: () => usePlayerStore.getState().setIsPlaying(false),
      nexttrack: () => usePlayerStore.getState().nextSurah(),
      previoustrack: () => usePlayerStore.getState().previousSurah(),
      seekbackward: (details) =>
        seekTo(audioPlayer.getCurrentTime() - (details?.seekOffset || SEEK_STEP_SECONDS)),
      seekforward: (details) =>
        seekTo(audioPlayer.getCurrentTime() + (details?.seekOffset || SEEK_STEP_SECONDS)),
      seekto: (details) => {
        if (Number.isFinite(details?.seekTime)) seekTo(details.seekTime);
      },
      stop: () => {
        const state = usePlayerStore.getState();
        state.setIsPlaying(false);
        audioPlayer.stop();
        state.setCurrentTime(0);
      }
    });

    // الحالة وقت التركيب: ممكن يكون فيه تلاوة شغالة من قبل ما الهوك يتركّب
    const initial = usePlayerStore.getState();
    applyMetadata(initial);
    mediaSession.setPlaybackState(playbackStateOf(initial));
    syncPosition(initial, true);

    const unsubscribe = usePlayerStore.subscribe((state, prev) => {
      if (
        state.currentSurah?.number !== prev.currentSurah?.number ||
        state.currentReciter !== prev.currentReciter ||
        state.language !== prev.language
      ) {
        applyMetadata(state);
      }

      if (state.isPlaying !== prev.isPlaying || !state.currentSurah !== !prev.currentSurah) {
        mediaSession.setPlaybackState(playbackStateOf(state));
        syncPosition(state, true);
        return;
      }

      // المدة بتوصل متأخرة (بعد ما الملف يحمّل)، والسرعة بتغيّر شكل
      // الشريط كله، والنطّة معناها إن المستخدم حرّك الصوت
      if (
        state.duration !== prev.duration ||
        state.playbackSpeed !== prev.playbackSpeed ||
        Math.abs(state.currentTime - prev.currentTime) > SEEK_JUMP_SECONDS
      ) {
        // أول ما التشغيل يبدأ فعلاً بنعيد إرسال البيانات. بعض نسخ
        // كروم على أندرويد بتبني جلسة الميديا وقت أول صوت بيطلع،
        // وبترمي أي بيانات اتبعتت قبلها - فبتظهر عندها أيقونة
        // المتصفح واسم الصفحة بدل السورة والقارئ
        if (!(prev.duration > 0) && state.duration > 0) {
          applyMetadata(state);
        }
        syncPosition(state, true);
        return;
      }

      if (state.currentTime !== prev.currentTime) {
        syncPosition(state);
      }
    });

    return () => {
      unsubscribe();
      mediaSession.clear();
    };
  }, []);
}

export default useMediaSession;
