# digital_wallet_system

## Requirements

npm
node js
mysql

## Database Setup
Steps:
1. Create a database "digital_wallet_system".

2. Create by importing the "user-schema.sql" to the database.

Note: To test the user data.

3. Import the "user-data.sql" data to the user table.

4. Create by import the "balance-schema.sql" to the database.

5. Import the "balance-data.sql" data to the balance table.

6. Create by import the "transactions-schema.sql" to the database.

## .env Setup
Rename the .env_sample.config to .env

Configure the .env data

DB_HOST = localhost
DB_NAME = digital_wallet_system
DB_USER = root
DB_PASS =

## Command
npm update
npm start


# API Docs
## Balance Inquiry
Get the user balance

GET http://localhost:5000/api/balance-inquiry/{id}

Parameters
  {id} (Number) User ID
  
Return

  id - (int) User ID
  
  first_name - (varchar) User's first name
  
  last_name - (varchar) User's last name
  
  status - (tinyint) Note: 1 = Active, 2 = Inactive
  
  balance - (Float) Money amount

## Cashin
Add money to the account.

POST http://localhost:5000/api/cash-in

Body Parameters
  {userId} (Number) Id for the User
  {amount} (Float) Amount of money to be added
Return
  id - (int) User ID
  first_name - (varchar) User's first name
  last_name - (varchar) User's last name
  status - (tinyint) Note: 1 = Active, 2 = Inactive
  total_balance - (Float) Money amount

## Debit
Deduct money to the account.

POST http://localhost:5000/api/debit

Body Parameters

  {userId} (Number) Id for the User
  
  {amount} (Float) Amount of money to be added
  
Return

  id - (int) User ID
  
  first_name - (varchar) User's first name
  
  last_name - (varchar) User's last name
  
  status - (tinyint) Note: 1 = Active, 2 = Inactive
  
  total_balance - (Float) Money amount
