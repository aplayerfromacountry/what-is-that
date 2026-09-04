import { Hexagram } from "../types";

export const TRIGRAMS: Record<string, { name: string; symbol: string; nature: string; element: string }> = {
  "111": { name: "Càn (Thiên)", symbol: "☰", nature: "Trời / Cương kiện", element: "Kim" },
  "000": { name: "Khôn (Địa)", symbol: "☷", nature: "Đất / Nhu thuận", element: "Thổ" },
  "010": { name: "Khảm (Thủy)", symbol: "☵", nature: "Nước / Hiểm trở", element: "Thủy" },
  "101": { name: "Ly (Hỏa)", symbol: "☲", nature: "Lửa / Sáng suốt", element: "Hỏa" },
  "001": { name: "Cấn (Sơn)", symbol: "☶", nature: "Núi / Tĩnh chỉ", element: "Thổ" },
  "110": { name: "Đoài (Trạch)", symbol: "☱", nature: "Đầm / Vui vẻ", element: "Kim" },
  "011": { name: "Tốn (Phong)", symbol: "☴", nature: "Gió / Thấm nhập", element: "Mộc" },
  "100": { name: "Chấn (Lôi)", symbol: "☳", nature: "Sấm / Khởi động", element: "Mộc" },
};

// 64 Quẻ Chu Dịch Cổ Đại (Chu Văn Vương Bát Quái Tượng Số)
export const HEXAGRAMS: Hexagram[] = [
  {
    id: 1,
    number: 1,
    name: "Thuần Càn (Bát Thuần Càn)",
    chineseName: "乾為天 (Qian)",
    binary: "111111",
    upperTrigram: "Càn (Trời)",
    lowerTrigram: "Càn (Trời)",
    upperTrigramSymbol: "☰",
    lowerTrigramSymbol: "☰",
    meaning: "Cương kiện, tự cường bất tức, nguồn năng lượng sáng tạo khởi nguyên của vũ trụ.",
    judgment: "Càn: Nguyên, hanh, lợi, trinh. (Khởi đầu vĩ đại, hanh thông suôn sẻ, giữ trọn chính đạo thì ắt đại cát).",
    image: "Thiên hành kiện, quân tử dĩ tự cường bất tức. (Trời vận hành mạnh mẽ, người quân tử noi theo mà không ngừng vươn lên).",
    quote: {
      text: "Trời vận hành không ngừng nghỉ, người quân tử cũng phải tự cường, tự lập mà vươn lên không một giây phút buông lơi.",
      author: "Khổng Tử (Kinh Dịch - Đại Tượng Truyện)",
      context: "Đạo làm việc lớn cần sức bền và ngọn lửa ý chí kiên định."
    }
  },
  {
    id: 2,
    number: 2,
    name: "Thuần Khôn (Bát Thuần Khôn)",
    chineseName: "坤為地 (Kun)",
    binary: "000000",
    upperTrigram: "Khôn (Đất)",
    lowerTrigram: "Khôn (Đất)",
    upperTrigramSymbol: "☷",
    lowerTrigramSymbol: "☷",
    meaning: "Nhu thuận, bao dung dưỡng dục, dùng đức dày chở che vạn vật (Hậu đức tải vật).",
    judgment: "Khôn: Nguyên hanh, lợi tẫn mã chi trinh. (Thuận theo tự nhiên, nhu hòa bền bỉ, khiêm nhường thì ắt thành tựu).",
    image: "Địa thế khôn, quân tử dĩ hậu đức tải vật. (Đất có thế nâng đỡ, người quân tử lấy đức dày mà bao dung chở che vạn vật).",
    quote: {
      text: "Nước mềm mại nhất trong thiên hạ nhưng không thứ gì cứng rắn có thể thắng nổi nó. Lấy nhu thắng cương, lấy tĩnh chế động.",
      author: "Lão Tử (Đạo Đức Kinh)",
      context: "Sức mạnh của sự bao dung, lắng nghe và nhu thuận."
    }
  },
  {
    id: 3,
    number: 3,
    name: "Thủy Lôi Truân",
    chineseName: "水雷屯 (Zhun)",
    binary: "100010",
    upperTrigram: "Khảm (Nước)",
    lowerTrigram: "Chấn (Sấm)",
    upperTrigramSymbol: "☵",
    lowerTrigramSymbol: "☳",
    meaning: "Gian nan buổi ban đầu, hạt mầm đang cựa mình đội đất trồi lên, cần tích lũy và kiên nhẫn.",
    judgment: "Truân: Nguyên hanh lợi trinh, vật dụng hữu du vãng, lợi kiến hầu. (Vạn sự khởi đầu nan, không nên manh động, hãy tìm người hiền giúp sức).",
    image: "Vân lôi truân, quân tử dĩ kinh luân. (Mây nước sấm chớp cuộn trào, người tài tranh thủ sắp xếp trật tự cơ nghiệp).",
    quote: {
      text: "Mọi việc đều khó khăn trước khi trở nên dễ dàng.",
      author: "Thomas Fuller",
      context: "Kiên nhẫn vượt qua thử thách sơ khai để tạo nền móng vững bền."
    }
  },
  {
    id: 4,
    number: 4,
    name: "Sơn Thủy Mông",
    chineseName: "山水蒙 (Meng)",
    binary: "010001",
    upperTrigram: "Cấn (Núi)",
    lowerTrigram: "Khảm (Nước)",
    upperTrigramSymbol: "☶",
    lowerTrigramSymbol: "☵",
    meaning: "Mờ tối mộng muội, cần được khai sáng học hỏi, tìm thầy hiền chỉ dạy.",
    judgment: "Mông: Hanh. Phỉ ngã cầu đồng mông, đồng mông cầu ngã. (Cần lòng thành khẩn cầu học, khiêm hạ lắng nghe).",
    image: "Sơn hạ xuất tuyền mông, quân tử dĩ quả hành dục đức. (Suối chảy dưới chân núi mịt mờ, người quân tử lấy hành động quả quyết mà nuôi dưỡng đức tính).",
    quote: {
      text: "Điều duy nhất tôi biết chắc chắn là tôi không biết gì cả. Sự nhận biết ngu dốt là khởi đầu của trí tuệ.",
      author: "Socrates",
      context: "Tâm thế người học trò, giữ ly nước rỗng để tiếp thu tinh hoa."
    }
  },
  {
    id: 5,
    number: 5,
    name: "Thủy Thiên Nhu",
    chineseName: "水天需 (Xu)",
    binary: "111010",
    upperTrigram: "Khảm (Nước)",
    lowerTrigram: "Càn (Trời)",
    upperTrigramSymbol: "☵",
    lowerTrigramSymbol: "☰",
    meaning: "Chờ đợi thời cơ chín muồi, nuôi dưỡng sức lực, giữ vững niềm tin trước giông bão.",
    judgment: "Nhu: Hữu phu, quang hanh, trinh cát, lợi thiệp đại xuyên. (Có lòng thành tín, sáng tỏ hanh thông, giữ chính thì tốt lành, vượt sông lớn có lợi).",
    image: "Vân thượng vu thiên nhu, quân tử dĩ ẩm thực yến lạc. (Mây bay lượn trên trời chưa mưa, người quân tử thư thái bồi bổ thân tâm, chờ đợi thời cơ).",
    quote: {
      text: "Kiên nhẫn là cay đắng, nhưng quả của nó lại rất ngọt ngào.",
      author: "Jean-Jacques Rousseau",
      context: "Chờ đợi không phải thụ động mà là chuẩn bị kỹ lưỡng cho ngày bùng nổ."
    }
  },
  {
    id: 6,
    number: 6,
    name: "Thiên Thủy Tụng",
    chineseName: "天水訟 (Song)",
    binary: "010111",
    upperTrigram: "Càn (Trời)",
    lowerTrigram: "Khảm (Nước)",
    upperTrigramSymbol: "☰",
    lowerTrigramSymbol: "☵",
    meaning: "Tranh chấp, kiện tụng, bất hòa, cần dĩ hòa vi quý, dừng lại đúng lúc để tránh họa hại.",
    judgment: "Tụng: Hữu phu trĩ dịch, trung cát, chung hung, lợi kiến đại nhân, bất lợi thiệp đại xuyên. (Tranh kiện thì giữa chừng biết hòa hoãn mới tốt, theo đuổi đến cùng ắt hung hiểm).",
    image: "Thiên dữ thủy vi hành tụng, quân tử dĩ tác sự mưu thủy. (Trời và nước ngược dòng nhau, người quân tử làm việc gì cũng phải mưu tính cẩn thận ngay từ đầu).",
    quote: {
      text: "Chiến thắng vĩ đại nhất là chiến thắng mà không cần phải giao chiến.",
      author: "Tôn Tử (Binh Pháp Tôn Tử)",
      context: "Hóa giải mâu thuẫn bằng sự sáng suốt thay vì đôi co thiệt hơn."
    }
  },
  {
    id: 7,
    number: 7,
    name: "Địa Thủy Sư",
    chineseName: "地水師 (Shi)",
    binary: "010000",
    upperTrigram: "Khôn (Đất)",
    lowerTrigram: "Khảm (Nước)",
    upperTrigramSymbol: "☷",
    lowerTrigramSymbol: "☵",
    meaning: "Dấy quân dẹp loạn, tập hợp sức mạnh tập thể, kỷ luật nghiêm minh và chính đạo dẫn đường.",
    judgment: "Sư: Trinh trượng nhân cát, vô cữu. (Giữ nghiêm chính đạo, giao cho bậc đại nhân từng trải chỉ huy thì tốt lành, không lỗi).",
    image: "Địa trung hữu thủy sư, quân tử dĩ dung dân súc chúng. (Trong lòng đất ngầm chứa dòng nước tụ hội, người lãnh đạo lấy lòng bao dung nuôi dưỡng muôn dân).",
    quote: {
      text: "Nếu muốn đi nhanh hãy đi một mình, nếu muốn đi xa hãy đi cùng nhau.",
      author: "Ngạn ngữ Châu Phi",
      context: "Kỷ luật và đồng lòng tạo nên sức mạnh vô địch."
    }
  },
  {
    id: 8,
    number: 8,
    name: "Thủy Địa Tỷ",
    chineseName: "水地比 (Bi)",
    binary: "000010",
    upperTrigram: "Khảm (Nước)",
    lowerTrigram: "Khôn (Đất)",
    upperTrigramSymbol: "☵",
    lowerTrigramSymbol: "☷",
    meaning: "Thân thiết gắn bó, tương trợ lẫn nhau, tìm kiếm minh chủ và bằng hữu chân thành.",
    judgment: "Tỷ: Cát. Nguyên phệ, nguyên vĩnh trinh, vô cữu. (Thân cận hòa hợp, giữ trọn chữ tín và sự chân thành lâu dài thì vạn sự tốt lành).",
    image: "Địa thượng hữu thủy tỷ, tiên vương dĩ kiến vạn quốc thân chư hầu. (Trên mặt đất có dòng nước thấm đẫm nhu hòa, bậc quân vương kết thân bằng hữu cùng phát triển).",
    quote: {
      text: "Một người bạn chân thành là nơi trú ẩn vững chắc, ai tìm được người bạn như thế là tìm được kho báu trần gian.",
      author: "Aristotle",
      context: "Đoàn kết và chọn người đáng tin cậy để đồng hành."
    }
  },
  {
    id: 9,
    number: 9,
    name: "Phong Thiên Tiểu Súc",
    chineseName: "風天小畜 (Xiao Chu)",
    binary: "111011",
    upperTrigram: "Tốn (Gió)",
    lowerTrigram: "Càn (Trời)",
    upperTrigramSymbol: "☴",
    lowerTrigramSymbol: "☰",
    meaning: "Tích lũy từng chút nhỏ, nuôi dưỡng năng lực từ từ, chưa thể làm đại sự ngay nhưng đang có tiến triển.",
    judgment: "Tiểu Súc: Hanh, mật vân bất vũ, tự ngã tây giao. (Mây dày đặc gió cuốn nhưng chưa đổ mưa, cần tích lũy công đức và kiên trì trau dồi).",
    image: "Phong hành thiên thượng tiểu súc, quân tử dĩ ý văn đức. (Gió thổi trên bầu trời, người quân tử chăm chút làm đẹp đức hạnh và nâng cao năng lực).",
    quote: {
      text: "Hành trình vạn dặm bắt đầu từ một bước chân. Tích tiểu thành đại là đạo tự nhiên.",
      author: "Lão Tử",
      context: "Kiên nhẫn gom góp nguồn lực từng ngày một."
    }
  },
  {
    id: 10,
    number: 10,
    name: "Thiên Trạch Lý",
    chineseName: "天澤履 (Lu)",
    binary: "110111",
    upperTrigram: "Càn (Trời)",
    lowerTrigram: "Đoài (Đầm)",
    upperTrigramSymbol: "☰",
    lowerTrigramSymbol: "☱",
    meaning: "Giẫm lên đuôi cọp mà không bị cắn, giữ lễ nghĩa, cẩn trọng hành sự, mềm mỏng nhưng kiên định.",
    judgment: "Lý: Lý hổ vĩ, bất xỉ nhân, hanh. (Đi sau đuôi cọp mà không bị cắn, giữ lễ độ và thái độ tôn trọng thì hanh thông).",
    image: "Thượng thiên hạ trạch lý, quân tử dĩ biện thượng hạ, định dân chí. (Trời trên đầm dưới phân minh, người quân tử phân rõ trên dưới, giữ lễ nghĩa đúng mực).",
    quote: {
      text: "Lễ độ và sự khiêm nhường không làm ta mất đi uy quyền, trái lại còn khuất phục được cả kẻ hung hãn.",
      author: "Benjamin Franklin",
      context: "Cách ứng xử khéo léo trong tình huống ngặt nghèo."
    }
  },
  {
    id: 11,
    number: 11,
    name: "Địa Thiên Thái",
    chineseName: "地天泰 (Tai)",
    binary: "111000",
    upperTrigram: "Khôn (Đất)",
    lowerTrigram: "Càn (Trời)",
    upperTrigramSymbol: "☷",
    lowerTrigramSymbol: "☰",
    meaning: "Thái bình thịnh trị, âm dương giao hòa, trời đất hòa hợp, vạn sự hanh thông thuận lợi.",
    judgment: "Thái: Tiểu vãng đại lai, cát hanh. (Điều nhỏ nhặt qua đi, việc lớn cát lành kéo đến, hanh thông thịnh vượng).",
    image: "Thiên địa giao thái, hậu dĩ tài thành thiên địa chi đạo. (Trời đất giao cảm sinh sôi, bậc hiền tài thuận theo quy luật mà phụng sự nhân sinh).",
    quote: {
      text: "Hạnh phúc lớn nhất không phải là không gặp trắc trở, mà là khi lòng ta an yên và hòa hợp với vạn vật xung quanh.",
      author: "Seneca",
      context: "Thời vận vàng son để tiến hành những kế hoạch ấp ủ."
    }
  },
  {
    id: 12,
    number: 12,
    name: "Thiên Địa Bĩ",
    chineseName: "天地否 (Pi)",
    binary: "000111",
    upperTrigram: "Càn (Trời)",
    lowerTrigram: "Khôn (Đất)",
    upperTrigramSymbol: "☰",
    lowerTrigramSymbol: "☷",
    meaning: "Bế tắc, ngăn cách, âm dương không thông, tiểu nhân đắc chí, người quân tử nên ẩn nhẫn giữ mình.",
    judgment: "Bĩ: Bĩ chi phỉ nhân, bất lợi quân tử trinh, đại vãng tiểu lai. (Thời vận bế tắc, người quân tử không nên vọng động, hãy giữ gìn khí tiết và tiết kiệm sức lực).",
    image: "Thiên địa bất giao bĩ, quân tử dĩ kiệm đức tị nan, bất khả vinh dĩ lộc. (Trời đất không giao hòa tạo thành bĩ tắc, người khôn ngoan giấu mình tránh tai ương).",
    quote: {
      text: "Trong đêm tối tăm nhất, hãy thắp lên ngọn lửa nội tâm và chờ đợi bình minh. Đừng lãng phí sức mạnh vào những cuộc chiến vô nghĩa.",
      author: "Khổng Tử",
      context: "Ẩn nhẫn bảo toàn thực lực khi gặp hoàn cảnh nghịch lý."
    }
  },
  {
    id: 13,
    number: 13,
    name: "Thiên Hỏa Đồng Nhân",
    chineseName: "天火同人 (Tong Ren)",
    binary: "101111",
    upperTrigram: "Càn (Trời)",
    lowerTrigram: "Ly (Lửa)",
    upperTrigramSymbol: "☰",
    lowerTrigramSymbol: "☲",
    meaning: "Hòa đồng cùng người, đại đồng thế giới, tìm bạn tri âm đồng chí hướng để cùng dựng xây đại nghiệp.",
    judgment: "Đồng Nhân: Vu dã hanh, lợi thiệp đại xuyên, lợi quân tử trinh. (Hòa đồng rộng khắp bốn phương thì hanh thông, vượt sông lớn có lợi, giữ lòng chính trực).",
    image: "Thiên dữ hỏa đồng nhân, quân tử dĩ loại tộc biện vật. (Lửa bốc lên trời soi sáng vạn vật, người quân tử tập hợp nhân tâm, đồng lòng hiệp lực).",
    quote: {
      text: "Nếu muốn đi thật xa, hãy kết nối với những tâm hồn cùng chí hướng và mục tiêu cao cả.",
      author: "Albert Einstein",
      context: "Mở rộng quan hệ, hợp tác đôi bên cùng có lợi."
    }
  },
  {
    id: 14,
    number: 14,
    name: "Hỏa Thiên Đại Hữu",
    chineseName: "火天大有 (Da You)",
    binary: "111101",
    upperTrigram: "Ly (Lửa)",
    lowerTrigram: "Càn (Trời)",
    upperTrigramSymbol: "☲",
    lowerTrigramSymbol: "☰",
    meaning: "Có tài sản lớn, mặt trời sáng rực trên đỉnh trời, tài lộc dồi dào, đức độ tỏa rạng.",
    judgment: "Đại Hữu: Nguyên hanh. (Đại thịnh vượng, khởi đầu tươi sáng và vạn sự hanh thông tốt lành).",
    image: "Hỏa tại thiên thượng đại hữu, quân tử dĩ át ác dương thiện, thuận thiên hưu mệnh. (Lửa sáng giữa vòm trời soi rọi, người quân tử trừ tà biểu dương điều thiện).",
    quote: {
      text: "Sự giàu có thực sự của một người được đo bằng những điều tốt đẹp họ cống hiến cho thế gian.",
      author: "Andrew Carnegie",
      context: "Khi đạt đỉnh cao thịnh vượng, hãy biết san sẻ và giữ lòng khiêm nhường."
    }
  },
  {
    id: 15,
    number: 15,
    name: "Địa Sơn Khiêm",
    chineseName: "地山謙 (Qian)",
    binary: "001000",
    upperTrigram: "Khôn (Đất)",
    lowerTrigram: "Cấn (Núi)",
    upperTrigramSymbol: "☷",
    lowerTrigramSymbol: "☶",
    meaning: "Khiêm tốn nhún nhường, núi cao vòi vọi chịu giấu mình dưới lòng đất, phúc lộc tự nhiên tìm đến.",
    judgment: "Khiêm: Hanh, quân tử hữu chung. (Khiêm nhường thì hanh thông, người quân tử giữ trước sau như một ắt có kết cục viên mãn).",
    image: "Địa trung hữu sơn khiêm, quân tử dĩ phẩu đa ích quả, xưng vật bình thi. (Trong lòng đất có ngọn núi cao, người quân tử bớt chỗ thừa bù vào chỗ thiếu, công bằng vô tư).",
    quote: {
      text: "Bông lúa chín là bông lúa cúi đầu. Càng uyên bác càng thấy mình nhỏ bé trước đại dương tri thức.",
      author: "Ngạn ngữ Á Đông",
      context: "Quẻ toàn cát trong Kinh Dịch - khiêm tốn là mẹ của vạn phúc."
    }
  },
  {
    id: 16,
    number: 16,
    name: "Lôi Địa Dự",
    chineseName: "雷地豫 (Yu)",
    binary: "000100",
    upperTrigram: "Chấn (Sấm)",
    lowerTrigram: "Khôn (Đất)",
    upperTrigramSymbol: "☳",
    lowerTrigramSymbol: "☷",
    meaning: "Vui vẻ phấn khởi, sấm nổ vang rền mặt đất thức tỉnh mầm sống, chuẩn bị hành động đem lại niềm vui.",
    judgment: "Dự: Lợi kiến hầu hành sư. (Thời cơ vui mừng hân hoan, thích hợp gây dựng cơ nghiệp và phát động công việc lớn).",
    image: "Lôi xuất địa phấn dự, tiên vương dĩ tác nhạc sùng đức. (Sấm nổ ra khỏi lòng đất gợi niềm vui hân hoan, người xưa tạo ra âm nhạc tôn vinh đức độ).",
    quote: {
      text: "Nụ cười và sự hân hoan là ánh sáng ban mai xua tan màn đêm u tối.",
      author: "Victor Hugo",
      context: "Thời cơ thuận lợi để truyền cảm hứng và bắt tay hành động."
    }
  },
  {
    id: 17,
    number: 17,
    name: "Trạch Lôi Tùy",
    chineseName: "澤雷隨 (Sui)",
    binary: "100110",
    upperTrigram: "Đoài (Đầm)",
    lowerTrigram: "Chấn (Sấm)",
    upperTrigramSymbol: "☱",
    lowerTrigramSymbol: "☳",
    meaning: "Tùy thời ứng biến, thuận theo dòng chảy tự nhiên, linh hoạt thích nghi với hoàn cảnh.",
    judgment: "Tùy: Nguyên hanh lợi trinh, vô cữu. (Thuận theo chính đạo thì vạn sự hanh thông, không có lỗi lầm gì).",
    image: "Trạch trung hữu lôi tùy, quân tử dĩ hướng hối nhập tức. (Trong đầm có sấm chớp theo mùa, người quân tử ngày làm đêm nghỉ, thuận theo nhịp điệu đất trời).",
    quote: {
      text: "Cây tre uốn mình theo chiều gió bão mà không gãy. Linh hoạt chính là bí mật của trường tồn.",
      author: "Tôn Tử",
      context: "Không cố chấp cứng nhắc, hãy xuôi theo chiều gió để tiến bước."
    }
  },
  {
    id: 18,
    number: 18,
    name: "Sơn Phong Cổ",
    chineseName: "山風蠱 (Gu)",
    binary: "011001",
    upperTrigram: "Cấn (Núi)",
    lowerTrigram: "Tốn (Gió)",
    upperTrigramSymbol: "☶",
    lowerTrigramSymbol: "☴",
    meaning: "Sửa chữa tệ hại hư hỏng, loại bỏ ung nhọt trì trệ, cải cách triệt để để hồi sinh.",
    judgment: "Cổ: Nguyên hanh, lợi thiệp đại xuyên, tiên giáp tam nhật, hậu giáp tam nhật. (Cải cách thì hanh thông, chuẩn bị kỹ trước 3 ngày và kiểm tra sau 3 ngày).",
    image: "Sơn hạ hữu phong cổ, quân tử dĩ chấn dân dục đức. (Dưới chân núi có gió ứ đọng, người quân tử chấn hưng tinh thần, sửa đổi thói hư tật xấu).",
    quote: {
      text: "Muốn có kết quả mới, bạn không thể tiếp tục lặp lại những thói quen cũ.",
      author: "Albert Einstein",
      context: "Thời điểm thanh lọc, dọn dẹp tàn dư và tái thiết."
    }
  },
  {
    id: 19,
    number: 19,
    name: "Địa Trạch Lâm",
    chineseName: "地澤臨 (Lin)",
    binary: "110000",
    upperTrigram: "Khôn (Đất)",
    lowerTrigram: "Đoài (Đầm)",
    upperTrigramSymbol: "☷",
    lowerTrigramSymbol: "☱",
    meaning: "Tiến đến gần gũi, giám sát ân cần, khí dương đang dâng lên mạnh mẽ, thời cơ vươn lên.",
    judgment: "Lâm: Nguyên hanh lợi trinh, chí vu bát nguyệt hữu hung. (Đang độ phát triển tốt đẹp, nhưng phải dự phòng đến tháng 8 có biến đổi).",
    image: "Địa thượng hữu trạch lâm, quân tử dĩ giáo tư vô cùng, dung bảo dân vô cương. (Trên mặt đất có đầm nước thấm đượm, người lãnh đạo chăm lo dạy dỗ và bảo bọc muôn người).",
    quote: {
      text: "Cơ hội không tự nhiên đến, cơ hội do chính sự chủ động và tận tâm của bạn tạo ra.",
      author: "Napoleon Hill",
      context: "Chủ động tiếp cận, nắm bắt cơ hội khi dương khí đang vượng."
    }
  },
  {
    id: 20,
    number: 20,
    name: "Phong Địa Quan",
    chineseName: "風地觀 (Guan)",
    binary: "000011",
    upperTrigram: "Tốn (Gió)",
    lowerTrigram: "Khôn (Đất)",
    upperTrigramSymbol: "☴",
    lowerTrigramSymbol: "☷",
    meaning: "Quan sát chiêm nghiệm, làm tấm gương sáng cho đời noi theo, lắng đọng tâm tư thấu thị sự việc.",
    judgment: "Quan: Quán nhi bất tiến, hữu phu dong nhược. (Quan sát trang nghiêm chân thành, lòng thành tín tự khắc cảm hóa vạn vật).",
    image: "Phong hành địa thượng quan, tiên vương dĩ tỉnh phương quan dân thiết giáo. (Gió thổi lướt trên mặt đất quan sát muôn nơi, bậc minh triết thấu hiểu lòng người mà giáo hóa).",
    quote: {
      text: "Người nhìn ra ngoài thì mơ mộng, người nhìn vào trong tâm mình mới thực sự tỉnh thức.",
      author: "Carl Jung",
      context: "Hãy lùi lại một bước quan sát toàn cảnh trước khi quyết định."
    }
  },
  {
    id: 21,
    number: 21,
    name: "Hỏa Lôi Phệ Hạp",
    chineseName: "火雷噬嗑 (Shi Ke)",
    binary: "100101",
    upperTrigram: "Ly (Lửa)",
    lowerTrigram: "Chấn (Sấm)",
    upperTrigramSymbol: "☲",
    lowerTrigramSymbol: "☳",
    meaning: "Cắn đứt trở ngại, loại bỏ kẻ cản đường, thực thi pháp luật nghiêm minh, quyết đoán hành động.",
    judgment: "Phệ Hạp: Hanh, lợi dụng ngục. (Cắn bỏ vật cản thì hanh thông, thích hợp chấn chỉnh kỷ cương và giải quyết dứt điểm).",
    image: "Lôi điện phệ hạp, tiên vương dĩ minh phạt sắc pháp. (Sấm chớp rền vang soi rõ chính tà, người cầm quyền dùng pháp luật nghiêm minh lập lại trật tự).",
    quote: {
      text: "Sự do dự chính là kẻ trộm đánh cắp thời gian và cơ hội. Hãy dũng cảm cắt bỏ những khúc mắc trì trệ.",
      author: "Edward Young",
      context: "Hành động dứt khoát, không nể nang làm ảnh hưởng việc lớn."
    }
  },
  {
    id: 22,
    number: 22,
    name: "Sơn Hỏa Bí",
    chineseName: "山火賁 (Bi)",
    binary: "101001",
    upperTrigram: "Cấn (Núi)",
    lowerTrigram: "Ly (Lửa)",
    upperTrigramSymbol: "☶",
    lowerTrigramSymbol: "☲",
    meaning: "Trang hoàng làm đẹp, văn hóa nghệ thuật, coi trọng vẻ đẹp nội dung bên trong hơn hình thức hào nhoáng.",
    judgment: "Bí: Hanh, tiểu lợi hữu du vãng. (Trang hoàng tao nhã thì hanh thông, việc nhỏ có lợi, không nên phóng đại vẻ ngoài).",
    image: "Sơn hạ hữu hỏa bí, quân tử dĩ minh thứ chính, vô cảm chiết ngục. (Dưới núi có lửa sáng chiếu rọi cảnh sắc, người quân tử làm sáng tỏ việc chính trị).",
    quote: {
      text: "Vẻ đẹp thực sự bắt đầu từ khoảnh khắc bạn quyết định là chính mình với sự chân thật mộc mạc.",
      author: "Coco Chanel",
      context: "Hình thức cần hài hòa với thực chất, tránh phô trương sáo rỗng."
    }
  },
  {
    id: 23,
    number: 23,
    name: "Sơn Địa Bác",
    chineseName: "山地剝 (Bo)",
    binary: "000001",
    upperTrigram: "Cấn (Núi)",
    lowerTrigram: "Khôn (Đất)",
    upperTrigramSymbol: "☶",
    lowerTrigramSymbol: "☷",
    meaning: "Bóc mòn tiêu điều, núi lở sụp đổ, âm thịnh dương suy, hãy bình tĩnh giữ gìn gốc rễ chờ qua cơn bĩ cực.",
    judgment: "Bác: Bất lợi hữu du vãng. (Thời kỳ suy thoái bào mòn, không nên tiến hành mạo hiểm việc mới).",
    image: "Sơn phụ vu địa bác, thượng dĩ hậu hạ an trạch. (Núi dựa trên đất bị xói lở, người trên phải biết che chở kẻ dưới mới giữ vững nền móng).",
    quote: {
      text: "Khi bão tố ập đến, kẻ khôn ngoan xây tường chắn gió, người thông thái xây cối xay gió, nhưng trước hết hãy bảo toàn tính mạng.",
      author: "Khuyết danh",
      context: "Thủ thế, cắt giảm thiệt hại, không manh động khi nghịch cảnh."
    }
  },
  {
    id: 24,
    number: 24,
    name: "Địa Lôi Phục",
    chineseName: "地雷復 (Fu)",
    binary: "100000",
    upperTrigram: "Khôn (Đất)",
    lowerTrigram: "Chấn (Sấm)",
    upperTrigramSymbol: "☷",
    lowerTrigramSymbol: "☳",
    meaning: "Hồi phục hồi sinh, một tia dương khí nảy nở trong lòng đất, đông tàn xuân đến, cơ hội mới mở ra.",
    judgment: "Phục: Hanh, xuất nhập vô tật, bằng lai vô cữu. (Hồi phục lại hanh thông, đi lại không lo tật bệnh, bạn bè cùng đến giúp sức).",
    image: "Lôi tại địa trung phục, tiên vương dĩ chí nhật bế quan, thương lữ bất hành. (Sấm tiềm ẩn trong lòng đất chờ thời, ngày Đông chí đóng cửa tĩnh dưỡng, không vội vã).",
    quote: {
      text: "Không có mùa đông nào kéo dài mãi mãi, và không có mùa xuân nào quên ghé lại trần gian.",
      author: "Hal Borland",
      context: "Ánh sáng đã le lói cuối đường hầm, bắt đầu hành trình mới đầy hứa hẹn."
    }
  },
  {
    id: 25,
    number: 25,
    name: "Thiên Lôi Vô Vọng",
    chineseName: "天雷無妄 (Wu Wang)",
    binary: "100111",
    upperTrigram: "Càn (Trời)",
    lowerTrigram: "Chấn (Sấm)",
    upperTrigramSymbol: "☰",
    lowerTrigramSymbol: "☳",
    meaning: "Không toan tính càn quấy, giữ tâm trong sáng tự nhiên, thuận theo lương tri, tránh vọng tưởng viển vông.",
    judgment: "Vô Vọng: Nguyên hanh lợi trinh, kỳ phỉ chính hữu sảnh, bất lợi hữu du vãng. (Chính đạo thì hanh thông lớn, toan tính sai lệch ắt gặp họa).",
    image: "Thiên hạ lôi hành vật dữ vô vọng, tiên vương dĩ mậu đối thời dưỡng vạn vật. (Sấm vang dưới vòm trời vạn vật tự nhiên sinh sôi, người quân tử thuận theo thời vận).",
    quote: {
      text: "Cứ làm việc thiện và giữ lòng thanh thản, phần còn lại hãy để trời xanh định liệu.",
      author: "Tục ngữ",
      context: "Đừng toan tính gian lận, cứ đi thẳng bằng con đường chân chính."
    }
  },
  {
    id: 26,
    number: 26,
    name: "Sơn Thiên Đại Súc",
    chineseName: "山天大畜 (Da Chu)",
    binary: "111001",
    upperTrigram: "Cấn (Núi)",
    lowerTrigram: "Càn (Trời)",
    upperTrigramSymbol: "☶",
    lowerTrigramSymbol: "☰",
    meaning: "Tích lũy to lớn, dung chứa ngàn vạn tinh hoa tri thức và tài năng, chuẩn bị cho sự nghiệp lẫy lừng.",
    judgment: "Đại Súc: Lợi trinh, bất gia thực cát, lợi thiệp đại xuyên. (Giữ điều chính đáng, không ăn bám gia đình mà tự lập thì cát lợi, vượt sông lớn thành công).",
    image: "Thiên tại sơn trung đại súc, quân tử dĩ đa thức tiền ngôn vãng hạnh, dĩ súc kỳ đức. (Bầu trời bao la thu gọn trong lòng núi, người quân tử học rộng nhớ nhiều để bồi đắp đức độ).",
    quote: {
      text: "Muốn trở thành ngọn hải đăng soi đường, trước hết bạn phải hấp thụ ánh sáng từ muôn triệu vì sao.",
      author: "Ralph Waldo Emerson",
      context: "Giai đoạn học hỏi sâu sắc, tích tụ nội công chuẩn bị xuất trận."
    }
  },
  {
    id: 27,
    number: 27,
    name: "Sơn Lôi Di",
    chineseName: "山雷頤 (Yi)",
    binary: "100001",
    upperTrigram: "Cấn (Núi)",
    lowerTrigram: "Chấn (Sấm)",
    upperTrigramSymbol: "☶",
    lowerTrigramSymbol: "☳",
    meaning: "Nuôi dưỡng chăm sóc, cẩn trọng lời ăn tiếng nói và cách thức tiếp nhận thức ăn, bồi dưỡng thân tâm.",
    judgment: "Di: Trinh cát, quan di, tự cầu khẩu thực. (Giữ chính đạo thì tốt lành, hãy xem cách nuôi dưỡng bản thân và người khác).",
    image: "Sơn hạ hữu lôi di, quân tử dĩ thận ngôn ngữ, tiết ẩm thực. (Dưới núi có sấm động, người quân tử thận trọng trong lời nói, tiết độ trong ăn uống).",
    quote: {
      text: "Lời nói đọi máu, thức ăn nuôi dưỡng thể xác, tư tưởng nuôi dưỡng tâm hồn. Hãy cẩn trọng những gì đưa vào và thốt ra.",
      author: "Hippocrates",
      context: "Chăm sóc sức khỏe, tu tâm dưỡng tính và giữ gìn khẩu nghiệp."
    }
  },
  {
    id: 28,
    number: 28,
    name: "Trạch Phong Đại Quá",
    chineseName: "澤風大過 (Da Guo)",
    binary: "011110",
    upperTrigram: "Đoài (Đầm)",
    lowerTrigram: "Tốn (Gió)",
    upperTrigramSymbol: "☱",
    lowerTrigramSymbol: "☴",
    meaning: "Gánh vác quá tải, cột trụ cong vênh vì chịu sức nặng quá lớn, cần dũng cảm điều chỉnh phi thường.",
    judgment: "Đại Quá: Đống nạo, lợi hữu du vãng, hanh. (Xà nhà oằn cong, cần hành động nhanh chóng giải tỏa sức nặng thì mới hanh thông).",
    image: "Trạch diệt mộc đại quá, quân tử dĩ độc lập bất cụ, độn thế vô muộn. (Nước đầm dâng cao ngập cả cây cổ thụ, người tài đứng vững không sợ hãi, dù ẩn dật cũng không buồn phiền).",
    quote: {
      text: "Áp lực tạo nên kim cương. Khi thử thách vượt qua sức chịu đựng thông thường, đó là lúc bản lĩnh xuất lộ.",
      author: "Thomas Carlyle",
      context: "Quyết tâm vượt qua tình huống quá tải bằng phương pháp đột phá."
    }
  },
  {
    id: 29,
    number: 29,
    name: "Thuần Khảm (Bát Thuần Khảm)",
    chineseName: "坎為水 (Kan)",
    binary: "010010",
    upperTrigram: "Khảm (Nước)",
    lowerTrigram: "Khảm (Nước)",
    upperTrigramSymbol: "☵",
    lowerTrigramSymbol: "☵",
    meaning: "Hiểm trở trùng trùng, nước sâu vực thẳm, giữ vững niềm tin và sự ngay thẳng để vượt qua sóng gió.",
    judgment: "Khảm: Tập khảm, hữu phu, duy tâm hanh, hành hữu thượng. (Hiểm nạn trùng điệp, giữ trọn lòng thành tín, tâm trí sáng suốt kiên trì ắt sẽ vượt qua).",
    image: "Thủy thao chí tập khảm, quân tử dĩ thường đức hạnh, tập giáo sự. (Nước chảy cuồn cuộn không ngừng, người quân tử rèn luyện đức hạnh bền bỉ vượt gian nan).",
    quote: {
      text: "Dòng sông đục thủng tảng đá không phải nhờ sức mạnh ghê gớm, mà nhờ sự kiên trì không ngừng nghỉ.",
      author: "Jim Watkins",
      context: "Giữ vững bình tĩnh trước hiểm nguy, không được hoảng loạn."
    }
  },
  {
    id: 30,
    number: 30,
    name: "Thuần Ly (Bát Thuần Ly)",
    chineseName: "離為火 (Li)",
    binary: "101101",
    upperTrigram: "Ly (Lửa)",
    lowerTrigram: "Ly (Lửa)",
    upperTrigramSymbol: "☲",
    lowerTrigramSymbol: "☲",
    meaning: "Sáng suốt rực rỡ, lửa cần nương tựa vào củi để cháy, văn minh sáng lạn, gắn bó đúng chỗ.",
    judgment: "Ly: Lợi trinh, hanh, súc tẫn ngưu cát. (Giữ vững sự ngay thẳng thì hanh thông, nuôi dưỡng tính nhu thuận như bò cái thì đại cát).",
    image: "Minh lưỡng tác ly, đại nhân dĩ kế minh chiếu vu tứ phương. (Hai ngọn đuốc sáng rực nối tiếp nhau, người sáng suốt lấy trí tuệ soi tỏ bốn phương).",
    quote: {
      text: "Hàng ngàn ngọn nến có thể được thắp sáng bởi một ngọn nến duy nhất mà ngọn nến ấy không hề tàn lụi. Trí tuệ chia sẻ làm sáng bừng nhân gian.",
      author: "Đức Phật Thích Ca Mâu Ni",
      context: "Dùng trí tuệ soi tỏ tương lai, tìm chỗ nương tựa vững chãi."
    }
  },
  {
    id: 31,
    number: 31,
    name: "Trạch Sơn Hàm",
    chineseName: "澤山咸 (Xian)",
    binary: "001110",
    upperTrigram: "Đoài (Đầm)",
    lowerTrigram: "Cấn (Núi)",
    upperTrigramSymbol: "☱",
    lowerTrigramSymbol: "☶",
    meaning: "Cảm ứng giao hòa, tình cảm chân thành rung động đôi lứa, đồng thanh tương ứng đồng khí tương cầu.",
    judgment: "Hàm: Hanh, lợi trinh, thủ nữ cát. (Giao cảm hanh thông, giữ trọn sự trong sáng, cưới hỏi kết giao đều tốt lành).",
    image: "Sơn thượng hữu trạch hàm, quân tử dĩ hư thụ nhân. (Trên đỉnh núi có đầm nước lắng đọng, người quân tử giữ lòng khiêm tốn mở rộng tiếp nhận mọi người).",
    quote: {
      text: "Trái tim có những lý lẽ riêng mà lý trí chẳng thể nào hiểu nổi. Sự chân thành lay động lòng người.",
      author: "Blaise Pascal",
      context: "Tình cảm tốt đẹp, nhân duyên sâu đậm, kết nối tâm giao."
    }
  },
  {
    id: 32,
    number: 32,
    name: "Lôi Phong Hằng",
    chineseName: "雷風恒 (Heng)",
    binary: "011100",
    upperTrigram: "Chấn (Sấm)",
    lowerTrigram: "Tốn (Gió)",
    upperTrigramSymbol: "☳",
    lowerTrigramSymbol: "☴",
    meaning: "Bền bỉ lâu dài, sấm gió luôn đi liền nhau, kiên định với mục tiêu, giữ trọn đạo nghĩa thủy chung.",
    judgment: "Hằng: Hanh, vô cữu, lợi trinh, lợi hữu du vãng. (Bền lâu thì hanh thông, không lỗi, giữ đạo kiên định tiến bước có lợi).",
    image: "Lôi phong hằng, quân tử dĩ lập bất dịch phương. (Sấm và gió tương trợ bền chặt, người quân tử đứng vững không đổi phương hướng).",
    quote: {
      text: "Thiên tài chỉ là 1% cảm hứng và 99% mồ hôi kiên trì.",
      author: "Thomas Edison",
      context: "Đạo thành công nằm ở sự kiên trì bền bỉ, không bỏ cuộc giữa chừng."
    }
  },
  {
    id: 33,
    number: 33,
    name: "Thiên Sơn Độn",
    chineseName: "天山遯 (Dun)",
    binary: "001111",
    upperTrigram: "Càn (Trời)",
    lowerTrigram: "Cấn (Núi)",
    upperTrigramSymbol: "☰",
    lowerTrigramSymbol: "☶",
    meaning: "Rút lui ẩn dật, lùi một bước để tiến ba bước, tránh đối đầu trực diện khi tiểu nhân đang chiếm ưu thế.",
    judgment: "Độn: Hanh, tiểu lợi trinh. (Lùi bước đúng lúc thì hanh thông, việc nhỏ giữ chính đạo có lợi).",
    image: "Thiên hạ hữu sơn độn, quân tử dĩ viễn tiểu nhân, bất ố nhi nghiêm. (Dưới gầm trời có núi cao sừng sững, người quân tử lánh xa kẻ tiểu nhân, không giận dữ nhưng giữ nghiêm phép tắc).",
    quote: {
      text: "Lùi một bước biển rộng trời cao, nhẫn một khắc sóng yên gió lặng.",
      author: "Cổ nhân",
      context: "Rút lui chiến thuật để bảo toàn lực lượng, chuẩn bị phản công."
    }
  },
  {
    id: 34,
    number: 34,
    name: "Lôi Thiên Đại Tráng",
    chineseName: "雷天大壯 (Da Zhuang)",
    binary: "111100",
    upperTrigram: "Chấn (Sấm)",
    lowerTrigram: "Càn (Trời)",
    upperTrigramSymbol: "☳",
    lowerTrigramSymbol: "☰",
    meaning: "Khí thế hừng hực, sức mạnh như sấm gầm trên trời, cần dùng sức mạnh có đạo lý, tránh húc bừa như dê đực.",
    judgment: "Đại Tráng: Lợi trinh. (Khí thế mạnh mẽ, giữ trọn đạo chính nghĩa mới bền lâu).",
    image: "Lôi tại thiên thượng đại tráng, quân tử dĩ phi lễ bất lý. (Sấm vang trên trời mạnh mẽ, người quân tử không làm việc trái với đạo đức lễ nghĩa).",
    quote: {
      text: "Sức mạnh không đến từ thể chất, nó đến từ ý chí bất khuất được dẫn đường bởi lương tri.",
      author: "Mahatma Gandhi",
      context: "Có quyền lực trong tay càng phải biết tự kiềm chế."
    }
  },
  {
    id: 35,
    number: 35,
    name: "Hỏa Địa Tấn",
    chineseName: "火地晉 (Jin)",
    binary: "000101",
    upperTrigram: "Ly (Lửa)",
    lowerTrigram: "Khôn (Đất)",
    upperTrigramSymbol: "☲",
    lowerTrigramSymbol: "☷",
    meaning: "Tiến lên rạng rỡ, mặt trời mọc lên khỏi mặt đất, thăng quan tiến chức, công danh xán lạn.",
    judgment: "Tấn: Khang hầu dụng tích mã phồn thứ, trú nhật tam tiếp. (Tiến bước vinh hiển, được vua ban thưởng nhiều ngựa quý, một ngày được tiếp kiến ba lần).",
    image: "Minh xuất địa thượng tấn, quân tử dĩ tự chiêu minh đức. (Mặt trời mọc từ lòng đất tỏa sáng, người tài tự làm rạng rỡ đức hạnh của mình).",
    quote: {
      text: "Thành công chỉ mỉm cười với những ai thức dậy sớm đón ánh bình minh và sẵn sàng bước tới.",
      author: "Napoleon",
      context: "Thời cơ thăng tiến công danh, hãy tự tin thể hiện tài năng."
    }
  },
  {
    id: 36,
    number: 36,
    name: "Địa Hỏa Minh Di",
    chineseName: "地火明夷 (Ming Yi)",
    binary: "101000",
    upperTrigram: "Khôn (Đất)",
    lowerTrigram: "Ly (Lửa)",
    upperTrigramSymbol: "☷",
    lowerTrigramSymbol: "☲",
    meaning: "Ánh sáng vùi trong lòng đất, chịu gian khó tủi nhục, hãy giấu tài giữ mình trong bóng tối chờ thời.",
    judgment: "Minh Di: Lợi gian trinh. (Ánh sáng bị tổn hại, nên giữ lòng kiên trinh chịu đựng gian nan).",
    image: "Minh nhập địa trung minh di, quân tử dĩ vị chúng, dụng hối nhi minh. (Ánh lửa chìm sâu dưới lòng đất, người sáng suốt hòa mình vào đám đông, ngoài tỏ ra vụng về nhưng trong sáng tỏ).",
    quote: {
      text: "Than bùn dưới áp lực ngàn năm biến thành kim cương. Chịu được nỗi khổ lớn nhất mới làm nên nghiệp lớn.",
      author: "Mạnh Tử",
      context: "Nhẫn nhịn, giấu tài, bảo toàn mạng sống và nhân phẩm trong hoàn cảnh tăm tối."
    }
  },
  {
    id: 37,
    number: 37,
    name: "Phong Hỏa Gia Nhân",
    chineseName: "風火家人 (Jia Ren)",
    binary: "101011",
    upperTrigram: "Tốn (Gió)",
    lowerTrigram: "Ly (Lửa)",
    upperTrigramSymbol: "☴",
    lowerTrigramSymbol: "☲",
    meaning: "Gia đình êm ấm, trong nhà hòa thuận trật tự, cội nguồn của mọi thành công xã hội.",
    judgment: "Gia Nhân: Lợi nữ trinh. (Đạo gia đình hòa thuận, người phụ nữ giữ trọn đức tính đoan trang thì cát lợi).",
    image: "Phong tự hỏa xuất gia nhân, quân tử dĩ ngôn hữu vật, nhi hành hữu hằng. (Gió từ ngọn lửa bốc lên ấm cúng, người quân tử lời nói có căn cứ, hành động có khuôn phép).",
    quote: {
      text: "Gia đình là tế bào của xã hội, là bến đỗ bình yên nhất che chở ta trước bão táp cuộc đời.",
      author: "Leo Tolstoy",
      context: "Tề gia trước khi trị quốc, chăm lo cho mái ấm của mình."
    }
  },
  {
    id: 38,
    number: 38,
    name: "Hỏa Trạch Khuê",
    chineseName: "火澤睽 (Kui)",
    binary: "110101",
    upperTrigram: "Ly (Lửa)",
    lowerTrigram: "Đoài (Đầm)",
    upperTrigramSymbol: "☲",
    lowerTrigramSymbol: "☱",
    meaning: "Chia rẽ bất đồng, lửa bốc lên trên nước đầm chảy xuống dưới, tìm kiếm điểm chung trong sự khác biệt.",
    judgment: "Khuê: Tiểu sự cát. (Bất đồng ly tán, chỉ nên làm những việc nhỏ hòa giải).",
    image: "Thượng hỏa hạ trạch khuê, quân tử dĩ đồng nhi dị. (Lửa trên đầm dưới trái ngược nhau, người quân tử hòa đồng nhưng vẫn giữ cá tính độc lập).",
    quote: {
      text: "Sự bất đồng ý kiến là cơ hội tuyệt vời để chúng ta học cách tôn trọng sự đa dạng.",
      author: "Voltaire",
      context: "Cầu đồng tồn dị, tìm tiếng nói chung để tránh rạn nứt."
    }
  },
  {
    id: 39,
    number: 39,
    name: "Thủy Sơn Kiển",
    chineseName: "水山蹇 (Jian)",
    binary: "001010",
    upperTrigram: "Khảm (Nước)",
    lowerTrigram: "Cấn (Núi)",
    upperTrigramSymbol: "☵",
    lowerTrigramSymbol: "☶",
    meaning: "Khó khăn chông gai, phía trước là nước sâu hiểm nạn, phía sau là núi cao chặn lối, nên dừng lại suy ngẫm.",
    judgment: "Kiển: Lợi tây nam, bất lợi đông bắc, lợi kiến đại nhân, trinh cát. (Đi về hướng Tây Nam thuận lợi, tìm người tài đức chỉ dẫn thì tai qua nạn khỏi).",
    image: "Sơn thượng hữu thủy kiển, quân tử dĩ phản thân tu đức. (Trên núi có dòng nước hiểm trở, người quân tử quay về soi xét bản thân và tu dưỡng phẩm chất).",
    quote: {
      text: "Khó khăn không phải là bức tường ngăn cản bạn, mà là bài kiểm tra xem bạn khao khát mục tiêu đến mức nào.",
      author: "John C. Maxwell",
      context: "Tạm dừng lại xem xét nội tại, tìm kiếm bậc quý nhân trợ lực."
    }
  },
  {
    id: 40,
    number: 40,
    name: "Lôi Thủy Giải",
    chineseName: "雷水解 (Xie)",
    binary: "010100",
    upperTrigram: "Chấn (Sấm)",
    lowerTrigram: "Khảm (Nước)",
    upperTrigramSymbol: "☳",
    lowerTrigramSymbol: "☵",
    meaning: "Hóa giải tai ách, sấm nổ mưa tan rạng rỡ đất trời, trút bỏ gánh nặng, tha thứ lỗi lầm.",
    judgment: "Giải: Lợi tây nam, vô sở vãng, kỳ lai phục cát, hữu sở vãng, túc cát. (Hóa giải hiểm nguy, nên trở về thế cân bằng, nếu cần hành động thì làm thật nhanh gọn).",
    image: "Lôi vũ tác giải, quân tử dĩ xá quá hữu tội. (Sấm mưa giáng xuống làm tan biến oi bức, người nhân từ bao dung tha thứ lỗi lầm cho kẻ khác).",
    quote: {
      text: "Sự tha thứ là mùi hương mà bông hoa tím tỏa ra cho gót chân vừa giẫm nát nó.",
      author: "Mark Twain",
      context: "Giai đoạn nhẹ nhõm, cởi bỏ trói buộc và ân oán để tái sinh."
    }
  },
  {
    id: 41,
    number: 41,
    name: "Sơn Trạch Tổn",
    chineseName: "山澤損 (Sun)",
    binary: "110001",
    upperTrigram: "Cấn (Núi)",
    lowerTrigram: "Đoài (Đầm)",
    upperTrigramSymbol: "☶",
    lowerTrigramSymbol: "☱",
    meaning: "Bớt dưới thêm trên, biết hy sinh cái nhỏ để thu hoạch cái lớn, kiềm chế lòng tham và nóng nảy.",
    judgment: "Tổn: Hữu phu, nguyên cát, vô cữu, khả trinh, lợi hữu du vãng. (Có lòng chân thành thì rất tốt lành, biết hy sinh đúng đắn sẽ có kết quả lớn).",
    image: "Sơn hạ hữu trạch tổn, quân tử dĩ trừng phẫn trất dục. (Dưới chân núi sâu lắng đầm nước, người quân tử kiềm chế cơn giận và nén bớt dục vọng).",
    quote: {
      text: "Không có sự vĩ đại nào đạt được mà không trải qua đức hy sinh.",
      author: "Martin Luther King Jr.",
      context: "Bớt chi tiêu hoang phí, tập trung vào giá trị cốt lõi lâu dài."
    }
  },
  {
    id: 42,
    number: 42,
    name: "Phong Lôi Ích",
    chineseName: "風雷益 (Yi)",
    binary: "100011",
    upperTrigram: "Tốn (Gió)",
    lowerTrigram: "Chấn (Sấm)",
    upperTrigramSymbol: "☴",
    lowerTrigramSymbol: "☳",
    meaning: "Gia tăng bồi đắp, gió thổi sấm rền làm tăng sinh khí, thêm phúc thêm lộc, giúp đỡ cộng đồng.",
    judgment: "Ích: Lợi hữu du vãng, lợi thiệp đại xuyên. (Tăng thêm lợi ích, thích hợp hành động tiến tới, vượt sông lớn có lợi).",
    image: "Phong lôi ích, quân tử dĩ kiến thiện tắc thiên, hữu quá tắc cải. (Gió và sấm tăng cường sức mạnh cho nhau, người quân tử thấy điều thiện thì làm theo, có lỗi thì sửa đổi).",
    quote: {
      text: "Cách duy nhất để nhân đôi niềm vui và sự thịnh vượng là san sẻ nó cho người khác.",
      author: "Albert Schweitzer",
      context: "Thời cơ phát triển nhanh, tạo dựng giá trị và chia sẻ tài lộc."
    }
  },
  {
    id: 43,
    number: 43,
    name: "Trạch Thiên Quải",
    chineseName: "澤天夬 (Guai)",
    binary: "111110",
    upperTrigram: "Đoài (Đầm)",
    lowerTrigram: "Càn (Trời)",
    upperTrigramSymbol: "☱",
    lowerTrigramSymbol: "☰",
    meaning: "Quyết liệt trừ tà, đầm nước bốc lên tận trời sắp đổ mưa rào, tuyên bố dứt khoát đẩy lùi cái xấu.",
    judgment: "Quải: Dương vu vương đình, phu hào hữu lệ, cáo tự ấp, bất lợi tức nhung, lợi hữu du vãng. (Công khai bày tỏ tại triều đình, không nên dùng bạo lực mù quáng mà cần dùng trí tuệ và chính nghĩa).",
    image: "Trạch thượng vu thiên quải, quân tử dĩ thí lộc cập hạ, cư đức tắc kỵ. (Đầm nước tích tụ trên cao, người lãnh đạo hào phóng ban phát bổng lộc cho kẻ dưới).",
    quote: {
      text: "Cái ác chỉ cần một điều kiện duy nhất để thắng thế: đó là những người tốt không làm gì cả.",
      author: "Edmund Burke",
      context: "Quyết tâm quét sạch tiêu cực, dứt khoát không thỏa hiệp."
    }
  },
  {
    id: 44,
    number: 44,
    name: "Thiên Phong Cấu",
    chineseName: "天風姤 (Gou)",
    binary: "011111",
    upperTrigram: "Càn (Trời)",
    lowerTrigram: "Tốn (Gió)",
    upperTrigramSymbol: "☰",
    lowerTrigramSymbol: "☴",
    meaning: "Gặp gỡ bất ngờ, gió thổi dưới vòm trời chu du khắp chốn, đề phòng sự cám dỗ ngấm ngầm.",
    judgment: "Cấu: Nữ tráng, vật dụng thủ nữ. (Gặp gỡ bất ngờ, người đàn bà quá lấn lướt thì không nên vội cưới).",
    image: "Thiên hạ hữu phong cấu, hậu dĩ thi mệnh cáo tứ phương. (Dưới gầm trời có gió thổi muôn phương, bậc quân vương ban bố sắc lệnh thông tỏ thiên hạ).",
    quote: {
      text: "Những cuộc gặp gỡ tình cờ thường mang đến bước ngoặt, nhưng hãy giữ sự tỉnh táo trước những lời đường mật.",
      author: "Jane Austen",
      context: "Đề phòng nguy cơ tiềm ẩn đằng sau những cơ hội có vẻ béo bở."
    }
  },
  {
    id: 45,
    number: 45,
    name: "Trạch Địa Tụy",
    chineseName: "澤地萃 (Cui)",
    binary: "000110",
    upperTrigram: "Đoài (Đầm)",
    lowerTrigram: "Khôn (Đất)",
    upperTrigramSymbol: "☱",
    lowerTrigramSymbol: "☷",
    meaning: "Tụ hội sum vầy, nước đầm tụ lại trên mặt đất phì nhiêu, quy tụ nhân tài, đồng lòng hướng thiện.",
    judgment: "Tụy: Hanh, vương cách hữu miếu, lợi kiến đại nhân, hanh lợi trinh. (Tụ hội thì hanh thông, lập đàn tế lễ, yết kiến bậc đại nhân thì mọi việc tốt lành).",
    image: "Trạch thượng vu địa tụy, quân tử dĩ trừ nhung khí, giới bất ngu. (Đầm nước tụ trên mặt đất, người quân tử chuẩn bị vũ khí, phòng ngừa bất trắc).",
    quote: {
      text: "Khi những người cùng chung chí hướng tụ lại một nơi, họ có thể dời non lấp biển.",
      author: "Margaret Mead",
      context: "Hội ngộ anh tài, xây dựng tổ chức và cộng đồng đoàn kết."
    }
  },
  {
    id: 46,
    number: 46,
    name: "Địa Phong Thăng",
    chineseName: "地風升 (Sheng)",
    binary: "011000",
    upperTrigram: "Khôn (Đất)",
    lowerTrigram: "Tốn (Gió)",
    upperTrigramSymbol: "☷",
    lowerTrigramSymbol: "☴",
    meaning: "Vươn lên vững chắc, mầm cây mọc từ lòng đất vươn cao đón nắng, từng bước thăng tiến không ngừng.",
    judgment: "Thăng: Nguyên hanh, dụng kiến đại nhân, vật tuất, nam chinh cát. (Khởi đầu rất hanh thông, tìm đến bậc hiền minh nâng đỡ, tiến về phương Nam tốt lành).",
    image: "Địa trung sinh mộc thăng, quân tử dĩ thuận đức, tích tiểu dĩ cao đại. (Trong đất cây mọc vươn lên, người quân tử tích lũy điều thiện nhỏ để trở nên cao lớn vững bền).",
    quote: {
      text: "Bậc thang thành công không thể leo lên bằng cách đút tay vào túi quần. Từng bước tiến vững chắc tạo nên đỉnh cao.",
      author: "Arnold Schwarzenegger",
      context: "Thời kỳ phát triển đều đặn, cây cối đơm hoa kết trái."
    }
  },
  {
    id: 47,
    number: 47,
    name: "Trạch Thủy Khốn",
    chineseName: "澤水困 (Kun)",
    binary: "010110",
    upperTrigram: "Đoài (Đầm)",
    lowerTrigram: "Khảm (Nước)",
    upperTrigramSymbol: "☱",
    lowerTrigramSymbol: "☵",
    meaning: "Khốn cùng bế tắc, nước cạn kiệt trong đầm lầy, rèn luyện chí khí anh hùng, miệng nói không ai tin nên dùng hành động.",
    judgment: "Khốn: Hanh, trinh đại nhân cát, vô cữu, hữu ngôn bất tín. (Gặp cảnh khốn khó nhưng bậc đại nhân vẫn giữ vững khí tiết, lúc này nói năng nhiều người ta không tin, hãy im lặng hành động).",
    image: "Trạch vô thủy khốn, quân tử dĩ trí mệnh toại chí. (Đầm cạn kiệt nước, người quân tử đem cả sinh mệnh bảo vệ lý tưởng cao đẹp).",
    quote: {
      text: "Những vì sao sáng nhất luôn tỏa rạng trong đêm đen u tối nhất.",
      author: "Khuyết danh",
      context: "Thử thách tôi luyện bản lĩnh, chớ bi quan buông xuôi."
    }
  },
  {
    id: 48,
    number: 48,
    name: "Thủy Phong Tỉnh",
    chineseName: "水風井 (Jing)",
    binary: "011010",
    upperTrigram: "Khảm (Nước)",
    lowerTrigram: "Tốn (Gió)",
    upperTrigramSymbol: "☵",
    lowerTrigramSymbol: "☴",
    meaning: "Giếng nước nuôi dân, nguồn mạch vô tận không bao giờ vơi cạn, tu dưỡng nguồn tri thức và đạo đức.",
    judgment: "Tỉnh: Cải ấp bất cải tỉnh, vô táng vô đắc, vãng lai tỉnh tỉnh. (Dời đổi làng xóm nhưng giếng nước vẫn ở đó không đổi, múc nước cần cẩn thận giữ gìn gàu dây).",
    image: "Mộc thượng hữu thủy tỉnh, quân tử dĩ lao dân khuyến tương. (Cây hút nước lên tạo nguồn sống, người quân tử động viên nhân dân tương trợ lẫn nhau).",
    quote: {
      text: "Tri thức và lòng nhân ái như mạch nước ngầm mát lành, càng san sẻ càng tuôn trào dồi dào.",
      author: "Benjamin Franklin",
      context: "Khai mở nội lực và nguồn tài nguyên bền vững sẵn có."
    }
  },
  {
    id: 49,
    number: 49,
    name: "Trạch Hỏa Cách",
    chineseName: "澤火革 (Ge)",
    binary: "101110",
    upperTrigram: "Đoài (Đầm)",
    lowerTrigram: "Ly (Lửa)",
    upperTrigramSymbol: "☱",
    lowerTrigramSymbol: "☲",
    meaning: "Cách mạng thay đổi, lửa nung nước đầm tạo nên biến chuyển lớn, lột xác đổi mới để phù hợp với thời đại.",
    judgment: "Cách: Dĩ nhật nãi phu, nguyên hanh lợi trinh, hối vong. (Đến ngày thích hợp thì biến đổi tạo dựng lòng tin, hanh thông to lớn, không còn hối tiếc).",
    image: "Trạch trung hữu hỏa cách, quân tử dĩ trị lịch minh thời. (Trong đầm có lửa sôi trào, người làm việc lớn sắp xếp lại thời vụ trật tự xã hội).",
    quote: {
      text: "Không có gì vĩnh cửu ngoại trừ sự thay đổi. Dám lột xác là bí quyết duy nhất để tồn tại và bứt phá.",
      author: "Heraclitus",
      context: "Đã đến lúc dũng cảm thực hiện cuộc cải cách toàn diện."
    }
  },
  {
    id: 50,
    number: 50,
    name: "Hỏa Phong Đỉnh",
    chineseName: "火風鼎 (Ding)",
    binary: "011101",
    upperTrigram: "Ly (Lửa)",
    lowerTrigram: "Tốn (Gió)",
    upperTrigramSymbol: "☲",
    lowerTrigramSymbol: "☴",
    meaning: "Vạc báu luyện kim, nấu nướng bồi bổ nuôi dưỡng hiền tài, biến đổi chất liệu thô thành ngọc quý.",
    judgment: "Đỉnh: Nguyên cát, hanh. (Vạc báu đúc kết thành tựu, rất tốt lành và hanh thông viên mãn).",
    image: "Mộc thượng hữu hỏa đỉnh, quân tử dĩ chính vị ngưng mệnh. (Gỗ châm lửa nấu vạc thiêng, người quân tử giữ đúng vị trí an định sứ mệnh).",
    quote: {
      text: "Lửa thử vàng, gian nan thử sức, môi trường tốt tôi luyện nhân tài kiệt xuất.",
      author: "Tục ngữ",
      context: "Gặt hái thành quả cao quý sau quá trình tôi luyện gian khổ."
    }
  },
  {
    id: 51,
    number: 51,
    name: "Thuần Chấn (Bát Thuần Chấn)",
    chineseName: "震為雷 (Zhen)",
    binary: "100100",
    upperTrigram: "Chấn (Sấm)",
    lowerTrigram: "Chấn (Sấm)",
    upperTrigramSymbol: "☳",
    lowerTrigramSymbol: "☳",
    meaning: "Sấm sét kinh thiên động địa, nỗi sợ hãi đến rồi đi, giữ vững sự bình tĩnh không làm đổ chén rượu cúng.",
    judgment: "Chấn: Hanh, chấn lai hách hách, tiếu ngôn ách ách, chấn kinh bách lý, bất táng tỷ sưởng. (Sấm nổ vang rền khiến người sợ hãi, nhưng sau đó tiếng cười vui vẻ trở lại, người vững vàng không đánh rơi chén ngọc).",
    image: "Tuấn lôi chấn, quân tử dĩ khủng cụ tu tỉnh. (Sấm vang dồn dập, người quân tử biết sợ hãi quy luật trời đất mà tự sửa mình).",
    quote: {
      text: "Dũng cảm không phải là không biết sợ, mà là làm chủ nỗi sợ hãi và tiếp tục tiến lên.",
      author: "Nelson Mandela",
      context: "Giữ đầu óc tỉnh táo trước những biến cố giật mình bất ngờ."
    }
  },
  {
    id: 52,
    number: 52,
    name: "Thuần Cấn (Bát Thuần Cấn)",
    chineseName: "艮為山 (Gen)",
    binary: "001001",
    upperTrigram: "Cấn (Núi)",
    lowerTrigram: "Cấn (Núi)",
    upperTrigramSymbol: "☶",
    lowerTrigramSymbol: "☶",
    meaning: "Núi đứng im phăng phắc, tĩnh lặng dừng lại đúng lúc, kiềm chế dục vọng, an định thân tâm.",
    judgment: "Cấn: Cấn kỳ bối, bất hoạch kỳ thân, hành kỳ đình, bất kiến kỳ nhân, vô cữu. (Dừng lại nơi lưng yên tĩnh, không thấy thân thể vướng bận, đi trong sân mà tâm rỗng rang không vướng bận ai).",
    image: "Kiêm sơn cấn, quân tử dĩ tư bất xuất kỳ vị. (Hai ngọn núi sừng sững đứng cạnh nhau, người quân tử suy nghĩ không vượt quá cương vị phận sự của mình).",
    quote: {
      text: "Sự bình yên thực sự không phải là nơi không có tiếng ồn hay giông bão, mà là sự tĩnh lặng ngay giữa tâm bão.",
      author: "Lão Tử",
      context: "Học cách dừng lại, thiền định và giữ cho tâm trí bất động."
    }
  },
  {
    id: 53,
    number: 53,
    name: "Phong Sơn Tiệm",
    chineseName: "風山漸 (Jian)",
    binary: "001011",
    upperTrigram: "Tốn (Gió)",
    lowerTrigram: "Cấn (Núi)",
    upperTrigramSymbol: "☴",
    lowerTrigramSymbol: "☶",
    meaning: "Tiến bước tuần tự từ từ, cây mọc trên sườn núi chậm mà chắc, như đàn chim nhạn bay về phương Nam.",
    judgment: "Tiệm: Nữ quy cát, lợi trinh. (Tiến triển chậm mà chắc chắn như cô gái về nhà chồng theo nghi lễ, vạn sự tốt lành).",
    image: "Sơn thượng hữu mộc tiệm, quân tử dĩ cư hiền đức thiện tục. (Trên núi có cây lớn dần theo năm tháng, người quân tử bồi đắp đức hạnh làm gương cho xã hội).",
    quote: {
      text: "Dục tốc bất đạt. Những điều vĩ đại trên thế giới đều cần thời gian để đơm hoa kết trái.",
      author: "Khổng Tử",
      context: "Đi từng bước vững chãi, không được nóng vội đốt cháy giai đoạn."
    }
  },
  {
    id: 54,
    number: 54,
    name: "Lôi Trạch Quy Muội",
    chineseName: "雷澤歸妹 (Gui Mei)",
    binary: "110100",
    upperTrigram: "Chấn (Sấm)",
    lowerTrigram: "Đoài (Đầm)",
    upperTrigramSymbol: "☳",
    lowerTrigramSymbol: "☱",
    meaning: "Gái về nhà chồng khi chưa đủ lễ nghi, cảm xúc lấn át lý trí, cần đề phòng sai lầm do bốc đồng.",
    judgment: "Quy Muội: Chinh hung, vô du lợi. (Hành động vội vã thì hung hiểm, không có điều gì có lợi).",
    image: "Trạch thượng hữu lôi quy muội, quân tử dĩ vĩnh chung tri tệ. (Trên đầm có sấm nổ bất ngờ, người quân tử nhìn trước kết cục dài lâu để phòng tránh tệ hại).",
    quote: {
      text: "Đừng đưa ra quyết định quan trọng khi bạn đang quá vui mừng hoặc đang quá giận dữ.",
      author: "Tục ngữ phương Tây",
      context: "Giữ lý trí sáng suốt, tránh để cảm xúc dẫn lối sai lầm."
    }
  },
  {
    id: 55,
    number: 55,
    name: "Lôi Hỏa Phong",
    chineseName: "雷火豐 (Feng)",
    binary: "101100",
    upperTrigram: "Chấn (Sấm)",
    lowerTrigram: "Ly (Lửa)",
    upperTrigramSymbol: "☳",
    lowerTrigramSymbol: "☲",
    meaning: "Phong phú dồi dào, sấm sét và ánh lửa rực rỡ đỉnh điểm giữa trưa, cần dự phòng lúc bóng xế tà.",
    judgment: "Phong: Hanh, vương cách chi, vật tuất, nghi nhật trung. (Phong phú thịnh vượng, bậc minh quân đến dự, như mặt trời giữa trưa tỏa sáng, đừng lo âu).",
    image: "Lôi điện giai chí phong, quân tử dĩ chiết ngục trí hình. (Sấm chớp cùng đến rạng rỡ uy nghi, người công minh xét xử án từ rõ ràng).",
    quote: {
      text: "Hãy tận hưởng ánh nắng ban trưa ấm áp, nhưng đừng quên dự trữ củi khô cho đêm lạnh.",
      author: "Khuyết danh",
      context: "Thời kỳ đỉnh cao của sự nghiệp và tài lộc, tận dụng triệt để."
    }
  },
  {
    id: 56,
    number: 56,
    name: "Hỏa Sơn Lữ",
    chineseName: "火山旅 (Lu)",
    binary: "001101",
    upperTrigram: "Ly (Lửa)",
    lowerTrigram: "Cấn (Núi)",
    upperTrigramSymbol: "☲",
    lowerTrigramSymbol: "☶",
    meaning: "Khách lữ hành xa quê hương, ngọn lửa cháy lướt trên sườn núi, thận trọng khiêm cung nơi đất khách quê người.",
    judgment: "Lữ: Tiểu hanh, lữ trinh cát. (Đi đường xa việc nhỏ hanh thông, giữ lòng đoan chính thì tốt lành).",
    image: "Sơn thượng hữu hỏa lữ, quân tử dĩ minh thận dụng hình, nhi bất lưu ngục. (Trên núi có ngọn lửa le lói, người quân tử thận trọng thưởng phạt phân minh).",
    quote: {
      text: "Nhập gia tùy tục. Đến nơi xa lạ, vũ khí lợi hại nhất là sự nhã nhặn và tôn trọng văn hóa bản xứ.",
      author: "Ngạn ngữ La Mã",
      context: "Đi xa làm ăn, thích nghi linh hoạt và cẩn trọng giữ gìn an toàn."
    }
  },
  {
    id: 57,
    number: 57,
    name: "Thuần Tốn (Bát Thuần Tốn)",
    chineseName: "巽為風 (Xun)",
    binary: "011011",
    upperTrigram: "Tốn (Gió)",
    lowerTrigram: "Tốn (Gió)",
    upperTrigramSymbol: "☴",
    lowerTrigramSymbol: "☴",
    meaning: "Gió luồn lách mềm mại, thấm sâu vào lòng người, nhu thuận khéo léo, kiên trì cảm hóa.",
    judgment: "Tốn: Tiểu hanh, lợi hữu du vãng, lợi kiến đại nhân. (Mềm mỏng thì hanh thông việc nhỏ, tiến bước có lợi, tìm người dẫn đường tài đức).",
    image: "Tùy phong tốn, quân tử dĩ thân mệnh hành sự. (Gió nối tiếp gió thổi khắp nhân gian, người lãnh đạo nhắc đi nhắc lại mệnh lệnh để thấu suốt).",
    quote: {
      text: "Nước chảy đá mòn, gió nhẹ luồn qua khe cửa hẹp. Sự kiên trì mềm mỏng có thể vượt qua mọi rào cản kiên cố.",
      author: "Lão Tử",
      context: "Dùng sự khéo léo và lắng nghe để thuyết phục đối phương."
    }
  },
  {
    id: 58,
    number: 58,
    name: "Thuần Đoài (Bát Thuần Đoài)",
    chineseName: "兌為澤 (Dui)",
    binary: "110110",
    upperTrigram: "Đoài (Đầm)",
    lowerTrigram: "Đoài (Đầm)",
    upperTrigramSymbol: "☱",
    lowerTrigramSymbol: "☱",
    meaning: "Đầm nước vui vẻ, cùng nhau trao đổi học hỏi, giao tiếp duyên dáng mang lại niềm vui cho mọi người.",
    judgment: "Đoài: Hanh, lợi trinh. (Vui vẻ hòa hợp thì hanh thông, giữ điều ngay thẳng).",
    image: "Lệ trạch đoài, quân tử dĩ bằng hữu giảng tập. (Hai đầm nước liền kề tương trợ thấm đượm, bạn bè cùng nhau trao đổi học thuật nâng cao trí tuệ).",
    quote: {
      text: "Niềm vui được chia sẻ là niềm vui nhân đôi, nỗi buồn được chia sẻ là nỗi buồn vơi đi một nửa.",
      author: "Ngạn ngữ Thụy Điển",
      context: "Giao tiếp cởi mở, kết giao bạn tốt, không khí chan hòa phấn khởi."
    }
  },
  {
    id: 59,
    number: 59,
    name: "Phong Thủy Hoán",
    chineseName: "風水渙 (Huan)",
    binary: "010011",
    upperTrigram: "Tốn (Gió)",
    lowerTrigram: "Khảm (Nước)",
    upperTrigramSymbol: "☴",
    lowerTrigramSymbol: "☵",
    meaning: "Gió thổi tan mây mù u ám, băng tuyết tan chảy thành dòng suối mát, giải tỏa nỗi hoài nghi, cứu vớt hiểm nguy.",
    judgment: "Hoán: Hanh, vương cách hữu miếu, lợi thiệp đại xuyên, lợi trinh. (Tan biến bế tắc thì hanh thông, lập đàn hướng về tổ tiên, vượt sông lớn có lợi).",
    image: "Phong hành thủy thượng hoán, tiên vương dĩ hưởng vu đế lập miếu. (Gió thổi trên mặt nước xua tan ngưng trệ, người lãnh đạo quy tụ lòng người cùng vượt hiểm nguy).",
    quote: {
      text: "Màn đêm u tối đến đâu cũng phải nhường lối cho bình minh ló dạng.",
      author: "Victor Hugo",
      context: "Giải tỏa mâu thuẫn, tan biến nghi ngờ, bắt đầu giai đoạn thông thoáng."
    }
  },
  {
    id: 60,
    number: 60,
    name: "Thủy Trạch Tiết",
    chineseName: "水澤節 (Jie)",
    binary: "110010",
    upperTrigram: "Khảm (Nước)",
    lowerTrigram: "Đoài (Đầm)",
    upperTrigramSymbol: "☵",
    lowerTrigramSymbol: "☱",
    meaning: "Tiết độ chừng mực, đầm chứa nước có bờ ngăn giữ chừng mực, biết dừng đúng lúc, không quá kham khổ.",
    judgment: "Tiết: Hanh, khổ tiết bất khả trinh. (Tiết chế thì hanh thông, nhưng quá gò bó khổ sở thì không thể bền lâu).",
    image: "Trạch thượng hữu thủy tiết, quân tử dĩ chế số độ, nghị đức hạnh. (Trên đầm có nước được bờ đê điều tiết, người quân tử đặt ra quy tắc lễ nghi đức độ).",
    quote: {
      text: "Trung dung là đỉnh cao của nghệ thuật sống. Biết đủ là giàu có nhất.",
      author: "Aristotle",
      context: "Kiểm soát chi tiêu, kiềm chế tham vọng, sống chừng mực."
    }
  },
  {
    id: 61,
    number: 61,
    name: "Phong Trạch Trung Phu",
    chineseName: "風澤中孚 (Zhong Fu)",
    binary: "110011",
    upperTrigram: "Tốn (Gió)",
    lowerTrigram: "Đoài (Đầm)",
    upperTrigramSymbol: "☴",
    lowerTrigramSymbol: "☱",
    meaning: "Lòng thành tín chân thật từ đáy lòng, cảm hóa cả loài muông thú tôm cá, uy tín tạo nên sức mạnh vô song.",
    judgment: "Trung Phu: Đồn ngư cát, lợi thiệp đại xuyên, lợi trinh. (Lòng thành tín cảm hóa được cả cá heo lợn rừng, vượt sông lớn thành công).",
    image: "Trạch thượng hữu phong trung phu, quân tử dĩ nghị ngục hoãn tử. (Trên đầm có gió mát lay động, người đức độ xét xử khoan dung, giữ trọn lòng nhân từ).",
    quote: {
      text: "Mất tiền là mất ít, mất danh dự là mất nhiều, nhưng mất đi chữ tín là mất tất cả.",
      author: "Ngạn ngữ Đức",
      context: "Giữ trọn lời hứa và chữ tín trong làm ăn và đời sống."
    }
  },
  {
    id: 62,
    number: 62,
    name: "Lôi Sơn Tiểu Quá",
    chineseName: "雷山小過 (Xiao Guo)",
    binary: "001100",
    upperTrigram: "Chấn (Sấm)",
    lowerTrigram: "Cấn (Núi)",
    upperTrigramSymbol: "☳",
    lowerTrigramSymbol: "☶",
    meaning: "Hơi quá một chút trong việc nhỏ, chim bay thấp thì an toàn, không nên bay cao ngạo mạn, cẩn tắc vô ưu.",
    judgment: "Tiểu Quá: Hanh, lợi trinh, khả tiểu sự, bất khả đại sự, phi điểu di chi âm, bất nghi thượng, nghi hạ, đại cát. (Việc nhỏ thì hanh thông, không nên làm việc lớn, chim bay nên hạ xuống thấp mới an toàn).",
    image: "Sơn thượng hữu lôi tiểu quá, quân tử dĩ hành quá hồ cung, tang quá hồ ai, dụng quá hồ kiệm. (Trên núi có tiếng sấm nhỏ, người quân tử giữ lễ hơi khiêm nhường một chút, chi tiêu hơi tiết kiệm một chút).",
    quote: {
      text: "Cẩn tắc vô ưu. Trong những giai đoạn nhạy cảm, thận trọng quá một chút vẫn tốt hơn là khinh suất.",
      author: "Khuyết danh",
      context: "Làm việc nhỏ cẩn thận, tránh phô trương hoặc mạo hiểm làm việc quá sức."
    }
  },
  {
    id: 63,
    number: 63,
    name: "Thủy Hỏa Ký Tế",
    chineseName: "水火既濟 (Ji Ji)",
    binary: "101010",
    upperTrigram: "Khảm (Nước)",
    lowerTrigram: "Ly (Lửa)",
    upperTrigramSymbol: "☵",
    lowerTrigramSymbol: "☲",
    meaning: "Đã xong xuôi trọn vẹn, âm dương tương giao hoàn hảo, nước trên lửa dưới nấu chín cơm, cần cẩn trọng đề phòng thoái trào.",
    judgment: "Ký Tế: Hanh tiểu, lợi trinh, sơ cát chung loạn. (Việc đã hoàn tất, ban đầu tốt lành nhưng về sau dễ buông lỏng mà sinh hỗn loạn, cẩn thận giữ gìn).",
    image: "Thủy tại hỏa thượng ký tế, quân tử dĩ tư hoạn nhi dự phòng chi. (Nước đun trên lửa đã sôi, người quân tử lo nghĩ trước mối họa tiềm ẩn để phòng ngừa từ xa).",
    quote: {
      text: "Sự kiêu ngạo và lơ là sau chiến thắng chính là mầm mống của thất bại tiếp theo. Giữ được đỉnh cao khó hơn leo lên đỉnh núi.",
      author: "Marcus Aurelius",
      context: "Khi mọi việc đã viên mãn, hãy giữ vững sự tỉnh táo và cẩn trọng giữ gìn thành quả."
    }
  },
  {
    id: 64,
    number: 64,
    name: "Hỏa Thủy Vị Tế",
    chineseName: "火水未濟 (Wei Ji)",
    binary: "010101",
    upperTrigram: "Ly (Lửa)",
    lowerTrigram: "Khảm (Nước)",
    upperTrigramSymbol: "☲",
    lowerTrigramSymbol: "☵",
    meaning: "Chưa xong, lửa bốc lên trên nước chảy xuống dưới chưa gặp nhau, một hành trình mới lại chuẩn bị bắt đầu, vòng xoay vô tận của vũ trụ.",
    judgment: "Vị Tế: Hanh, tiểu hồ ngật tế, nhu kỳ vĩ, vô du lợi. (Chưa hoàn tất nhưng chứa đựng tiềm năng hanh thông vô tận, cáo nhỏ lội qua sông ướt đuôi, cần thêm một chút cố gắng).",
    image: "Hỏa tại thủy thượng vị tế, quân tử dĩ thận biện vật cư phương. (Lửa ở trên nước ở dưới chưa tương giao, người thông thái thận trọng sắp xếp lại trật tự chuẩn bị cho chặng đường mới).",
    quote: {
      text: "Đây chưa phải là điểm kết thúc, thậm chí chưa phải là khởi đầu của sự kết thúc. Nhưng có lẽ, đây là sự kết thúc của một khởi đầu.",
      author: "Winston Churchill",
      context: "Vũ trụ không ngừng biến dịch, mỗi kết thúc luôn mở ra một chân trời mới tươi đẹp."
    }
  },
];

export function getRandomHexagram(): Hexagram {
  const randomIndex = Math.floor(Math.random() * HEXAGRAMS.length);
  return HEXAGRAMS[randomIndex];
}

export function findHexagramByBinary(binary: string): Hexagram {
  const found = HEXAGRAMS.find((h) => h.binary === binary);
  if (found) return found;
  return HEXAGRAMS[0];
}

export function findHexagramByTrigrams(upperNameOrSymbol: string, lowerNameOrSymbol: string): Hexagram | null {
  const found = HEXAGRAMS.find((h) => 
    (h.upperTrigram.includes(upperNameOrSymbol) || h.upperTrigramSymbol === upperNameOrSymbol) &&
    (h.lowerTrigram.includes(lowerNameOrSymbol) || h.lowerTrigramSymbol === lowerNameOrSymbol)
  );
  return found || null;
}
