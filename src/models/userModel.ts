import crypto from 'crypto';
import mongoose, { Model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

// Enums
export enum UserRole {
  USER = 'user',
  GUIDE = 'guide',
  LEAD_GUIDE = 'lead-guide',
  ADMIN = 'admin'
}

// Base interface for schema properties
export interface IUserDocument extends mongoose.Document {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  role: UserRole;
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active: boolean;

  // Instance methods
  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;

  changedPasswordAfter(JWTTimestamp: number): boolean;

  createPasswordResetToken(): string;
}

// Interface for User Model with static methods (if needed)
interface IUserModel extends Model<IUserDocument> {
  // Add static methods here if needed
}

const userSchema = new mongoose.Schema<IUserDocument, IUserModel>({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(this: IUserDocument, el: string): boolean {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// Indexes for better performance
// userSchema.index({ email: 1 }, { unique: true }); // unique is auto index
userSchema.index({ passwordResetToken: 1 }, { sparse: true });

// Document middleware -> runs before save, create
// hash password before saving
userSchema.pre('save', async function(this: IUserDocument, next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// update passwordChangedAt time when password is modified
userSchema.pre('save', function(this: IUserDocument, next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// Query middleware -> runs before find()
// filter out inactive users
userSchema.pre(/^find/, function(
  this: mongoose.Query<IUserDocument[], IUserDocument>,
  next
) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// Instance methods -> call it from each document only one record (document)
// compare password
userSchema.methods.correctPassword = async function(
  this: IUserDocument,
  candidatePassword: string,
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// check if password was changed after login
userSchema.methods.changedPasswordAfter = function(
  this: IUserDocument,
  JWTTimestamp: number
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000
    );

    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

// create password reset token
userSchema.methods.createPasswordResetToken = function(
  this: IUserDocument
): string {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

// Create model with proper typing
const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);
export default User;
