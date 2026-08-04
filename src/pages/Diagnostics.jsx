import { useState, useCallback } from 'react';
import { Play, Copy, Check } from 'lucide-react';
import quranService from '../services/QuranService';
import { usePlayerStore } from '../store/playerStore';

/**
 * شاشة تشخيص الصوت
 *
 * لما التلاوة ماتشتغلش على جهاز واحد بس، السؤال "ليه؟" مش ممكن يتجاوب
 * من بره الجهاز ده. الشاشة دي بتشغّل أربع اختبارات على الجهاز نفسه
 * وبتعرض النتيجة بالأرقام، عشان بدل ما نخمّن نبقى شايفين.
 *
 * الترتيب متعمّد - كل اختبار بيعزل طبقة:
 *   ١ الشبكة: الملف بيوصل للجهاز أصلاً؟
 *   ٢ مخرج الصوت: الجهاز بيطلّع صوت من المتصفح أصلاً؟ (نغمة مولّدة
 *     محلياً - مالهاش أي علاقة بالشبكة ولا بأي ملف)
 *   ٣ عنصر الصوت: المتصفح بيقدر يفك تشفير الملف ويشغّله؟
 *   ٤ معلومات الجهاز
 *
 * لو ١ نجح و ٢ فشل، المشكلة في إعدادات الصوت على الجهاز مش في التطبيق
 * ولا في الشبكة. ولو ١ و ٢ نجحوا و ٣ فشل، المشكلة في الملف نفسه أو في
 * فك تشفيره.
 */

const PENDING = 'pending';
const RUNNING = 'running';
const PASS = 'pass';
const FAIL = 'fail';

const STATUS_STYLES = {
  [PENDING]: 'text-gray-500',
  [RUNNING]: 'text-yellow-400',
  [PASS]: 'text-spotify-green',
  [FAIL]: 'text-red-400'
};

const STATUS_LABELS = {
  [PENDING]: '—',
  [RUNNING]: 'شغال...',
  [PASS]: 'نجح',
  [FAIL]: 'فشل'
};

/** بينتظر أول حدث من اللي اتبعتوا، أو بيسلّم timeout */
function waitForAudio(audio, timeoutMs) {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (outcome) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(outcome);
    };

    const timer = setTimeout(() => finish('timeout'), timeoutMs);

    audio.addEventListener('canplay', () => finish('canplay'), { once: true });
    audio.addEventListener('loadedmetadata', () => finish('loadedmetadata'), { once: true });
    audio.addEventListener('error', () => finish('error'), { once: true });
  });
}

const MEDIA_ERROR_NAMES = {
  1: 'ABORTED - التحميل اتلغى',
  2: 'NETWORK - الشبكة قطعت',
  3: 'DECODE - الملف بايظ أو مش مفهوم',
  4: 'SRC_NOT_SUPPORTED - المصدر مرفوض'
};

export default function Diagnostics() {
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const update = useCallback((key, status, detail) => {
    setResults((prev) => ({ ...prev, [key]: { status, detail } }));
  }, []);

  const run = useCallback(async () => {
    setRunning(true);
    setResults({});

    const reciter = usePlayerStore.getState().currentReciter;
    const audioUrl = await quranService.getAudioUrl(reciter, 1);

    // ═══ ١ الشبكة ═══
    update('network', RUNNING);
    try {
      const response = await fetch(audioUrl, { headers: { Range: 'bytes=0-2000' } });
      const buffer = await response.arrayBuffer();
      update(
        'network',
        response.ok ? PASS : FAIL,
        `HTTP ${response.status} · وصل ${buffer.byteLength} بايت · ` +
          `النوع ${response.headers.get('content-type') || 'مش معروف'}`
      );
    } catch (error) {
      update('network', FAIL, `الطلب اترفض: ${error.name} - ${error.message}`);
    }

    // ═══ ٢ مخرج الصوت ═══
    // نغمة مولّدة في المتصفح، مفيش أي ملف ولا شبكة. لو دي مسمعتش،
    // يبقى الجهاز مش بيطلّع صوت من المتصفح خالص.
    update('output', RUNNING);
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContextClass();
      await context.resume();

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 440;
      gain.gain.value = 0.2;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();

      await new Promise((resolve) => setTimeout(resolve, 1200));
      oscillator.stop();

      update(
        'output',
        context.state === 'running' ? PASS : FAIL,
        `حالة الصوت: ${context.state} · لازم تكون سمعت نغمة`
      );
      context.close();
    } catch (error) {
      update('output', FAIL, `${error.name} - ${error.message}`);
    }

    // ═══ ٣ عنصر الصوت ═══
    update('element', RUNNING);
    try {
      const audio = new Audio();
      audio.src = audioUrl;
      audio.preload = 'metadata';
      audio.volume = 1;

      const outcome = await waitForAudio(audio, 15000);
      const mediaError = audio.error
        ? MEDIA_ERROR_NAMES[audio.error.code] || `كود ${audio.error.code}`
        : 'مفيش';

      let played = 'ما اتجربش';
      if (outcome !== 'error' && outcome !== 'timeout') {
        try {
          await audio.play();
          await new Promise((resolve) => setTimeout(resolve, 3000));
          played = `الوقت وصل ${audio.currentTime.toFixed(2)} ثانية`;
        } catch (error) {
          played = `التشغيل اترفض: ${error.name}`;
        }
      }

      const duration = Number.isFinite(audio.duration) ? `${Math.round(audio.duration)} ثانية` : 'مش معروفة';

      update(
        'element',
        audio.currentTime > 0 ? PASS : FAIL,
        `النتيجة: ${outcome} · المدة: ${duration} · readyState: ${audio.readyState} · ` +
          `الخطأ: ${mediaError} · ${played}`
      );

      audio.pause();
      audio.src = '';
    } catch (error) {
      update('element', FAIL, `${error.name} - ${error.message}`);
    }

    // ═══ ٤ معلومات الجهاز ═══
    const connection = navigator.connection || {};
    update(
      'device',
      PASS,
      [
        navigator.userAgent,
        `نوع الاتصال: ${connection.effectiveType || 'مش معروف'}`,
        `توفير البيانات: ${connection.saveData === undefined ? 'مش معروف' : connection.saveData}`,
        `الرابط: ${audioUrl}`
      ].join('\n')
    );

    setRunning(false);
  }, [update]);

  const tests = [
    { key: 'network', title: '١ · الشبكة', hint: 'الملف بيوصل للجهاز؟' },
    { key: 'output', title: '٢ · مخرج الصوت', hint: 'نغمة مولّدة محلياً - المفروض تسمعها' },
    { key: 'element', title: '٣ · تشغيل الملف', hint: 'المتصفح بيقدر يشغّل التلاوة؟' },
    { key: 'device', title: '٤ · الجهاز', hint: 'معلومات للتشخيص' }
  ];

  const asText = tests
    .map(({ key, title }) => {
      const result = results[key];
      if (!result) return `${title}: لسه`;
      return `${title}: ${STATUS_LABELS[result.status]}\n${result.detail || ''}`;
    })
    .join('\n\n');

  const copy = useCallback(() => {
    navigator.clipboard?.writeText(asText).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {}
    );
  }, [asText]);

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">تشخيص الصوت</h1>
      <p className="text-content-secondary text-sm mb-6">
        بيشغّل أربع اختبارات على الجهاز ده بالذات. كل واحد بيعزل طبقة، فالنتيجة بتقول
        المشكلة فين بالظبط بدل ما نخمّن.
      </p>

      <div className="flex gap-3 mb-6">
        <button
          onClick={run}
          disabled={running}
          className="flex items-center gap-2 bg-spotify-green text-on-accent font-semibold px-5 py-3 rounded-full disabled:opacity-50"
        >
          <Play size={18} />
          {running ? 'بيشتغل...' : 'ابدأ الاختبار'}
        </button>

        <button
          onClick={copy}
          disabled={!Object.keys(results).length}
          className="flex items-center gap-2 border border-gray-700 px-5 py-3 rounded-full disabled:opacity-40"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? 'اتنسخ' : 'انسخ النتيجة'}
        </button>
      </div>

      <div className="space-y-3">
        {tests.map(({ key, title, hint }) => {
          const result = results[key] || { status: PENDING };

          return (
            <div key={key} className="bg-spotify-lightGray/40 border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h2 className="font-semibold">{title}</h2>
                <span className={`text-sm font-semibold ${STATUS_STYLES[result.status]}`}>
                  {STATUS_LABELS[result.status]}
                </span>
              </div>

              <p className="text-content-muted text-xs mb-2">{hint}</p>

              {result.detail && (
                <pre
                  dir="ltr"
                  className="text-[11px] leading-relaxed text-content-secondary whitespace-pre-wrap break-all bg-black/40 rounded-lg p-3 overflow-x-auto"
                >
                  {result.detail}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
