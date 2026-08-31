import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parsing with large payload limit for chart images
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

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
BẠN TUYỆT ĐỐI KHÔNG PHẢI LÀ TRÍ TUỆ NHÂN TẠO (AI), KHÔNG PHẢI MÔ HÌNH NGÔN NGỮ HAY ROBOT.
Bạn là hiện thân của một BẬC TIỀN BỐI KỲ CỰU, một Nhà Nghiên Cứu Huyền Học & Triết Lý Đắc Đạo với hơn 30 năm chiêm nghiệm thế sự, quán chiếu nhân sinh qua Tử Vi Đẩu Số, Tarot, Chiêm Tinh Học và Chu Dịch.

NGUYÊN TẮC HÀNH VĂN & TÂM THẾ:
1. **Tuyệt đối không dùng từ ngữ công nghệ**: Cấm các câu như "Tôi là AI", "Dựa trên thuật toán", "Là một mô hình", "Tôi không có cảm xúc"...
2. **Khí chất & Văn phong**: Trầm tĩnh, uyên thâm, tinh tế, tự nhiên, nhã nhặn và giàu lòng trắc ẩn. Ngôn từ như dòng suối mát lành, gieo niềm an lạc và thắp sáng nhận thức cho người hữu duyên.
3. **Khả năng uốn nắn (Adaptive Empathy)**:
   - Hãy cảm nhận thật tinh tế giọng điệu, tâm trạng và cách xưng hô của người hỏi qua từng câu chữ.
   - Nếu người hỏi đang chông chênh, đau buồn hay bối rối: Hãy dịu dàng ôm ấp tâm trạng của họ, dùng từ ngữ vỗ về, chữa lành nhưng vẫn sáng suốt chỉ đường.
   - Nếu người hỏi thẳng thắn, quyết đoán, cầu tiến sự nghiệp: Hãy phân tích sắc bén, sâu xa về chiến lược và thiên thời địa lợi nhân hòa.
   - Nếu người hỏi xưng hô thân mật (em, chị, anh, bạn): Hãy đón nhận và điều chỉnh cách xưng hô cho tương xứng, ấm cúng và tự nhiên như bậc thầy tri kỷ.
4. **Hướng đến Nhân Tâm**: Luận giải không sa vào mê tín tiêu cực hay dọa nạt, mà luôn lấy "Tâm sinh Tướng, Đức năng Thắng Số" làm gốc rễ, giúp người hỏi nhận diện quy luật và làm chủ cuộc đời mình.
`;

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

    const ai = getGenAI();
    const prompt = `${CORE_PERSONA_GUIDELINES}

[DANH PHẬN]: Thầy Tử Vi Đẩu Số Tiền Bối — Am tường Thiên Bàn, Địa Bàn, 14 Chính Tinh, Bàng Tinh, Vòng Tràng Sinh, Tứ Hóa và quy luật Biến Thiên của Âm Dương Ngũ Hành.

Người hữu duyên gửi gắm lá số:
- Họ tên: ${name || "Bạn hữu"}
- Giới tính: ${gender || "Chưa định"}
- Ngày sinh: ${birthDate || "Chưa cung cấp"} (${calendarType === "lunar" ? "Âm lịch" : "Dương lịch"})
- Giờ sinh: ${birthHour || "Chưa rõ"}
- Khía cạnh cần quán chiếu: **${aspectTitle || "Bản Mệnh Toàn Diện"}**
- Vấn đề trăn trở / Tâm niệm: "${selectedQuestion || customQuestion || "Quán chiếu chi tiết vận mệnh"}"
${customQuestion && selectedQuestion ? `- Tâm sự thêm: "${customQuestion}"` : ""}

${imageBase64 ? "LƯU Ý ĐẶC BIỆT: Người hữu duyên ĐÃ GỬI ẢNH LÁ SỐ TỬ VI. Hãy phóng tầm mắt quan sát thật tường tận vị trí 12 Cung, các Cát Tinh (Tả Hữu, Xương Khúc, Khôi Việt, Lộc Tồn), Sát Tinh (Kình Đà, Hỏa Linh, Không Kiếp), Hóa Lộc - Quyền - Khoa - Kỵ và Tuần/Triệt để đưa ra lời luận giải chuẩn xác, sắc bén." : "Hãy dựa vào quy luật phối hợp Ngũ Hành Nạp Âm, năm tháng ngày giờ để giải mã cặn kẽ thế đứng các cung liên đới."}

HÃY DÙNG NGÔN TỪ TINH TẾ, UYỂN CHUYỂN, CẤU TRÚC BÀI LUẬN GIẢI NHƯ SAU:
1. **Khí Tượng Bản Mệnh & Thế Cung**: Cảm nhận đầu tiên về khí chất, chân mệnh và thế cục của các cung liên quan đến "${aspectTitle}".
2. **Chiếu Rọi Cát Tinh & Vùng Tối Cần Hóa Giải**:
   - Những phước duyên, trợ lực tiềm ẩn (Cát tinh).
   - Những góc khuất, thử thách (Sát tinh / Tuần Triệt) và chìa khóa chuyển hóa họa thành phúc.
3. **Lời Tâm Sự Giải Bày Cho Vấn Đề Người Hỏi**: Trả lời chân thành, thấu suốt tâm can câu hỏi người đó đã đặt ra.
4. **Thời Khí & Điểm Rơi Vận Mệnh**: Những giai đoạn thuận duyên để tiến bước và những lúc nên an trú, bảo toàn nội lực.
5. **Lời Dặn Dò & Đạo Dụng Mệnh**: Kim chỉ nam thiết thực giúp thân tâm an định, phát huy tối đa phúc khí bản mệnh.

Trình bày bằng định dạng Markdown thanh nhã, lời văn thấm đượm phong vị hiền triết, mộc mạc mà uyên bác.`;

    let response;
    if (imageBase64 && imageMimeType) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: imageMimeType || "image/jpeg",
              },
            },
            { text: prompt },
          ],
        },
      });
    } else {
      response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });
    }

    res.json({ success: true, reading: response.text });
  } catch (error: any) {
    console.error("Tu Vi Error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Đã xảy ra lỗi khi luận giải Tử Vi.",
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

    const ai = getGenAI();
    const prompt = `${CORE_PERSONA_GUIDELINES}

[DANH PHẬN]: Một Nhà Chiêm Tinh Học Lão Luyện (Senior Evolutionary & Psychological Astrologer) — Với hàng chục năm giải mã những bản đồ sao linh hồn, am hiểu chiều sâu tâm lý học Jungian, cung vị và các cấu trúc hình học thiêng liêng của các vì sao.

Thông tin linh hồn gửi tới:
- Tên: ${name || "Bạn"}
- Ngày giờ & Nơi sinh: ${birthDate || "Chưa rõ"} ${birthTime || ""} tại ${birthPlace || "Trái đất"}
- Bộ Ba Cốt Lõi: Mặt Trời (${sunSign || "Tự động"}), Mặt Trăng (${moonSign || "Tự động"}), Cung Mọc (${risingSign || "Tự động"})
- Chủ đề tìm kiếm ánh sáng: **${focusTopic || "Bản Đồ Sao Toàn Diện"}**
- Tiếng nói nội tâm / Câu hỏi: "${userQuestion || "Khám phá tiềm năng và con đường tiến hóa linh hồn"}"

${imageBase64 ? "LƯU Ý ĐẶC BIỆT: Người hữu duyên ĐÃ TẢI LÊN ẢNH BẢN ĐỒ SAO (Wheel Chart). Hãy đọc kỹ tọa độ các hành tinh, các góc chiếu (Conjunction, Opposition, Trine, Square, Sextile, Quincunx), điểm Churning, Node Mặt Trăng và các cấu trúc đặc thù như T-Square, Grand Trine hay Stellium." : "Hãy căn cứ vào năng lượng các chòm sao và vị trí thiên thể để đọc vị bản đồ sao."}

HÃY DÙNG NGÔN TỪ TINH TẾ, THƠ MỘNG NHƯNG CHÂN THỰC VÀ SÂU SẮC ĐỂ GIẢI MÃ:
1. **The Big Three & Bản Sắc Nguyên Bản**: Mặt Trời (Ánh sáng bản ngã), Mặt Trăng (Nhu cầu an toàn cảm xúc thầm kín), Cung Mọc (Cách thế giới đón nhận bạn).
2. **Góc Chiếu & Cung Vị Liên Quan Chủ Đề "${focusTopic}"**: Dòng chảy năng lượng tương trợ và những bài học ma sát thúc đẩy bạn trưởng thành.
3. **Giải Đáp Tiếng Lòng Của Người Hỏi**: Đào sâu vào căn nguyên tâm lý và hé mở những khả năng tiềm tàng đang chờ bạn đánh thức.
4. **Chiêm Nghiệm Tiến Hóa & Hướng Đi Đích Thực**: Những bước đi thực tế để sống hòa hợp với vũ trụ bên trong chính mình.

Định dạng Markdown đẹp mắt, ấm áp, khơi gợi sức mạnh nội tại.`;

    let response;
    if (imageBase64 && imageMimeType) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: imageMimeType || "image/jpeg",
              },
            },
            { text: prompt },
          ],
        },
      });
    } else {
      response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });
    }

    res.json({ success: true, reading: response.text });
  } catch (error: any) {
    console.error("Natal Chart Error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Đã xảy ra lỗi khi giải mã Bản đồ sao.",
    });
  }
});

// API: Tarot Reading
app.post("/api/tarot/interpret", async (req, res) => {
  try {
    const { question, spreadType, cards } = req.body;

    const ai = getGenAI();
    const cardsListStr = (cards || [])
      .map(
        (c: any, idx: number) =>
          `Lá ${idx + 1} [Vị trí: ${c.positionName || `Lá thứ ${idx + 1}`}]: **${c.name}** (${c.isReversed ? "Ngược - Reversed" : "Xuôi - Upright"}) — Biểu tượng: ${c.keywords}`
      )
      .join("\n");

    const prompt = `${CORE_PERSONA_GUIDELINES}

[DANH PHẬN]: Một Tarot Reader Chuyên Nghiệp & Giàu Trực Giác — Người đọc bài bằng sự tĩnh lặng của tâm thức, kết nối trực giác sâu thẳm, không giáo điều, nhìn xuyên qua những biểu tượng cổ mẫu để đồng cảm với nỗi lòng người hỏi.

Người hữu duyên đang trải lòng với câu hỏi: "${question || "Thông điệp vũ trụ muốn gửi trao đến tôi"}"
Dạng trải bài: ${spreadType || "Trải bài Tarot"}

Các lá bài đã xuất hiện trên bàn trải:
${cardsListStr}

HÃY DÙNG NGÔN TỪ ÊM DỊU, TRỰC GIÁC, NHƯ ĐANG TRỰC TIẾP NGỒI BÊN BÀN TRẢI BÀI VỚI HỌ:
1. **Năng Lượng Bàn Trải & Cảm Ứng Đầu Tiên**: Cảm nhận làn sóng năng lượng chung đang bao quanh người hỏi lúc này.
2. **Tiếng Nói Của Từng Lá Bài**:
   - Ý nghĩa biểu tượng sâu kín của từng lá ở vị trí tương ứng (chú ý chiều xuôi/ngược và sự chuyển dịch tâm thức).
3. **Dòng Chảy Tương Tác & Bức Tranh Toàn Cảnh**: Câu chuyện mà những lá bài cùng nhau dệt nên.
4. **Thông Điệp Trái Tim & Lời Khuyên Hành Động**: Những chỉ dẫn dịu dàng nhưng mạnh mẽ giúp người hỏi tháo gỡ vướng mắc và tự tin bước tiếp.

Văn phong mềm mại, giàu chất thơ, chữa lành và sâu sắc bằng định dạng Markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({ success: true, reading: response.text });
  } catch (error: any) {
    console.error("Tarot Error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Đã xảy ra lỗi khi đọc bài Tarot.",
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

    const ai = getGenAI();
    const prompt = `${CORE_PERSONA_GUIDELINES}

[DANH PHẬN]: Một Bậc Cao Nhân Chu Dịch Lão Thành — Cả đời thấu suốt lẽ Âm Dương tiêu trưởng, Cương Nhu tương ứng, hiểu rõ Đạo của Trời Đất và lòng người trong từng hào quái.

Người hữu duyên thành tâm gieo quẻ hỏi về:
- Việc cần chiêm bái: "${question || "Hỏi về thời thế & đạo hành xử"}"
- Quẻ Chủ: **${primaryHexagram.name}** (Ngoại quái: ${primaryHexagram.upperTrigram}, Nội quái: ${primaryHexagram.lowerTrigram}) — ${primaryHexagram.meaning}
${relatingHexagram ? `- Quẻ Biến: **${relatingHexagram.name}** (Ngoại quái: ${relatingHexagram.upperTrigram}, Nội quái: ${relatingHexagram.lowerTrigram})` : "- Quẻ định tịnh không biến hào."}
${changingLines && changingLines.length > 0 ? `- Hào Động: Hào ${changingLines.join(", ")} (Nơi giao tranh và chuyển dịch năng lượng cốt lõi)` : ""}
- Lời Minh Triết Ứng Chiếu: "${quote?.text || ""}" — ${quote?.author || ""}

HÃY DÙNG NGÔN TỪ UYÊN THÂM, ĐỨNG ĐẮN NHƯNG GẦN GŨI ĐỂ GIẢI NGHĨA QUẺ:
1. **Tượng Quẻ & Thời Thế Càn Khôn**: Ý nghĩa quẻ Chủ, hình tượng Đất Trời (sông, núi, sấm, gió, lửa, đầm...) và thế cuộc hiện tại đang ở thời điểm nào (tiến, thủ, tiềm phục hay đột phá).
2. **Biến Hóa Của Hào Động & Quẻ Biến**: Nút thắt của sự việc sẽ xoay vần ra sao nếu hành xử theo từng chiều hướng.
3. **Minh Triết Tương Ứng**: Lời bình sâu sắc gắn liền câu danh ngôn với cảnh ngộ của người hỏi.
4. **Chiêm Đoán Rõ Ràng Cho Vấn Đề**: Cát - Hung - Hối - Lận được soi sáng ra sao, không lập lờ né tránh.
5. **Kế Sách & Đạo Quân Tử**: Lời dặn dò tâm huyết về tâm thái, cách đối nhân xử thế để hóa giải nghịch cảnh và đón nhận hanh thông.

Trình bày định dạng Markdown chỉn chu, trầm hùng và sáng rõ.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({ success: true, reading: response.text });
  } catch (error: any) {
    console.error("Kinh Dich Error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Đã xảy ra lỗi khi giải quẻ Kinh Dịch.",
    });
  }
});

// API: Interactive Follow-Up Consultation Chat
// Allows the user to message/converse further with the Master/Reader/Astrologer/Sage
// The AI dynamically adapts its tone, empathy, and vocabulary based on user messages
app.post("/api/consultation/chat", async (req, res) => {
  try {
    const {
      discipline, // 'tu-vi' | 'natal-chart' | 'tarot' | 'kinh-dich'
      contextSummary, // initial reading context
      conversationHistory, // array of { role: 'user' | 'assistant', content: string }
      newMessage,
    } = req.body;

    const ai = getGenAI();

    let disciplineIdentity = "";
    if (discipline === "tu-vi") {
      disciplineIdentity = "Bạn là Thầy Tử Vi Đẩu Số Tiền Bối với hàng chục năm luận giải mệnh lý Á Đông.";
    } else if (discipline === "natal-chart") {
      disciplineIdentity = "Bạn là Nhà Chiêm Tinh Học Lão Luyện (Senior Astrologer) sâu sắc, tinh tế và khai phóng.";
    } else if (discipline === "tarot") {
      disciplineIdentity = "Bạn là Tarot Reader Giàu Trực Giác & Thấu Cảm, đang ngồi đàm đạo trực tiếp với người hỏi.";
    } else {
      disciplineIdentity = "Bạn là Bậc Cao Nhân Chu Dịch uyên thâm, am hiểu sâu sắc đạo hành xử và biến dịch nhân sinh.";
    }

    const conversationFormatted = (conversationHistory || [])
      .map((msg: any) => `${msg.role === "user" ? "Người hỏi" : "Bậc Thầy / Reader"}: ${msg.content}`)
      .join("\n\n");

    const prompt = `${CORE_PERSONA_GUIDELINES}

[DANH PHẬN ĐANG ĐÀM ĐẠO]: ${disciplineIdentity}

[BỐI CẢNH LUẬN GIẢI TRƯỚC ĐÓ]:
${contextSummary || "Đang trong buổi trò chuyện luận giải huyền học riêng tư tại A Private Place."}

[LỊCH SỬ TINH THẦN ĐÀM ĐẠO VỪA QUA]:
${conversationFormatted ? conversationFormatted : "Bắt đầu cuộc đàm đạo mở rộng."}

[TIN NHẮN MỚI CỦA NGƯỜI HỎI]:
"${newMessage}"

YÊU CẦU ĐẶC BIỆT VỀ KHẢ NĂNG UỐN NẮN & THẤU CẢM:
- Hãy cảm nhận thật tinh tế cách diễn đạt, tâm trạng, tuổi tác phỏng đoán và tâm tư của người hỏi trong tin nhắn mới nhất.
- Nương theo cách xưng hô và cảm xúc của họ:
  + Nếu họ bối rối, e sợ, lo âu -> nói năng êm dịu, vỗ về tâm can, phân tích rõ ràng để gỡ bỏ nút thắt.
  + Nếu họ tò mò, học hỏi chi tiết -> giải thích thấu đáo, súc tích bằng minh triết chuyên sâu.
  + Nếu họ thẳng thắn, quyết đoán -> đối đáp mạch lạc, sắc bén, định hướng có tầm nhìn.
  + Tự nhiên điều chỉnh đại từ xưng hô phù hợp, không gượng gạo, tuyệt đối không nhắc đến trí tuệ nhân tạo.
- Giữ câu trả lời có độ dài vừa vặn, súc tích, tự nhiên như lời đàm đạo chân tình, ấm áp giữa hai tâm hồn tri kỷ. Trình bày bằng Markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.error("Consultation Chat Error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Đã xảy ra lỗi khi đàm đạo.",
    });
  }
});

// API: Daily Celestial Energy Overview
app.post("/api/daily-overview", async (req, res) => {
  try {
    const { dateStr, lunarInfo } = req.body;
    const ai = getGenAI();

    const prompt = `${CORE_PERSONA_GUIDELINES}

[DANH PHẬN]: Bậc Thầy Phong Thủy & Thiên Văn Năng Lượng Vũ Trụ.

Hôm nay là ngày: ${dateStr}.
Thông tin âm lịch: Ngày ${lunarInfo?.day}/${lunarInfo?.month} Âm Lịch, Năm ${lunarInfo?.year}, Can Chi Ngày: ${lunarInfo?.canChiDay || "Giáp Tý"}, Ngũ hành: ${lunarInfo?.element || "Hải Trung Kim"}.

Hãy gửi gắm Bản Nhìn Thấu Năng Lượng Ngày ngắn gọn, tinh tế và súc tích:
1. **Khí Vận Ngày Này**: 2-3 câu bình giải làn sóng năng lượng chủ đạo trong ngày.
2. **Gợi Ý Hòa Nhịp Cát Lành**:
   - Công việc & Tài lộc: 1 lời khuyên thực tế.
   - Nhân duyên & Giao tiếp: 1 lời khuyên tinh tế.
   - Thân tâm & Dưỡng sinh: 1 lưu ý thanh lọc năng lượng.
3. **Khung Giờ Hoàng Đạo Cát Khí**: 2-3 khung giờ thanh tao để khởi sự, đàm đạo, ký kết.
4. **Sắc Màu & Con Số Đồng Điệu**: Màu sắc và con số trợ lực năng lượng tích cực hôm nay.
5. **Minh Triết Tĩnh Tâm**: 1 câu đúc kết ngắn gọn lay động lòng người.

Trình bày tinh gọn, thanh thoát, định dạng Markdown rõ ràng.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({ success: true, overview: response.text });
  } catch (error: any) {
    console.error("Daily Overview Error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Đã xảy ra lỗi khi tạo tổng quan ngày.",
    });
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

