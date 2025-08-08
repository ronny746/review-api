const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

exports.authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({error: 'No token provided'});
  
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({error: 'No token provided'});

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({error: 'Invalid token'});
    req.userId = decoded.id;
    next();
  });
};
