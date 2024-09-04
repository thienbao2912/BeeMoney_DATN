const jwt = require('jsonwebtoken');

const middlewareController = {
  //Bản Gốc
  // verifyToken
  verifyToken: (req, res, next) => {
    const token = req.header('x-auth-token');
    
    if (token) {
      const accessToken = token;
      jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
        if (err) {
          res.status(403).json('Token is not valid');
        } else {
          req.user = user;
          next();
        }
      });
    } else {
      res.status(401).json("You're not authenticated");
    }
  },
  
  //Bản 1.0
  verifyTokenAuthorization: (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Sử dụng header Authorization với Bearer
    if (token) {
      jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, user) => {
        if (err) {
          return res.status(403).json('Token is not valid');
        }
        req.user = user;
        next();
      });
    } else {
      res.status(401).json("You're not authenticated");
    }
  },

  authenticateToken: (req, res, next) => {
    const authHeader = req.headers['x-auth-token'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (token == null) return res.sendStatus(401);
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
  
      // Lấy userId từ headers và gán vào req.user
      const userId = req.headers['userid'];
      if (userId) {
        user.id = userId;
      }
      
      req.user = user;
      next();
    });
  },

  //Bản Gốc
  //verifyTokenAdminAuth
  // verifyTokenAdminAuth: (req, res, next) => {
  //   middlewareController.verifyToken(req, res, () => {
  //     if (req.user.id == req.parmas.id || req.user.admin) {
  //       next();
  //     }
  //     else {
  //       res.status(403).json("You're not allowed to delete other")
  //     }
  //   });
  // },
  
  //Bản 1.1
  verifyTokenAdminAuth: (req, res, next) => {
    middlewareController.verifyToken(req, res, () => {
      if (req.user.id == req.params.id || req.user.role === 'admin') { // Sửa lỗi chính tả params
        next();
      } else {
        res.status(403).json("You're not allowed to access this resource");
      }
    });
  },

  notFound: (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found!`)
    res.status(404)
    next(error)
  },

  errHandler: (error, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    return res.status(statusCode).json({
      success: false,
      mes: error.message
    })
  }
}

module.exports = middlewareController;
