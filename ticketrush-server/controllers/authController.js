const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 've_dem_nay_nong_lam'; // Trong thực tế cái này bỏ vào file .env nhé

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại!' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword });
    
    res.status(201).json({ message: 'Đăng ký thành công!', userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Sai mật khẩu!' });

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1d' });
    res.status(200).json({ message: 'Đăng nhập thành công', token, userId: user._id, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};