const mysql = require('mysql');
// Connection to Database
const pool = mysql.createPool({
    connectionLimit : 100,
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME
})

// API Docs
exports.api = (req, res) => {
    res.render('api');
}

// Installation Docs
exports.installation = (req, res) => {
    res.render('installation');
}

// View Users
exports.view = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err; // Error occur
        
        // Get all Users
        connection.query('SELECT * FROM user WHERE status = 1', (err, rows) => {
            // Release connection when done
            connection.release();

            if(!err){
                res.render('home', {rows});
            }
            else{
                console.log(err);
            }
        });
    });
}
// Find Users
exports.find = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err; // Error occur
        
        let userId = req.params.id;
        // Get Users
        connection.query('SELECT * FROM user WHERE id = ?', [userId], (err, rows) => {
            // Release connection when done
            connection.release();
            if(!err){
                res.render('userPage', {rows, userId});
            }
            else{
                console.log(err);
            }
        });
    });
}

// Add Users Form View
exports.addForm = (req, res) => {
    res.render('addUser', {alert : ''});
}

// Add New Users
exports.add = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err; // Error occur
        let new_date = new Date();
        const {first_name, last_name} = req.body;
        // Get Users
        connection.query('INSERT INTO user SET first_name = ?, last_name= ?', [first_name, last_name], (err, user) => {
            
            if(!err){
                connection.query('INSERT INTO balance SET user_id = ?, balance = ?, updated_at= ?', [user.insertId, 0, new_date], (err, rows) => {
                    // Release connection when done
                    connection.release();
                    if(!err){
                        res.render('addUser', {alert:'User added'});
                    }
                    else{
                        console.log(err);
                    }
                });
            }
        });
    });
}


// update Users Form View
exports.updateUserForm = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err; // Error occur
        
        let userId = req.params.id;
        // Get Users
        connection.query('SELECT * FROM user WHERE id = ?', [userId], (err, rows) => {
            // Release connection when done
            connection.release();
            if(!err){
                res.render('updateUserForm', {rows, userId});
            }
            else{
                console.log(err);
            }
        });
    });
}

// Add New Users
exports.updateUser = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err; // Error occur
        
        const {first_name, last_name} = req.body;
        const userId = req.params.id;
        // Get Users
        connection.query('UPDATE user SET first_name = ?, last_name = ? WHERE id = ?', [first_name, last_name, userId], (err, rows) => {
            // Release connection when done
            if(!err){
                connection.query('SELECT * FROM user WHERE id = ?', [userId], (err, rows) => {
                    // Release connection when done
                    connection.release();
                    if(!err){
                        res.render('updateUserForm', {rows, alert : "User is now updated"});
                    }
                    else{
                        console.log(err);
                    }
                });
            }
            else{
                console.log(err);
            }
        });
    });
}

// Delete User
exports.deleteUser = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err; // Error occur
        
        const userId = req.params.id;
        connection.query('UPDATE user SET status = ? WHERE id = ?', [2, userId], (err, rows) => {
            // Release connection when done
            if(!err){
                connection.query('SELECT * FROM user WHERE status = ?', [1], (err, rows) => {
                    // Release connection when done
                    connection.release();
                    if(!err){
                        res.render('home', {rows, alert: 'User Deleted.'});
                    }
                });
            }
            else{
                console.log(err)
            }
        });
    });
}


// Balance Inquiry
exports.balance = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err; // Error occur
        
        const userId = req.params.id;
        // Get Users
        connection.query('SELECT user.*, balance.balance FROM user LEFT JOIN balance ON user.id = balance.user_id WHERE user.id = ?', [userId], (err, rows) => {
            // Release connection when done
            if(!err){
                connection.query('SELECT * FROM transactions WHERE user_id = ?', [userId], (err, transactions) => {
                    // Release connection when done
                    connection.release();
                    if(!err){
                        res.render('balance-inquiry', {rows, userId, transactions});
                    }
                });
            }
            else{
                console.log(err);
            }
        });
    });
}

// Balance Inquiry
exports.api_balance = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err; // Error occur
        
        const userId = req.params.id;
        // Get Users
        connection.query('SELECT user.*, balance.balance FROM user LEFT JOIN balance ON user.id = balance.user_id WHERE user.id = ?', [userId], (err, rows) => {
            // Release connection when done
            connection.release();
            if(!err){
                res.send(rows);
            }
            else{
                console.log(err);
            }
        });
    });
}

// Add Users Form View
exports.cashinForm = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err; // Error occur
        connection.query('SELECT user.*, balance.balance as total_balance FROM user LEFT JOIN balance ON user.id = balance.user_id WHERE user.id = ?', [req.params.id], (err, rows) => {
            connection.release();

            if(!err){
                res.render('cashInForm', {rows, userId : req.params.id});
            }
        });
    });
}

// Cash In Inquiry
exports.cashin = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err; // Error occur
        let new_balance;
        let new_date = new Date();
        const {userId, amount} = req.body;
        // Check Amount
        if(amount < 0){
            connection.query('SELECT user.*, balance.balance as total_balance FROM user LEFT JOIN balance ON user.id = balance.user_id WHERE user.id = ?', [userId], (err, rows) => {
                connection.release();
    
                if(!err){
                    res.render('cashInForm', {rows, userId, err_alert : 'Negative Number'});
                }
            });
        }
        else{
            connection.query('SELECT * FROM balance WHERE user_id = ?', [userId], (err, balance) => {
                if(!err){
                    // With existing balance
                    if(balance.length > 0){
                        new_balance = parseFloat(amount) + parseFloat(balance[0].balance);
    
                        connection.query('UPDATE balance SET balance = ?, updated_at = ? WHERE user_id = ?', [new_balance, new_date, userId], (err, rows2) => {
                
                            if(!err){
                                connection.query('INSERT INTO transactions SET money = ?, type = ?, created_at = ?, user_id = ?', [amount, 'cashin',new_date, userId], (err, rows) => {
                
                                    if(!err){
                                        connection.query('SELECT user.*, balance.balance as total_balance FROM user LEFT JOIN balance ON user.id = balance.user_id WHERE user.id = ?', [userId], (err, rows) => {
                                            connection.release();
                                
                                            if(!err){
                                                res.render('cashInForm', {rows, userId, alert : 'Money has been added.'});
                                            }
                                        });
                                    }
                                });
                            }
                        });                    
                    }
                    // No Balance yet
                    else{
                        connection.query('INSERT INTO balance SET user_id = ?, balance = ?, updated_at= ?', [userId, amount, new_date], (err, rows) => {
                
                            if(!err){
                                connection.query('INSERT INTO transactions SET money = ?, type = ?, created_at = ?, user_id = ?', [amount, 'cashin',new_date, userId], (err, rows) => {
                
                                    if(!err){
                                        connection.query('SELECT user.*, balance.balance as total_balance FROM user LEFT JOIN balance ON user.id = balance.user_id WHERE user.id = ?', [userId], (err, rows) => {
                                            connection.release();
                                
                                            if(!err){
                                                res.render('cashInForm', {rows, userId, alert : 'Money has been added.'});
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
                else{
                    console.log(err);
                }
            });
        }
        
    });
}

// Cash In Inquiry
exports.api_cashin = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err; // Error occur
        let new_balance;
        let new_date = new Date();
        const {userId, amount} = req.body;

        if(amount < 0){
            res.send("Negative Number");
        }
        else{
            connection.query('SELECT * FROM balance WHERE user_id = ?', [userId], (err, rows) => {
                
                if(!err){
                    // With existing balance
                    if(rows.length > 0){
                        new_balance = parseFloat(amount) + parseFloat(rows[0].balance);
                        connection.query('UPDATE balance SET balance = ?, updated_at = ? WHERE user_id = ?', [new_balance, new_date, userId], (err, rows2) => {
                
                            if(!err){
                                connection.query('INSERT INTO transactions SET money = ?, type = ?, created_at = ?, user_id = ?', [amount, 'cashin',new_date, userId], (err, rows) => {
                
                                    if(!err){
                                        connection.query('SELECT user.*, balance.balance as total_balance FROM user LEFT JOIN balance ON user.id = balance.user_id WHERE user.id = ?', [userId], (err, rows) => {
                                            connection.release();
                                
                                            if(!err){
                                                res.send(rows);
                                            }
                                        });
                                    }
                                });
                            }
                        });
    
                    }
                    // No Balance yet
                    else{
                        connection.query('INSERT INTO balance SET user_id = ?, balance = ?, updated_at= ?', [userId, amount, new_date], (err, rows) => {
                
                            if(!err){
                                connection.query('INSERT INTO transactions SET money = ?, type = ?, created_at = ?, user_id = ?', [amount, 'cashin',new_date, userId], (err, rows) => {
                
                                    if(!err){
                                        connection.query('SELECT user.*, balance.balance as total_balance FROM user LEFT JOIN balance ON user.id = balance.user_id WHERE user.id = ?', [userId], (err, rows) => {
                                            connection.release();
                                
                                            if(!err){
                                                res.send(rows);
                                            }
                                            else res.send(err);
                                        });
                                    }
                                    else res.send(err);
                                });
                            }
                            else res.send(err);
                        });
                    }
                }
                else{
                    console.log(err);
                }
            });
        }
        
    });
}

// Add Users Form View
exports.debitForm = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err; // Error occur
        connection.query('SELECT user.*, balance.balance as total_balance FROM user LEFT JOIN balance ON user.id = balance.user_id WHERE user.id = ?', [req.params.id], (err, rows) => {
            connection.release();

            if(!err){
                res.render('debitForm', {rows, userId : req.params.id});
            }
        });
    });
}

// Debit Money
exports.debit = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err; // Error occur
        let new_balance;
        let new_date = new Date();
        const {userId, amount} = req.body;

        // Check Amount
        if(amount < 0){
            connection.query('SELECT user.*, balance.balance as total_balance FROM user LEFT JOIN balance ON user.id = balance.user_id WHERE user.id = ?', [userId], (err, rows) => {
                connection.release();
    
                if(!err){
                    res.render('debitForm', {rows, userId, err_alert : 'Negative Number'});
                }
            });
        }
        else{
            connection.query('SELECT *, balance as total_balance FROM balance WHERE user_id = ?', [userId], (err, rows) => {
                
                if(!err){
                    // With existing balance
                    if(rows.length > 0){
                        if(amount <= rows[0].balance){
                            new_balance = parseFloat(rows[0].balance) - parseFloat(amount);
                            connection.query('UPDATE balance SET balance = ?, updated_at = ? WHERE user_id = ?', [new_balance, new_date, userId], (err, rows2) => {
                
                                if(!err){
                                    connection.query('INSERT INTO transactions SET money = ?, type = ?, created_at = ?, user_id = ?', [amount, 'debit', new_date, userId], (err, transactions) => {
                
                                        if(!err){
                                            connection.query('SELECT user.*, balance.balance as total_balance FROM user LEFT JOIN balance ON user.id = balance.user_id WHERE user.id = ?', [userId], (err, rows) => {
                                                connection.release();
                                    
                                                if(!err){
                                                    res.render('debitForm', {rows, userId, alert : 'Money has been deducted.'});
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                        else{
                            res.render('debitForm', { rows, userId, err_alert:"Amount exceeds the total balance. Check the balance first."});
                        }
    
                    }
                    else
                    res.render('debitForm',{ rows, userId, err_alert:"No balance"});
                }
                else{
                    res.redirect(301, 'debitForm');
                    console.log(err);
                }
            });
        }
    });
}


// Debit Money
exports.api_debit = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err; // Error occur
        let new_balance;
        let new_date = new Date();
        const {userId, amount} = req.body;
        if(parseFloat(amount) < 0){
            res.send("Negative Number");
        }
        else{
            connection.query('SELECT * FROM balance WHERE user_id = ?', [userId], (err, rows) => {
                
                if(!err){
                    // With existing balance
                    if(rows.length > 0){
                        if(amount <= rows[0].balance){
                            new_balance = parseFloat(rows[0].balance) - parseFloat(amount);
                            connection.query('UPDATE balance SET balance = ?, updated_at = ? WHERE user_id = ?', [new_balance, new_date, userId], (err, rows2) => {
                
                                if(!err){
                                    connection.query('INSERT INTO transactions SET money = ?, type = ?, created_at = ?, user_id = ?', [amount, 'debit', new_date, userId], (err, rows) => {
                
                                        if(!err){
                                            connection.query('SELECT user.*, balance.balance as total_balance FROM user LEFT JOIN balance ON user.id = balance.user_id WHERE user.id = ?', [userId], (err, rows) => {
                                                connection.release();
                                    
                                                if(!err){
                                                    res.send(rows);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                        else{
                            res.send("Amount exceeds the total balance. Check the balance first.");
                        }
    
                    }
                    else
                        res.send("No Balance.");
                }
                else{
                    console.log(err);
                }
            });
        }
    });
}
