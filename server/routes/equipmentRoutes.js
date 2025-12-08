import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getEquipment,
  getEquipmentById,
  addEquipment,
  updateEquipment,
  deleteEquipment,
} from '../controllers/equipmentController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getEquipment);
router.get('/:id', getEquipmentById);
router.post('/', addEquipment);
router.put('/:id', updateEquipment);
router.delete('/:id', deleteEquipment);

export default router;
