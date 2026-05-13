import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  value: {
    type: String,
    unique: true,
    required: true,
    match: [
      /^[a-z]+:[a-z]+(:(own|any))?$/,
      'Invalid permission format, should be <action>:<resource>:<scope(own or any, optional)>',
    ],
  },
  name: { type: String, required: true },
});

export const Permission = mongoose.model('Permission', permissionSchema);
