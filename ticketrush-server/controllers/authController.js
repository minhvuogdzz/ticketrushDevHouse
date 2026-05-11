const User = require('../models/User'); // Đảm bảo ông có model User nhé

exports.login = async (req, res) => {
  const { username, password } = req.body;

  // 1. KIỂM TRA ĐẶC QUYỀN ADMIN (Chặn ngay từ vòng gửi xe)
  if (username === 'admin' && password === 'admin88') {
    return res.status(200).json({
      message: "Đăng nhập Admin thành công!",
      userId: "admin_999",
      username: "admin",
      role: "admin", // <-- Cái này để Frontend nhận diện
      token: "admin_token_secret"
    });
  }

  // 2. NẾU LÀ NGƯỜI DÙNG BÌNH THƯỜNG -> TÌM TRONG DATABASE
  try {
    const user = await User.findOne({ username });
    
    // Nếu không tìm thấy trong DB
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản trong hệ thống!" });
    }

    // Nếu sai mật khẩu (Đang ví dụ check text thường, nếu ông dùng bcrypt thì sửa lại)
    if (user.password !== password) {
      return res.status(400).json({ message: "Sai mật khẩu!" });
    }

    // Đăng nhập thành công cho người dùng bình thường
    return res.status(200).json({
      message: "Đăng nhập thành công!",
      userId: user._id,
      username: user.username,
      role: "user", // Người dùng bình thường chỉ là user
      token: "user_token_secret"
    });

  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

exports.register = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Kiểm tra xem tài khoản đã ai đăng ký chưa
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Tài khoản này đã tồn tại!" });
    }

    // 2. Nếu chưa có thì tạo mới (Đang lưu plain text theo code cũ của ông)
    const newUser = new User({
      username,
      password,
      role: 'user' // Mặc định tạo ra là user thường
    });

    // 3. Lưu vào DB
    await newUser.save();

    res.status(201).json({ message: "Đăng ký thành công! Mời bạn đăng nhập." });

  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server khi đăng ký!" });
  }
};