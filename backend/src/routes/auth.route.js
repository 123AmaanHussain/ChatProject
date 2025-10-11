import express from 'express';

const router = express.Router();

router.get("/signup", (req, res) => {
    res.send("Hello from signup");
});

router.get("/login", (req, res) => {
    res.send("Hello from login");
});

router.get("/logout", (req, res) => {
    res.send("Hello from logout");
});


export default router;