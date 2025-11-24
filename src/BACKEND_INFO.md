# Backend Connection Guide

## Overview
Your Aluminum Windows & Doors application is configured with a Supabase backend that automatically stores all data in a PostgreSQL database.

## Current Configuration
- **Project ID**: `cccqaaaildvfmyqfzngo`
- **Backend URL**: `https://cccqaaaildvfmyqfzngo.supabase.co/functions/v1/make-server-ad0536e6`
- **Database**: Supabase PostgreSQL with KV Store table

## How It Works

### Backend Server
The backend server is located at `/supabase/functions/server/index.tsx` and includes:
- REST API endpoints for all data operations (GET, POST, DELETE)
- CORS enabled for frontend access
- Automatic fallback to localStorage if unavailable
- Health check endpoint for monitoring

### Data Storage
All data is stored in a key-value table (`kv_store_ad0536e6`) with the following prefixes:
- `product:` - Product catalog items
- `glass:` - Glass types and specifications
- `style:` - Window/door styles
- `colour:` - Available colors
- `accessory:` - Accessories catalog
- `customer:` - Customer information
- `document:` - Quotations, invoices, and receipts

### Connection Status
The app displays a real-time connection indicator in the header:
- 🟢 **Green badge**: Database Connected - All data is saved to Supabase
- 🟠 **Orange badge**: Local Storage Mode - Data is saved locally in your browser

## Troubleshooting

### If the backend shows as disconnected:
1. Check the browser console for detailed connection logs
2. The backend may need time to deploy (first load can take 10-15 seconds)
3. Verify the Supabase project is active at: https://supabase.com/dashboard/project/cccqaaaildvfmyqfzngo

### Console Logs to Look For:
- `🔍 Checking backend availability...` - Connection test started
- `✅ Backend is available and connected` - Success!
- `❌ Backend connection failed` - Connection issue (will use localStorage)

### Viewing Your Data
You can view the database directly at:
https://supabase.com/dashboard/project/cccqaaaildvfmyqfzngo/database/tables

## Local Storage Fallback
If the backend is unavailable, the app automatically:
- Saves all data to browser localStorage
- Continues functioning normally
- Seamlessly syncs to backend when connection is restored

**Note**: Data in localStorage is browser-specific and will be lost if you clear browser data.

## API Endpoints
All endpoints are prefixed with `/make-server-ad0536e6`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Check server status |
| `/products` | GET/POST/DELETE | Manage products |
| `/glasses` | GET/POST/DELETE | Manage glass types |
| `/styles` | GET/POST/DELETE | Manage styles |
| `/colours` | GET/POST/DELETE | Manage colours |
| `/accessories` | GET/POST/DELETE | Manage accessories |
| `/customers` | GET/POST/DELETE | Manage customers |
| `/documents` | GET/POST/DELETE | Manage documents |

## Environment Variables
The backend uses these environment variables (already configured):
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Backend authentication
- `SUPABASE_ANON_KEY` - Frontend authentication
