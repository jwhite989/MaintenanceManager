import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceType: {
      type: String,
      required: true,
      enum: {
        values: ["preventative maintenance", "breakdown", "planned", "other"],
        message: "{VALUE} is not a valid service type",
      },
      default: "other",
    },
    date: {
      type: Date,
      required: true,
    },
    mileage: {
      type: Number,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Maintenance = mongoose.model("Maintenance", maintenanceSchema);

export default Maintenance;
