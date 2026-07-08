/**
 * إشعارات محلية لتذكير المستخدم بمواعيده.
 *
 * كل الاستدعاءات محميّة (try/catch) فلا تُعطِب التطبيق على المنصّات التي لا تدعم
 * الإشعارات (مثل الويب أو Expo Go بقيوده). التذكير محلي فقط — لا يتطلّب خادماً.
 */
import * as Notifications from "expo-notifications";

// كيف تظهر الإشعارات والتطبيق مفتوح
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

let asked = false;

/** يطلب إذن الإشعارات مرة واحدة عند الحاجة. يعيد true إن مُنِح. */
export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (asked && !current.canAskAgain) return false;
    asked = true;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch {
    return false;
  }
}

/**
 * يجدول تذكيراً قبل الموعد بساعة (أو بعد ثوانٍ إن كان الموعد قريباً جداً).
 * يعيد معرّف الإشعار لإلغائه لاحقاً، أو null عند التعذّر.
 */
export async function scheduleBookingReminder(opts: {
  salonName: string;
  serviceName: string;
  scheduledAt: string;
}): Promise<string | null> {
  try {
    const granted = await ensureNotificationPermission();
    if (!granted) return null;

    const targetMs = new Date(opts.scheduledAt).getTime() - 60 * 60 * 1000; // قبل ساعة
    const fireAt = new Date(Math.max(targetMs, Date.now() + 5000));

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "تذكير بموعدك في تألق ✨",
        body: `${opts.serviceName} في ${opts.salonName} — اقترب موعدك`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
    });
  } catch {
    return null;
  }
}

/** يلغي تذكيراً مجدولاً (عند إلغاء الحجز). */
export async function cancelReminder(id: string | null | undefined): Promise<void> {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // تجاهل
  }
}
