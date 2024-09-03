const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());
function authentication(req, res, next) {
    var authHeader = req.headers.authorization;

    if (!authHeader) {
        let error = new Error("Your are not authenticated!");
        res.setHeader("WWW-Authenticate", 'Basic');
        error.status = 401;
        return next(error);
    }

    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

    // var orginalString = new Buffer.from(authHeader.split(' ')[1], 'base64').toString();
    // var encodeStr = new Buffer.from(orginalString, 'utf-8').toString('base64');

    // console.log("encodeStr ",encodeStr);
    var userId = auth[0];
    var pass = auth[1];

    if (userId === 'vrurgk' && pass === 'happy@123') {
        next();
    }
    else {
        var error = new Error("You are not authenticated!");
        res.setHeader('WWW-Authenticate', 'Basic');
        error.status = 401;
        return next(error);
    }
}

app.use(authentication);

var conn = mysql.createConnection({
    host: '3.12.102.246', 
    user: 'geekayTech', 
    password: 'Geekay@123',
    connectTimeout: 30000,
    database: 'test'    
});
conn.connect((err, msg) => {
    if (err) {
        console.log(err);
        return;
    }
})

app.use(express.static('frontend'));

app.listen(5000, ()=> {
    console.log("Application run http://localhost:5000");
})

//Get All Users

app.get("/users", (req, res) => {
    var query = 'select * from emp_info';
    conn.query(query, (err, result) => {
        if (err) {
            res.send({error: err.message});
        }
        if (result.length > 0) {
            res.send({
                msg: "get all user data",
                data: result
            })
        }
        else {
            res.send(0);
        }
    })
});

//get Data

app.get("/user/:id", (req, res) => {
    var id = req.params.id;
    var query = `SELECT * FROM personal_info, emp_info WHERE personal_info.id = emp_info.id AND personal_info.id = ${id}`;
    conn.query(query, (err, result) => {
        if (err) 
            res.send({error: err.message});
        if (result.length > 0) {
            res.send({ data : result});
        }
        else {
            res.send({messagge: "data not found"});
        }
        
    })
})

//add Data

app.post("/user/add", (req, res) => {
    var query = `Insert into emp_info values(${req.body.id}, '${req.body.firstname}', '${req.body.lastname}', '${req.body.email}', ${req.body.mobile}, '${req.body.companyName}', '${req.body.design}', '${req.body.department}', ${req.body.salary}, ${req.body.experience}, ${req.body.travelType})`;
    conn.query(query, (err, result) => {
        if (err) {
            res.send({error: err.message});
        }
        if (result.affectedRows > 0) {
            query = `INSERT INTO personal_info VALUES(${req.body.id}, '${req.body.fathers_name}', '${req.body.mothers_name}', '${req.body.dob}', ${req.body.Age}, '${req.body.address}', '${req.body.current_location}',${req.body.pin})`;
            conn.query(query, (err, result) => {
                if (err) {
                    res.send({error: err.message});
                }
                if (result.affectedRows > 0) {
                    res.send({data: "data added Successfully"});
                }
                else {
                    res.send({data: "Insert Failed"});
                }
                
            });
        }
        else {
            res.send({data: "Insert Failed"});
        }
    });
});

//update Data

app.put("/user/update/:id", (req, res) => {
    let id = req.params.id;
    var query = `UPDATE emp_info A, personal_info B SET A.firstname = '${req.body.firstname}', A.lastname = '${req.body.lastname}', A.email = '${req.body.email}', A.mobile = ${req.body.mobile}, A.companyName = '${req.body.companyName}', A.design = '${req.body.design}', A.department = '${req.body.department}', A.salary = ${req.body.salary}, A.experience = ${req.body.experience}, A.travelType = ${req.body.travelType}, B.fathers_name = '${req.body.fathers_name}', B.mothers_name = '${req.body.mothers_name}', B.dob = '${req.body.dob}', B.Age = ${req.body.Age}, B.address= '${req.body.address}', B.current_location = '${req.body.current_location}', B.pin = ${req.body.pin} WHERE A.id = B.id AND A.id = ${id}`;
    conn.query(query, (err, result) => {
        if (err) {
            res.send({error: err.message});
        } 
        if (result.affectedRows > 0) {
            res.send({data : "data successfully updated"});
        }
        else {
            res.send({data: "no data affected"});
        }
    })
});


//Delete data

app.delete('/user/delete/:id', (req, res) => {
    let id = req.params.id;
    var query = `DELETE FROM personal_info WHERE id = ${id}`;
    conn.query(query, (err, result) => {
        if (err) {
            res.send({error: err.message});
        }
        if (result.affectedRows > 0) {
            var query = `DELETE FROM emp_info WHERE id = ${id}`;
            conn.query(query, (err, result) => {
                if (err) {
                    res.send({error: err.message});
                }
                if (result.affectedRows > 0) {
                    res.send({data: "delete successfully"});
                }
                else {
                    res.send({data: "not affected"});
                }
            });
        }
        else {
            res.send({message: "not affected"});
        }
    });
    
});

