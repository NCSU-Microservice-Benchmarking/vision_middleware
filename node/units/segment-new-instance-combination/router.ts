import express from 'express'
const router = express.Router();

router.post('/health-check', healthCheck);

function healthCheck() {
    
}

export default router;