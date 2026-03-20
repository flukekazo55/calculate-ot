const localeMap = { th: "th-TH", en: "en-US" };
const translations = {
  th: {
    appTitle: "Calculate OT (V1.0)",
    heading: "ตัวคิดเวลา OT",
    heroCaption:
      "ติดตามยอด OT ปัจจุบัน บันทึกเพิ่ม และใช้ชดเชยได้จากหน้าจอเดียว",
    entryCountLabel: "รายการทั้งหมด",
    lastUpdateLabel: "อัปเดตล่าสุด",
    lastUpdateEmpty: "ยังไม่มีข้อมูล",
    recordPanelHint: "คำนวณตามประเภทวันแล้วบันทึกเข้าเวลาสะสม",
    usePanelHint: "หัก OT ออกจากยอดคงเหลือพร้อมบันทึกหมายเหตุ",
    historyPanelHint: "รายการล่าสุดจะถูกแสดงด้านบนพร้อมสรุปยอดคงเหลือ",
    historyCountLabel: "รายการ",
    historyEmpty: "ยังไม่มีประวัติ OT เริ่มบันทึกรายการแรกได้เลย",
    backendUnavailable: "Backend API ไม่พร้อมใช้งาน",
    useHistoryDetail: (beforeText, afterText) =>
      `ยอดคงเหลือ ${beforeText} -> ${afterText}`,
    calcCardTitle: "บันทึก OT",
    dayTypeLabel: "ประเภทวัน",
    "dayType.weekday": "วันธรรมดา (จ.-ศ.)",
    "dayType.weekend": "เสาร์ / อาทิตย์",
    "dayType.holiday": "วันหยุดพิเศษ",
    activityLabel: "กิจกรรม",
    activityPlaceholder: "เช่น แก้ระบบหลังบ้าน",
    startLabel: "เริ่ม (24 ชม.)",
    endLabel: "สิ้นสุด (24 ชม.)",
    calcBtn: "คำนวณ & บันทึก",
    resetBtn: "ล้างข้อมูลทั้งหมด",
    useCardTitle: "ใช้ OT",
    useTimeLabel: "เวลาที่ใช้ (hh:mm)",
    useTimePlaceholder: "เช่น 02:30",
    useNoteLabel: "หมายเหตุ",
    useNotePlaceholder: "เช่น ใช้ชดเชย #Leave",
    useBtn: "บันทึกการใช้ OT",
    historyTitle: "ประวัติทั้งหมด",
    grandTotalLabel: "รวมทั้งหมด",
    initBalanceLabel: "ยอด OT ปัจจุบันทั้งหมด",
    languageLabel: "ภาษา",
    langThai: "ภาษาไทย",
    langEnglish: "ภาษาอังกฤษ",
    syncBtn: "ซิงก์ Git",
    syncingTitle: "กำลังซิงก์...",
    syncingMessage: "กำลังซิงก์และดึงข้อมูล data.json กับ Git",
    syncSuccess: "ซิงก์ Git สำเร็จแล้ว",
    syncPulled: "ดึงข้อมูลล่าสุดจาก Git แล้ว",
    syncNoChanges: "ไม่มีการเปลี่ยนแปลงใหม่ใน data.json",
    syncError: "ซิงก์ Git ล้มเหลว",
    okBtn: "ตกลง",
    cancelBtn: "ยกเลิก",
    infoTitle: "แจ้งเตือน",
    successTitle: "สำเร็จ",
    errorTitle: "เกิดข้อผิดพลาด",
    confirmResetTitle: "ยืนยันการล้างข้อมูล?",
    defaultActivity: "ไม่ระบุ",
    useDefaultNote: "ใช้ OT",
    confirmReset: "ล้างข้อมูลทั้งหมด?",
    resetSuccess: "ล้างข้อมูลเรียบร้อยแล้ว",
    calcInvalidRange: "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม",
    calcSuccess: (activity, durationText) =>
      `บันทึกสำเร็จ: ${activity} (${durationText})`,
    useInvalidFormat: "กรอกเวลาแบบ hh:mm เช่น 02:30",
    useOverLimit: "❌ ใช้ OT เกินยอดที่มีอยู่!",
    useAlert: (usedText, remainText) =>
      `ใช้ OT ไป ${usedText}, เหลือ ${remainText}`,
    formatUseEntry: ({ note, dateText, usedText, beforeText, afterText }) =>
      `[${note}] วันที่ ${dateText} [ใช้ ${usedText}] ใช้วันหยุด OT จาก [${beforeText}] เหลือ [${afterText}] #Leave`,
    hourUnit: "ชั่วโมง",
    minuteUnit: "นาที",
  },
  en: {
    appTitle: "Calculate OT (V1.0)",
    heading: "Calculate OT",
    heroCaption:
      "Track the current OT balance, add new entries, and record OT usage from one screen.",
    entryCountLabel: "Total entries",
    lastUpdateLabel: "Last updated",
    lastUpdateEmpty: "No data yet",
    recordPanelHint: "Calculate OT based on day type and add it to the balance.",
    usePanelHint: "Deduct OT from the remaining balance with an optional note.",
    historyPanelHint: "Newest items appear first together with the running balance.",
    historyCountLabel: "entries",
    historyEmpty: "No OT history yet. Add your first entry to get started.",
    backendUnavailable: "Backend API is unavailable",
    useHistoryDetail: (beforeText, afterText) =>
      `Balance ${beforeText} -> ${afterText}`,
    calcCardTitle: "Add OT Entry",
    dayTypeLabel: "Day Type",
    "dayType.weekday": "Weekday (Mon-Fri)",
    "dayType.weekend": "Weekend / Day Off",
    "dayType.holiday": "Holiday",
    activityLabel: "Activity",
    activityPlaceholder: "e.g., Fix back office system",
    startLabel: "Start (24h)",
    endLabel: "End (24h)",
    calcBtn: "Calculate & Save",
    resetBtn: "Clear All",
    useCardTitle: "Use OT",
    useTimeLabel: "Time to use (hh:mm)",
    useTimePlaceholder: "e.g., 02:30",
    useNoteLabel: "Note",
    useNotePlaceholder: "e.g., Offset #Leave",
    useBtn: "Save OT Usage",
    historyTitle: "Full History",
    grandTotalLabel: "Total",
    initBalanceLabel: "Current OT Balance",
    languageLabel: "Language",
    langThai: "Thai",
    langEnglish: "English",
    syncBtn: "Sync Git",
    syncingTitle: "Syncing...",
    syncingMessage: "Syncing data.json with Git (pull/push)",
    syncSuccess: "Git sync completed",
    syncPulled: "Pulled latest data from Git",
    syncNoChanges: "No new changes to push",
    syncError: "Git sync failed",
    okBtn: "OK",
    cancelBtn: "Cancel",
    infoTitle: "Notice",
    successTitle: "Success",
    errorTitle: "Something went wrong",
    confirmResetTitle: "Reset all data?",
    defaultActivity: "Unspecified",
    useDefaultNote: "Use OT",
    confirmReset: "Clear every record?",
    resetSuccess: "All records have been cleared.",
    calcInvalidRange: "End time must be later than start time",
    calcSuccess: (activity, durationText) =>
      `Saved successfully: ${activity} (${durationText})`,
    useInvalidFormat: "Enter time as hh:mm, e.g., 02:30",
    useOverLimit: "❌ You cannot use more OT than you have!",
    useAlert: (usedText, remainText) =>
      `Used OT ${usedText}, remaining ${remainText}`,
    formatUseEntry: ({ note, dateText, usedText, beforeText, afterText }) =>
      `[${note}] Date ${dateText} [Used ${usedText}] OT bank from [${beforeText}] left [${afterText}] #Leave`,
    hourUnit: "hours",
    minuteUnit: "minutes",
  },
};

let currentLang = localStorage.getItem("otLang") || "th";
if (!translations[currentLang]) currentLang = "th";

const jq = window.jQuery || null;
const API_BASE_STORAGE_KEY = "otApiBase";
const API_QUERY_PARAM = "api";
const $ = (selector) => document.querySelector(selector);

function t(key, ...args) {
  const pack = translations[currentLang] || translations.th;
  const value = pack[key];
  if (typeof value === "function") return value(...args);
  return value ?? key;
}

function normalizeApiBase(input) {
  if (!input) return "";
  let value = String(input).trim();
  if (!value) return "";
  if (/^\/\//.test(value)) {
    value = `https:${value}`;
  } else if (
    !/^https?:\/\//i.test(value) &&
    /^[a-z0-9.-]+\.[a-z]{2,}(:\d+)?(\/.*)?$/i.test(value)
  ) {
    value = `https://${value}`;
  }
  return value.replace(/\/+$/, "");
}

const API_BASE_FROM_CONFIG = normalizeApiBase(
  window.__APP_CONFIG?.API_BASE || ""
);

function resolveApiBase() {
  try {
    const params = new URLSearchParams(window.location.search);
    const queryValue = normalizeApiBase(params.get(API_QUERY_PARAM));
    if (queryValue) {
      localStorage.setItem(API_BASE_STORAGE_KEY, queryValue);
      return queryValue;
    }
  } catch {}
  if (API_BASE_FROM_CONFIG) {
    localStorage.setItem(API_BASE_STORAGE_KEY, API_BASE_FROM_CONFIG);
    return API_BASE_FROM_CONFIG;
  }
  return normalizeApiBase(localStorage.getItem(API_BASE_STORAGE_KEY));
}

const apiBase = resolveApiBase();

function getLocale(lang = currentLang) {
  return localeMap[lang] || localeMap.en;
}

function toHM(hours, lang = currentLang) {
  const pack = translations[lang] || translations.th;
  const totalMinutes = Math.max(0, Math.round(Math.abs(hours) * 60));
  const H = Math.floor(totalMinutes / 60);
  const M = totalMinutes % 60;
  return {
    H,
    M,
    text: `${H} ${pack.hourUnit} ${M} ${pack.minuteUnit}`,
  };
}

function toCompactHM(hours, lang = currentLang) {
  const totalMinutes = Math.max(0, Math.round(Math.abs(hours) * 60));
  const H = Math.floor(totalMinutes / 60);
  const M = totalMinutes % 60;
  if (lang === "th") return `${H}ชม. ${M}น.`;
  return `${H}h ${M}m`;
}

function toClockHM(hours) {
  const totalMinutes = Math.max(0, Math.round(Math.abs(hours) * 60));
  const H = Math.floor(totalMinutes / 60);
  const M = totalMinutes % 60;
  return `${String(H).padStart(2, "0")}:${String(M).padStart(2, "0")}`;
}

function parseTime(timeText) {
  const [h, m] = timeText.split(":").map(Number);
  return h * 60 + m;
}

const LUNCH_START = parseTime("12:00");
const LUNCH_END = parseTime("13:00");

function splitLunch(start, end) {
  if (end <= start) return [];
  if (end <= LUNCH_START || start >= LUNCH_END) return [[start, end]];
  const segments = [];
  if (start < LUNCH_START) {
    segments.push([start, Math.min(end, LUNCH_START)]);
  }
  if (end > LUNCH_END) {
    segments.push([Math.max(start, LUNCH_END), end]);
  }
  return segments.filter(([segStart, segEnd]) => segEnd > segStart);
}

function parseHHMM(text) {
  if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(text)) return null;
  const [h, m] = text.split(":").map(Number);
  return h * 60 + m;
}

const defaultTitleByIcon = {
  success: "successTitle",
  error: "errorTitle",
  info: "infoTitle",
  warning: "infoTitle",
};

let backendAvailable = true;

function setBackendAvailability(available) {
  backendAvailable = available;
  const syncBtn = document.getElementById("syncBtn");
  if (!syncBtn) return;
  syncBtn.disabled = !available;
  syncBtn.title = available ? "" : t("backendUnavailable");
}

function buildApiUrl(path) {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  if (!apiBase) return `./${normalized}`;
  return `${apiBase}/${normalized}`;
}

async function fetchApi(path, options = {}) {
  if (!backendAvailable) return null;
  try {
    const response = await fetch(buildApiUrl(path), options);
    if (response.status === 404) {
      setBackendAvailability(false);
    }
    return response;
  } catch {
    setBackendAvailability(false);
    return null;
  }
}

function showAlertModal({ icon = "info", titleKey, text = "" }) {
  const resolvedKey = titleKey || defaultTitleByIcon[icon];
  const resolvedTitle = resolvedKey ? t(resolvedKey) : "";
  return Swal.fire({
    icon,
    title: resolvedTitle,
    text,
    confirmButtonText: t("okBtn"),
    heightAuto: false,
  });
}

const showError = (text) => showAlertModal({ icon: "error", text });
const showSuccess = (text) => showAlertModal({ icon: "success", text });
const showInfo = (text) => showAlertModal({ icon: "info", text });

function patchNativeAlerts() {
  const patched = (message) => {
    const text = message === undefined || message === null ? "" : String(message);
    showInfo(text);
  };
  window.alert = patched;
  try {
    console.alert = patched;
  } catch {
    console.log("console.alert override not supported.");
  }
}

function updateLanguageToggleUI() {
  const toggle = document.getElementById("languageToggle");
  const wrapper = document.getElementById("languageSwitcher");
  const flag = document.getElementById("languageFlag");
  const textEl = document.getElementById("languageToggleText");
  if (!toggle) return;
  const isEn = toggle.checked;
  const langName = isEn ? t("langEnglish") : t("langThai");
  if (flag) {
    flag.classList.toggle("switcher-flag--en", isEn);
    flag.classList.toggle("switcher-flag--th", !isEn);
  }
  if (textEl) {
    textEl.textContent = langName;
  }
  if (wrapper) {
    wrapper.classList.toggle("switcher--en", isEn);
    wrapper.classList.toggle("switcher--th", !isEn);
    wrapper.classList.toggle("switcher--focus", toggle === document.activeElement);
    wrapper.setAttribute("aria-label", `${t("languageLabel")}: ${langName}`);
    if (jq) jq(wrapper).toggleClass("is-checked", isEn);
  }
}

function setupLanguageToggle() {
  const toggle = document.getElementById("languageToggle");
  if (!toggle) return;
  toggle.checked = currentLang === "en";
  updateLanguageToggleUI();
  toggle.addEventListener("change", (event) => {
    const nextLang = event.target.checked ? "en" : "th";
    currentLang = translations[nextLang] ? nextLang : "th";
    localStorage.setItem("otLang", currentLang);
    updateLanguageToggleUI();
    applyTranslations();
  });
  toggle.addEventListener("focus", () =>
    document.getElementById("languageSwitcher")?.classList.add("switcher--focus")
  );
  toggle.addEventListener("blur", () =>
    document
      .getElementById("languageSwitcher")
      ?.classList.remove("switcher--focus")
  );
}

async function confirmAction({
  titleKey = "confirmResetTitle",
  textKey = "confirmReset",
} = {}) {
  const result = await Swal.fire({
    icon: "warning",
    title: t(titleKey),
    text: t(textKey),
    showCancelButton: true,
    confirmButtonText: t("okBtn"),
    cancelButtonText: t("cancelBtn"),
    focusCancel: true,
    heightAuto: false,
  });
  return result.isConfirmed;
}

function calcWeighted(type, start, end) {
  const boundary = parseTime("17:00");
  const segments = splitLunch(start, end);
  let weightedMin = 0;
  segments.forEach(([segStart, segEnd]) => {
    const segDur = segEnd - segStart;
    if (type === "weekday") {
      weightedMin += segDur * 1.5;
    } else if (type === "holiday") {
      weightedMin += segDur * 2;
    } else {
      if (segEnd <= boundary) weightedMin += segDur;
      else if (segStart >= boundary) weightedMin += segDur * 1.5;
      else weightedMin += (boundary - segStart) * 1 + (segEnd - boundary) * 1.5;
    }
  });
  return { weightedMin };
}

function getDayTypeLabel(dayType) {
  if (dayType === "weekday" || dayType === "weekend" || dayType === "holiday") {
    return t(`dayType.${dayType}`);
  }
  if (dayType === "use") return t("useCardTitle");
  return dayType || "-";
}

function getLastUpdateText() {
  const lastUpdate = localStorage.getItem("otLastUpdate");
  return lastUpdate || t("lastUpdateEmpty");
}

function formatRecordDate(record) {
  if (!record) return "-";
  if (record.date) return record.date;
  if (record.timestamp) {
    return new Date(record.timestamp).toLocaleDateString(getLocale());
  }
  return "-";
}

function formatUseSummary(record) {
  const dateText = formatRecordDate(record);
  const meta = record.meta;
  if (meta && typeof meta.spentHours === "number") {
    return t("formatUseEntry", {
      note: record.activity,
      dateText,
      usedText: toHM(meta.spentHours).text,
      beforeText: toHM(meta.beforeHours || 0).text,
      afterText: toHM(meta.afterHours || 0).text,
    });
  }
  return record.formatted || record.activity || "";
}

function formatUseHistoryDetail(record) {
  const meta = record.meta;
  if (meta && typeof meta.spentHours === "number") {
    return t(
      "useHistoryDetail",
      toHM(meta.beforeHours || 0).text,
      toHM(meta.afterHours || 0).text
    );
  }
  return formatUseSummary(record);
}

function getUseTag(record) {
  const note = String(record?.activity || "").trim();
  const match = note.match(/#[A-Za-z0-9_-]+/);
  return match ? match[0] : t("useCardTitle");
}

function renderEmptyState(summary) {
  const empty = document.createElement("div");
  empty.className = "history-empty";

  const icon = document.createElement("span");
  icon.className = "material-symbols-outlined";
  icon.textContent = "schedule";

  const text = document.createElement("p");
  text.textContent = t("historyEmpty");

  empty.appendChild(icon);
  empty.appendChild(text);
  summary.appendChild(empty);
}

function createHistoryItem(record) {
  const isUseRecord = record?.type === "use" || Number(record?.value || 0) < 0;
  const item = document.createElement("article");
  item.className = `history-item${isUseRecord ? " history-item--use" : ""}`;
  item.setAttribute("role", "listitem");

  const top = document.createElement("div");
  top.className = "history-item__top";

  const copy = document.createElement("div");
  const kind = document.createElement("p");
  kind.className = "history-kind";
  kind.textContent = isUseRecord ? t("useCardTitle") : t("calcCardTitle");

  const title = document.createElement("h3");
  title.className = "history-title";
  title.textContent = record.activity || t("defaultActivity");

  copy.appendChild(kind);
  copy.appendChild(title);

  const amount = document.createElement("div");
  amount.className = "history-amount";
  amount.textContent = `${isUseRecord ? "-" : "+"} ${toClockHM(record.value)}`;

  top.appendChild(copy);
  top.appendChild(amount);

  const detail = document.createElement("p");
  detail.className = "history-detail";
  detail.textContent = isUseRecord
    ? formatUseHistoryDetail(record)
    : toHM(record.value).text;

  const meta = document.createElement("div");
  meta.className = "history-meta";

  const dateWrap = document.createElement("span");
  dateWrap.className = "history-date";

  const dateIcon = document.createElement("span");
  dateIcon.className = "material-symbols-outlined";
  dateIcon.setAttribute("aria-hidden", "true");
  dateIcon.textContent = "calendar_today";

  const dateText = document.createElement("span");
  dateText.textContent = formatRecordDate(record);

  dateWrap.appendChild(dateIcon);
  dateWrap.appendChild(dateText);

  const chip = document.createElement("span");
  chip.className = "history-chip";
  chip.textContent = isUseRecord
    ? getUseTag(record)
    : getDayTypeLabel(record.dayType);

  meta.appendChild(dateWrap);
  meta.appendChild(chip);

  item.appendChild(top);
  item.appendChild(detail);
  item.appendChild(meta);
  return item;
}

function renderSummary(showInit = false) {
  const list = JSON.parse(localStorage.getItem("otRecords") || "[]");
  const summary = $("#summaryList");
  if (!summary) return;

  summary.innerHTML = "";
  const total = list.reduce((acc, item) => acc + Number(item.value || 0), 0);
  const totalText = toHM(total).text;

  const heroTotalValue = $("#heroTotalValue");
  if (heroTotalValue) heroTotalValue.textContent = toCompactHM(total);

  const totalBox = $("#grandTotal");
  if (totalBox) totalBox.textContent = totalText;

  const initBox = $("#initBalance");
  if (initBox) {
    const shouldShow = showInit || initBox.style.display === "inline-flex";
    if (shouldShow) {
      initBox.textContent = `${t("initBalanceLabel")}: ${totalText}`;
      initBox.style.display = "inline-flex";
    } else {
      initBox.style.display = "none";
    }
  }

  const recordCountValue = $("#recordCountValue");
  if (recordCountValue) recordCountValue.textContent = String(list.length);

  const summaryCount = $("#summaryCount");
  if (summaryCount) summaryCount.textContent = String(list.length);

  const lastUpdateValue = $("#lastUpdateValue");
  if (lastUpdateValue) lastUpdateValue.textContent = getLastUpdateText();

  if (!list.length) {
    renderEmptyState(summary);
    return;
  }

  [...list].reverse().forEach((record) => {
    summary.appendChild(createHistoryItem(record));
  });
}

async function loadData() {
  const localRecords = JSON.parse(localStorage.getItem("otRecords") || "[]");
  try {
    const response = await fetchApi("load");
    if (!response || !response.ok) throw new Error("load_unavailable");
    const data = await response.json();
    localStorage.setItem("otRecords", JSON.stringify(data.records));
    localStorage.setItem("otLastUpdate", data.lastUpdate);
    renderSummary(true);
  } catch {
    renderSummary(localRecords.length > 0);
  }
}

async function saveData() {
  if (!backendAvailable) return;
  const data = {
    records: JSON.parse(localStorage.getItem("otRecords") || "[]"),
    lastUpdate: new Date().toLocaleString(getLocale()),
  };
  const response = await fetchApi("save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response || !response.ok) return;
}

async function resetData() {
  const confirmed = await confirmAction();
  if (!confirmed) return;
  if (backendAvailable) {
    await fetchApi("reset", { method: "POST" });
  }
  localStorage.clear();
  renderSummary();
  await showSuccess(t("resetSuccess"));
}

async function calc() {
  const type = $("#dayType").value;
  const actInput = $("#activity");
  const activity = (actInput?.value || "").trim() || t("defaultActivity");
  const start = parseTime($("#startTime").value);
  const end = parseTime($("#endTime").value);
  if (end <= start) {
    await showError(t("calcInvalidRange"));
    return;
  }
  const { weightedMin } = calcWeighted(type, start, end);
  const earnedHours = weightedMin / 60;
  saveRecord("earn", earnedHours, activity, type);
  await showSuccess(t("calcSuccess", activity, toHM(earnedHours).text));
}

async function useOT() {
  const timeText = ($("#useTime").value || "").trim();
  const min = parseHHMM(timeText);
  if (min === null) {
    await showError(t("useInvalidFormat"));
    return;
  }
  const hr = min / 60;
  const note = ($("#useNote").value || "").trim() || t("useDefaultNote");
  const list = JSON.parse(localStorage.getItem("otRecords") || "[]");
  const before = list.reduce((a, b) => a + Number(b.value || 0), 0);
  const after = before - hr;
  if (after < 0) {
    await showError(t("useOverLimit"));
    return;
  }

  const locale = getLocale();
  const dateText = new Date().toLocaleDateString(locale);
  const formatted = t("formatUseEntry", {
    note,
    dateText,
    usedText: toHM(hr).text,
    beforeText: toHM(before).text,
    afterText: toHM(after).text,
  });
  const meta = {
    spentHours: hr,
    beforeHours: before,
    afterHours: after,
  };
  saveRecord("use", -hr, note, "use", formatted, meta);
  await showSuccess(t("useAlert", toHM(hr).text, toHM(after).text));
}

async function syncGit() {
  if (!backendAvailable) {
    await showInfo(t("backendUnavailable"));
    return;
  }

  const btn = document.getElementById("syncBtn");
  if (btn) btn.disabled = true;

  try {
    Swal.fire({
      title: t("syncingTitle"),
      text: t("syncingMessage"),
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await fetchApi("sync", { method: "POST" });
    if (!response) throw new Error("sync_unavailable");

    let data = {};
    try {
      data = await response.json();
    } catch (err) {
      console.error(err);
    }

    Swal.close();

    if (!response.ok || data.error) {
      throw new Error(data.details || data.error || "sync_failed");
    }

    if (data && data.syncedData) {
      const syncedRecords = Array.isArray(data.syncedData.records)
        ? data.syncedData.records
        : [];
      const syncedLastUpdate =
        typeof data.syncedData.lastUpdate === "string"
          ? data.syncedData.lastUpdate
          : "";
      localStorage.setItem("otRecords", JSON.stringify(syncedRecords));
      localStorage.setItem("otLastUpdate", syncedLastUpdate);
      renderSummary(true);
    }

    if (data.message === "pulled") {
      await showSuccess(t("syncPulled"));
    } else if (data.message === "no_changes") {
      await showInfo(t("syncNoChanges"));
    } else {
      await showSuccess(t("syncSuccess"));
    }
  } catch (err) {
    Swal.close();
    await showError(`${t("syncError")}${err?.message ? ` (${err.message})` : ""}`);
  } finally {
    if (btn) btn.disabled = !backendAvailable;
  }
}

function saveRecord(type, value, activity, dayType, formatted = "", meta = null) {
  const list = JSON.parse(localStorage.getItem("otRecords") || "[]");
  const locale = getLocale();
  const now = new Date();
  const record = {
    id: now.getTime(),
    date: now.toLocaleDateString(locale),
    type,
    activity,
    dayType,
    value,
  };

  if (formatted) record.formatted = formatted;
  if (meta && Object.keys(meta).length) record.meta = meta;

  list.push(record);
  localStorage.setItem("otRecords", JSON.stringify(list));
  localStorage.setItem("otLastUpdate", new Date().toLocaleString(locale));
  saveData();
  renderSummary();
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.title = t("appTitle");

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    const value = t(key);
    if (typeof value === "string") node.textContent = value;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.getAttribute("data-i18n-placeholder");
    const value = t(key);
    if (typeof value === "string") {
      node.setAttribute("placeholder", value);
    }
  });

  const toggle = document.getElementById("languageToggle");
  if (toggle) {
    toggle.checked = currentLang === "en";
    updateLanguageToggleUI();
  }

  setBackendAvailability(backendAvailable);
  const initVisible = $("#initBalance")?.style.display === "inline-flex";
  renderSummary(initVisible);
}

$("#calcBtn").addEventListener("click", calc);
$("#resetBtn").addEventListener("click", resetData);
$("#useBtn").addEventListener("click", useOT);

const syncBtn = $("#syncBtn");
if (syncBtn) syncBtn.addEventListener("click", syncGit);

patchNativeAlerts();
setupLanguageToggle();
applyTranslations();
setBackendAvailability(true);
loadData();
