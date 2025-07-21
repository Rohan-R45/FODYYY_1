# MongoDB Atlas Troubleshooting Guide

## 🚨 Authentication Failed Error

You're getting this error: `bad auth : authentication failed`

This means your MongoDB Atlas connection string has authentication issues. Here's how to fix it:

### Step 1: Verify Your Database User

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log into your account
3. Select your project
4. Click **"Database Access"** in the left sidebar
5. Check if user `vivekchetan66` exists and has the right permissions

### Step 2: Reset Database User Password

1. In **"Database Access"**, find your user `vivekchetan66`
2. Click the **"Edit"** button (pencil icon)
3. Click **"Edit Password"**
4. Choose **"Autogenerate Secure Password"** or set a new one
5. **⚠️ IMPORTANT: Copy the new password immediately!**
6. Make sure **"Read and write to any database"** is selected
7. Click **"Update User"**

### Step 3: Check Network Access (IP Whitelist)

1. Click **"Network Access"** in the left sidebar
2. Check if your current IP is listed
3. If not, click **"Add IP Address"**
4. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Click **"Confirm"**

⏱️ *Network changes can take 1-2 minutes to take effect*

### Step 4: Get New Connection String

1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the new connection string
5. It should look like:
   ```
   mongodb+srv://vivekchetan66:<password>@cluster0.lryktse.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```

### Step 5: Update Your .env File

Replace your current MONGODB_URI with the new one, making sure to:
- Replace `<password>` with your actual password
- Add `/fodyyy` before the `?` to specify the database name

Example:
```env
MONGODB_URI=mongodb+srv://vivekchetan66:YOUR_NEW_PASSWORD@cluster0.lryktse.mongodb.net/fodyyy?retryWrites=true&w=majority&appName=Cluster0
```

### Step 6: Handle Special Characters in Password

If your password contains special characters, you need to URL encode them:

| Character | URL Encoded |
|-----------|-------------|
| @         | %40         |
| :         | %3A         |
| /         | %2F         |
| ?         | %3F         |
| #         | %23         |
| [         | %5B         |
| ]         | %5D         |
| %         | %25         |
| +         | %2B         |
| =         | %3D         |

Example:
- Password: `MyPass@123+`
- Encoded: `MyPass%40123%2B`

## 🔧 Quick Fix Commands

### Test Your Connection String
Create a simple test file to verify your connection:

```javascript
// test-connection.js
const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connection successful!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
```

Run it with: `node test-connection.js`

### Check Your Current IP Address
Visit [whatismyipaddress.com](https://whatismyipaddress.com/) to see your current IP address, then make sure it's whitelisted in MongoDB Atlas.

## 🎯 Common Solutions

### Solution 1: Create New Database User
Sometimes it's easier to create a fresh user:

1. In MongoDB Atlas, go to **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `fodyyy-admin` (or any name you prefer)
5. Click **"Autogenerate Secure Password"**
6. Copy the password
7. Select **"Read and write to any database"**
8. Click **"Add User"**
9. Update your .env file with the new credentials

### Solution 2: Use Different Cluster
If issues persist, try creating a new cluster:

1. In MongoDB Atlas, click **"Build a Database"**
2. Choose **"M0 Sandbox"** (free tier)
3. Select a different region
4. Create new database user for this cluster
5. Get the new connection string

## 🔍 Debug Your Connection String

Your current connection string format should be:
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER_URL/DATABASE_NAME?retryWrites=true&w=majority&appName=Cluster0
```

Breaking down your connection string:
- **Username**: `vivekchetan66`
- **Password**: `V87Bq3ECf5jLNwL` (verify this is correct)
- **Cluster**: `cluster0.lryktse.mongodb.net`
- **Database**: `fodyyy` (make sure this is added)

## 📞 Still Having Issues?

If you're still getting authentication errors:

1. **Double-check credentials** in MongoDB Atlas dashboard
2. **Wait 2-3 minutes** after making changes (propagation time)
3. **Try from a different network** (mobile hotspot) to rule out firewall issues
4. **Create a completely new cluster** and database user
5. **Contact MongoDB Atlas support** - they have excellent free support

## ✅ Success Indicators

When your connection works, you should see:
```
✅ MongoDB connected successfully!
   Host: cluster0-shard-00-02.lryktse.mongodb.net
   Database: fodyyy
   Port: 27017
🔗 Mongoose connected to MongoDB
```

---

**Need more help?** Check the main `MONGODB_SETUP.md` file for complete setup instructions.