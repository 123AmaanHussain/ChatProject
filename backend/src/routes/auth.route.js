import express from 'express';
import { signup, login, logout, updateProfile } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';

const router = express.Router();
router.use(arcjetProtection)

router.post("/signup", signup);
router.post("/login",  login);
router.post("/logout", logout);
router.put("/update-profile",  protectRoute,updateProfile);
router.get("/check",  protectRoute,(req,res)=>{       //check if user is logged in (protected route, middleware)
    res.status(200).json(req.user);
});     

export default router;