import express from 'express';
import {
  createMaintenance,
  getAllMaintenance,
  getMaintenanceByEquipment,
  updateMaintenance,
  deleteMaintenance,
} from '../controllers/maintenanceController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createMaintenance);
router.get('/', authMiddleware, getAllMaintenance);
router.get('/:equipmentId', authMiddleware, getMaintenanceByEquipment);
router.put('/:id', authMiddleware, updateMaintenance);
router.delete('/:id', authMiddleware, deleteMaintenance);

export default router;
