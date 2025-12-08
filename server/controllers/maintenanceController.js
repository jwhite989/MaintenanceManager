import Maintenance from '../models/Maintenance.js';
import Equipment from '../models/Equipment.js';

export const createMaintenance = async (req, res, next) => {
  try {
    const { equipmentId } = req.body;

    const equipment = await Equipment.findOne({
      _id: equipmentId,
      userId: req.userId,
    });

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const record = await Maintenance.create({
      ...req.body,
      userId: req.userId,
    });

    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

export const getAllMaintenance = async (req, res, next) => {
  try {
    const records = await Maintenance.find({ userId: req.userId });
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceByEquipment = async (req, res, next) => {
  try {
    const { equipmentId } = req.params;

    const equipment = await Equipment.findOne({
      _id: equipmentId,
      userId: req.userId,
    });

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const records = await Maintenance.find({
      equipmentId,
      userId: req.userId,
    }).sort({ date: -1 });

    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

export const updateMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await Maintenance.findOneAndUpdate(
      { _id: id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Maintenance.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
