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
    judgment: "Càn: Nguyên, hanh, lợi, trinh. (Khởi đầu vĩ đại, thông suốt hanh thông, giữ trọn chính đạo thì ắt đại cát).",
    image: "Thiên hành kiện, quân tử dĩ tự cường bất tức (Trời vận hành mạnh mẽ, người quân tử noi theo mà không ngừng vươn lên).",
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
    judgment: "Khôn: Nguyên hanh, lợi tẫn mã chi trinh. (Thuận theo tự nhiên, nhu hòa như ngựa cái, bền bỉ khiêm nhường thì ắt thành tựu).",
    image: "Địa thế khôn, quân tử dĩ hậu đức tải vật (Đất có thế nâng đỡ, người quân tử lấy đức dày mà bao dung chở che vạn vật).",
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
    image: "Vân lôi truân, quân tử dĩ kinh luân (Mây nước sấm chớp cuộn trào, người tài tranh thủ sắp xếp trật tự cơ nghiệp).",
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
    image: "Sơn hạ xuất tuyền mông, quân tử dĩ quả hành dục đức (Suối chảy dưới chân núi mịt mờ, người quân tử lấy hành động quả quyết mà nuôi dưỡng đức tính).",
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
    meaning: "Chờ đợi thời cơ, tích dưỡng sức lực, giữ tâm an định trước khi hành động.",
    judgment: "Nhu: Hữu phu, quang hanh, trinh cát, lợi thiệp đại xuyên. (Có lòng chân thành, sáng sủa hanh thông, vượt sông lớn ắt thắng).",
    image: "Vân thượng vu thiên nhu, quân tử dĩ ẩm thực yến lạc (Mây tụ trên trời chuẩn bị mưa, người quân tử thong dong ăn uống bồi dưỡng tâm thân).",
    quote: {
      text: "Hai chiến binh dũng mãnh và kiên cường nhất chính là Thời Gian và Sự Kiên Nhẫn.",
      author: "Leo Tolstoy (Chiến tranh và Hòa bình)",
      context: "Chờ gió đông nổi lên, không nóng vội gượng ép hoàn cảnh."
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
    meaning: "Tranh chấp, kiện tụng, bất đồng quan điểm, nên hòa giải lùi bước, dĩ hòa vi quý.",
    judgment: "Tụng: Hữu phu trất thích, trung cát, chung hung, bất lợi thiệp đại xuyên. (Tranh chấp dù có lý cũng sinh ưu phiền, hòa giải ở giữa thì lành, theo đuổi đến cùng thì hung).",
    image: "Thiên dữ thủy vi hành tụng, quân tử dĩ tác sự mưu thủy (Trời đi lên nước chảy xuống trái chiều nhau, người quân tử mưu tính kỹ từ đầu để tránh tranh đoạt).",
    quote: {
      text: "Một người nóng giận thì không thể thắng một người điềm tĩnh. Cách duy nhất để chiến thắng một cuộc tranh cãi là tránh nó.",
      author: "Dale Carnegie",
      context: "Buông bỏ cái tôi hiếu thắng để giữ trọn bình an và mối quan hệ."
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
    meaning: "Quân đội, kỷ luật tập thể, lãnh đạo công minh, vì đại nghĩa tập hợp sức mạnh.",
    judgment: "Sư: Trinh, trượng nhân cát, vô cữu. (Giữ nghiêm kỷ luật chính đạo, người chỉ huy sáng suốt ắt đại thắng).",
    image: "Địa trung hữu thủy sư, quân tử dĩ dung dân súc chúng (Trong lòng đất ngầm chứa nước, người lãnh đạo bao dung nuôi dưỡng muôn dân).",
    quote: {
      text: "Binh pháp dạy: Không phải do quân đông mà thắng, cốt ở chỗ kỷ luật nghiêm minh, trên dưới đồng lòng.",
      author: "Tôn Tử (Binh Pháp Tôn Tử)",
      context: "Kỷ luật thép và sự đồng lòng tạo nên sức mạnh vô địch."
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
    meaning: "Thân thiện gắn kết, tìm người đồng chí hướng, cùng nhau tương trợ liên minh.",
    judgment: "Tỷ: Cát, nguyên phệ, nguyên vĩnh trinh vô cữu. (Gắn kết hòa hợp, giữ lòng trung thực trọn vẹn không lỗi lầm).",
    image: "地上有水比, 先王以建萬國親諸侯 (Nước thấm vào lòng đất quyện làm một, kết thân với bằng hữu tạo thành đồng minh vững chãi).",
    quote: {
      text: "Nếu muốn đi thật nhanh, hãy đi một mình. Nếu muốn đi thật xa, hãy đi cùng nhau.",
      author: "Tục ngữ Châu Phi / Warren Buffett",
      context: "Sức mạnh của tình bằng hữu, sự hợp tác chân thành."
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
    meaning: "Tích lũy nhỏ, gió thổi trên trời mây tụ chưa mưa, cần nhẫn nại gom nhặt từng bước.",
    judgment: "Tiểu Súc: Hanh, mật vân bất vũ, tự ngã tây giao. (Mây dày đặc chưa đổ mưa, tích tiểu thành đại, kiên trì trau dồi).",
    image: "Phong hành thiên thượng tiểu súc, quân tử dĩ ý văn đức (Gió lượn trên trời, người quân tử trau dồi văn tài đức độ từng ngày).",
    quote: {
      text: "Hành trình vạn dặm bắt đầu từ một bước chân. Đừng chê việc nhỏ không làm, giọt nước nhỏ lâu ngày tràn chum.",
      author: "Lão Tử",
      context: "Tích lũy nội lực bền bỉ, từng bước tiến vững chắc."
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
    meaning: "Lễ tiết ứng xử, dẫm đuôi cọp mà cọp không cắn nhờ giữ đúng lễ nghĩa khiêm cung.",
    judgment: "Lý: Lý hổ vĩ bất xước nhân, hanh. (Dẫm đuôi cọp nhưng cọp không cắn người, vì biết giữ mình theo khuôn phép).",
    image: "Thượng thiên hạ trạch lý, quân tử dĩ biện thượng hạ định dân chí (Trời ở trên đầm ở dưới phân minh, giữ đúng trật tự lễ nghĩa thì mọi việc êm thuận).",
    quote: {
      text: "Lễ nghĩa và sự tôn trọng chính là tấm khiên vững chắc nhất bảo vệ ta giữa giông bão cuộc đời.",
      author: "Khổng Tử",
      context: "Ứng xử lịch thiệp, khôn khéo và đúng mực giúp hóa giải mọi nguy cơ."
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
    meaning: "Thái bình thịnh vượng, trời đất giao hòa, âm dương thông suốt, tiểu vãng đại lai.",
    judgment: "Thái: Tiểu vãng đại lai, cát hanh. (Cái nhỏ đi cái lớn đến, vạn vật tươi tốt, đón nhận phúc lành).",
    image: "Thiên địa giao thái, hậu dĩ tài thành thiên địa chi đạo (Trời đất giao cảm sinh thái bình, nắm bắt thời cơ vàng để tạo lập đại nghiệp).",
    quote: {
      text: "Hạnh phúc và thịnh vượng không tự nhiên xuất hiện, chúng nảy mầm khi sự chuẩn bị gặp đúng cơ hội của thời thế.",
      author: "Seneca",
      context: "Thời vận hanh thông rực rỡ, hãy mở lòng đón nhận và cống hiến hết mình."
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
    meaning: "Bế tắc chia cắt, trời đi lên đất đi xuống không gặp nhau, tiểu nhân lấn lướt quân tử nên ẩn nhẫn.",
    judgment: "Bĩ: Bĩ chi phỉ nhân, bất lợi quân tử trinh, đại vãng tiểu lai. (Thời vận ngăn trở, người quân tử nên giữ mình trong sạch, ẩn nhẫn chờ thời).",
    image: "Thiên địa bất giao bĩ, quân tử dĩ kiệm đức tị nạn (Trời đất không giao nhau sinh bĩ tắc, người khôn ngoan thu mình dưỡng đức tránh nạn).",
    quote: {
      text: "Khi gió bão gầm thét, cây liễu mềm mại cúi mình chờ bão tan; kẻ cứng nhắc cố chống cự sẽ bị bật gốc.",
      author: "Trang Tử",
      context: "Thời thế chưa thuận, biết ẩn nhẫn giữ mình chính là trí tuệ lớn."
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
    meaning: "Đồng tâm hiệp lực, hòa hợp cùng mọi người, không phân biệt ranh giới vì mục tiêu cao đẹp.",
    judgment: "Đồng Nhân: Đồng nhân vu dã hanh, lợi thiệp đại xuyên, lợi quân tử trinh. (Hòa đồng với thiên hạ ở chốn rộng lớn, vượt sóng gió ắt thành công).",
    image: "Thiên dữ hỏa đồng nhân, quân tử dĩ loại tộc biện vật (Trời và lửa cùng hướng lên trên, người sáng suốt phân minh vạn vật để gắn kết nhân tâm).",
    quote: {
      text: "Đoàn kết là sức mạnh. Khi có sự cộng tác và phối hợp, những điều phi thường nhất đều có thể thực hiện.",
      author: "Mattie Stepanek",
      context: "Mở rộng tấm lòng, gắn kết với những người có chung lý tưởng."
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
    meaning: "Sở hữu vĩ đại, mặt trời rực sáng trên đỉnh trời, tài lộc dồi dào, đức sáng soi thiên hạ.",
    judgment: "Đại Hữu: Nguyên hanh. (Khởi đầu rực rỡ, được hưởng gia tài lớn, biết sẻ chia thì phúc trạch trường tồn).",
    image: "Hỏa tại thiên thượng đại hữu, quân tử dĩ át ác dương thiện (Lửa rạng ngời trên trời cao, người quân tử diệt trừ điều xấu, xiển dương việc thiện).",
    quote: {
      text: "Thước đo giá trị của một con người không phải ở chỗ họ tích lũy được bao nhiêu, mà ở chỗ họ đã trao đi bao nhiêu cho cuộc đời.",
      author: "Albert Einstein",
      context: "Khi có được thành tựu lớn, hãy giữ đức khiêm nhường và chia sẻ giá trị."
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
    meaning: "Khiêm tốn, núi cao sừng sững mà giấu mình dưới lòng đất mẹ bao la, quẻ toàn cát duy nhất trong 64 quẻ.",
    judgment: "Khiêm: Hanh, quân tử hữu chung. (Khiêm nhường thì hanh thông trọn vẹn, người quân tử giữ trước sau như một).",
    image: "Địa trung hữu sơn khiêm, quân tử dĩ phẫu đa ích quả (Núi cao giấu mình trong lòng đất, bớt chỗ thừa bù chỗ thiếu, công bằng ôn hòa).",
    quote: {
      text: "Bông lúa chín là bông lúa cúi đầu. Càng uyên thâm, người ta càng khiêm nhường và tĩnh lặng.",
      author: "Tục ngữ Á Đông / Khổng Tử",
      context: "Khiêm tốn là mẹ của mọi đức tính tốt lành, giữ mình bình thản trước vinh hoa."
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
    meaning: "Phục hồi, ánh dương quay trở lại sau đêm đông dài, khởi sắc đầy hy vọng, nhất dương sinh.",
    judgment: "Phục: Hanh, xuất nhập vô tật, bằng lai vô cữu. (Hồi phục sinh khí, bạn bè quay lại giúp đỡ, một chu kỳ tươi sáng bắt đầu).",
    image: "Lôi tại địa trung phục, tiên vương dĩ chí nhật bế quan (Sấm động ngầm dưới đất báo hiệu mùa xuân, nghỉ ngơi tĩnh dưỡng đón sinh khí mới).",
    quote: {
      text: "Đêm đen tối nhất chính là lúc bình minh sắp ló dạng. Không có mùa đông nào kéo dài mãi mãi.",
      author: "Victor Hugo",
      context: "Năng lượng đang hồi sinh, hãy tự tin khởi đầu lại với trái tim tràn đầy hy vọng."
    }
  },
  {
    id: 29,
    number: 29,
    name: "Bát Thuần Khảm (Khảm Vi Thủy)",
    chineseName: "坎為水 (Kan)",
    binary: "010010",
    upperTrigram: "Khảm (Nước)",
    lowerTrigram: "Khảm (Nước)",
    upperTrigramSymbol: "☵",
    lowerTrigramSymbol: "☵",
    meaning: "Hiểm trở trùng trùng, sóng gió dồn dập, giữ tâm vững vàng như dòng nước chảy tìm lối thoát.",
    judgment: "Khảm: Tập khảm hữu phu, duy tâm hanh, hành hữu thượng. (Trùng trùng hiểm trở nhưng lòng giữ trọn niềm tin chính nghĩa thì sẽ vượt qua).",
    image: "Thủy thao chí tập khảm, quân tử dĩ thường đức hạnh tập giáo sự (Nước chảy cuồn cuộn không ngừng, người kiên định rèn luyện phẩm hạnh vượt bão táp).",
    quote: {
      text: "Biển lặng không bao giờ tạo nên những thủy thủ tài ba.",
      author: "Franklin D. Roosevelt",
      context: "Đối diện với thử thách bằng lòng dũng cảm và sự tỉnh thức tuyệt đối."
    }
  },
  {
    id: 30,
    number: 30,
    name: "Bát Thuần Ly (Ly Vi Hỏa)",
    chineseName: "離為火 (Li)",
    binary: "101101",
    upperTrigram: "Ly (Lửa)",
    lowerTrigram: "Ly (Lửa)",
    upperTrigramSymbol: "☲",
    lowerTrigramSymbol: "☲",
    meaning: "Sáng suốt bám víu, lửa sáng soi đường, cần nương tựa vào điều chính đạo như lửa cần củi.",
    judgment: "Ly: Lợi trinh, hanh, súc tẫn ngưu cát. (Giữ vững sự trong sáng, nhu thuận như nuôi bò cái thì đại cát).",
    image: "Minh lưỡng tác ly, đại nhân dĩ kế minh chiếu vu tứ phương (Hai ngọn đuốc sáng rực soi tỏ bốn phương, lấy trí tuệ chân chính giáo hóa lòng người).",
    quote: {
      text: "Hàng ngàn ngọn nến có thể được thắp sáng bởi một ngọn nến duy nhất mà cuộc đời của ngọn nến ấy không hề bị rút ngắn. Tri thức và tình yêu chia sẻ chỉ làm tăng thêm ánh sáng.",
      author: "Đức Phật Thích Ca Mâu Ni",
      context: "Dùng sự sáng suốt và ấm áp để soi tỏ con đường tương lai."
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
    meaning: "Đã xong xuôi trọn vẹn, âm dương cân bằng hoàn hảo, nước trên lửa dưới nấu chín cơm, cần cẩn trọng đề phòng thoái trào.",
    judgment: "Ký Tế: Hanh tiểu, lợi trinh, sơ cát chung loạn. (Việc đã hoàn tất, ban đầu tốt lành nhưng về sau dễ buông lỏng mà sinh hỗn loạn, cẩn thận giữ gìn).",
    image: "Thủy tại hỏa thượng ký tế, quân tử dĩ tư hoạn nhi dự phòng chi (Nước đun trên lửa đã sôi, người quân tử lo nghĩ trước mối họa tiềm ẩn để phòng ngừa từ xa).",
    quote: {
      text: "Sự kiêu ngạo và lơ là sau chiến thắng chính là mầm mống của thất bại tiếp theo. Giữ được đỉnh cao khó hơn leo lên đỉnh núi.",
      author: "Marcus Aurelius (Meditations)",
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
    image: "Hỏa tại thủy thượng vị tế, quân tử dĩ thận biện vật cư phương (Lửa ở trên nước ở dưới chưa tương giao, người thông thái thận trọng sắp xếp lại trật tự chuẩn bị cho chặng đường mới).",
    quote: {
      text: "Đây chưa phải là điểm kết thúc, thậm chí chưa phải là khởi đầu của sự kết thúc. Nhưng có lẽ, đây là sự kết thúc của một khởi đầu.",
      author: "Winston Churchill",
      context: "Vũ trụ không ngừng biến dịch, mỗi kết thúc luôn mở ra một chân trời mới tươi đẹp."
    }
  }
];

export function getRandomHexagram(): Hexagram {
  const randomIndex = Math.floor(Math.random() * HEXAGRAMS.length);
  return HEXAGRAMS[randomIndex];
}
