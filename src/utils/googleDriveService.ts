import { HistoryItem, UserProfile, UserPlantGardenState } from "../types";

const APP_FOLDER_NAME = "A Private Place - Hồ Sơ Huyền Học & Nhật Ký";

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
}

/**
 * Searches for or creates a dedicated Google Drive folder for the application
 */
export async function getOrCreateAppFolder(accessToken: string): Promise<string> {
  const query = encodeURIComponent(
    `name = '${APP_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&spaces=drive`;

  const searchRes = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!searchRes.ok) {
    const errorText = await searchRes.text();
    throw new Error(`Không thể tìm thư mục Google Drive: ${errorText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder if not found
  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: APP_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
      description: "Thư mục lưu trữ sao lưu hồ sơ, lịch sử luận giải & nhật ký tâm thức từ A Private Place",
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Không thể tạo thư mục Google Drive: ${errorText}`);
  }

  const folderData = await createRes.json();
  return folderData.id;
}

/**
 * Uploads a text or JSON file to the application folder in Google Drive
 */
export async function uploadFileToDriveFolder(
  accessToken: string,
  fileName: string,
  content: string,
  mimeType: string = "text/plain",
  description?: string
): Promise<DriveFileItem> {
  const folderId = await getOrCreateAppFolder(accessToken);

  const boundary = "-------314159265358979323846";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: mimeType,
    parents: [folderId],
    description: description || "Tài liệu sao lưu từ A Private Place",
  };

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Lỗi tải tệp lên Google Drive: ${errorText}`);
  }

  return await res.json();
}

/**
 * Lists all files inside the A Private Place folder in Google Drive
 */
export async function listDriveBackups(accessToken: string): Promise<DriveFileItem[]> {
  try {
    const folderId = await getOrCreateAppFolder(accessToken);
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink)&orderBy=modifiedTime desc`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json();
    return data.files || [];
  } catch (err: any) {
    console.error("List drive backups error:", err);
    throw err;
  }
}

/**
 * Deletes a file from Google Drive.
 * NOTE: User confirmation MUST be obtained before invoking this function.
 */
export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Xóa tệp thất bại: ${await res.text()}`);
  }
}

/**
 * Downloads a file content from Google Drive
 */
export async function getDriveFileContent(
  accessToken: string,
  fileId: string
): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Không thể đọc nội dung tệp: ${await res.text()}`);
  }

  return await res.text();
}

/**
 * Formats and exports a single reading (Tử Vi, Natal Chart, Tarot, Kinh Dịch) to Google Drive
 */
export async function exportSingleReadingToDrive(
  accessToken: string,
  item: HistoryItem,
  userProfile?: UserProfile | null
): Promise<DriveFileItem> {
  const dateStr = new Date(item.timestamp).toLocaleDateString("vi-VN").replace(/\//g, "-");
  const typeTitles: Record<string, string> = {
    "tu-vi": "Tu_Vi",
    "natal-chart": "Ban_Do_Sao",
    "tarot": "Tarot",
    "kinh-dich": "Kinh_Dich",
  };
  const prefix = typeTitles[item.type] || "Luan_Giai";
  const cleanTitle = (item.title || "Chiêm Nghiệm")
    .replace(/[^\w\s\u00C0-\u1EF9]/gi, "")
    .trim()
    .slice(0, 30);
  const fileName = `[${prefix}]_${cleanTitle}_${dateStr}.md`;

  const content = `# ✦ A PRIVATE PLACE — BẢN LUẬN GIẢI HUYỀN HỌC ✦
*Không gian riêng tư cho chiêm nghiệm và tĩnh lặng*
--------------------------------------------------
- **Phân hệ**: ${item.type.toUpperCase()}
- **Chủ đề / Tiêu đề**: ${item.title}
${item.aspectOrSpread ? `- **Cung vị / Trải bài**: ${item.aspectOrSpread}` : ""}
${item.question ? `- **Câu hỏi / Vấn đề chiêm nghiệm**: ${item.question}` : ""}
- **Thời gian luận giải**: ${new Date(item.timestamp).toLocaleString("vi-VN")}
- **Hồ sơ mệnh chủ**: ${userProfile?.name || "Bạn tri kỷ"} (${userProfile?.email || "Riêng tư"})
--------------------------------------------------

## NỘI DUNG LUẬN GIẢI CHI TIẾT:

${item.resultMarkdown}

--------------------------------------------------
*Được tạo và tự động lưu trữ từ A Private Place via Google Drive.*
`;

  return await uploadFileToDriveFolder(
    accessToken,
    fileName,
    content,
    "text/markdown",
    `Bản luận giải ${item.type} của ${userProfile?.name || "bạn tri kỷ"}`
  );
}

/**
 * Backs up entire user data (Profile + Readings History + Plant Diary) to Google Drive
 */
export async function backupFullDataToDrive(
  accessToken: string,
  userProfile: UserProfile | null,
  history: HistoryItem[],
  plantGarden: UserPlantGardenState
): Promise<{ jsonFile: DriveFileItem; summaryFile: DriveFileItem }> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5).replace(/:/g, "h");

  // 1. Structured JSON Backup (can be imported back)
  const backupObject = {
    version: "2.0.0",
    appName: "A Private Place",
    exportedAt: now.toISOString(),
    user: userProfile,
    totalReadings: history.length,
    readings: history,
    plantGarden: plantGarden,
  };

  const jsonFileName = `Sao_Luu_Tong_The_${dateStr}_${timeStr}.json`;
  const jsonFile = await uploadFileToDriveFolder(
    accessToken,
    jsonFileName,
    JSON.stringify(backupObject, null, 2),
    "application/json",
    "Tệp sao lưu toàn bộ dữ liệu máy chủ & hồ sơ A Private Place"
  );

  // 2. Human-Readable Document Overview
  let summaryContent = `# ✦ A PRIVATE PLACE — TỔNG HỢP TOÀN BỘ HỒ SƠ & LỊCH SỬ LUẬN GIẢI ✦
Ngày tạo sao lưu: ${now.toLocaleString("vi-VN")}
Chủ nhân: ${userProfile?.name || "Bạn Tri Kỷ"} (${userProfile?.email || "Chưa thiết lập email"})
Tổng số bản luận giải: ${history.length} bản ghi
-------------------------------------------------------------

`;

  if (userProfile?.astroProfile) {
    const ap = userProfile.astroProfile;
    summaryContent += `## 1. THÔNG TIN HỒ SƠ CHIÊM TINH & TỬ VI
- Họ và tên: ${ap.fullName || "Chưa nhập"}
- Ngày sinh: ${ap.birthDate || "Chưa nhập"} (Giờ: ${ap.birthHour || "Chưa nhập"}) - Lịch: ${ap.calendarType === "lunar" ? "Âm Lịch" : "Dương Lịch"}
- Giới tính: ${ap.gender || "Chưa nhập"}
- Nơi sinh: ${ap.birthPlace || "Chưa nhập"}
- Cung Mặt Trời: ${ap.sunSign || "Chưa tính"} | Cung Mặt Trăng: ${ap.moonSign || "Chưa tính"} | Cung Mọc: ${ap.risingSign || "Chưa tính"}

-------------------------------------------------------------
`;
  }

  summaryContent += `## 2. NƠI XẢ BỎ NỖI NIỀM & MANIFEST ĐIỀU TỐT ĐẸP
- Cấp độ an tâm: Cấp ${plantGarden.level} (${plantGarden.totalExp || plantGarden.exp || 0} EXP)
- Tổng số lần manifest điều tốt đẹp: ${plantGarden.waterCount || 0}
- Tổng số lần xả bỏ nỗi niềm: ${plantGarden.weedCount || 0}
- Số mục nhật ký đã lưu: ${plantGarden.entries?.length || 0} dòng tâm sự

-------------------------------------------------------------
## 3. DANH SÁCH ${history.length} BẢN LUẬN GIẢI ĐÃ LƯU:

`;

  history.forEach((h, idx) => {
    summaryContent += `### [${idx + 1}] ${h.title} (${h.type.toUpperCase()})
- Thời gian: ${new Date(h.timestamp).toLocaleString("vi-VN")}
${h.question ? `- Câu hỏi: ${h.question}` : ""}
${h.aspectOrSpread ? `- Phân loại: ${h.aspectOrSpread}` : ""}

${h.resultMarkdown}

-------------------------------------------------------------
`;
  });

  const summaryFileName = `Ho_So_Tong_Hop_Luan_Giai_${dateStr}_${timeStr}.md`;
  const summaryFile = await uploadFileToDriveFolder(
    accessToken,
    summaryFileName,
    summaryContent,
    "text/markdown",
    "Bản tổng hợp dễ đọc tất cả luận giải và hồ sơ của bạn"
  );

  return { jsonFile, summaryFile };
}

// =========================================================================
// Subfolders Management (Nhạc Thiền & Lá Số Tử Vi / Bản Đồ Sao)
// =========================================================================

export async function getOrCreateSubFolder(
  accessToken: string,
  subFolderName: string
): Promise<string> {
  const rootFolderId = await getOrCreateAppFolder(accessToken);
  const query = encodeURIComponent(
    `name = '${subFolderName}' and '${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&spaces=drive`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // Create subfolder
  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: subFolderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [rootFolderId],
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Không thể tạo thư mục '${subFolderName}': ${errorText}`);
  }

  const folderData = await createRes.json();
  return folderData.id;
}

/**
 * Uploads binary file (Audio, Image) to Google Drive via multipart
 */
export async function uploadBinaryFileToDrive(
  accessToken: string,
  fileName: string,
  blob: Blob,
  mimeType: string,
  parentFolderId?: string,
  description?: string
): Promise<DriveFileItem> {
  const targetFolderId = parentFolderId || (await getOrCreateAppFolder(accessToken));

  const metadata = {
    name: fileName,
    mimeType: mimeType,
    parents: [targetFolderId],
    description: description || "Tệp sao lưu đa phương tiện từ A Private Place",
  };

  const boundary = "-------drive_upload_boundary_" + Date.now();
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  // Read blob as ArrayBuffer
  const arrayBuffer = await blob.arrayBuffer();
  const metadataPart = new TextEncoder().encode(
    delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\nContent-Transfer-Encoding: binary\r\n\r\n`
  );
  const closePart = new TextEncoder().encode(closeDelimiter);

  // Combine parts into single binary body
  const bodyBlob = new Blob([metadataPart, arrayBuffer, closePart], {
    type: `multipart/related; boundary=${boundary}`,
  });

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink,webContentLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: bodyBlob,
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Lỗi tải tệp nhị phân lên Google Drive: ${errorText}`);
  }

  return await res.json();
}

// =========================================================================
// Music Backup & Synchronization to Google Drive
// =========================================================================

export const MUSIC_FOLDER_NAME = "Nhạc Thiền & Thư Giãn";

export async function uploadMusicTrackToDrive(
  accessToken: string,
  title: string,
  artist: string,
  audioBlob: Blob,
  mimeType: string = "audio/mpeg"
): Promise<DriveFileItem> {
  const folderId = await getOrCreateSubFolder(accessToken, MUSIC_FOLDER_NAME);
  const cleanTitle = (title || "Bai_Hat")
    .replace(/[^\w\s\u00C0-\u1EF9]/gi, "")
    .trim()
    .slice(0, 40)
    .replace(/\s+/g, "_");
  const ext = mimeType.includes("wav") ? "wav" : mimeType.includes("m4a") ? "m4a" : "mp3";
  const fileName = `[Nhac]_${cleanTitle}.${ext}`;

  return await uploadBinaryFileToDrive(
    accessToken,
    fileName,
    audioBlob,
    mimeType,
    folderId,
    `Tệp âm thanh: ${title} - Nghệ sĩ: ${artist}`
  );
}

export async function listDriveMusicTracks(accessToken: string): Promise<DriveFileItem[]> {
  try {
    const folderId = await getOrCreateSubFolder(accessToken, MUSIC_FOLDER_NAME);
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink)&orderBy=modifiedTime desc`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error("Failed to list music tracks in Drive:", err);
    return [];
  }
}

export async function downloadDriveAudioBlob(
  accessToken: string,
  fileId: string
): Promise<Blob> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Không thể tải tệp âm thanh từ Google Drive: ${await res.text()}`);
  }

  return await res.blob();
}

// =========================================================================
// Astrological Charts (Lá Số Tử Vi & Bản Đồ Sao) Backup to Google Drive
// =========================================================================

export const CHARTS_FOLDER_NAME = "Lá Số Tử Vi & Bản Đồ Sao";

export async function uploadAstroChartToDrive(
  accessToken: string,
  chart: {
    type: "tu-vi" | "natal-chart";
    title?: string;
    fullName?: string;
    birthDate?: string;
    birthHour?: string;
    calendarType?: string;
    gender?: string;
    birthPlace?: string;
    chartImageUrl?: string;
    notes?: string;
  }
): Promise<{ reportFile: DriveFileItem; imageFile?: DriveFileItem }> {
  const folderId = await getOrCreateSubFolder(accessToken, CHARTS_FOLDER_NAME);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const typePrefix = chart.type === "tu-vi" ? "La_So_Tu_Vi" : "Ban_Do_Sao";
  const personName = (chart.fullName || "Ban_Menh")
    .replace(/[^\w\s\u00C0-\u1EF9]/gi, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 30);

  // 1. Upload Chart Image if available
  let imageFile: DriveFileItem | undefined = undefined;
  if (chart.chartImageUrl && chart.chartImageUrl.startsWith("data:")) {
    try {
      const parts = chart.chartImageUrl.split(",");
      const mimeMatch = parts[0]?.match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const imageBlob = new Blob([u8arr], { type: mime });
      const imgExt = mime.includes("png") ? "png" : "jpg";
      const imgFileName = `[${typePrefix}_Anh]_${personName}_${dateStr}.${imgExt}`;

      imageFile = await uploadBinaryFileToDrive(
        accessToken,
        imgFileName,
        imageBlob,
        mime,
        folderId,
        `Ảnh gốc ${chart.type === "tu-vi" ? "Lá số Tử Vi" : "Bản đồ sao"} của ${chart.fullName || "bạn"}`
      );
    } catch (imgErr) {
      console.warn("Could not upload chart image to Drive:", imgErr);
    }
  }

  // 2. Upload Comprehensive Astrological Profile Markdown Report
  const reportFileName = `[${typePrefix}_Ho_So]_${personName}_${dateStr}.md`;
  const reportContent = `# ✦ A PRIVATE PLACE — HỒ SƠ ${chart.type === "tu-vi" ? "LÁ SỐ TỬ VI" : "BẢN ĐỒ SAO"} ✦
*Được lưu trữ an toàn & vĩnh viễn trên Google Drive*
-------------------------------------------------------------
- **Chủ mệnh**: ${chart.fullName || "Bạn tri kỷ"}
- **Ngày sinh**: ${chart.birthDate || "Chưa rõ"} (${chart.calendarType === "lunar" ? "Âm Lịch" : "Dương Lịch"})
- **Giờ sinh**: ${chart.birthHour || "Chưa rõ"}
- **Giới tính**: ${chart.gender || "Chưa xác định"}
- **Nơi sinh**: ${chart.birthPlace || "Chưa xác định"}
- **Thời gian lưu**: ${now.toLocaleString("vi-VN")}
${imageFile ? `- **Liên kết ảnh lá số gốc trên Drive**: ${imageFile.webViewLink || imageFile.name}` : ""}
-------------------------------------------------------------

## GHI CHÚ BẢN MỆNH:
${chart.notes || "Chưa có ghi chú bổ sung."}

-------------------------------------------------------------
*Dữ liệu được sao lưu từ A Private Place. Khi chuyển đổi thiết bị, bạn chỉ cần mở ứng dụng và kết nối Google Drive để khôi phục lại toàn bộ.*
`;

  const reportFile = await uploadFileToDriveFolder(
    accessToken,
    reportFileName,
    reportContent,
    "text/markdown",
    `Hồ sơ chiêm tinh ${typePrefix} của ${chart.fullName || "bạn"}`
  );

  return { reportFile, imageFile };
}

export async function listDriveAstroCharts(accessToken: string): Promise<DriveFileItem[]> {
  try {
    const folderId = await getOrCreateSubFolder(accessToken, CHARTS_FOLDER_NAME);
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink)&orderBy=modifiedTime desc`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error("Failed to list astro charts in Drive:", err);
    return [];
  }
}

