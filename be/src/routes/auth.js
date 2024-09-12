const authController = require('../controllers/authController');
const router = require('express').Router();
const middlewareController = require("../middleware/auth");


// Đăng ký
router.post("/register", authController.registerUser);

// Đăng nhập
router.post("/login", authController.loginUser);

// Quên mật khẩu
router.post('/forgot-password', authController.forgotPassword);

// Cập nhật mật khẩu
router.put('/resetPassword', authController.resetPassword);

router.post('/reset-password', authController.resetPassword);
// Lấy thông tin người dùng theo ID
router.get("/get-one/:id", authController.getOne);

// Cập nhật thông tin người dùng
router.put('/update/:id', authController.update);

// Xác minh mật khẩu cũ
router.post('/verify-password', authController.verifyOldPassword);

// Lấy thông tin hồ sơ người dùng
router.get('/get-profile/:id', authController.getProfile);

// Lấy danh sách tất cả người dùng
router.get('/list', authController.list);

// Lấy tất cả người dùng (được bảo vệ bằng token)
router.get("/", middlewareController.verifyToken, authController.getAllUser);

// Xóa người dùng
router.delete("/:id", middlewareController.verifyTokenAdminAuth, authController.deleteUser);

module.exports = router;