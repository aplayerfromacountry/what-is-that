import { PlantTreeOption } from "../types";
import realSakuraImg from "../assets/images/real_sakura_tree_1788511553596.jpg";
import realGinkgoImg from "../assets/images/real_ginkgo_tree_1788511570723.jpg";
import realBodhiImg from "../assets/images/real_bodhi_tree_1788511587377.jpg";
import realWisteriaImg from "../assets/images/real_wisteria_tree_1788511606692.jpg";

export const PLANT_TREES: PlantTreeOption[] = [
  {
    id: "sakura",
    name: "Linh Thụ Anh Đào Dạ Nguyệt",
    nameEn: "Moonlit Celestial Sakura",
    title: "Cây Tình Thương & Chữa Lành Tâm Hồn",
    element: "Hỏa - Mộc (Thanh khiết)",
    meaning: "Bao dung, xoa dịu tổn thương, thu hút nhân duyên hòa ái & tình yêu thương thuần khiết",
    description:
      "Cổ thụ hoa anh đào nở rộ thanh nhã trong làn gió thanh mát. Từng cánh hoa hồng pastel tung bay trong gió giúp xoa dịu những nhát cắt tinh thần, nuôi dưỡng lòng trắc ẩn và sự an yên sâu sắc.",
    imageUrl: realSakuraImg,
    googlePhotoUrl: "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1200&q=80",
    googlePhotoCredit: "Nhiếp ảnh hoa anh đào thực tế (Unsplash / Google)",
    accentGradient: "from-rose-500/20 via-pink-500/10 to-purple-500/20",
    accentColor: "text-rose-300",
    borderColor: "border-rose-400/40 hover:border-rose-400/80",
    tagColor: "bg-rose-500/20 text-rose-200 border-rose-400/30",
    manifestSuggestions: [
      "Tôi mở lòng đón nhận tình yêu thương chân thành và sự bao dung của vũ trụ.",
      "Trái tim tôi tràn đầy sự ấm áp, bình an và thấu hiểu mọi người xung quanh.",
      "Tôi trân trọng và yêu quý bản thân trọn vẹn trong từng khoảnh khắc hiện tại.",
      "Mọi mối quan hệ của tôi ngày càng gắn kết, chân thành và nâng đỡ lẫn nhau.",
    ],
    sorrowSuggestions: [
      "Tôi đang cảm thấy cô đơn và có phần hụt hẫng vì những kỳ vọng chưa thành...",
      "Tôi cảm thấy tổn thương bởi một lời nói thiếu tinh tế trong ngày...",
      "Nỗi sợ bị từ chối và cảm giác không đủ tốt đang làm tôi trăn trở...",
      "Tôi trút bỏ áp lực phải làm vừa lòng tất cả mọi người chung quanh...",
    ],
  },
  {
    id: "ginkgo",
    name: "Cổ Thụ Ngân Hạnh Hoàng Kim",
    nameEn: "Golden Ginkgo of Abundance",
    title: "Cây Trí Tuệ & Thịnh Vượng Sung Túc",
    element: "Kim - Thổ (Vượng phát)",
    meaning: "Khai mở trí tuệ, hanh thông tài lộc, sự kiên định bền bỉ và gặt hái thành tựu lớn",
    description:
      "Cổ thụ ngân hạnh nghìn năm tuổi rực rỡ sắc vàng hoàng kim giữa đất trời. Tán lá rẻ quạt lay động uy nghi trong gió thu, khai thông dòng chảy tài lộc, trí huệ sáng suốt và thành công trường tồn.",
    imageUrl: realGinkgoImg,
    googlePhotoUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    googlePhotoCredit: "Nhiếp ảnh cổ thụ ngân hạnh mùa thu (Unsplash / Google)",
    accentGradient: "from-amber-500/20 via-yellow-500/10 to-orange-500/20",
    accentColor: "text-amber-300",
    borderColor: "border-amber-400/40 hover:border-amber-400/80",
    tagColor: "bg-amber-500/20 text-amber-200 border-amber-400/30",
    manifestSuggestions: [
      "Dòng chảy tài lộc, thịnh vượng và cơ hội quý giá luôn tự nhiên tìm đến với tôi.",
      "Trí tuệ và trực giác của tôi luôn sắc bén, sáng suốt trong mọi quyết định quan trọng.",
      "Tôi kiên định, tự tin và vững vàng trên con đường kiến tạo sự nghiệp rực rỡ.",
      "Mọi nỗ lực và sự kiên trì của tôi đều đơm hoa kết trái vượt xa mong đợi.",
    ],
    sorrowSuggestions: [
      "Tôi đang lo lắng về vấn đề tài chính và những khoản chi tiêu sắp tới...",
      "Cảm giác bế tắc, áp lực công việc và tiến độ đang đè nặng lên tâm trí...",
      "Tôi sợ mình không đủ năng lực để hoàn thành mục tiêu đã đề ra...",
      "Nỗi hoang mang về phương hướng sự nghiệp khiến tôi bồn chồn mất ngủ...",
    ],
  },
  {
    id: "bodhi",
    name: "Bồ Đề Nguyệt Quang Lam Ngọc",
    nameEn: "Celestial Azure Bodhi",
    title: "Cây Tĩnh Lặng & Giác Ngộ Tự Tại",
    element: "Thủy - Mộc (Thanh tịnh)",
    meaning: "An định tinh thần, buông bỏ chấp niệm, thấu triệt sự thật và tìm lại chính mình",
    description:
      "Đại thụ bồ đề cổ kính vươn tán rợp bóng an nhiên dưới bầu trời đêm tĩnh lặng. Từng chiếc lá hình trái tim xào xạc theo làn gió an định, che chở cho tâm hồn khỏi giông bão thế gian, đưa tâm trí trở về trạng thái an nhiên.",
    imageUrl: realBodhiImg,
    googlePhotoUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80",
    googlePhotoCredit: "Nhiếp ảnh đại thụ bồ đề / cổ thụ ngàn năm (Unsplash / Google)",
    accentGradient: "from-cyan-500/20 via-teal-500/10 to-indigo-500/20",
    accentColor: "text-cyan-300",
    borderColor: "border-cyan-400/40 hover:border-cyan-400/80",
    tagColor: "bg-cyan-500/20 text-cyan-200 border-cyan-400/30",
    manifestSuggestions: [
      "Tâm trí tôi tĩnh lặng như mặt hồ phẳng lặng, sáng rõ và an yên tuyệt đối.",
      "Tôi nhẹ nhàng buông bỏ những điều không thể kiểm soát để tận hưởng sự tự do nội tại.",
      "Mỗi hơi thở vào mang đến bình an, mỗi hơi thở ra xua tan mọi vướng bận trần thế.",
      "Tôi luôn được bảo bọc trong trường năng lượng chở che và bình thản sâu sắc.",
    ],
    sorrowSuggestions: [
      "Tâm trí tôi đang rối bời, suy nghĩ quá nhiều (overthinking) không thể ngơi nghỉ...",
      "Cảm giác bức bối, giận dữ và bất lực trước một việc bất như ý vừa xảy ra...",
      "Nỗi sợ tương lai vô định và cảm giác mất kết nối với chính mình...",
      "Tôi trút bỏ mọi muộn phiền, buông tay khỏi những điều khiến mình mệt mỏi...",
    ],
  },
  {
    id: "wisteria",
    name: "Tử Đằng Tinh Tú Vĩnh Hằng",
    nameEn: "Starlight Wisteria of Dreams",
    title: "Cây Hóa Giải & Ước Nguyện Thành Toàn",
    element: "Phong - Thủy (Biến chuyển diệu kỳ)",
    meaning: "Biến ước mơ thành hiện thực, hóa giải năng lượng tiêu cực, tái sinh niềm tin",
    description:
      "Cổ thụ hoa tử đằng nghìn tuổi buông rủ từng chùm hoa tím biếc như dòng suối hoa thướt tha lay động trước gió. Từng cánh hoa đung đưa nhịp nhàng biến chuyển mọi âu lo thành niềm hy vọng tươi sáng.",
    imageUrl: realWisteriaImg,
    googlePhotoUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    googlePhotoCredit: "Nhiếp ảnh đại thụ hoa tử đằng Ashikaga (Unsplash / Google)",
    accentGradient: "from-purple-500/20 via-violet-500/10 to-fuchsia-500/20",
    accentColor: "text-purple-300",
    borderColor: "border-purple-400/40 hover:border-purple-400/80",
    tagColor: "bg-purple-500/20 text-purple-200 border-purple-400/30",
    manifestSuggestions: [
      "Những ước mơ và mục tiêu cao đẹp của tôi đang dần trở thành hiện thực kỳ diệu.",
      "Vũ trụ đang sắp đặt mọi nguồn lực tốt nhất để hỗ trợ và nâng đỡ bước chân tôi.",
      "Tôi tin tưởng vào thời điểm hoàn hảo của số phận và đón nhận mọi điều kỳ diệu.",
      "Tôi tỏa ra năng lượng tích cực, rạng rỡ và thu hút những cơ hội thần kỳ.",
    ],
    sorrowSuggestions: [
      "Tôi cảm thấy chán nản vì ước mơ dường như quá xa vời so với thực tế...",
      "Cảm giác mệt mỏi và kiệt sức vì đã nỗ lực nhiều mà chưa thấy kết quả xứng đáng...",
      "Nỗi thất vọng và hối tiếc về một quyết định trong quá khứ...",
      "Tôi gửi gắm toàn bộ nỗi buồn này vào hư không để đón nhận niềm hy vọng mới...",
    ],
  },
];

export const TREE_LEVELS = [
  {
    level: 1,
    name: "Hạt Mầm Thức Tỉnh",
    nameEn: "Awakening Seed",
    expRequired: 100,
    badge: "🌱 Hạt Mầm",
    statusText: "Mầm cây vừa hé nở trong mảnh đất tâm thức, khao khát đón nhận sương mai.",
    perk: "+15 exp mỗi lần tưới manifest • +10 exp mỗi lần nhổ cỏ giải muộn",
  },
  {
    level: 2,
    name: "Chồi Biếc Hướng Dương",
    nameEn: "Rising Sprout",
    expRequired: 250,
    badge: "🌿 Chồi Non",
    statusText: "Từng chiếc lá biếc vươn mình đón nắng sớm, trường năng lượng ngày một vững chãi.",
    perk: "Kích hoạt hiệu ứng hào quang lấp lánh quanh gốc cây",
  },
  {
    level: 3,
    name: "Cây Non Hấp Thụ Tinh Hoa",
    nameEn: "Thriving Tree",
    expRequired: 500,
    badge: "🌳 Cây Non Khỏe Khoắn",
    statusText: "Thân cây vươn cao, rễ bám sâu vào lòng đất bình an, tán lá rợp bóng mát dịu.",
    perk: "Mở khóa hiệu ứng sương mai thần diệu & đom đóm dạ quang",
  },
  {
    level: 4,
    name: "Cổ Thụ Tỏa Ngát Khí Vận",
    nameEn: "Lush Elder Tree",
    expRequired: 900,
    badge: "✨ Cổ Thụ Sum Sê",
    statusText: "Cây trưởng thành sum sê tỏa hương thanh khiết, biến chuyển mọi ưu tư thành dưỡng chất.",
    perk: "Khuếch đại năng lượng manifest và bảo bọc trường khí cá nhân",
  },
  {
    level: 5,
    name: "Linh Thụ Đại Ngàn Phát Quang",
    nameEn: "Sacred Celestial Tree",
    expRequired: 1500,
    badge: "🌸👑 Linh Thụ Thần Diệu",
    statusText: "Đạt cảnh giới viên mãn đơm hoa kết trái rực rỡ, tỏa ánh hào quang chiếu rọi muôn phương.",
    perk: "Tâm thức an nhiên tự tại, mọi ước nguyện đều hòa nhịp với dòng chảy vũ trụ",
  },
];

export function calculateTreeLevel(totalExp: number): {
  level: number;
  currentLevelExp: number;
  expForNextLevel: number;
  levelInfo: typeof TREE_LEVELS[0];
  percent: number;
} {
  let accumulatedExp = 0;

  for (let i = 0; i < TREE_LEVELS.length; i++) {
    const lvl = TREE_LEVELS[i];
    const prevAccumulated = accumulatedExp;
    accumulatedExp += lvl.expRequired;

    if (totalExp < accumulatedExp || i === TREE_LEVELS.length - 1) {
      const currentLevelExp = Math.max(0, totalExp - prevAccumulated);
      const expForNextLevel = lvl.expRequired;
      const percent = Math.min(100, Math.round((currentLevelExp / expForNextLevel) * 100));

      return {
        level: lvl.level,
        currentLevelExp,
        expForNextLevel,
        levelInfo: lvl,
        percent,
      };
    }
  }

  const maxLvl = TREE_LEVELS[TREE_LEVELS.length - 1];
  return {
    level: 5,
    currentLevelExp: maxLvl.expRequired,
    expForNextLevel: maxLvl.expRequired,
    levelInfo: maxLvl,
    percent: 100,
  };
}
