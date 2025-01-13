const crypto = require("crypto");
const moment = require("moment");
const querystring = require("qs");
require("dotenv").config();

const sortObject = (obj) => {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
};

const createPaymentUrl = (amount, orderId, req) => {
  return new Promise((resolve, reject) => {
    try {
      process.env.TZ = "Asia/Ho_Chi_Minh";
      const date = new Date();
      const createDate = moment(date).format("YYYYMMDDHHmmss");

      const ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress ||
        "127.0.0.1";

      const tmnCode = process.env.VNP_TMNCODE;
      const secretKey = process.env.VNP_HASHSECRET;
      const vnpUrl = process.env.VNP_URL;
      const returnUrl = process.env.VNP_RETURNURL;
      console.log("VNP_HASHSECRET:", `"${process.env.VNP_HASHSECRET}"`);

      const locale = req.body.language || "vn";
      const currCode = "VND";

      let vnp_Params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: currCode,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh toan cho ma GD: ${orderId}`, // Không encode
        vnp_OrderType: "other",
        vnp_Amount: Math.round(amount * 100), // Đảm bảo nhân 100
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
      };

      if (req.body.bankCode) {
        vnp_Params["vnp_BankCode"] = req.body.bankCode;
      }

      // Sắp xếp tham số
      vnp_Params = sortObject(vnp_Params);

      // Tính chữ ký
      const signData = querystring.stringify(vnp_Params, { encode: false });
      console.log("Sorted Parameters (signData):", signData);

      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
      console.log("Generated Secure Hash:", signed);

      vnp_Params["vnp_SecureHash"] = signed;

      // Tạo URL thanh toán
      const paymentUrl =
        vnpUrl + "?" + new URLSearchParams(vnp_Params).toString();
      console.log("Final Payment URL:", paymentUrl);

      resolve(paymentUrl);
    } catch (error) {
      console.error("Error in createPaymentUrl:", error);
      reject(error);
    }
  });
};

const verifyVNPayHash = (vnp_Params) => {
  const { vnp_SecureHash, ...paramsWithoutHash } = vnp_Params;

  // Sắp xếp các tham số theo thứ tự A-Z
  const sortedParams = sortObject(paramsWithoutHash);
  const signData = querystring.stringify(sortedParams, { encode: false });

  // Lấy khóa bí mật từ môi trường
  const secretKey = process.env.VNP_HASHSECRET;

  // Tạo HMAC với SHA-512
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  console.log("Calculated Secure Hash:", signed);
  console.log("VNPay Secure Hash:", vnp_SecureHash);

  // So sánh chữ ký tính toán với chữ ký của VNPay
  return signed === vnp_SecureHash;
};

module.exports = { createPaymentUrl, verifyVNPayHash };
