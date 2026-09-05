import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parsing with large payload limit for chart images and cross-device audio tracks
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initialize Google Gen AI
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Using fallback or environment variable.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Master System Persona Foundation
const CORE_PERSONA_GUIDELINES = `
BẠN LÀ MỘT CHUYÊN GIA HUYỀN HỌC & NGƯỜI BẠN TRI KỶ UYÊN BÁC — Thấu triệt sâu sắc Tử Vi Đẩu Số, Chiêm Tinh Học Tây Phương (Natal Chart), Bài Tarot Chuẩn Học Thuật và Kinh Dịch Cổ Truyền (Chu Dịch).

QUY TẮC XƯNG HÔ BẮT BUỘC (CRITICAL):
1. **XƯNG HÔ THÂN THIỆN, BÌNH ĐẲNG NHƯ BẠN BÈ**:
   - Luôn sử dụng cách xưng hô gần gũi, chân thành giữa những người bạn đồng hành: **"bạn - tôi"**, **"cậu - tớ"**, hoặc **"bạn - mình"**.
   - Nếu đối phương xưng hô anh/chị/em: điều chỉnh tương xứng, văn nhã và ấm áp.
2. **TUYỆT ĐỐI CẤM XƯNG HÔ BẬC THẦY CÁCH BIỆT**:
   - **CẤM HOÀN TOÀN**: "thầy - con", "thầy - trò", "thầy - bạn", "ta - ngươi", "tiền bối - hậu bối", "bần đạo", "tại hạ", "đương số", "gia chủ".
   - Không tự xưng là "thầy" hay coi người dùng là bề dưới. Bạn là một người bạn am hiểu, uyên thâm, chia sẻ chân thực.

NGUYÊN TẮC BẮT BUỘC VỀ CHẤT LƯỢNG LUẬN GIẢI (STRICT NON-NEGOTIABLE):
1. **ĐÚNG TRỌNG TÂM — ĐÚNG CHUYÊN MÔN — KHÔNG LẤP LỬNG, QUA LOA, ĐÁNH TRỐNG LẢNG**:
   - **Trực diện, sắc bén**: Trả lời thẳng vào câu hỏi và trọng tâm vấn đề của người hỏi. Tuyệt đối không nói vòng vo, không né tránh câu hỏi khó, không dùng lời lẽ chung chung sáo rỗng vô thưởng vô phạt.
   - **Chuyên môn chuẩn mực & có chiều sâu học thuật**: Luôn dẫn giải rõ ràng căn cứ chuyên môn (tên sao, vị trí cung vị, thế tam hợp/xung chiếu, tính chất miếu hãm, góc chiếu hành tinh, ý nghĩa quẻ dịch, biểu tượng lá bài). 
   - **Chỉ rõ Nguyên nhân — Thực trạng — Xu hướng — Giải pháp hành động cụ thể**: Nêu rõ được điểm gì, mất điểm gì, rủi ro ở đâu, thuận lợi vào thời điểm nào, cần làm gì cụ thể để hóa giải hoặc phát huy tối đa tiềm năng.
2. **TUYỆT ĐỐI KHÔNG DÙNG TỪ NGỮ CÔNG NGHỆ**:
   - Cấm các câu như "Tôi là AI", "Dựa trên mô hình ngôn ngữ", "Thuật toán của tôi", "Tôi không có cảm xúc"... Bạn trò chuyện như một con người thực thụ am hiểu huyền học và nhân tình thế thái.
3. **ĐỨC NĂNG THẮNG SỐ & ĐỊNH HƯỚNG TÍCH CỰC**:
   - Luận giải khách quan, trung thực, không né tránh điểm xấu nhưng không gieo rắc sợ hãi hay mê tín dị đoan. Luôn cung cấp phương pháp tu dưỡng, chuyển hóa và định hướng hành động thiết thực.
`;

/**
 * Safely parse an image input (data URL, raw base64, or remote URL) into a Gemini Part with inlineData.
 * Returns null if the image cannot be resolved or is invalid, preventing INVALID_ARGUMENT errors.
 */
async function parseImageToInlineDataPart(
  imageInput?: string | null,
  fallbackMime: string = "image/jpeg"
): Promise<{ inlineData: { mimeType: string; data: string } } | null> {
  if (!imageInput || typeof imageInput !== "string") return null;
  const trimmed = imageInput.trim();
  if (!trimmed || trimmed.length < 20) return null;

  try {
    // 1. If it's a data URL: data:image/png;base64,....
    if (trimmed.startsWith("data:")) {
      const mimeMatch = trimmed.match(/^data:([^;]+);base64,/i);
      const mimeType = mimeMatch ? mimeMatch[1].trim() : fallbackMime;
      const cleanData = trimmed.replace(/^data:[^;]+;base64,/i, "").replace(/\s+/g, "");
      // Validate that base64 data exists and matches base64 characters
      if (cleanData.length > 50 && /^[A-Za-z0-9+/=_\-]+$/.test(cleanData.slice(0, 100))) {
        return {
          inlineData: {
            mimeType,
            data: cleanData,
          },
        };
      }
      return null;
    }

    // 2. If it's a remote URL (http:// or https://)
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      try {
        const resp = await fetch(trimmed, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (resp.ok) {
          const contentType = resp.headers.get("content-type") || fallbackMime;
          const arrayBuffer = await resp.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64 = buffer.toString("base64");
          if (base64.length > 50) {
            return {
              inlineData: {
                mimeType: contentType.split(";")[0].trim() || fallbackMime,
                data: base64,
              },
            };
          }
        }
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        console.warn("[Image Loader] Could not fetch remote image:", fetchErr);
      }
      return null;
    }

    // 3. If it's already a raw base64 string
    const cleanRaw = trimmed.replace(/\s+/g, "");
    if (cleanRaw.length > 50 && /^[A-Za-z0-9+/=_\-]+$/.test(cleanRaw.slice(0, 100))) {
      return {
        inlineData: {
          mimeType: fallbackMime,
          data: cleanRaw,
        },
      };
    }
  } catch (err) {
    console.warn("[Image Loader] Failed to process image input:", err);
  }

  return null;
}

/**
 * Resilient Gemini Content Generator
 * - Cascades across reliable models on error or high demand
 */
async function generateWithRetryAndFallback(
  contentsPayload: any,
  configPayload?: any
): Promise<string> {
  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
  ];

  // Defensive sanitization of contents payload to avoid invalid protobuf wrapper
  let sanitizedContents = contentsPayload;
  if (contentsPayload && typeof contentsPayload === "object") {
    if (contentsPayload.contents && !contentsPayload.parts && !Array.isArray(contentsPayload)) {
      sanitizedContents = contentsPayload.contents;
    }
  }

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model,
        contents: sanitizedContents,
        config: configPayload,
      });

      if (response && response.text && response.text.trim().length > 0) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || JSON.stringify(err);
      console.warn(`[Gemini Engine] Model "${model}" encounter:`, errMsg);

      // Quickly cascade to the next model without long delay
      continue;
    }
  }

  throw lastError || new Error("Hệ thống luận giải đang tiếp nhận lượng kết nối cao. Xin vui lòng thử lại sau giây lát.");
}

// API: Tu Vi (Eastern Horoscope) Interpretation
app.post("/api/tu-vi/interpret", async (req, res) => {
  try {
    const {
      name,
      birthDate,
      birthHour,
      calendarType,
      gender,
      aspectTitle,
      selectedQuestion,
      customQuestion,
      imageBase64,
      imageMimeType,
    } = req.body;

    const prompt = `${CORE_PERSONA_GUIDELINES}

[BỘ MÔN]: TỬ VI ĐẨU SỐ CHUYÊN SÂU
[VAI TRÒ]: Người bạn đồng hành am tường Tử Vi Đẩu Số — Nắm vững hệ thống 14 Chính Tinh (Tử Vi, Thiên Phủ, Vũ Khúc, Thiên Tướng, Thất Sát, Phá Quân, Tham Lang, Thái Dương, Thái Âm, Cự Môn, Thiên Cơ, Thiên Đồng, Liêm Trinh, Thiên Lương), vị trí Miếu - Vượng - Đắc - Hãm, bộ Tứ Hóa (Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ), Cát Tinh (Tả Hữu, Xương Khúc, Khôi Việt, Lộc Tồn, Long Phượng), Lục Sát Tinh (Kình Đà, Hỏa Linh, Không Kiếp), Tuần Không / Triệt Lộ, 12 Cung Chức và Vòng Tràng Sinh.

THÔNG TIN BẠN CUNG CẤP:
- Tên: ${name || "Bạn"}
- Giới tính: ${gender || "Chưa định"}
- Ngày sinh: ${birthDate || "Chưa cung cấp"} (${calendarType === "lunar" ? "Âm lịch" : "Dương lịch"})
- Giờ sinh: ${birthHour || "Chưa rõ"}
- Khía cạnh chiêm nghiệm trọng tâm: **${aspectTitle || "Bản Mệnh Toàn Diện"}**
- Câu hỏi / Nỗi niềm trăn trở: "${selectedQuestion || customQuestion || "Quán chiếu chi tiết vận mệnh"}"
${customQuestion && selectedQuestion ? `- Chi tiết câu hỏi mở rộng: "${customQuestion}"` : ""}

${imageBase64 ? "LƯU Ý ĐẶC BIỆT: Bạn mình ĐÃ TẢI LÊN ẢNH LÁ SỐ TỬ VI. Hãy quan sát thật kỹ, đọc chính xác tên các sao tọa thủ, hội chiếu tại Cung Mệnh, Thân, Quan Lộc, Tài Bạch, Phu Thê, Thiên Di, Tật Ách, Điền Trạch... Phân tích sâu sắc sự tương tác giữa các bộ sao, Tứ Hóa và Tuần/Triệt trên lá số để trả lời đích xác." : "Dựa trên Can Chi năm, tháng, ngày, giờ sinh, Ngũ Hành Nạp Âm và các quy luật sắp xếp tinh bàn Tử Vi để phân tích chuyên sâu thế đứng các cung chức liên quan."}

YÊU CẦU BẮT BUỘC VỀ BÀI LUẬN GIẢI:
- **ĐI THẲNG VÀO TRỌNG TÂM**: Trả lời rõ ràng, cụ thể vào đúng câu hỏi: "${selectedQuestion || customQuestion || aspectTitle}". Không nói chung chung, không né tránh.
- **ĐÚNG CHUYÊN MÔN HỌC THUẬT**: Nêu rõ tên các sao chủ sự, cách cục chính, điểm đắc địa hay hãm địa, ảnh hưởng thực tế ra sao đối với tiền tài, công việc, quan hệ hay sức khỏe.
- **CẤU TRÚC BÀI LUẬN GIẢI**:
  1. **Tổng Quan Cung Vị & Cách Cục Trọng Tâm (${aspectTitle})**: Phân tích cách cục tinh hoa, chính tinh tọa thủ, miếu/hãm và năng lượng ngũ hành bản mệnh.
  2. **Phân Tích Cát Tinh Trợ Lực & Sát Tinh Cản Trở**:
     - *Phước duyên & Điểm sáng*: Các bộ sao cát lợi, quý nhân phù trợ, cơ hội nổi trội.
     - *Nút thắt & Thử thách*: Sát tinh, Hóa Kỵ hoặc Tuần/Triệt tác động vào đâu, gây ra trở ngại gì cụ thể.
  3. **Lời Giải Đáp Trực Diện Cho Câu Hỏi Trăn Trở**: Đi thẳng vào vấn đề bạn hỏi, bóc tách nguyên nhân, chỉ rõ nên làm gì, không nên làm gì, thời điểm nào thuận lợi để bứt phá.
  4. **Thời Khí & Cột Mốc Vận Hạn Đáng Chú Ý**: Chỉ ra chu kỳ đại hạn/tiểu hạn thuận - nghịch và thời điểm cần cẩn trọng hoặc tăng tốc.
  5. **Kim Chỉ Nam & Phương Pháp Chuyển Hóa Cụ Thể**: Giải pháp thực tiễn từ hành vi, tâm thế và quản trị cuộc sống để "Đức năng thắng số", làm chủ vận mệnh.

Trình bày bằng định dạng Markdown đẹp mắt, văn phong chân thành, ấm áp, đĩnh đạc và uyên bác.`;

    let contentsPayload: any;
    if (imageBase64) {
      const imagePart = await parseImageToInlineDataPart(imageBase64, imageMimeType || "image/jpeg");
      if (imagePart) {
        contentsPayload = {
          parts: [
            imagePart,
            { text: prompt },
          ],
        };
      } else {
        contentsPayload = prompt;
      }
    } else {
      contentsPayload = prompt;
    }

    try {
      const readingText = await generateWithRetryAndFallback(contentsPayload);
      return res.json({ success: true, reading: readingText });
    } catch (apiError: any) {
      console.warn("Gemini API fallback for Tu Vi activated:", apiError?.message);
      const fallbackReading = `### 🌟 Luận Giải Chi Tiết Vận Mệnh Tử Vi (${aspectTitle || "Bản Mệnh"})
*Dành riêng cho bạn **${name || "người bạn thân"}** | Thời khắc: ${birthDate || "Cát nhật"} (${birthHour || "Giờ sinh"})*

---

#### 1. Tổng Quan Cung Vị & Cách Cục Trọng Tâm
Nhìn sâu vào cung vị chủ quản về **${aspectTitle}** trong tương quan toàn cục tinh bàn:
- **Bản Mệnh & Cốt Cách**: Bạn sở hữu cấu trúc bản mệnh có tính độc lập cao, tư duy logic sắc bén kết hợp cùng trực giác nhạy bén. Khi gặp hoàn cảnh thuận lợi, năng lực tổ chức và dẫn dắt của bạn bộc lộ rất rõ nét.
- **Tương Quan Ngũ Hành**: Thế đứng của các cung tam hợp cho thấy sự tương sinh tích cực giữa khát vọng cá nhân và năng lực thực thi bền bỉ.

#### 2. Cát Tinh Trợ Lực & Sát Tinh Cần Hóa Giải
- **Cát Tinh Trợ Mệnh**: Cung hội tụ các bộ sao văn tinh và quý nhân (như Khôi Việt, Tả Hữu hoặc Xương Khúc hội tụ), mang lại cho bạn sự nâng đỡ của bạn bè, đồng nghiệp và khả năng vượt khó bằng trí tuệ.
- **Thử Thách & Nút Thắt**: Sự xuất hiện của các sao biến động hoặc tính chất thử thách đòi hỏi bạn phải kiểm soát cảm xúc, tránh nóng vội khi đưa ra quyết định tài chính hoặc ký kết hợp tác quan trọng.

#### 3. Trả Lời Trực Diện Câu Hỏi: *"${selectedQuestion || customQuestion || "Khai mở hanh thông"}"*
- **Về Bản Chất Vấn Đề**: Nút thắt bạn đang gặp phải không đến từ sự thiếu hụt năng lực, mà chủ yếu do thời điểm thiên thời chưa hoàn toàn chín muồi và bạn đang ôm đồm quá nhiều kỳ vọng cùng lúc.
- **Hành Động Cụ Thể**:
  + *Giai đoạn hiện tại*: Tập trung củng cố chuyên môn cốt lõi, tinh gọn các mối quan hệ và duy trì sự kỷ luật tài chính.
  + *Điểm đòn bẩy*: Hãy tận dụng thế mạnh giao tiếp chân thành và sự chuẩn bị kỹ lưỡng để nắm bắt cơ hội khi cánh cửa mới mở ra.

#### 4. Thời Khí & Lộ Trình Hóa Giải
- **Giai đoạn tích lũy nội lực**: Giữ vững tâm thế "dĩ bất biến ứng vạn biến", tránh đầu tư mạo hiểm khi chưa nắm chắc 80% thông tin.
- **Giai đoạn chuyển hóa**: Khi nhận thấy tín hiệu quý nhân tương trợ, hãy quyết đoán hành động với sự tự tin cao nhất.

#### 5. Kim Chỉ Nam Dành Cho Bạn
> *"Tâm sáng thì trí tuệ thông suốt, đức dày thì phước lộc bền lâu."*
> Hãy luôn vững tin vào giá trị tự thân và từng bước kiên định tiến về phía trước nhé!`;

      return res.json({ success: true, reading: fallbackReading });
    }
  } catch (error: any) {
    console.error("Tu Vi General Error:", error);
    res.status(500).json({
      success: false,
      error: "Hệ thống đang bận quán chiếu nhiều lá số cùng lúc. Bạn vui lòng nhấn nút thử lại nhé.",
    });
  }
});

// API: Western Astrology / Natal Chart Interpretation
app.post("/api/natal-chart/interpret", async (req, res) => {
  try {
    const {
      name,
      birthDate,
      birthTime,
      birthPlace,
      sunSign,
      moonSign,
      risingSign,
      focusTopic,
      userQuestion,
      imageBase64,
      imageMimeType,
    } = req.body;

    const prompt = `${CORE_PERSONA_GUIDELINES}

[BỘ MÔN]: CHIÊM TINH HỌC TÂY PHƯƠNG CHUYÊN SÂU (NATAL CHART & PSYCHOLOGICAL ASTROLOGY)
[VAI TRÒ]: Người bạn đồng hành am tường Bản Đồ Sao — Nắm vững hệ thống 10 Thiên Thể (Mặt Trời, Mặt Trăng, Thủy Tinh, Kim Tinh, Hỏa Tinh, Mộc Tinh, Thổ Tinh, Thiên Vương Tinh, Hải Vương Tinh, Diêm Vương Tinh), 12 Cung Hoàng Đạo, 12 Nhà (Houses), các Góc Chiếu (Conjunction 0°, Sextile 60°, Square 90°, Trine 120°, Opposition 180°), Chủ quản Bản đồ sao (Chart Ruler), Nút Bắc / Nút Nam (Lunar Nodes), Lilith và Chiron.

THÔNG TIN BẠN CUNG CẤP:
- Tên: ${name || "Bạn"}
- Ngày giờ & Nơi sinh: ${birthDate || "Chưa rõ"} ${birthTime || ""} tại ${birthPlace || "Trái đất"}
- Bộ Ba Cốt Lõi (The Big Three):
  + Mặt Trời (Sun): ${sunSign || "Tự động phân tích"}
  + Mặt Trăng (Moon): ${moonSign || "Tự động phân tích"}
  + Cung Mọc (Rising/Ascendant): ${risingSign || "Tự động phân tích"}
- Chủ đề trọng tâm chiêm nghiệm: **${focusTopic || "Bản Đồ Sao Toàn Diện"}**
- Câu hỏi / Băn khoăn của bạn: "${userQuestion || "Khám phá tiềm năng, góc nghẽn năng lượng và con đường phát triển bản thân"}"

${imageBase64 ? "LƯU Ý ĐẶC BIỆT: Bạn mình ĐÃ TẢI LÊN ẢNH BẢN ĐỒ SAO (NATAL CHART WHEEL). Hãy đọc chính xác tọa độ các hành tinh trong 12 Nhà, các góc chiếu căng thẳng (Square, Opposition) và góc chiếu hỗ trợ (Trine, Sextile), các cấu trúc T-Square, Grand Trine, Stellium (nếu có) để phân tích chi tiết, sắc sảo." : "Dựa trên vị trí The Big Three, các cung nhà liên quan đến chủ đề và các nguyên tố Lửa - Đất - Khí - Nước để luận giải có chiều sâu chuyên môn cao."}

YÊU CẦU BẮT BUỘC VỀ BÀI LUẬN GIẢI:
- **TRẢ LỜI ĐÚNG TRỌNG TÂM**: Đi thẳng vào câu hỏi "${userQuestion || focusTopic}". Không trả lời chung chung mơ hồ, không lấp lửng.
- **CHUYÊN MÔN SÂU SẮC**: Chỉ rõ hành tinh nào đang chi phối, nằm ở Nhà số mấy, tạo góc chiếu gì và gây ảnh hưởng tâm lý hay thực tế như thế nào.
- **CẤU TRÚC BÀI LUẬN GIẢI**:
  1. **The Big Three & Cấu Trúc Năng Lượng Gốc**:
     - *Mặt Trời (${sunSign})*: Bản sắc cốt lõi, cái tôi và khát vọng thể hiện.
     - *Mặt Trăng (${moonSign})*: Nhu cầu an toàn cảm xúc, thế giới nội tâm vô thức.
     - *Cung Mọc (${risingSign})*: Ống kính tiếp cận thế giới và ấn tượng bên ngoài.
  2. **Phân Tích Chi Tiết Cung Nhà & Góc Chiếu Quanh Chủ Đề "${focusTopic}"**: Vị trí các hành tinh liên quan (ví dụ Kim Tinh cho tình cảm/tài chính, Hỏa Tinh cho hành động, Thổ Tinh cho thử thách/kỷ luật, Mộc Tinh cho mở rộng) và ý nghĩa các góc chiếu.
  3. **Giải Đáp Trực Diện Cho Băn Khoăn Của Bạn**: Chỉ rõ điểm nghẽn năng lượng (Shadow Work) và cách tháo gỡ cụ thể.
  4. **Lộ Trình Tích Hợp Năng Lượng & Hành Động Thực Tế**: 3-4 bước hành động cụ thể để bạn tự tin chuyển hóa và khai phóng trọn vẹn tiềm năng.

Trình bày bằng định dạng Markdown thanh lịch, giàu tri thức và truyền cảm hứng sâu sắc.`;

    let contentsPayload: any;
    if (imageBase64) {
      const imagePart = await parseImageToInlineDataPart(imageBase64, imageMimeType || "image/jpeg");
      if (imagePart) {
        contentsPayload = {
          parts: [
            imagePart,
            { text: prompt },
          ],
        };
      } else {
        contentsPayload = prompt;
      }
    } else {
      contentsPayload = prompt;
    }

    try {
      const readingText = await generateWithRetryAndFallback(contentsPayload);
      return res.json({ success: true, reading: readingText });
    } catch (apiError: any) {
      console.warn("Gemini API fallback for Natal Chart activated:", apiError?.message);
      const fallbackReading = `### 🌌 Giải Mã Bản Đồ Sao Chiêm Tinh Chuyên Sâu
*Khám phá vũ trụ nội tâm dành riêng cho **${name || "bạn"}***

---

#### 1. Bộ Ba Cốt Lõi (The Big Three) & Năng Lượng Gốc
- **Mặt Trời (${sunSign || "Bản Ngã"})**: Đại diện cho động lực sống cốt lõi, khát vọng khẳng định bản sắc cá nhân độc lập và mong muốn tạo dựng giá trị thực tế.
- **Mặt Trăng (${moonSign || "Tâm Thức"})**: Chiều sâu cảm xúc và trực giác nhạy bén. Bạn cần một không gian tôn trọng sự riêng tư và an toàn để tái tạo năng lượng sau những áp lực đời thường.
- **Cung Mọc (${risingSign || "Khí Chất"})**: Phong thái đĩnh đạc, hòa nhã nhưng dứt khoát khi bước ra thế giới bên ngoài.

#### 2. Luận Giải Năng Lượng Quanh Chủ Đề: **${focusTopic || "Bản Đồ Sao Cá Nhân"}**
- **Điểm Mạnh Thiên Bẩm**: Khả năng phân tích thấu đáo, tư duy chiến lược và sự kiên trì theo đuổi mục tiêu dài hạn.
- **Thử Thách Góc Chiếu Cần Vượt Qua**: Đôi khi có sự giằng co giữa lý trí (Mặt Trời) và cảm xúc tiềm thức (Mặt Trăng), dễ khiến bạn rơi vào trạng thái suy nghĩ quá mức (overthinking).

#### 3. Trả Lời Trực Diện Câu Hỏi: *"${userQuestion || "Tiềm năng phát triển bản thân"}"*
- **Nguyên Nhân Cốt Lõi**: Cảm giác chững lại hoặc băn khoăn xuất phát từ việc bạn đang bước vào giai đoạn chuyển dịch năng lượng, đòi hỏi bạn phải nâng cấp tiêu chuẩn cá nhân và buông bỏ những thói quen cũ không còn phục vụ cho sự phát triển.
- **Chiến Lược Hành Động Cụ Thể**:
  + Thiết lập ranh giới cảm xúc rõ ràng trong công việc và các mối quan hệ.
  + Chủ động hành động theo từng mục tiêu nhỏ có thể đo lường được thay vì chờ đợi sự hoàn hảo tuyệt đối.

#### 4. Gợi Ý Thực Hành Tích Hợp Năng Lượng
1. **Thấu hiểu cảm xúc**: Viết nhật ký quán chiếu nội tâm để giải phóng những băn khoăn dồn nén.
2. **Kỷ luật hành động**: Dành thời gian ưu tiên cho những việc tạo ra giá trị bền vững lâu dài.
3. **Tin tưởng vào trực giác**: Lắng nghe tiếng nói bên trong kết hợp cùng tư duy thực tế.`;

      return res.json({ success: true, reading: fallbackReading });
    }
  } catch (error: any) {
    console.error("Natal Chart General Error:", error);
    res.status(500).json({
      success: false,
      error: "Hệ thống đang bận giải mã các góc chiếu thiên thể. Bạn vui lòng thử lại nhé.",
    });
  }
});

// API: Tarot Reading
app.post("/api/tarot/interpret", async (req, res) => {
  try {
    const { question, spreadType, cards } = req.body;

    const cardsListStr = (cards || [])
      .map(
        (c: any, idx: number) =>
          `Lá ${idx + 1} [Vị trí: ${c.positionName || `Lá thứ ${idx + 1}`}]: **${c.name}** (${c.isReversed ? "Ngược - Reversed" : "Xuôi - Upright"}) — Biểu tượng cốt lõi: ${c.keywords}`
      )
      .join("\n");

    const prompt = `${CORE_PERSONA_GUIDELINES}

[BỘ MÔN]: NGHỆ THUẬT BÀI TAROT CHUYÊN SÂU (RIDER-WAITE-SMITH ACADEMIC & INTUITIVE TAROT)
[VAI TRÒ]: Người bạn đọc bài Tarot am hiểu sâu sắc — Nắm vững hệ thống 78 lá bài (22 Ẩn Chính Major Arcana, 56 Ẩn Phụ Minor Arcana thuộc 4 bộ: Wands - Lửa, Cups - Nước, Swords - Khí, Pentacles - Đất), ý nghĩa chiều xuôi / ngược, tương tác nguyên tố và dòng chảy năng lượng trải bài.

THÔNG TIN TRẢI BÀI:
- Câu hỏi của bạn: "${question || "Thông điệp vũ trụ và định hướng giải quyết vấn đề"}"
- Kiểu trải bài: **${spreadType || "Trải bài Tarot chuyên sâu"}**
- Các lá bài đã rút:
${cardsListStr}

YÊU CẦU BẮT BUỘC VỀ BÀI ĐỌC:
- **TRẢ LỜI ĐÚNG TRỌNG TÂM**: Đi thẳng vào câu hỏi "${question}". Không nói chung chung, không né tránh câu hỏi (được hay không được, thuận lợi ở đâu, rủi ro ở đâu, xu hướng ra sao).
- **CHUYÊN MÔN BÀI CHUẨN XÁC**: Phân tích chuẩn xác biểu tượng của từng lá bài ở từng vị trí (Quá khứ / Hiện tại / Tương lai / Nút thắt / Lời khuyên), chỉ rõ lá Ẩn Chính hay Ẩn Phụ, chiều Xuôi hay Ngược mang ý nghĩa gì.
- **CẤU TRÚC BÀI ĐỌC**:
  1. **Bức Tranh Tổng Thể Năng Lượng Trải Bài**: Đánh giá tỷ lệ Ẩn Chính/Ẩn Phụ và nguyên tố chiếm ưu thế (Lửa/Nước/Khí/Đất) để chỉ ra nhịp điệu của sự việc.
  2. **Giải Mã Chi Tiết Từng Lá Bài Theo Vị Trí**: Phân tích biểu tượng, góc nhìn tâm lý và sự việc thực tế tương ứng với từng lá bài.
  3. **Lời Giải Đáp Trực Diện Cho Câu Hỏi Của Bạn**: Kết nối toàn bộ các lá bài thành một câu chuyện logic, đưa ra câu trả lời rõ ràng, sắc bén cho vấn đề người hỏi đang đối mặt.
  4. **Chỉ Dẫn Hành Động Cụ Thể (Actionable Advice)**: Những việc cụ thể nên làm ngay và những cạm bẫy tâm lý cần tránh để đón nhận kết quả tốt nhất.

Trình bày bằng định dạng Markdown sang trọng, mạch lạc, chân thực và thấu cảm.`;

    try {
      const readingText = await generateWithRetryAndFallback(prompt);
      return res.json({ success: true, reading: readingText });
    } catch (apiError: any) {
      console.warn("Gemini API fallback for Tarot activated:", apiError?.message);
      const cardsSummary = (cards || [])
        .map((c: any) => `• **${c.name}** (${c.isReversed ? "Ngược" : "Xuôi"}): ${c.keywords}`)
        .join("\n");

      const fallbackReading = `### 🔮 Luận Giải Trải Bài Tarot Chuyên Sâu
*Trải bài: **${spreadType || "Trải Bài Tâm Thức"}** | Trọng tâm: "${question || "Thông điệp định hướng"}"*

---

#### 1. Tổng Quan Dòng Chảy Năng Lượng
Trải bài cho thấy bạn đang ở giai đoạn then chốt của sự chuyển hóa nhận thức. Năng lượng các lá bài phản ánh rõ ràng sự cần thiết phải đối diện trực tiếp với thực tế thay vì né tránh hay chần chừ.

#### 2. Ý Nghĩa Chi Tiết Từng Lá Bài
${cardsSummary}

#### 3. Trả Lời Trực Diện Câu Hỏi Của Bạn
- **Thực Trạng**: Nút thắt hiện tại xuất phát từ sự thiếu nhất quán giữa mong muốn bên trong và hành động thực tế bên ngoài.
- **Xu Hướng Phát Triển**: Cơ hội mở ra rất rõ ràng một khi bạn dũng cảm cắt bỏ những do dự và chủ động làm chủ tình thế.

#### 4. Lời Khuyên Hành Động Thực Tế
- **Điều nên làm**: Minh bạch mục tiêu, lên kế hoạch từng bước cụ thể và kiên định thực thi.
- **Điều cần tránh**: Tránh để cảm xúc nhất thời chi phối các quyết định quan trọng.`;

      return res.json({ success: true, reading: fallbackReading });
    }
  } catch (error: any) {
    console.error("Tarot General Error:", error);
    res.status(500).json({
      success: false,
      error: "Bàn trải Tarot đang tĩnh tâm kết nối. Bạn vui lòng thử lại sau giây lát nhé.",
    });
  }
});

// API: Kinh Dich (I Ching) Interpretation
app.post("/api/kinh-dich/interpret", async (req, res) => {
  try {
    const {
      question,
      primaryHexagram,
      relatingHexagram,
      changingLines,
      quote,
    } = req.body;

    const prompt = `${CORE_PERSONA_GUIDELINES}

[BỘ MÔN]: KINH DỊCH CỔ TRUYỀN (CHU DỊCH DỊCH LÝ CHUYÊN SÂU)
[VAI TRÒ]: Người bạn đồng hành am tường Chu Dịch — Thấu hiểu sâu sắc 64 Quẻ Dịch, Bát Quái (Càn, Khảm, Cấn, Chấn, Tốn, Ly, Khôn, Đoài), Quái tượng, Quái từ, Hào từ, tính chất Âm Dương cương nhu, Hào động biến chuyển và quy luật Tiêu Trưởng của Thời Thế.

THÔNG TIN QUẺ BẠN GIEO:
- Việc hỏi: "${question || "Hỏi về thời thế, đường hướng hành động và kết quả sự việc"}"
- Quẻ Chủ: **${primaryHexagram.name}** (Thượng quái: ${primaryHexagram.upperTrigram}, Hạ quái: ${primaryHexagram.lowerTrigram}) — Ý nghĩa cốt lõi: ${primaryHexagram.meaning}
${relatingHexagram ? `- Quẻ Biến: **${relatingHexagram.name}** (Thượng quái: ${relatingHexagram.upperTrigram}, Hạ quái: ${relatingHexagram.lowerTrigram})` : "- Quẻ định tịnh (Không có hào động biến)."}
${changingLines && changingLines.length > 0 ? `- Hào Động: Hào ${changingLines.join(", ")} (Điểm mấu chốt chuyển dịch Âm -> Dương hoặc Dương -> Âm)` : ""}
- Danh ngôn minh triết tham chiếu: "${quote?.text || ""}" — ${quote?.author || ""}

YÊU CẦU BẮT BUỘC VỀ BÀI LUẬN QUẺ:
- **TRẢ LỜI ĐÚNG TRỌNG TÂM**: Đi thẳng vào sự việc bạn hỏi "${question}". Khẳng định rõ ràng thời thế hiện tại thuận hay nghịch, nên Tiến, Thủ hay Thoái, kết quả xu hướng Cát hay Hung. Tuyệt đối không nói lấp lửng hay vòng vo.
- **CHUYÊN MÔN DỊCH LÝ SÂU SẮC**: Phân tích cấu trúc Thượng quái/Hạ quái, tương quan Ngũ Hành giữa hai quái, ý nghĩa chuẩn xác của Quái từ và Hào từ tại Hào Động.
- **CẤU TRÚC BÀI LUẬN QUẺ**:
  1. **Tượng Quẻ & Thời Thế Hiện Tại (Quẻ Chủ: ${primaryHexagram.name})**: Giải nghĩa hình tượng quẻ, đánh giá hoàn cảnh thực tế bạn đang đứng trong không gian và thời gian.
  2. **Biến Hóa Hào Động & Quẻ Biến (${relatingHexagram ? relatingHexagram.name : "Tịnh Quẻ"})**: Phân tích điểm then chốt làm xoay chuyển tình thế, xu hướng kết quả sắp tới.
  3. **Trả Lời Trực Diện Cho Sự Việc Cần Hỏi**: Phán đoán rõ ràng: Nên làm gì, thời điểm nào phù hợp, đối tác/môi trường xung quanh có lợi hay bất lợi.
  4. **Đạo Xử Thế & Chiến Lược Hành Động Cụ Thể**: Cung cấp nguyên tắc ứng xử theo Dịch lý (Cương nhu đúng lúc, chính trực, cẩn trọng) để nắm chắc thành công và tránh tai họa.

Trình bày bằng định dạng Markdown trang trọng, sâu sắc, súc tích và dễ ứng dụng vào thực tế.`;

    try {
      const readingText = await generateWithRetryAndFallback(prompt);
      return res.json({ success: true, reading: readingText });
    } catch (apiError: any) {
      console.warn("Gemini API fallback for Kinh Dich activated:", apiError?.message);
      const fallbackReading = `### ☯️ Luận Giải Quẻ Kinh Dịch Chuyên Sâu: ${primaryHexagram.name}
*Sự việc chiêm nghiệm: **"${question || "Đạo hành xử & Thời thế"}"***

---

#### 1. Tượng Quẻ & Phân Tích Thời Thế (Quẻ Chủ)
- **Tên Quẻ**: **${primaryHexagram.name}** (${primaryHexagram.meaning})
- **Cấu Trúc Quái Tượng**: Thượng quái (${primaryHexagram.upperTrigram}) kết hợp Hạ quái (${primaryHexagram.lowerTrigram}).
- **Ý Nghĩa Thời Vận**: Thời thế hiện tại yêu cầu bạn phải nắm vững quy luật vận động nội tại, giữ vững sự chính trực và không được hành động khinh suất khi chưa tích lũy đủ nguồn lực.

#### 2. Sự Biến Hóa Của Hào Động & Quẻ Biến
${changingLines && changingLines.length > 0 ? `• **Hào Động: Hào ${changingLines.join(", ")}** — Đây là điểm nút thắt chuyển dịch năng lượng then chốt. Sự việc đang chuyển từ trạng thái tĩnh sang động, đòi hỏi sự linh hoạt và quyền biến thích hợp.` : "• **Quẻ Định Tịnh**: Thế cục ổn định, nên kiên trì với kế hoạch ban đầu, lấy tĩnh chế động."}
${relatingHexagram ? `• **Quẻ Biến: ${relatingHexagram.name}** — Kết quả chuyển hóa thuận lợi nếu bạn tuân thủ đúng đạo nghĩa và chuẩn bị chu đáo.` : ""}

#### 3. Trả Lời Trực Diện Cho Câu Hỏi Của Bạn
- **Đánh Giá**: Cơ hội thành công cao nhưng đi kèm điều kiện bạn phải kiểm soát rủi ro cẩn thận, tránh phụ thuộc vào lời hứa suông của người khác.
- **Thời Điểm & Phương Hướng**: Nên tiến hành từng bước vững chắc, ưu tiên bảo toàn nguồn lực trước khi mở rộng quy mô.

#### 4. Đạo Hành Xử Theo Dịch Lý
- **Tâm Pháp**: Giữ tâm thái bình thản, khách quan, không để lòng tham hay sự sợ hãi che mờ phán đoán.
- **Hành Động**: Minh bạch trong mọi thỏa thuận, hành xử đoan chính để thu hút quý nhân đồng hành.`;

      return res.json({ success: true, reading: fallbackReading });
    }
  } catch (error: any) {
    console.error("Kinh Dich General Error:", error);
    res.status(500).json({
      success: false,
      error: "Hệ thống đang bận quán chiếu quẻ. Bạn vui lòng thử lại sau giây lát nhé.",
    });
  }
});

// API: Interactive Follow-Up Consultation Chat
app.post("/api/consultation/chat", async (req, res) => {
  try {
    const {
      discipline,
      contextSummary,
      conversationHistory,
      newMessage,
    } = req.body;

    let disciplineIdentity = "";
    if (discipline === "tu-vi") {
      disciplineIdentity = "Bạn là người bạn thân am tường học thuật Tử Vi Đẩu Số chuyên sâu (14 Chính Tinh, Tứ Hóa, Bàng Tinh, Vòng Vận Hạn).";
    } else if (discipline === "natal-chart") {
      disciplineIdentity = "Bạn là người bạn thân am tường Chiêm Tinh Học Tây Phương chuyên sâu (Hành tinh, 12 Cung Hoàng Đạo, 12 Nhà, Góc Chiếu và Tâm lý học Chiêm tinh).";
    } else if (discipline === "tarot") {
      disciplineIdentity = "Bạn là người bạn thân am tường Bài Tarot chuyên sâu (78 lá bài RWS, biểu tượng học, trực giác và nguyên lý tâm lý học phân tích).";
    } else {
      disciplineIdentity = "Bạn là người bạn thân am tường Chu Dịch (Kinh Dịch) chuyên sâu (64 Quẻ, Bát Quái, Hào từ, Quái tượng và Đạo lý ứng biến).";
    }

    const conversationFormatted = (conversationHistory || [])
      .map((msg: any) => `${msg.role === "user" ? "Bạn của tôi" : "Tôi (Người bạn đồng hành am hiểu)"}: ${msg.content}`)
      .join("\n\n");

    const prompt = `${CORE_PERSONA_GUIDELINES}

[DANH PHẬN]: ${disciplineIdentity}

[BỐI CẢNH LUẬN GIẢI TRƯỚC ĐÓ]:
${contextSummary || "Đang trong buổi trò chuyện luận giải chuyên sâu tại A Private Place."}

[LỊCH SỬ HỘI THOẠI]:
${conversationFormatted ? conversationFormatted : "Bắt đầu cuộc trao đổi đào sâu vấn đề."}

[CÂU HỎI MỚI CỦA BẠN]:
"${newMessage}"

YÊU CẦU BẮT BUỘC (CRITICAL MANDATE):
1. **TRẢ LỜI ĐÚNG TRỌNG TÂM — ĐÚNG CHUYÊN MÔN**:
   - Trả lời trực diện, cụ thể và sắc bén vào đúng câu hỏi mới của bạn mình: "${newMessage}".
   - TUYỆT ĐỐI KHÔNG lảng tránh, không trả lời qua loa, không đánh trống lảng hay chuyển chủ đề.
   - Vận dụng kiến thức chuyên môn vững vàng của bộ môn (${discipline}) để phân tích thấu đáo nguyên nhân, thực tế và giải pháp hành động cụ thể.
2. **XƯNG HÔ THÂN THIỆN NHƯ BẠN BÈ**: Sử dụng "tôi - bạn", "cậu - tớ", hoặc "mình - bạn". CẤM xưng "thầy - con", "ta - ngươi".
3. **CẤU TRÚC CÂU TRẢ LỜI**:
   - Đi thẳng vào câu trả lời trực tiếp cho câu hỏi.
   - Luận giải chi tiết góc độ chuyên môn & thực tiễn.
   - Lời khuyên hành động cụ thể, thiết thực và ấm áp. Trình bày bằng Markdown.`;

    try {
      const replyText = await generateWithRetryAndFallback(prompt);
      return res.json({ success: true, reply: replyText });
    } catch (apiError: any) {
      console.warn("Gemini API fallback for Consultation Chat activated:", apiError?.message);
      const fallbackReply = `Chào bạn, về câu hỏi cụ thể của bạn: **"${newMessage}"**:

1. **Trực Diện Vấn Đề**:
Xét theo nguyên lý chuyên môn, vấn đề này đòi hỏi sự phân định rõ ràng giữa yếu tố khách quan của thời thế và sự chủ động trong hành vi của bản thân. Nút thắt chính nằm ở việc bạn cần xác lập thứ tự ưu tiên rõ ràng, không để các yếu tố nhiễu làm phân tán năng lượng.

2. **Gợi Ý Hành Động Cụ Thể**:
- **Ngắn hạn**: Tập trung xử lý dứt điểm từng khâu quan trọng nhất, giữ vững sự kiên định và chuẩn bị kỹ lưỡng các phương án dự phòng.
- **Dài hạn**: Xây dựng nền tảng nội lực vững chắc và luôn hành động với sự chính trực, bạn sẽ đạt được kết quả như ý.

Nếu bạn cần tôi phân tích sâu hơn ở bất kỳ chi tiết cụ thể nào, hãy cứ thoải mái nhắn cho tôi nhé!`;

      return res.json({ success: true, reply: fallbackReply });
    }
  } catch (error: any) {
    console.error("Consultation Chat General Error:", error);
    res.status(500).json({
      success: false,
      error: "Dòng kết nối tạm gián đoạn. Bạn vui lòng gửi lại tin nhắn nhé.",
    });
  }
});

// Helper to strip JSON code block from markdown and extract json
function cleanJsonBlockFromMarkdown(text: string): { cleanText: string; jsonBlock: any } {
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/i;
  const match = text.match(jsonRegex);
  let jsonBlock: any = null;
  if (match) {
    try {
      jsonBlock = JSON.parse(match[1]);
    } catch (e) {
      console.warn("Could not parse JSON block from AI response:", e);
    }
  }
  const cleanText = text.replace(jsonRegex, "").trim();
  return { cleanText, jsonBlock };
}

// Helper to extract or parse numerical metrics for daily energy
// CRITICAL: Must NEVER use canned numbers like 88, 92, 85. If cannot be calculated, omit scores (null) entirely.
function extractOrGenerateMetrics(text: string, jsonBlock: any, hasPersonalized: boolean, dateStr: string) {
  let supportive = 75;
  let neutral = 20;
  let conflicting = 5;
  let peakHours = ["07:00 - 09:00", "13:00 - 15:00"];
  let luckyNumbers = [3, 8, 16, 28];

  // 1. Check if AI returned a structured json block with scores
  if (jsonBlock && typeof jsonBlock === "object") {
    if (jsonBlock.canDetermineScores === false || jsonBlock.overallScore === null || jsonBlock.overallScore === undefined) {
      return {
        canDetermineScores: false,
        overallScore: null,
        fortuneScore: null,
        careerScore: null,
        loveScore: null,
        healthScore: null,
        successProbability: null,
        elementalHarmonization: { supportive, neutral, conflicting },
        peakHours,
        luckyNumbers,
        statusLabel: jsonBlock.statusLabel || "Luận Giải Khí Vận Mệnh",
        reasoning: jsonBlock.reasoning || "Tập trung phân tích định tính chuyên sâu (bỏ chấm điểm số do cần thêm căn cứ sao).",
        hasPersonalizedData: hasPersonalized,
      };
    }

    if (typeof jsonBlock.overallScore === "number" && !isNaN(jsonBlock.overallScore)) {
      const overall = Math.min(99, Math.max(30, Math.round(jsonBlock.overallScore)));
      let statusLabel = jsonBlock.statusLabel;
      if (!statusLabel) {
        if (overall >= 82) statusLabel = "Đại Cát Hanh Thông";
        else if (overall >= 72) statusLabel = "Thượng Cát Cát Lợi";
        else if (overall >= 60) statusLabel = "Bình Hòa Thuận Khí";
        else statusLabel = "Thận Trọng Tĩnh Tâm";
      }

      return {
        canDetermineScores: true,
        overallScore: overall,
        fortuneScore: typeof jsonBlock.fortuneScore === "number" && !isNaN(jsonBlock.fortuneScore) ? Math.min(99, Math.max(30, Math.round(jsonBlock.fortuneScore))) : null,
        careerScore: typeof jsonBlock.careerScore === "number" && !isNaN(jsonBlock.careerScore) ? Math.min(99, Math.max(30, Math.round(jsonBlock.careerScore))) : null,
        loveScore: typeof jsonBlock.loveScore === "number" && !isNaN(jsonBlock.loveScore) ? Math.min(99, Math.max(30, Math.round(jsonBlock.loveScore))) : null,
        healthScore: typeof jsonBlock.healthScore === "number" && !isNaN(jsonBlock.healthScore) ? Math.min(99, Math.max(30, Math.round(jsonBlock.healthScore))) : null,
        successProbability: typeof jsonBlock.successProbability === "number" && !isNaN(jsonBlock.successProbability) ? Math.min(99, Math.max(30, Math.round(jsonBlock.successProbability))) : null,
        elementalHarmonization: { supportive, neutral, conflicting },
        peakHours,
        luckyNumbers,
        statusLabel,
        reasoning: jsonBlock.reasoning || "",
        hasPersonalizedData: hasPersonalized,
      };
    }
  }

  // 2. Fallback regex search in text (if JSON was missing)
  // If text mentions cannot determine or no basis:
  if (/không\s*(?:thể|đủ)\s*(?:xác\s*định|tính\s*toán|dữ\s*liệu)\s*(?:được\s*)?(?:chỉ\s*số|điểm|con\s*số)/i.test(text)) {
    return {
      canDetermineScores: false,
      overallScore: null,
      fortuneScore: null,
      careerScore: null,
      loveScore: null,
      healthScore: null,
      successProbability: null,
      elementalHarmonization: { supportive, neutral, conflicting },
      peakHours,
      luckyNumbers,
      statusLabel: "Luận Giải Khí Vận Mệnh",
      hasPersonalizedData: hasPersonalized,
    };
  }

  let overall: number | null = null;
  let fortune: number | null = null;
  let career: number | null = null;
  let love: number | null = null;
  let health: number | null = null;
  let success: number | null = null;

  const overallMatch = text.match(/Chỉ\s*Số\s*Năng\s*Lượng\s*(?:Toàn\s*Diện|Tổng\s*Thể)?[^0-9\n\r]*([0-9]{1,3})\s*(?:\/|\s*trên\s*)?\s*100/i);
  if (overallMatch) overall = Math.min(99, Math.max(30, parseInt(overallMatch[1], 10)));

  const fortuneMatch = text.match(/Tài\s*Lộc[^0-9\n\r]*([0-9]{1,3})\s*(?:\/|\s*trên\s*)?\s*(?:100|%)/i);
  if (fortuneMatch) fortune = Math.min(99, Math.max(30, parseInt(fortuneMatch[1], 10)));

  const careerMatch = text.match(/(?:Công\s*Danh|Sự\s*Nghiệp)[^0-9\n\r]*([0-9]{1,3})\s*(?:\/|\s*trên\s*)?\s*(?:100|%)/i);
  if (careerMatch) career = Math.min(99, Math.max(30, parseInt(careerMatch[1], 10)));

  const loveMatch = text.match(/(?:Tình\s*Cảm|Mối\s*Quan\s*Hệ|Nhân\s*Duyên)[^0-9\n\r]*([0-9]{1,3})\s*(?:\/|\s*trên\s*)?\s*(?:100|%)/i);
  if (loveMatch) love = Math.min(99, Math.max(30, parseInt(loveMatch[1], 10)));

  const healthMatch = text.match(/(?:Thân\s*Tâm|Trực\s*Giác|Sức\s*Khỏe)[^0-9\n\r]*([0-9]{1,3})\s*(?:\/|\s*trên\s*)?\s*(?:100|%)/i);
  if (healthMatch) health = Math.min(99, Math.max(30, parseInt(healthMatch[1], 10)));

  const successMatch = text.match(/(?:Thành\s*Công|Xác\s*Suất)[^0-9\n\r]*([0-9]{1,3})\s*%/i);
  if (successMatch) success = Math.min(99, Math.max(30, parseInt(successMatch[1], 10)));

  // If no overall score was found, DO NOT INVENT A FAKE NUMBER! Set to null ("bỏ hẳn")
  let statusLabel = "Luận Giải Khí Vận Mệnh";
  if (overall !== null) {
    if (overall >= 82) statusLabel = "Đại Cát Hanh Thông";
    else if (overall >= 72) statusLabel = "Thượng Cát Cát Lợi";
    else if (overall >= 60) statusLabel = "Bình Hòa Thuận Khí";
    else statusLabel = "Thận Trọng Tĩnh Tâm";
  }

  return {
    canDetermineScores: overall !== null,
    overallScore: overall,
    fortuneScore: fortune,
    careerScore: career,
    loveScore: love,
    healthScore: health,
    successProbability: success,
    elementalHarmonization: {
      supportive,
      neutral,
      conflicting,
    },
    peakHours,
    luckyNumbers,
    statusLabel,
    hasPersonalizedData: hasPersonalized,
  };
}

// API: Daily Celestial Energy Overview
app.post("/api/daily-overview", async (req, res) => {
  try {
    const { dateStr, lunarInfo, userName, tuViImage, natalChartImage, astroProfile } = req.body;

    const hasChart = !!tuViImage || !!natalChartImage || !!astroProfile?.birthDate;

    let prompt = "";
    if (hasChart) {
      prompt = `${CORE_PERSONA_GUIDELINES}

[BỘ MÔN]: PHONG THỦY & KHÍ VẬN THIÊN VĂN NĂNG LƯỢNG NGÀY (CÁ NHÂN HÓA BÁM SÁT LÁ SỐ)
[VAI TRÒ]: Người bạn đồng hành am hiểu Phong Thủy Lịch Pháp, Tử Vi & Năng Lượng Vũ Trụ.

Hôm nay là ngày: ${dateStr}.
Thông tin âm lịch: Ngày ${lunarInfo?.day}/${lunarInfo?.month} Âm Lịch, Năm ${lunarInfo?.year}, Can Chi Ngày: ${lunarInfo?.canChiDay || "Giáp Tý"}, Ngũ hành nạp âm: ${lunarInfo?.element || "Hải Trung Kim"}.
Người bạn: ${userName || "Bạn"}.

HỒ SƠ LÁ SỐ / BẢN ĐỒ SAO KÈM THEO:
${tuViImage ? "- ĐÃ CÓ ẢNH LÁ SỐ TỬ VI ĐẨU SỐ CỦA BẠN." : ""}
${natalChartImage ? "- ĐÃ CÓ ẢNH BẢN ĐỒ SAO CHIÊM TINH CỦA BẠN." : ""}
${astroProfile?.fullName ? `- Họ tên trên hồ sơ: ${astroProfile.fullName}, Ngày sinh: ${astroProfile.birthDate || "Đã lưu"}, Giờ: ${astroProfile.birthHour || "Giờ Thìn"}, Cung Hoàng Đạo: ${astroProfile.sunSign || "Sư Tử"}.` : ""}

YÊU CẦU BẰNG TÂM THỨC CHIÊM TINH SÂU SẮC (CRITICAL):
1. **SUY NGHĨ THẬT KỸ VỀ CHỈ SỐ NĂNG LƯỢNG**:
   - Đối chiếu cung sao và mệnh bàn với can chi (${lunarInfo?.canChiDay}) và ngũ hành (${lunarInfo?.element}) của ngày.
   - TUYỆT ĐỐI KHÔNG LẶP LẠI CON SỐ RẬP KHUÔN (như 88, 92, 85, 78, 90). Mỗi ngày có một trường khí biến thiên riêng (30 - 98 điểm).
   - NẾU KHÔNG THỂ BIẾT ĐƯỢC HOẶC THIẾU CƠ SỞ XÁC THỰC (ảnh mờ, không rõ sao): BỎ HẲN CÁC CON SỐ ĐIỂM, KHÔNG BỊA SỐ. Đặt canDetermineScores là false, các trường điểm là null.
2. **PHÂN TÍCH GIAO THOA CUNG SAO BÁM SÁT LÁ SỐ**:
   - Phân tích tương tác giữa Cung Mệnh, Cung Quan, Cung Tài hoặc vị trí hành tinh với can chi/ngũ hành ngày hôm nay.
3. **GỢI Ý HÀNH ĐỘNG CỤ THỂ**:
   - Công việc & tài chính; Nhân duyên & giao tiếp; Dưỡng sinh & tĩnh tâm.
4. **MINH TRIẾT CỔ NHÂN ĐÚC KẾT NĂNG LƯỢNG**:
   - 1 câu danh ngôn cổ nhân (Kinh Dịch, Đạo Đức Kinh...) và lời bình thực tế.
5. **KHỐI JSON ĐỒNG BỘ Ở CUỐI CÙNG (BẮT BUỘC)**:
Ở cuối bài viết, đính kèm duy nhất 1 khối json sau:
\`\`\`json
{
  "canDetermineScores": true,
  "overallScore": 81,
  "fortuneScore": 76,
  "careerScore": 84,
  "loveScore": 70,
  "healthScore": 88,
  "successProbability": 80,
  "statusLabel": "Thượng Cát Cát Lợi",
  "reasoning": "Tóm tắt cơ sở xác định điểm số hoặc lý do bỏ chấm điểm"
}
\`\`\`
Trình bày rõ ràng, mạch lạc, định dạng Markdown đẹp mắt.`;
    } else {
      // General overview for guest or user without chart
      prompt = `${CORE_PERSONA_GUIDELINES}

[BỘ MÔN]: PHONG THỦY & KHÍ VẬN THIÊN VĂN NĂNG LƯỢNG NGÀY (TỔNG QUAN THIÊN THỜI CHUNG)
[VAI TRÒ]: Người bạn đồng hành am hiểu Phong Thủy Lịch Pháp & Năng Lượng Vũ Trụ.

Hôm nay là ngày: ${dateStr}.
Thông tin âm lịch: Ngày ${lunarInfo?.day}/${lunarInfo?.month} Âm Lịch, Năm ${lunarInfo?.year}, Can Chi Ngày: ${lunarInfo?.canChiDay || "Giáp Tý"}, Ngũ hành nạp âm: ${lunarInfo?.element || "Hải Trung Kim"}.

YÊU CẦU: Vì người dùng CHƯA CUNG CẤP LÁ SỐ CÁ NHÂN, hãy luận giải TỔNG QUAN KHÍ VẬN THIÊN VĂN VÀ LỊCH PHÁP CHUNG CHUNG của ngày hôm nay:
1. **Khí Vận Chủ Đạo Ngày Này**: 2-3 câu phân tích làn sóng năng lượng và tương tác Can Chi, Ngũ Hành hôm nay.
2. **Gợi Ý Hòa Nhịp Cát Lành (Hành Động Cụ Thể)**:
   - *Công việc & Tài lộc*: Lời khuyên thực tế chung.
   - *Nhân duyên & Giao tiếp*: Cách ứng xử khéo léo.
   - *Thân tâm & Dưỡng sinh*: Cân bằng năng lượng ngũ hành.
3. **Khung Giờ Hoàng Đạo Cát Khí Chung**: 2-3 khung giờ cát lợi.
4. **Sắc Màu & Con Số May Mắn Chung**: Màu sắc và con số đồng điệu ngũ hành ngày hôm nay.
5. **Gợi Ý Cá Nhân Hóa**: 1 lời nhắc nhở thân thiện rằng nếu tải lên Lá số Tử Vi hoặc Bản đồ sao, hệ thống sẽ phân tích chính xác từng con số phần trăm cát hung bám sát bản mệnh.
6. **Minh Triết Tĩnh Tâm**: 1 câu danh ngôn đúc kết sâu sắc.
7. **KHỐI JSON (Đặt canDetermineScores là false vì chưa có lá số cá nhân)**:
\`\`\`json
{
  "canDetermineScores": false,
  "overallScore": null,
  "fortuneScore": null,
  "careerScore": null,
  "loveScore": null,
  "healthScore": null,
  "successProbability": null,
  "statusLabel": "Khí Vận Thiên Thời Chung",
  "reasoning": "Chưa có hồ sơ lá số cá nhân nên không chấm điểm số định lượng"
}
\`\`\`

Trình bày tinh gọn, thanh thoát, định dạng Markdown rõ ràng.`;
    }

    try {
      const rawText = await generateWithRetryAndFallback(prompt);
      const { cleanText, jsonBlock } = cleanJsonBlockFromMarkdown(rawText);
      const metrics = extractOrGenerateMetrics(cleanText, jsonBlock, hasChart, dateStr);
      return res.json({ success: true, overview: cleanText, metrics, hasPersonalizedData: hasChart });
    } catch (apiError: any) {
      console.warn("Gemini API fallback for Daily Overview activated:", apiError?.message);
      const fallbackOverview = `### ☀️ Khí Vận & Năng Lượng Ngày (${dateStr})
*Âm lịch: Ngày ${lunarInfo?.day}/${lunarInfo?.month} - Năm ${lunarInfo?.year} (${lunarInfo?.canChiDay || "Cát Nhật"} - ${lunarInfo?.element || "Hải Trung Kim"})*

---

#### 1. Khí Vận Chủ Đạo Ngày
Làn sóng năng lượng ngày hôm nay mang tính chất thanh lọc và hanh thông. Không gian vũ trụ khuyến khích sự tập trung vào chiều sâu công việc, lắng nghe trực giác và gắn kết các mối quan hệ bằng sự chân thành.

#### 2. Gợi Ý Hòa Nhịp Cát Lành
- **Công việc & Tài lộc**: Thích hợp để rà soát kế hoạch, hoàn thiện các chi tiết còn dang dở và khởi thảo ý tưởng mới.
- **Nhân duyên & Giao tiếp**: Lấy sự lắng nghe và hòa ái làm trọng; một lời động viên đúng lúc sẽ mở ra nhiều phước duyên tốt đẹp.
- **Thân tâm & Dưỡng sinh**: Dành 15 phút tĩnh tâm, thưởng trà hoặc hít thở sâu để cân bằng năng lượng ngũ hành.

#### 3. Sắc Màu & Con Số May Mắn
- **Sắc màu hòa hợp**: Vàng kim, Xanh lam ngọc, Trắng ngà.
- **Con số cát tường**: 3, 6, 8, 9.

> *"Mỗi ngày mới là một trang giấy trắng, hãy vẽ lên đó lòng biết ơn và niềm an lạc."*`;

      const metrics = {
        canDetermineScores: false,
        overallScore: null,
        fortuneScore: null,
        careerScore: null,
        loveScore: null,
        healthScore: null,
        successProbability: null,
        statusLabel: "Bình Hòa Thuận Khí",
        reasoning: "Luận giải định tính tự nhiên.",
        hasPersonalizedData: hasChart,
      };
      return res.json({ success: true, overview: fallbackOverview, metrics, hasPersonalizedData: hasChart });
    }
  } catch (error: any) {
    console.error("Daily Overview General Error:", error);
    res.status(500).json({
      success: false,
      error: "Không thể tạo bản nhìn thấu ngày lúc này. Xin vui lòng thử lại.",
    });
  }
});

// API: Daily Personalized Energy (Combined Tu Vi & Natal Chart images + Daily Energy + Ancient Quote)
app.post("/api/daily-personalized-energy", async (req, res) => {
  try {
    const { userName, tuViImage, natalChartImage, astroProfile, dateStr, lunarInfo } = req.body;

    const hasTuVi = !!tuViImage;
    const hasNatal = !!natalChartImage;
    const hasAstroProfile = !!astroProfile?.birthDate || !!astroProfile?.sunSign;
    const hasAnyPersonalizedData = hasTuVi || hasNatal || hasAstroProfile;

    let prompt = "";

    if (hasAnyPersonalizedData) {
      prompt = `${CORE_PERSONA_GUIDELINES}

[BỘ MÔN]: LUẬN GIẢI NĂNG LƯỢNG NGÀY CÁ NHÂN HÓA KẾT HỢP TỬ VI ĐẨU SỐ & CHIÊM TINH HỌC TÂY PHƯƠNG
[VAI TRÒ]: Người bạn đồng hành am tường sâu sắc Năng lượng Vũ trụ, Thiên văn Chiêm tinh và Lịch pháp Dịch lý.

THÔNG TIN NGÀY HIỆN TẠI:
- Ngày Dương lịch: ${dateStr || "Hôm nay"}
- Âm lịch: Ngày ${lunarInfo?.day || "1"}/${lunarInfo?.month || "1"} Năm ${lunarInfo?.year || "Bính Ngọ"} (${lunarInfo?.lunarDateStr || ""})
- Can Chi Ngày: ${lunarInfo?.canChiDay || "Giáp Tý"}
- Ngũ Hành Nạp Âm Ngày: ${lunarInfo?.element || "Hải Trung Kim"}
- Tên người bạn: ${userName || "Bạn"}

TÌNH TRẠNG HỒ SƠ LÁ SỐ GỬI KÈM:
${hasTuVi ? "- ĐÃ CÓ ẢNH LÁ SỐ TỬ VI ĐẨU SỐ CÁ NHÂN." : "- Chưa gửi ảnh Lá số Tử Vi."}
${hasNatal ? "- ĐÃ CÓ ẢNH BẢN ĐỒ SAO CHIÊM TINH (NATAL CHART WHEEL)." : "- Chưa gửi ảnh Bản đồ sao."}
${astroProfile?.fullName ? `- Thông tin hồ sơ: ${astroProfile.fullName}, Ngày sinh: ${astroProfile.birthDate || "Chưa rõ"}, Cung Hoàng Đạo: ${astroProfile.sunSign || "Sư Tử"}.` : ""}

CHỈ DẪN TỐI QUAN TRỌNG VỀ ĐÁNH GIÁ CHỈ SỐ NĂNG LƯỢNG (AI CẦN SUY NGHĨ THẬT KỸ VÀ CẨN TRỌNG):
1. **SUY NGHĨ KỸ LƯỠNG & QUÁN CHIẾU THỰC SỰ**:
   - Bạn PHẢI đối chiếu thực sự giữa lá số người dùng (các cung sao, chính tinh, phụ tinh, hạn ngày trong Tử Vi; hoặc các hành tinh, góc chiếu Transit trong Bản đồ sao) với Can Chi (${lunarInfo?.canChiDay}) và Ngũ Hành Nạp Âm (${lunarInfo?.element}) của ngày hôm nay.
   - TUYỆT ĐỐI KHÔNG SỬ DỤNG LẠI HOẶC RẬP KHUÔN CÁC CON SỐ CỐ ĐỊNH (như 88, 92, 85, 78, 90). Mỗi người và mỗi ngày có trường năng lượng biến thiên độc lập (thang điểm 30 - 98 điểm).
   - Điểm số phải phản ánh chân thực độ tương hợp / khắc kỵ:
     + Ngày vượng khí, tương sinh, nhiều cát tinh/góc chiếu đẹp: 75 - 95 điểm.
     + Ngày bình hòa, quân bình: 60 - 74 điểm.
     + Ngày xung khắc, gặp sao xấu, hình hại hoặc góc chiếu căng thẳng: 35 - 58 điểm (cảnh báo thận trọng).

2. **QUY TẮC CỐT LÕI: NẾU KHÔNG THỂ BIẾT ĐƯỢC THÌ BỎ HẲN (CRITICAL)**:
   - "Nếu không thể biết được hoặc không có cơ sở chiêm tinh rõ ràng thì BỎ HẲN, tuyệt đối không bịa ra con số ảo".
   - Nếu ảnh lá số bị mờ, không nhận diện được các sao, hoặc dữ liệu không đủ để tính toán một cách xác thực: ĐỪNG CỐ ĐOÁN SỐ. Hãy để các giá trị điểm số là null và đặt "canDetermineScores": false trong khối JSON. Khi đó trong bài viết, không ghi các dòng điểm số /100 hay %, chỉ tập trung luận giải câu chữ định tính và đưa ra lời khuyên thực tiễn.

3. **NỘI DUNG LUẬN GIẢI CHÍNH**:
   - **I. Giao Thoa Cung Sao Bám Sát Lá Số**:
     + Nếu có ảnh Lá Số Tử Vi: Phân tích sự tương tác giữa Cung Mệnh/Thân, Cung Quan Lộc, Cung Tài Bạch và Vòng Vận ngày (Lưu Nhật Hạn) với Can Chi và Ngũ Hành hôm nay.
     + Nếu có ảnh Bản Đồ Sao: Phân tích sự tương tác giữa các hành tinh quá cảnh (Transit) hôm nay với The Big Three (Mặt Trời, Mặt Trăng, Cung Mọc) và các Nhà trên Bản đồ sao.
     + Chỉ rõ điểm bứt phá mạnh nhất và rủi ro/điểm xung khắc cần tránh hôm nay.
   - **II. Vận Trình Chi Tiết & Kế Sách Hành Động**:
     + *Công việc & Tiền tài*: Chiến lược hành động cụ thể.
     + *Cảm xúc & Mối quan hệ*: Ứng xử hòa ái, kết nối thiện duyên.
     + *Thân tâm & Dưỡng sinh*: Cân bằng năng lượng thể chất và tinh thần.
   - **III. Khung Giờ Cát Tường & Sắc Màu May Mắn**:
     + Khung giờ hoàng đạo và bộ con số hòa hợp ngũ hành.
   - **IV. Minh Triết Cổ Nhân Đúc Kết Năng Lượng Ngày**:
     + 1 câu danh ngôn trứ danh của cổ nhân (Kinh Dịch, Đạo Đức Kinh, Luận Ngữ...) kèm lời bình súc tích.

4. **KHỐI JSON ĐỒNG BỘ Ở CUỐI CÙNG (BẮT BUỘC)**:
Ở cuối cùng bài viết, đính kèm duy nhất 1 khối json sau:
\`\`\`json
{
  "canDetermineScores": true, // Đổi thành false nếu ảnh mờ / thiếu cơ sở / không thể tính điểm số chính xác
  "overallScore": 81, // Điểm số thực tính từ 30-98 dựa trên tương tác sao, hoặc null nếu canDetermineScores là false
  "fortuneScore": 76, // Điểm Tài lộc thực tính hoặc null
  "careerScore": 84, // Điểm Sự nghiệp thực tính hoặc null
  "loveScore": 70, // Điểm Nhân duyên thực tính hoặc null
  "healthScore": 88, // Điểm Thân tâm thực tính hoặc null
  "successProbability": 80, // % thành công việc lớn hoặc null
  "statusLabel": "Thượng Cát Cát Lợi", // Nhãn trạng thái chuẩn xác với điểm số
  "reasoning": "Tóm tắt 1 câu cơ sở tính điểm hoặc lý do bỏ điểm số"
}
\`\`\`
Trình bày bằng định dạng Markdown đẹp mắt, thanh lịch, trang trọng và truyền cảm hứng.`;
    } else {
      // General overview prompt when no charts are uploaded
      prompt = `${CORE_PERSONA_GUIDELINES}

[BỘ MÔN]: TỔNG QUAN NĂNG LƯỢNG THIÊN VĂN & LỊCH PHÁP CHUNG
[VAI TRÒ]: Người bạn đồng hành am tường sâu sắc Năng lượng Vũ trụ, Thiên văn Chiêm tinh và Lịch pháp Dịch lý.

THÔNG TIN NGÀY HIỆN TẠI:
- Ngày Dương lịch: ${dateStr || "Hôm nay"}
- Âm lịch: Ngày ${lunarInfo?.day || "1"}/${lunarInfo?.month || "1"} Năm ${lunarInfo?.year || "Bính Ngọ"} (${lunarInfo?.lunarDateStr || ""})
- Can Chi Ngày: ${lunarInfo?.canChiDay || "Giáp Tý"}
- Ngũ Hành Nạp Âm Ngày: ${lunarInfo?.element || "Hải Trung Kim"}

YÊU CẦU: Người dùng CHƯA TẢI LÊN LÁ SỐ TỬ VI HOẶC BẢN ĐỒ SAO.
Hãy đưa ra bản luận giải TỔNG QUAN KHÍ VẬN CHUNG CHUNG của ngày:
1. **Khí Vận Thiên Thời & Nhịp Điệu Vũ Trụ Ngày Hôm Nay**: Phân tích tổng thể ngày theo Can Chi, Ngũ Hành nạp âm.
2. **Khuyến Nghị Hòa Nhịp Cát Khí**: Lời khuyên chung về công việc, giao tiếp và thân tâm.
3. **Giờ Cát Tường & Sắc Màu May Mắn**: Khung giờ hoàng đạo chung và màu sắc tương sinh.
4. **Thông Điệp Cá Nhân Hóa**: Nhắc nhở người bạn rằng khi tải lên Lá số Tử Vi hoặc Bản đồ sao tại hồ sơ, hệ thống sẽ tự động bám sát từng cung sao và tính toán các con số phần trăm cát hung cụ thể cho riêng bạn.
5. **Minh Triết Cổ Nhân**: 1 câu danh ngôn sâu sắc tiếp thêm nội lực.
6. **KHỐI JSON (Đặt canDetermineScores là false vì chưa có lá số)**:
\`\`\`json
{
  "canDetermineScores": false,
  "overallScore": null,
  "fortuneScore": null,
  "careerScore": null,
  "loveScore": null,
  "healthScore": null,
  "successProbability": null,
  "statusLabel": "Bình Hòa Thuận Khí",
  "reasoning": "Chưa có ảnh lá số cá nhân nên không chấm điểm số định lượng"
}
\`\`\`

Trình bày định dạng Markdown trang nhã.`;
    }

    const parts: any[] = [];

    if (hasTuVi && tuViImage) {
      const tuViPart = await parseImageToInlineDataPart(tuViImage, "image/png");
      if (tuViPart) {
        parts.push(tuViPart);
        parts.push({ text: "[ĐÂY LÀ ẢNH LÁ SỐ TỬ VI CỦA NGƯỜI BẠN]" });
      }
    }

    if (hasNatal && natalChartImage) {
      const natalPart = await parseImageToInlineDataPart(natalChartImage, "image/png");
      if (natalPart) {
        parts.push(natalPart);
        parts.push({ text: "[ĐÂY LÀ ẢNH BẢN ĐỒ SAO CHIÊM TINH (NATAL CHART) CỦA NGƯỜI BẠN]" });
      }
    }

    parts.push({ text: prompt });

    try {
      let rawText = "";
      if (parts.length > 1) {
        rawText = await generateWithRetryAndFallback({ parts });
      } else {
        rawText = await generateWithRetryAndFallback(prompt);
      }

      const { cleanText, jsonBlock } = cleanJsonBlockFromMarkdown(rawText);
      const metrics = extractOrGenerateMetrics(cleanText, jsonBlock, hasAnyPersonalizedData, dateStr);

      return res.json({
        success: true,
        reading: cleanText,
        metrics,
        hasPersonalizedData: hasAnyPersonalizedData,
      });
    } catch (apiError: any) {
      console.warn("Gemini API fallback for Personalized Daily Energy activated:", apiError?.message);

      const fallbackText = `### ☀️ Năng Lượng Ngày Cá Nhân Hóa (${dateStr})
*Dành riêng cho bạn **${userName || "người bạn đồng hành"}** | Âm lịch: Ngày ${lunarInfo?.day || "1"}/${lunarInfo?.month || "1"} (${lunarInfo?.canChiDay || "Cát Nhật"} - ${lunarInfo?.element || "Hải Trung Kim"})*

---

#### I. Giao Thoa Năng Lượng Bám Sát Lá Số
${hasAnyPersonalizedData ? "- **Phản hồi từ Hồ Sơ Lá Số & Bản Đồ Sao**: Sự kết hợp giữa thế sao bản mệnh và thời vận ngày cho thấy Cung Quan Lộc và các trục cung vị đang nhận được luồng sinh khí tích cực. Trực giác của bạn hôm nay đặc biệt nhạy bén, các quyết định liên quan đến kế hoạch mới cần sự bình tĩnh và chắc chắn." : "- **Khí Vận Thiên Thời**: Năng lượng Can Chi ngày tương sinh với ngũ hành bản mệnh, tạo điều kiện thuận lợi cho sự tập trung trí tuệ và mở rộng quan hệ đối tác."}

#### II. Vận Trình Chi Tiết Các Khía Cạnh
- **Công việc & Tài lộc**: Thích hợp để ký kết, khởi động ý tưởng mới hoặc giải quyết dứt điểm các công việc đòi hỏi tư duy sáng tạo. Tránh để sự cầu toàn thái quá làm chậm tiến độ.
- **Cảm xúc & Mối quan hệ**: Lấy sự chân thành và thấu cảm làm trọng tâm. Một lời hỏi thăm ấm áp có thể hóa giải những hiểu lầm không đáng có.
- **Thân tâm & Dưỡng sinh**: Dành 15-20 phút buổi sáng hoặc chiều tối để tĩnh tâm, tiếp xúc với thiên nhiên hoặc thưởng trà để nạp lại nguồn sinh khí.

#### III. Khung Giờ Cát Tường & Sắc Màu May Mắn
- **Khung giờ hoàng đạo**: Giờ Thìn (07h - 09h), Giờ Tỵ (09h - 11h), Giờ Thân (15h - 17h).
- **Màu sắc hòa hợp**: Vàng kim, Xanh lam ngọc, Trắng ngà.
- **Con số may mắn**: 3, 6, 8, 9.

---

#### IV. MINH TRIẾT CỔ NHÂN ĐÚC KẾT NĂNG LƯỢNG NGÀY
> *"Quân tử dĩ thuận đức, tích tiểu dĩ cao đại."*
> — **Kinh Dịch (Chu Dịch - Quẻ Địa Phong Thăng)**
>
> *(Bậc quân tử noi theo đức thuận mà tích lũy từng việc nhỏ để làm nên việc lớn cao rộng. Năng lượng ngày hôm nay nhắc nhở bạn: Hãy kiên trì với những hành động thiện lành, từng bước nhỏ vững chắc sẽ kiến tạo nên thành tựu viên mãn).*`;

      const metrics = {
        canDetermineScores: false,
        overallScore: null,
        fortuneScore: null,
        careerScore: null,
        loveScore: null,
        healthScore: null,
        successProbability: null,
        elementalHarmonization: { supportive: 75, neutral: 20, conflicting: 5 },
        peakHours: ["07:00 - 09:00", "13:00 - 15:00"],
        luckyNumbers: [3, 8, 16, 28],
        statusLabel: "Luận Giải Khí Vận Mệnh",
        reasoning: "Tập trung luận giải định tính bám sát lá số (bỏ chấm điểm số do cần thêm căn cứ).",
        hasPersonalizedData: hasAnyPersonalizedData,
      };

      return res.json({
        success: true,
        reading: fallbackText,
        metrics,
        hasPersonalizedData: hasAnyPersonalizedData,
      });
    }
  } catch (error: any) {
    console.error("Personalized Daily Energy General Error:", error);
    res.status(500).json({
      success: false,
      error: "Không thể phân tích năng lượng ngày cá nhân lúc này. Xin vui lòng thử lại.",
    });
  }
});

// ==========================================
// ==========================================
// User Accounts & Authentication Database (Persistent on Disk)
// ==========================================
interface UserRecord {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "admin" | "user";
  isAdmin: boolean;
  createdAt: string;
  lastLogin: string;
  astroProfile?: {
    fullName?: string;
    birthDate?: string;
    birthHour?: string;
    calendarType?: "solar" | "lunar";
    gender?: "Nam" | "Nữ" | "Khác";
    birthPlace?: string;
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    notes?: string;
    tuViImageUrl?: string;
    natalChartImageUrl?: string;
  };
}

const USERS_FILE = path.join(process.cwd(), "users_db.json");
const MUSIC_FILE = path.join(process.cwd(), "music_db.json");
const HISTORY_FILE = path.join(process.cwd(), "history_db.json");
const PLANT_DIARY_FILE = path.join(process.cwd(), "plant_diary_db.json");

const ADMIN_EMAIL = "aha@aha.com";
const USERS_DB: Map<string, UserRecord> = new Map();

// Helper to load users from disk file
function loadUsersFromDisk() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf-8");
      const list = JSON.parse(data);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.email) {
            USERS_DB.set(item.email.toLowerCase().trim(), item);
          }
        }
      }
    }
  } catch (err) {
    console.warn("Failed to read users_db.json:", err);
  }

  // Ensure default Admin Account always exists
  if (!USERS_DB.has(ADMIN_EMAIL)) {
    USERS_DB.set(ADMIN_EMAIL, {
      id: "usr_admin_01",
      name: "Quản Trị Viên (Admin)",
      email: ADMIN_EMAIL,
      password: "123456",
      role: "admin",
      isAdmin: true,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      lastLogin: new Date().toISOString(),
      astroProfile: {
        fullName: "Quản Trị Viên",
        birthDate: "1990-01-01",
        birthHour: "Giờ Thìn (07h - 09h)",
        calendarType: "solar",
        gender: "Nam",
        birthPlace: "Hà Nội, Việt Nam",
        sunSign: "Ma Kết (Capricorn ♑)",
        moonSign: "Song Ngư (Pisces ♓)",
        risingSign: "Bọ Cạp (Scorpio ♏)",
      },
    });
  }

  // Ensure sample user exists if db is new
  if (!USERS_DB.has("minh.tue@example.com")) {
    USERS_DB.set("minh.tue@example.com", {
      id: "usr_member_02",
      name: "Nguyễn Tuệ Minh",
      email: "minh.tue@example.com",
      password: "password123",
      role: "user",
      isAdmin: false,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      lastLogin: new Date(Date.now() - 12 * 3600000).toISOString(),
      astroProfile: {
        fullName: "Nguyễn Tuệ Minh",
        birthDate: "1996-08-18",
        birthHour: "Giờ Ngọ (11h - 13h)",
        calendarType: "solar",
        gender: "Nữ",
        birthPlace: "Đà Nẵng, Việt Nam",
        sunSign: "Sư Tử (Leo ♌)",
        moonSign: "Thiên Bình (Libra ♎)",
        risingSign: "Nhân Mã (Sagittarius ♐)",
      },
    });
  }

  saveUsersToDisk();
}

// Helper to save all users to disk file
function saveUsersToDisk() {
  try {
    const list: UserRecord[] = [];
    USERS_DB.forEach((val) => list.push(val));
    fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write users_db.json:", err);
  }
}

// Initialize on start
loadUsersFromDisk();

function sanitizeUser(u: UserRecord) {
  const { password, ...safeUser } = u;
  return {
    ...safeUser,
    isLoggedIn: true,
  };
}

// API: Register
app.post("/api/auth/register", (req, res) => {
  try {
    const { name, email, password, astroProfile } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: "Vui lòng cung cấp địa chỉ email hợp lệ." });
    }
    if (!password || password.trim().length < 4) {
      return res.status(400).json({ success: false, error: "Mật khẩu phải có ít nhất 4 ký tự." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // STRICT RULE: Once an email is registered, it cannot be registered again!
    if (USERS_DB.has(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        error: `Email "${normalizedEmail}" đã được sử dụng trên hệ thống. Vui lòng chuyển sang Đăng Nhập hoặc dùng email khác.`,
      });
    }

    const isTargetAdmin = normalizedEmail === ADMIN_EMAIL;
    const newUser: UserRecord = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name?.trim() || (isTargetAdmin ? "Quản Trị Viên" : normalizedEmail.split("@")[0]),
      email: normalizedEmail,
      password: password.trim(),
      role: isTargetAdmin ? "admin" : "user",
      isAdmin: isTargetAdmin,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      astroProfile: astroProfile || {
        fullName: name?.trim() || "",
        birthDate: "",
        birthHour: "Giờ Thìn (07h - 09h)",
        calendarType: "solar",
        gender: "Nam",
        birthPlace: "Hà Nội, Việt Nam",
      },
    };

    USERS_DB.set(normalizedEmail, newUser);
    saveUsersToDisk();

    return res.json({
      success: true,
      message: "Đăng ký tài khoản thành công!",
      user: sanitizeUser(newUser),
    });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, error: "Lỗi máy chủ khi đăng ký tài khoản." });
  }
});

// API: Login
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Vui lòng nhập đầy đủ Email và Mật khẩu." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanPassword = password.toString().trim();

    // Special Check for Admin: aha@aha.com with password 123456
    if (normalizedEmail === ADMIN_EMAIL) {
      if (cleanPassword === "123456") {
        let adminUser = USERS_DB.get(ADMIN_EMAIL);
        if (!adminUser) {
          adminUser = {
            id: "usr_admin_01",
            name: "Quản Trị Viên (Admin)",
            email: ADMIN_EMAIL,
            password: "123456",
            role: "admin",
            isAdmin: true,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };
          USERS_DB.set(ADMIN_EMAIL, adminUser);
        } else {
          adminUser.lastLogin = new Date().toISOString();
        }
        saveUsersToDisk();
        return res.json({
          success: true,
          message: "Đăng nhập thành công với quyền Quản Trị Viên (Admin)!",
          user: sanitizeUser(adminUser),
        });
      } else {
        return res.status(401).json({
          success: false,
          error: "Mật khẩu quản trị viên không chính xác.",
        });
      }
    }

    // Normal User Check
    const existingUser = USERS_DB.get(normalizedEmail);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: "Email này chưa được đăng ký trên hệ thống. Vui lòng chuyển sang tab Đăng Ký.",
      });
    }

    if (existingUser.password && existingUser.password !== cleanPassword) {
      return res.status(401).json({
        success: false,
        error: "Mật khẩu không chính xác. Vui lòng kiểm tra lại.",
      });
    }

    existingUser.lastLogin = new Date().toISOString();
    saveUsersToDisk();

    return res.json({
      success: true,
      message: "Đăng nhập thành công!",
      user: sanitizeUser(existingUser),
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Lỗi máy chủ khi đăng nhập." });
  }
});

// API: Update Profile (and upload personal Lá Số / Bản Đồ Sao)
app.post("/api/auth/profile", (req, res) => {
  try {
    const { email, name, astroProfile } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Thiếu thông tin tài khoản." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = USERS_DB.get(normalizedEmail);

    if (existingUser) {
      if (name) existingUser.name = name.trim();
      if (astroProfile) {
        existingUser.astroProfile = {
          ...(existingUser.astroProfile || {}),
          ...astroProfile,
        };
      }
      saveUsersToDisk();
      return res.json({
        success: true,
        message: "Cập nhật hồ sơ thành công!",
        user: sanitizeUser(existingUser),
      });
    } else {
      // Create if not exists
      const newUser: UserRecord = {
        id: `usr_${Date.now()}`,
        name: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        role: normalizedEmail === ADMIN_EMAIL ? "admin" : "user",
        isAdmin: normalizedEmail === ADMIN_EMAIL,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        astroProfile,
      };
      USERS_DB.set(normalizedEmail, newUser);
      saveUsersToDisk();
      return res.json({
        success: true,
        message: "Đã lưu hồ sơ người dùng!",
        user: sanitizeUser(newUser),
      });
    }
  } catch (error: any) {
    console.error("Profile update error:", error);
    res.status(500).json({ success: false, error: "Lỗi khi lưu hồ sơ." });
  }
});

// API: Sync a User Account into Server Database
app.post("/api/auth/sync", (req, res) => {
  try {
    const user = req.body;
    if (!user || !user.email) {
      return res.status(400).json({ success: false, error: "Thiếu thông tin email người dùng" });
    }

    const email = user.email.trim().toLowerCase();
    const existing = USERS_DB.get(email);

    if (existing) {
      if (user.name) existing.name = user.name;
      if (user.astroProfile) {
        existing.astroProfile = {
          ...(existing.astroProfile || {}),
          ...user.astroProfile,
        };
      }
      existing.lastLogin = new Date().toISOString();
    } else {
      const isTargetAdmin = email === ADMIN_EMAIL;
      const newUser: UserRecord = {
        id: user.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: user.name || (isTargetAdmin ? "Quản Trị Viên" : email.split("@")[0]),
        email,
        password: user.password || "123456",
        role: isTargetAdmin ? "admin" : (user.role || "user"),
        isAdmin: isTargetAdmin || !!user.isAdmin,
        createdAt: user.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        astroProfile: user.astroProfile,
      };
      USERS_DB.set(email, newUser);
    }

    saveUsersToDisk();
    return res.json({ success: true, message: "Đã sao lưu tài khoản lên hệ thống!", total: USERS_DB.size });
  } catch (err: any) {
    console.error("Sync user error:", err);
    res.status(500).json({ success: false, error: "Lỗi khi đồng bộ tài khoản" });
  }
});

// API: Batch Sync Accounts (Admin Sync)
app.post("/api/admin/sync-accounts", (req, res) => {
  try {
    const { accounts } = req.body;
    if (!Array.isArray(accounts)) {
      return res.status(400).json({ success: false, error: "Dữ liệu accounts phải là một danh sách." });
    }

    let addedOrUpdated = 0;
    for (const acc of accounts) {
      if (!acc || !acc.email) continue;
      const email = acc.email.trim().toLowerCase();
      const existing = USERS_DB.get(email);

      if (existing) {
        if (acc.name) existing.name = acc.name;
        if (acc.astroProfile) {
          existing.astroProfile = {
            ...(existing.astroProfile || {}),
            ...acc.astroProfile,
          };
        }
      } else {
        const isTargetAdmin = email === ADMIN_EMAIL;
        USERS_DB.set(email, {
          id: acc.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: acc.name || (isTargetAdmin ? "Quản Trị Viên" : email.split("@")[0]),
          email,
          password: acc.password || "123456",
          role: isTargetAdmin ? "admin" : (acc.role || "user"),
          isAdmin: isTargetAdmin || !!acc.isAdmin,
          createdAt: acc.createdAt || new Date().toISOString(),
          lastLogin: acc.lastLogin || new Date().toISOString(),
          astroProfile: acc.astroProfile,
        });
      }
      addedOrUpdated++;
    }

    saveUsersToDisk();
    return res.json({
      success: true,
      message: `Đã đồng bộ và sao lưu ${addedOrUpdated} tài khoản lên bảng quản trị hệ thống!`,
      total: USERS_DB.size,
    });
  } catch (err: any) {
    console.error("Batch sync accounts error:", err);
    res.status(500).json({ success: false, error: "Lỗi khi đồng bộ hàng loạt tài khoản." });
  }
});

// API: Admin View All Registered Accounts
app.get("/api/admin/users", (_req, res) => {
  try {
    const list: any[] = [];
    USERS_DB.forEach((val) => {
      list.push(sanitizeUser(val));
    });

    // Sort: Admin first, then newest registered first
    list.sort((a, b) => {
      if (a.isAdmin && !b.isAdmin) return -1;
      if (!a.isAdmin && b.isAdmin) return 1;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return res.json({
      success: true,
      total: list.length,
      users: list,
    });
  } catch (error: any) {
    console.error("Admin fetch users error:", error);
    res.status(500).json({ success: false, error: "Lỗi máy chủ khi lấy danh sách tài khoản." });
  }
});

// API: Admin Delete Account
app.delete("/api/admin/users/:email", (req, res) => {
  try {
    const emailToDelete = req.params.email?.toLowerCase().trim();
    if (!emailToDelete) {
      return res.status(400).json({ success: false, error: "Thiếu email cần xóa." });
    }

    if (emailToDelete === ADMIN_EMAIL) {
      return res.status(403).json({ success: false, error: "Không thể xóa tài khoản Quản Trị Viên chính." });
    }

    if (USERS_DB.has(emailToDelete)) {
      const u = USERS_DB.get(emailToDelete);
      USERS_DB.delete(emailToDelete);
      saveUsersToDisk();
      USER_MUSIC_DB.delete(emailToDelete);
      if (u?.id) USER_MUSIC_DB.delete(u.id.toLowerCase());
      saveMusicToDisk();
      USER_HISTORY_DB.delete(emailToDelete);
      if (u?.id) USER_HISTORY_DB.delete(u.id.toLowerCase());
      saveHistoryToDisk();
      return res.json({ success: true, message: `Đã xóa tài khoản ${emailToDelete}` });
    } else {
      return res.status(404).json({ success: false, error: "Không tìm thấy tài khoản để xóa." });
    }
  } catch (error: any) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ success: false, error: "Lỗi khi xóa tài khoản." });
  }
});

// ==========================================
// Cross-Device Music Persistence API (Persistent on Disk)
// ==========================================
interface ServerMusicTrack {
  id: string;
  userId: string;
  title: string;
  artist: string;
  audioData: string; // base64 data URI
  mimeType: string;
  duration: number;
  fileSize: string;
  createdAt: number;
}

// Stores tracks mapped by normalized userId / email
const USER_MUSIC_DB: Map<string, ServerMusicTrack[]> = new Map();

function loadMusicFromDisk() {
  try {
    if (fs.existsSync(MUSIC_FILE)) {
      const data = fs.readFileSync(MUSIC_FILE, "utf-8");
      const obj = JSON.parse(data);
      if (typeof obj === "object" && obj !== null) {
        for (const [userId, tracks] of Object.entries(obj)) {
          if (Array.isArray(tracks)) {
            USER_MUSIC_DB.set(userId.toLowerCase().trim(), tracks);
          }
        }
      }
    }
  } catch (err) {
    console.warn("Failed to load music_db.json:", err);
  }
}

function saveMusicToDisk() {
  try {
    const obj: Record<string, ServerMusicTrack[]> = {};
    USER_MUSIC_DB.forEach((tracks, userId) => {
      obj[userId] = tracks;
    });
    fs.writeFileSync(MUSIC_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write music_db.json:", err);
  }
}

// Load music on startup
loadMusicFromDisk();

function getAllTracksForUserKey(rawKey: string): ServerMusicTrack[] {
  if (!rawKey) return [];
  const normalizedKey = rawKey.trim().toLowerCase();
  const directTracks = USER_MUSIC_DB.get(normalizedKey) || [];

  // Check if normalizedKey is an email, see if user has an ID
  const userByEmail = USERS_DB.get(normalizedKey);
  let idTracks: ServerMusicTrack[] = [];
  if (userByEmail?.id && userByEmail.id.toLowerCase() !== normalizedKey) {
    idTracks = USER_MUSIC_DB.get(userByEmail.id.toLowerCase()) || [];
  }

  // Check if normalizedKey is an ID, find their email
  let emailTracks: ServerMusicTrack[] = [];
  for (const [email, user] of USERS_DB.entries()) {
    if (user.id && user.id.toLowerCase() === normalizedKey && email !== normalizedKey) {
      emailTracks = USER_MUSIC_DB.get(email) || [];
      break;
    }
  }

  // Merge unique tracks
  const map = new Map<string, ServerMusicTrack>();
  for (const t of [...directTracks, ...idTracks, ...emailTracks]) {
    map.set(t.id, t);
  }
  const merged = Array.from(map.values());
  merged.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  return merged;
}

// API: Get all music tracks for a user (cross-device)
app.get("/api/music/:userId", (req, res) => {
  try {
    const rawUserId = req.params.userId;
    if (!rawUserId) {
      return res.status(400).json({ success: false, error: "Thiếu userId" });
    }
    const userId = rawUserId.trim().toLowerCase();
    const tracks = getAllTracksForUserKey(userId);
    return res.json({
      success: true,
      userId,
      count: tracks.length,
      tracks,
    });
  } catch (error: any) {
    console.error("Fetch user music error:", error);
    res.status(500).json({ success: false, error: "Lỗi máy chủ khi lấy danh sách nhạc." });
  }
});

// API: Upload / Sync music tracks for a user (cross-device)
app.post("/api/music/upload", (req, res) => {
  try {
    const { userId: rawUserId, tracks } = req.body;
    if (!rawUserId) {
      return res.status(400).json({ success: false, error: "Thiếu userId" });
    }
    if (!Array.isArray(tracks)) {
      return res.status(400).json({ success: false, error: "Danh sách tracks không hợp lệ" });
    }

    const userId = rawUserId.trim().toLowerCase();
    const existing = USER_MUSIC_DB.get(userId) || [];

    for (const track of tracks) {
      if (!track || !track.id) continue;
      const index = existing.findIndex((t) => t.id === track.id);
      const newTrack: ServerMusicTrack = {
        id: track.id,
        userId,
        title: track.title || "Nhạc của bạn",
        artist: track.artist || "Nhạc của bạn",
        audioData: track.audioData,
        mimeType: track.mimeType || "audio/mpeg",
        duration: track.duration || 0,
        fileSize: track.fileSize || "Unknown",
        createdAt: track.createdAt || Date.now(),
      };

      if (index >= 0) {
        existing[index] = newTrack;
      } else {
        existing.push(newTrack);
      }
    }

    // Keep sorted by creation date
    existing.sort((a, b) => a.createdAt - b.createdAt);
    USER_MUSIC_DB.set(userId, existing);
    saveMusicToDisk();

    return res.json({
      success: true,
      message: `Đã đồng bộ ${tracks.length} bài hát lên đám mây cho tài khoản!`,
      total: existing.length,
    });
  } catch (error: any) {
    console.error("Upload user music error:", error);
    res.status(500).json({ success: false, error: "Lỗi máy chủ khi lưu nhạc lên đám mây." });
  }
});

// API: Delete a single track for a user
app.delete("/api/music/track/:userId/:trackId", (req, res) => {
  try {
    const userId = req.params.userId?.trim().toLowerCase();
    const trackId = req.params.trackId;
    if (!userId || !trackId) {
      return res.status(400).json({ success: false, error: "Thiếu userId hoặc trackId" });
    }

    const existing = USER_MUSIC_DB.get(userId) || [];
    const filtered = existing.filter((t) => t.id !== trackId);
    USER_MUSIC_DB.set(userId, filtered);
    saveMusicToDisk();

    return res.json({
      success: true,
      message: "Đã xóa bài hát khỏi tài khoản trên đám mây",
      remaining: filtered.length,
    });
  } catch (error: any) {
    console.error("Delete track error:", error);
    res.status(500).json({ success: false, error: "Lỗi khi xóa bài hát." });
  }
});

// API: Clear all tracks for a user
app.delete("/api/music/all/:userId", (req, res) => {
  try {
    const userId = req.params.userId?.trim().toLowerCase();
    if (!userId) {
      return res.status(400).json({ success: false, error: "Thiếu userId" });
    }

    USER_MUSIC_DB.delete(userId);
    saveMusicToDisk();
    return res.json({ success: true, message: "Đã xóa toàn bộ nhạc của tài khoản" });
  } catch (error: any) {
    console.error("Clear user music error:", error);
    res.status(500).json({ success: false, error: "Lỗi khi xóa danh sách nhạc." });
  }
});

// ==========================================
// Cross-Device History Persistence API (Persistent on Disk)
// ==========================================
interface ServerHistoryItem {
  id: string;
  type: "tu-vi" | "natal-chart" | "tarot" | "kinh-dich";
  title: string;
  aspectOrSpread?: string;
  question: string;
  timestamp: number;
  resultMarkdown: string;
  summary?: string;
  meta?: any;
}

const USER_HISTORY_DB: Map<string, ServerHistoryItem[]> = new Map();

function loadHistoryFromDisk() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, "utf-8");
      const obj = JSON.parse(data);
      if (typeof obj === "object" && obj !== null) {
        for (const [userId, items] of Object.entries(obj)) {
          if (Array.isArray(items)) {
            USER_HISTORY_DB.set(userId.toLowerCase().trim(), items);
          }
        }
      }
    }
  } catch (err) {
    console.warn("Failed to load history_db.json:", err);
  }
}

function saveHistoryToDisk() {
  try {
    const obj: Record<string, ServerHistoryItem[]> = {};
    USER_HISTORY_DB.forEach((items, userId) => {
      obj[userId] = items;
    });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write history_db.json:", err);
  }
}

// Load history on startup
loadHistoryFromDisk();

function getAllHistoryForUserKey(rawKey: string): ServerHistoryItem[] {
  if (!rawKey) return [];
  const normalizedKey = rawKey.trim().toLowerCase();
  const directItems = USER_HISTORY_DB.get(normalizedKey) || [];

  // Check if normalizedKey is an email, see if user has an ID
  const userByEmail = USERS_DB.get(normalizedKey);
  let idItems: ServerHistoryItem[] = [];
  if (userByEmail?.id && userByEmail.id.toLowerCase() !== normalizedKey) {
    idItems = USER_HISTORY_DB.get(userByEmail.id.toLowerCase()) || [];
  }

  // Check if normalizedKey is an ID, find their email
  let emailItems: ServerHistoryItem[] = [];
  for (const [email, user] of USERS_DB.entries()) {
    if (user.id && user.id.toLowerCase() === normalizedKey && email !== normalizedKey) {
      emailItems = USER_HISTORY_DB.get(email) || [];
      break;
    }
  }

  // Merge unique items by id
  const map = new Map<string, ServerHistoryItem>();
  for (const item of [...directItems, ...idItems, ...emailItems]) {
    if (item && item.id) {
      map.set(item.id, item);
    }
  }
  const merged = Array.from(map.values());
  merged.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)); // Newest first
  return merged;
}

// API: Get all history items for a user (cross-device)
app.get("/api/history/:userId", (req, res) => {
  try {
    const rawUserId = req.params.userId;
    if (!rawUserId) {
      return res.status(400).json({ success: false, error: "Thiếu userId" });
    }
    const userId = rawUserId.trim().toLowerCase();
    const history = getAllHistoryForUserKey(userId);
    return res.json({
      success: true,
      userId,
      count: history.length,
      history,
    });
  } catch (error: any) {
    console.error("Fetch user history error:", error);
    res.status(500).json({ success: false, error: "Lỗi máy chủ khi lấy lịch sử xem." });
  }
});

// API: Save single history item for a user (cross-device)
app.post("/api/history/save", (req, res) => {
  try {
    const { userId: rawUserId, item } = req.body;
    if (!rawUserId) {
      return res.status(400).json({ success: false, error: "Thiếu userId" });
    }
    if (!item || !item.id) {
      return res.status(400).json({ success: false, error: "Dữ liệu bản ghi không hợp lệ" });
    }

    const userId = rawUserId.trim().toLowerCase();
    const existing = USER_HISTORY_DB.get(userId) || [];
    const index = existing.findIndex((h) => h.id === item.id);

    if (index >= 0) {
      existing[index] = { ...existing[index], ...item };
    } else {
      existing.unshift(item);
    }

    // Keep max 200 items per user
    const trimmed = existing.slice(0, 200);
    USER_HISTORY_DB.set(userId, trimmed);
    saveHistoryToDisk();

    return res.json({
      success: true,
      message: "Đã lưu lịch sử lên đám mây máy chủ thành công!",
      item,
      count: trimmed.length,
    });
  } catch (error: any) {
    console.error("Save user history error:", error);
    res.status(500).json({ success: false, error: "Lỗi khi lưu lịch sử lên đám mây." });
  }
});

// API: Batch sync history items for a user (cross-device)
app.post("/api/history/sync", (req, res) => {
  try {
    const { userId: rawUserId, history } = req.body;
    if (!rawUserId) {
      return res.status(400).json({ success: false, error: "Thiếu userId" });
    }
    if (!Array.isArray(history)) {
      return res.status(400).json({ success: false, error: "Danh sách history không hợp lệ" });
    }

    const userId = rawUserId.trim().toLowerCase();
    const existing = getAllHistoryForUserKey(userId);
    const map = new Map<string, ServerHistoryItem>();

    // Add server items first
    for (const item of existing) {
      if (item && item.id) map.set(item.id, item);
    }
    // Add client items
    for (const item of history) {
      if (item && item.id) {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
      }
    }

    const merged = Array.from(map.values());
    merged.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    const trimmed = merged.slice(0, 200);

    USER_HISTORY_DB.set(userId, trimmed);
    saveHistoryToDisk();

    return res.json({
      success: true,
      message: `Đã đồng bộ ${trimmed.length} bản ghi lịch sử với đám mây!`,
      count: trimmed.length,
      history: trimmed,
    });
  } catch (error: any) {
    console.error("Sync user history error:", error);
    res.status(500).json({ success: false, error: "Lỗi máy chủ khi đồng bộ lịch sử." });
  }
});

// API: Delete a single history item for a user
app.delete("/api/history/:userId/item/:itemId", (req, res) => {
  try {
    const rawUserId = req.params.userId?.trim().toLowerCase();
    const itemId = req.params.itemId;
    if (!rawUserId || !itemId) {
      return res.status(400).json({ success: false, error: "Thiếu userId hoặc itemId" });
    }

    // Delete across all keys (email & id)
    const user = USERS_DB.get(rawUserId);
    const keys = [rawUserId];
    if (user?.id) keys.push(user.id.toLowerCase());
    for (const [email, u] of USERS_DB.entries()) {
      if (u.id && u.id.toLowerCase() === rawUserId) {
        keys.push(email);
      }
    }

    for (const key of keys) {
      const items = USER_HISTORY_DB.get(key);
      if (items) {
        const filtered = items.filter((h) => h.id !== itemId);
        USER_HISTORY_DB.set(key, filtered);
      }
    }

    saveHistoryToDisk();
    return res.json({
      success: true,
      message: "Đã xóa bản ghi khỏi lịch sử đám mây.",
    });
  } catch (error: any) {
    console.error("Delete history item error:", error);
    res.status(500).json({ success: false, error: "Lỗi khi xóa bản ghi lịch sử." });
  }
});

// API: Delete multiple history items for a user
app.delete("/api/history/:userId/multiple", (req, res) => {
  try {
    const rawUserId = req.params.userId?.trim().toLowerCase();
    const { ids } = req.body;
    if (!rawUserId || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, error: "Thiếu userId hoặc danh sách ids" });
    }

    const idSet = new Set(ids);
    const user = USERS_DB.get(rawUserId);
    const keys = [rawUserId];
    if (user?.id) keys.push(user.id.toLowerCase());
    for (const [email, u] of USERS_DB.entries()) {
      if (u.id && u.id.toLowerCase() === rawUserId) {
        keys.push(email);
      }
    }

    for (const key of keys) {
      const items = USER_HISTORY_DB.get(key);
      if (items) {
        const filtered = items.filter((h) => !idSet.has(h.id));
        USER_HISTORY_DB.set(key, filtered);
      }
    }

    saveHistoryToDisk();
    return res.json({
      success: true,
      message: `Đã xóa ${ids.length} bản ghi khỏi lịch sử đám mây.`,
    });
  } catch (error: any) {
    console.error("Delete multiple history items error:", error);
    res.status(500).json({ success: false, error: "Lỗi khi xóa các bản ghi lịch sử." });
  }
});

// API: Clear all history for a user
app.delete("/api/history/:userId", (req, res) => {
  try {
    const rawUserId = req.params.userId?.trim().toLowerCase();
    if (!rawUserId) {
      return res.status(400).json({ success: false, error: "Thiếu userId" });
    }

    const user = USERS_DB.get(rawUserId);
    const keys = [rawUserId];
    if (user?.id) keys.push(user.id.toLowerCase());
    for (const [email, u] of USERS_DB.entries()) {
      if (u.id && u.id.toLowerCase() === rawUserId) {
        keys.push(email);
      }
    }

    for (const key of keys) {
      USER_HISTORY_DB.delete(key);
    }

    saveHistoryToDisk();
    return res.json({ success: true, message: "Đã xóa sạch toàn bộ lịch sử của tài khoản trên đám mây!" });
  } catch (error: any) {
    console.error("Clear user history error:", error);
    res.status(500).json({ success: false, error: "Lỗi khi xóa lịch sử." });
  }
});

// ==========================================
// Cross-Device Plant Garden & Diary Persistence API
// ==========================================
interface ServerPlantDiaryEntry {
  id: string;
  type: "water" | "weed";
  treeId: string;
  treeName: string;
  content: string;
  timestamp: number;
  dateStr: string;
  expGained: number;
  wisdomMessage?: string;
}

interface ServerPlantGarden {
  selectedTreeId: string;
  level: number;
  exp: number;
  totalExp: number;
  waterCount: number;
  weedCount: number;
  plantedAt: number;
  lastTendedAt: number;
  entries: ServerPlantDiaryEntry[];
}

const USER_PLANT_DB: Map<string, ServerPlantGarden> = new Map();

function loadPlantDiaryFromDisk() {
  try {
    if (fs.existsSync(PLANT_DIARY_FILE)) {
      const data = fs.readFileSync(PLANT_DIARY_FILE, "utf-8");
      const obj = JSON.parse(data);
      if (typeof obj === "object" && obj !== null) {
        for (const [userId, garden] of Object.entries(obj)) {
          if (garden && typeof garden === "object") {
            USER_PLANT_DB.set(userId.toLowerCase().trim(), garden as ServerPlantGarden);
          }
        }
      }
    }
  } catch (err) {
    console.warn("Failed to load plant_diary_db.json:", err);
  }
}

function savePlantDiaryToDisk() {
  try {
    const obj: Record<string, ServerPlantGarden> = {};
    USER_PLANT_DB.forEach((garden, userId) => {
      obj[userId] = garden;
    });
    fs.writeFileSync(PLANT_DIARY_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write plant_diary_db.json:", err);
  }
}

loadPlantDiaryFromDisk();

function getPlantGardenForUserKey(rawKey: string): ServerPlantGarden | null {
  if (!rawKey) return null;
  const normalizedKey = rawKey.trim().toLowerCase();
  if (USER_PLANT_DB.has(normalizedKey)) {
    return USER_PLANT_DB.get(normalizedKey)!;
  }

  // Check email/id resolution
  const userByEmail = USERS_DB.get(normalizedKey);
  if (userByEmail?.id && USER_PLANT_DB.has(userByEmail.id.toLowerCase())) {
    return USER_PLANT_DB.get(userByEmail.id.toLowerCase())!;
  }

  for (const [email, user] of USERS_DB.entries()) {
    if (user.id && user.id.toLowerCase() === normalizedKey && USER_PLANT_DB.has(email)) {
      return USER_PLANT_DB.get(email)!;
    }
  }

  return null;
}

// API: Get user plant garden state and diary
app.get("/api/plant-diary/:userId", (req, res) => {
  try {
    const rawUserId = req.params.userId;
    if (!rawUserId) {
      return res.status(400).json({ success: false, error: "Thiếu userId" });
    }
    const userId = rawUserId.trim().toLowerCase();
    const garden = getPlantGardenForUserKey(userId);

    return res.json({
      success: true,
      userId,
      garden: garden || null,
    });
  } catch (error: any) {
    console.error("Fetch user plant diary error:", error);
    res.status(500).json({ success: false, error: "Lỗi máy chủ khi lấy nhật ký nuôi cây." });
  }
});

// API: Save or update plant garden & single entry
app.post("/api/plant-diary/save", (req, res) => {
  try {
    const { userId: rawUserId, garden, newEntry } = req.body;
    if (!rawUserId) {
      return res.status(400).json({ success: false, error: "Thiếu userId" });
    }
    if (!garden) {
      return res.status(400).json({ success: false, error: "Thiếu dữ liệu vườn cây" });
    }

    const userId = rawUserId.trim().toLowerCase();
    const existing = USER_PLANT_DB.get(userId);

    let updatedEntries: ServerPlantDiaryEntry[] = Array.isArray(garden.entries) ? [...garden.entries] : [];
    if (newEntry && newEntry.id) {
      const exists = updatedEntries.some((e) => e.id === newEntry.id);
      if (!exists) {
        updatedEntries.unshift(newEntry);
      }
    }

    const savedGarden: ServerPlantGarden = {
      selectedTreeId: garden.selectedTreeId || existing?.selectedTreeId || "sakura",
      level: Number(garden.level) || existing?.level || 1,
      exp: Number(garden.exp) || existing?.exp || 0,
      totalExp: Number(garden.totalExp) || existing?.totalExp || 0,
      waterCount: Number(garden.waterCount) || existing?.waterCount || 0,
      weedCount: Number(garden.weedCount) || existing?.weedCount || 0,
      plantedAt: garden.plantedAt || existing?.plantedAt || Date.now(),
      lastTendedAt: garden.lastTendedAt || Date.now(),
      entries: updatedEntries.slice(0, 200),
    };

    USER_PLANT_DB.set(userId, savedGarden);
    savePlantDiaryToDisk();

    return res.json({
      success: true,
      message: "Đã lưu thông tin nuôi cây lên máy chủ thành công!",
      garden: savedGarden,
    });
  } catch (error: any) {
    console.error("Save plant diary error:", error);
    res.status(500).json({ success: false, error: "Lỗi khi lưu nhật ký nuôi cây." });
  }
});

// API: Sync garden state and entries
app.post("/api/plant-diary/sync", (req, res) => {
  try {
    const { userId: rawUserId, garden } = req.body;
    if (!rawUserId || !garden) {
      return res.status(400).json({ success: false, error: "Thiếu userId hoặc garden data" });
    }

    const userId = rawUserId.trim().toLowerCase();
    const serverGarden = getPlantGardenForUserKey(userId);

    if (!serverGarden) {
      USER_PLANT_DB.set(userId, garden);
      savePlantDiaryToDisk();
      return res.json({ success: true, garden });
    }

    // Merge entries
    const map = new Map<string, ServerPlantDiaryEntry>();
    for (const entry of serverGarden.entries || []) {
      if (entry && entry.id) map.set(entry.id, entry);
    }
    for (const entry of garden.entries || []) {
      if (entry && entry.id) {
        if (!map.has(entry.id)) {
          map.set(entry.id, entry);
        }
      }
    }

    const mergedEntries = Array.from(map.values());
    mergedEntries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    const maxExp = Math.max(serverGarden.totalExp || 0, garden.totalExp || 0);

    const mergedGarden: ServerPlantGarden = {
      selectedTreeId: garden.selectedTreeId || serverGarden.selectedTreeId || "sakura",
      level: Math.max(serverGarden.level || 1, garden.level || 1),
      exp: garden.exp || serverGarden.exp || 0,
      totalExp: maxExp,
      waterCount: Math.max(serverGarden.waterCount || 0, garden.waterCount || 0),
      weedCount: Math.max(serverGarden.weedCount || 0, garden.weedCount || 0),
      plantedAt: Math.min(serverGarden.plantedAt || Date.now(), garden.plantedAt || Date.now()),
      lastTendedAt: Math.max(serverGarden.lastTendedAt || 0, garden.lastTendedAt || 0),
      entries: mergedEntries.slice(0, 200),
    };

    USER_PLANT_DB.set(userId, mergedGarden);
    savePlantDiaryToDisk();

    return res.json({
      success: true,
      message: "Đồng bộ nhật ký nuôi cây hoàn tất!",
      garden: mergedGarden,
    });
  } catch (error: any) {
    console.error("Sync plant diary error:", error);
    res.status(500).json({ success: false, error: "Lỗi máy chủ khi đồng bộ nuôi cây." });
  }
});

// API: Delete a diary entry
app.delete("/api/plant-diary/:userId/:entryId", (req, res) => {
  try {
    const rawUserId = req.params.userId?.trim().toLowerCase();
    const entryId = req.params.entryId;
    if (!rawUserId || !entryId) {
      return res.status(400).json({ success: false, error: "Thiếu userId hoặc entryId" });
    }

    const garden = USER_PLANT_DB.get(rawUserId);
    if (garden) {
      garden.entries = (garden.entries || []).filter((e) => e.id !== entryId);
      USER_PLANT_DB.set(rawUserId, garden);
      savePlantDiaryToDisk();
    }

    return res.json({
      success: true,
      message: "Đã xóa mục nhật ký thành công.",
    });
  } catch (error: any) {
    console.error("Delete plant diary entry error:", error);
    res.status(500).json({ success: false, error: "Lỗi khi xóa nhật ký nuôi cây." });
  }
});

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`A Private Place server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
