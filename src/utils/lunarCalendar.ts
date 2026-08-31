import { DailyLunarInfo } from "../types";

const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const NAP_AM = [
  "Hải Trung Kim", "Lư Trung Hỏa", "Đại Lâm Mộc", "Lộ Bàng Thổ", "Kiếm Phong Kim",
  "Sơn Đầu Hỏa", "Giản Hạ Thủy", "Thành Đầu Thổ", "Bạch Lạp Kim", "Dương Liễu Mộc",
  "Tuyền Trung Thủy", "Ốc Thượng Thổ", "Tích Lịch Hỏa", "Tùng Bách Mộc", "Trường Lưu Thủy",
  "Sa Trung Kim", "Sơn Hạ Hỏa", "Bình Địa Mộc", "Bích Thượng Thổ", "Kim Bạch Kim",
  "Phúc Đăng Hỏa", "Thiên Hà Thủy", "Đại Trạch Thổ", "Thoa Xuyến Kim", "Tang Đố Mộc",
  "Đại Khê Thủy", "Sa Trung Thổ", "Thiên Thượng Hỏa", "Thạch Lựu Mộc", "Đại Hải Thủy"
];

// Simplified accurate lunar approximation for presentation & energy overview
export function getDailyLunarInfo(date: Date = new Date()): DailyLunarInfo {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  // Julian day count approximation for Vietnam timezone (UTC+7)
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  const canDayIdx = (jd + 9) % 10;
  const chiDayIdx = (jd + 1) % 12;
  const canChiDay = `${CAN[canDayIdx]} ${CHI[chiDayIdx]}`;

  const canYearIdx = (year + 6) % 10;
  const chiYearIdx = (year + 8) % 12;
  const canChiYear = `${CAN[canYearIdx]} ${CHI[chiYearIdx]}`;

  const canMonthIdx = (year * 12 + month + 3) % 10;
  const chiMonthIdx = (month + 1) % 12;
  const canChiMonth = `${CAN[canMonthIdx]} ${CHI[chiMonthIdx]}`;

  const napAmIdx = Math.floor((canDayIdx * 6 + chiDayIdx) / 2) % NAP_AM.length;
  const element = NAP_AM[napAmIdx] || "Thiên Thượng Hỏa";

  // Approximate lunar day and month (synodic month ~29.53 days)
  const lunarCycle = ((jd - 2451550.1) / 29.53058867) % 1;
  const lunarDay = Math.floor(lunarCycle * 29.53) + 1;
  const lunarMonth = ((month + 10) % 12) + 1; // Approx alignment
  const lunarYear = year;

  const luckyHours = [
    "Tý (23h - 01h)",
    "Sửu (01h - 03h)",
    "Thìn (07h - 09h)",
    "Tỵ (09h - 11h)",
    "Mùi (13h - 15h)",
    "Tuất (19h - 21h)"
  ];

  const unluckyHours = [
    "Dần (03h - 05h)",
    "Mão (05h - 07h)",
    "Ngọ (11h - 13h)",
    "Thân (15h - 17h)"
  ];

  const suitableActivities = [
    "Cầu tài lộc, ký kết hợp đồng",
    "Gặp gỡ quý nhân, mở rộng quan hệ",
    "Học tập, chiêm nghiệm, tĩnh tâm",
    "Khai trương, xuất hành hướng Nam"
  ];

  const unsuitableActivities = [
    "Tranh cãi, đôi co bốc đồng",
    "Cho vay mượn tiền bạc thiếu giấy tờ",
    "Làm việc quá sức đêm muộn"
  ];

  return {
    solarDate: `Thứ ${date.getDay() === 0 ? "Chủ Nhật" : date.getDay() + 1}, ngày ${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year}`,
    lunarDateStr: `Ngày ${lunarDay} tháng ${lunarMonth} năm ${canChiYear}`,
    lunarDay,
    lunarMonth,
    lunarYear,
    canChiDay,
    canChiMonth,
    canChiYear,
    element,
    zodiacDay: `Ngày ${canChiDay} (${CHI[chiDayIdx]} - Hoàng Đạo)`,
    luckyHours,
    unluckyHours,
    suitableActivities,
    unsuitableActivities
  };
}
