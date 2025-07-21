# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas (cloud database) for your FODYYY backend project.

## Why MongoDB Atlas?

- ✅ **Free Tier Available** - 512MB storage, perfect for development
- ✅ **No Local Installation** - Works from anywhere with internet
- ✅ **Automatic Backups** - Your data is safe
- ✅ **Global Availability** - Fast access worldwide
- ✅ **Easy Scaling** - Upgrade when you need more resources

## Step-by-Step Setup

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click **"Try Free"** or **"Start Free"**
3. Sign up with your email or Google/GitHub account
4. Verify your email address

### 2. Create a New Cluster

1. After logging in, click **"Build a Database"**
2. Choose **"M0 Sandbox"** (Free tier)
3. Select your preferred **Cloud Provider** (AWS, Google Cloud, or Azure)
4. Choose a **Region** closest to your location
5. Give your cluster a name (e.g., "FODYYY-Cluster")
6. Click **"Create Cluster"**

⏱️ *Cluster creation takes 1-3 minutes*

### 3. Create Database User

1. In the **Security** section, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter a username (e.g., `fodyyy-user`)
5. Click **"Autogenerate Secure Password"** or create your own
6. **⚠️ IMPORTANT: Copy and save the password immediately!**
7. Under **Database User Privileges**, select **"Read and write to any database"**
8. Click **"Add User"**

### 4. Configure Network Access

1. In the **Security** section, click **"Network Access"**
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, use specific IP addresses
4. Click **"Confirm"**

### 5. Get Your Connection String

1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** as driver and version **"4.1 or later"**
5. Copy the connection string - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
   ```

### 6. Update Your .env File

1. Open your `.env` file in the FODYYY project
2. Replace the MONGODB_URI with your Atlas connection string:
   ```env
   MONGODB_URI=mongodb+srv://fodyyy-user:YOUR_PASSWORD@cluster0.abc123.mongodb.net/fodyyy?retryWrites=true&w=majority
   ```

**Important replacements:**
- Replace `<username>` with your database username
- Replace `<password>` with your database password
- Add `/fodyyy` before the `?` to specify your database name

### 7. Test Your Connection

1. Save your `.env` file
2. Run your server:
   ```bash
   npm run dev
   ```
3. You should see:
   ```
   ✅ MongoDB connected successfully!
      Host: cluster0-shard-00-02.abc123.mongodb.net
      Database: fodyyy
      Port: 27017
   ```

## Example Complete Connection String

```env
# Replace with your actual values:
MONGODB_URI=mongodb+srv://fodyyy-user:MySecurePassword123@cluster0.abc123.mongodb.net/fodyyy?retryWrites=true&w=majority
```

## Troubleshooting

### Connection Issues

**Error: "Authentication failed"**
- ✅ Check username and password are correct
- ✅ Ensure password doesn't contain special characters that need URL encoding
- ✅ Verify the database user exists and has proper permissions

**Error: "IP not whitelisted"**
- ✅ Add your IP address to Network Access in Atlas
- ✅ For development, you can use 0.0.0.0/0 (allow all IPs)

**Error: "Server selection timeout"**
- ✅ Check your internet connection
- ✅ Verify the cluster URL is correct
- ✅ Ensure your firewall isn't blocking the connection

### Password Special Characters

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

Example:
- Password: `MyPass@123`
- Encoded: `MyPass%40123`

## MongoDB Atlas Dashboard Features

Once connected, you can use the Atlas dashboard to:

- 📊 **Browse Collections** - View your data
- 📈 **Monitor Performance** - See connection stats
- 🔍 **Query Data** - Run database queries
- 📋 **View Logs** - Debug connection issues
- ⚙️ **Manage Users** - Add/remove database users
- 🌐 **Network Access** - Manage IP whitelist

## Free Tier Limits

MongoDB Atlas Free Tier (M0) includes:
- 512 MB storage
- Shared RAM
- No backup (for free tier)
- Community support

Perfect for development and small projects!

## Next Steps

After successful connection:
1. Test your API endpoints (register/login users)
2. Check data in MongoDB Atlas dashboard
3. Consider upgrading to paid tier for production use

## Need Help?

- 📖 [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- 💬 [MongoDB Community Forums](https://community.mongodb.com/)
- 🎓 [MongoDB University](https://university.mongodb.com/) - Free courses

---

**🎉 Congratulations!** Your FODYYY backend is now connected to MongoDB Atlas!