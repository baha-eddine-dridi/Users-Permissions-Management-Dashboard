import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission extends Document {
  name: string;
  resource: string;
  action: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    resource: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc: any, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Indexes pour améliorer les performances
permissionSchema.index({ name: 1 });
permissionSchema.index({ resource: 1, action: 1 });
permissionSchema.index({ isActive: 1 });

export const Permission = mongoose.model<IPermission>('Permission', permissionSchema);
