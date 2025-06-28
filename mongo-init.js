// MongoDB initialization script for ProjectBuzz
// This script runs when the MongoDB container starts for the first time

// Switch to the projectbuzz database
db = db.getSiblingDB('projectbuzz');

// Create a user for the application
db.createUser({
  user: 'projectbuzz_user',
  pwd: 'projectbuzz_password',
  roles: [
    {
      role: 'readWrite',
      db: 'projectbuzz'
    }
  ]
});

// Create initial collections with some basic indexes
db.createCollection('users');
db.createCollection('projects');
db.createCollection('payments');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.projects.createIndex({ "seller": 1 });
db.projects.createIndex({ "status": 1 });
db.projects.createIndex({ "category": 1 });
db.payments.createIndex({ "user": 1 });
db.payments.createIndex({ "project": 1 });
db.payments.createIndex({ "cfOrderId": 1 }, { unique: true });

print('✅ ProjectBuzz database initialized successfully!');
