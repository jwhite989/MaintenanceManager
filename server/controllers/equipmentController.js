import Equipment from '../models/Equipment.js';

export const getEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.find({ userId: req.userId });
    res.status(200).json(equipment);
  } catch (error) {
    next(error);
  }
};

export const getEquipmentById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const unit = await Equipment.findOne({ _id: id, userId: req.userId });

    if (!unit) {
      return res.status(404).json(`Equipment with id:${id} not found.`);
    }
    res.status(200).json(unit);
  } catch (error) {
    next(error);
  }
};

export const addEquipment = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Request body cannot be empty' });
    }
    const equipmentData = req.body;
    equipmentData.userId = req.userId;

    const newEquipment = await Equipment.create(equipmentData);
    res.status(201).json(newEquipment);
  } catch (error) {
    next(error);
  }
};

export const updateEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedEquipment = await Equipment.findOneAndUpdate(
      { _id: id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedEquipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.status(200).json(updatedEquipment);
  } catch (error) {
    next(error);
  }
};

export const deleteEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Equipment.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
