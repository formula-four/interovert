import { Router }    from 'express';
import { requireAuth } from '../middlewares/auth.js';
import asyncHandler    from '../middlewares/asyncHandler.js';
import {
  getDashboardStats,
  getDashboardEventParticipants,
} from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/stats',                          requireAuth, asyncHandler(getDashboardStats));
router.get('/events/:eventId/participants',   requireAuth, asyncHandler(getDashboardEventParticipants));

export default router;
