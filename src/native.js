import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { BleClient } from "@capacitor-community/bluetooth-le";

const nativeReadyEvent = new Event("orbit-native-ready");

async function sync(alarms, notes, ringtone, timer) {
  await LocalNotifications.requestPermissions();

  const pending = [];

  for (const alarm of alarms || []) {
    if (!alarm.enabled) continue;
    const [hour, minute] = String(alarm.time).split(":").map(Number);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) continue;

    pending.push({
      id: 100000 + Number(alarm.id) % 10000,
      title: alarm.label || "Orbit alarm",
      body: "Your alarm is ringing",
      schedule: {
        at: nextLocalTime(hour, minute),
        repeats: true,
        allowWhileIdle: true
      },
      channelId: ringtone || "pulse",
      extra: { kind: "alarm", alarmId: alarm.id }
    });
  }

  for (const note of notes || []) {
    if (!note.reminder || note.notified) continue;
    pending.push({
      id: 200000 + Number(note.id) % 10000,
      title: "Orbit reminder",
      body: note.text,
      schedule: { at: new Date(note.reminder), allowWhileIdle: true },
      channelId: ringtone || "pulse",
      extra: { kind: "reminder", noteId: note.id }
    });
  }

  if (timer && timer.running) {
    pending.push({
      id: 300001,
      title: "Orbit timer",
      body: "Your countdown is complete",
      schedule: { at: new Date(timer.endAt), allowWhileIdle: true },
      channelId: ringtone || "pulse",
      extra: { kind: "timer" }
    });
  }

  await LocalNotifications.cancel({ notifications: [{ id: 300001 }] }).catch(() => {});
  await LocalNotifications.schedule({ notifications: pending });
}

function nextLocalTime(hour, minute) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  if (date <= new Date()) date.setDate(date.getDate() + 1);
  return date;
}

async function connectClock() {
  await BleClient.initialize();
  const device = await BleClient.requestDevice([]);
  await BleClient.connect(device.deviceId);
  return { name: device.name || device.deviceId };
}

async function disconnectClock() {
  const devices = await BleClient.getConnectedDevices([]);
  await Promise.all(devices.map((device) => BleClient.disconnect(device.deviceId)));
}

window.OrbitNative = {
  isNative: Capacitor.isNativePlatform(),
  sync,
  connectClock,
  disconnectClock
};

window.dispatchEvent(nativeReadyEvent);
