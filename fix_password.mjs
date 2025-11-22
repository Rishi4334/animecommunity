import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

async function fixPasswords() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://231fa04334_db_user:rishi@cluster0.lb5lxhy.mongodb.net/anime_tracker?retryWrites=true&w=majority';
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    const userSchema = new mongoose.Schema({
      username: String,
      email: { type: String, lowercase: true },
      password: String,
      role: String,
      profileLinks: Object,
      createdAt: Date,
    });
    
    const User = mongoose.model('User', userSchema);
    
    const password = 'Rishi@2006';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('New hashed password:', hashedPassword);
    
    const result1 = await User.updateOne(
      { email: 'rishipulipaka2006@gmail.com' },
      { password: hashedPassword }
    );
    
    const result2 = await User.updateOne(
      { email: '231fa04334@gmail.com' },
      { password: hashedPassword }
    );
    
    console.log('✓ Password reset for rishipulipaka2006@gmail.com - Updated:', result1.modifiedCount);
    console.log('✓ Password reset for 231fa04334@gmail.com - Updated:', result2.modifiedCount);
    
    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixPasswords();
