# WorkBooster Leads - Running Instructions

## Prerequisites
- Node.js installed
- PostgreSQL database access

## Running the Application

### 1. Start the Backend Server (Terminal 1)
```bash
cd server
node index.js
```
The backend server will run on `http://localhost:3001`

### 2. Start the Frontend Server (Terminal 2)
```bash
npm run dev
```
The frontend will run on `http://localhost:8080`

## Database Configuration

The backend connects to PostgreSQL with the following credentials (configured in `server/.env`):
- Host: 103.14.123.44
- Port: 30018
- Database: postgres
- Username: dhi_admin
- Password: dhi@123

## API Endpoints

### Dropdown Data
- `GET /api/leads/accounts` - Get all accounts
- `GET /api/leads/users` - Get all users
- `GET /api/leads/stages` - Get all lead stages
- `GET /api/leads/statuses` - Get all lead statuses

### Lead Operations
- `POST /api/leads` - Create a new lead

### Health Check
- `GET /health` - Check server and database connectivity

## Using the Lead Sourcing Form

1. Navigate to the "Sourcing" page from the sidebar
2. Fill in the required fields (marked with *)
3. Click "Create Lead" to save to the database
4. The form will reset after successful submission

## Troubleshooting

If you see "Failed to load form data":
1. Make sure the backend server is running on port 3001
2. Check the database connection in the backend terminal
3. Verify the database credentials in `server/.env`
