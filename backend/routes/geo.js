import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import { validateAddress, buildFormattedAddress } from '../services/geocodeService.js';

const router = Router();

/**
 * POST /api/geo/validate
 * Body: { line1, line2, city, state, postalCode, country }  OR  { address: string }
 * Response: { status, primary, candidates }
 */
router.post(
  '/validate',
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const addressString =
      typeof body.address === 'string' && body.address.trim()
        ? body.address
        : buildFormattedAddress({
            line1: body.line1 || body.addressLine1,
            line2: body.line2 || body.addressLine2,
            city: body.city || body.addressCity,
            state: body.state || body.addressState,
            postalCode: body.postalCode || body.addressPostalCode,
            country: body.country || body.addressCountry,
          });

    if (!addressString.trim()) {
      return res.status(400).json({ message: 'Address is required' });
    }

    const result = await validateAddress(addressString);
    return res.json({ ...result, queried: addressString });
  })
);

export default router;
