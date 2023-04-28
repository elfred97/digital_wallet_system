const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// View
router.get('/', userController.view);
router.get('/find/:id', userController.find);
router.get('/api', userController.api);
router.get('/installation', userController.installation);
router.get('/addUser', userController.addForm);
router.post('/addNewUser', userController.add);
router.get('/updateUser/:id', userController.updateUserForm);
router.post('/updateUser/:id', userController.updateUser);
router.get('/deleteUser/:id', userController.deleteUser);
router.get('/cash-in/:id', userController.cashinForm);
router.get('/balance-inquiry/:id', userController.balance);
router.post('/cash-in/:id', userController.cashin);
router.get('/debit/:id', userController.debitForm);
router.post('/debit/:id', userController.debit);
router.get('/api/balance-inquiry/:id', userController.api_balance);
router.post('/api/cash-in', userController.api_cashin);
router.post('/api/debit', userController.api_debit);
module.exports = router;