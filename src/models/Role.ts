import mongoose from 'mongoose';
import type { IRole } from '../types/models-type/role.type.ts';

const roleSchema = new mongoose.Schema<IRole>({
  value: { type: String, unique: true, required: true },
  name: { type: String, unique: true, required: true },
  priority: { type: Number, default: 0 },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission', required: true }],
});

export const Role = mongoose.model('Role', roleSchema);
