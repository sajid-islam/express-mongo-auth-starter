import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  value: { type: String, unique: true, required: true },
  name: { type: String, required: true },
});

export const Permission = mongoose.model('Permission', permissionSchema);
