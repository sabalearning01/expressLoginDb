const express = require('express');
const bcryptjs = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const jsonwebtoken = require('jsonwebtoken');

require('dotenv').config();


const app = express();

const Port = process.env.PORT || 4000;
const dbUrl = process.env.MONGODB_URI; // Replace with your MongoDB URL
mongoose.connect(dbUrl);
const conn = mongoose.connection;
conn.once('open', ()=>{
    console.log('Successfully connected to database');
})
const JWT_SECRET = process.env.JWT_SECRET; // Replace with your JWT secret

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin); 
  },
  credentials: true,
}));



// User Model
const UserSchema = new mongoose.Schema({
    email: { type : String, required: true, unique: true},
    password: {type : String, required: true}
},  {timestamps:true});

const User = mongoose.model("User", UserSchema);

// const User1 = new User({
//     email: "user1@example.com",
//     password: "$2a$10$7Q5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5"
// });

// User1.save();


// Register routes
app.post('/register', async (req,res) => {
    const {email, password} = req.body;
    if (!email || !password){
        return res.status(400).json({message: 'Email and password are required'})
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
    
});


// login route
// app.post('/login', async (req, res)=>{
//     const {email, password} = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//         return res.status(401).json({ message: 'Invalid email or password' });
//     }

//     const isPasswordValid = await bcryptjs.compare(password, user.password);
//     if (!isPasswordValid) {
//         return res.status(401).json({ message: 'Invalid email or password' });
//     }

//     const token = jsonwebtoken.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
//     res.status(200).json({ message: 'Login successful', token });
// });


app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      // return res.status(400).json({ errors: { email: "Email and password are required" } });
      return res.status(400).json({
        errors: {email:"Email and password are required"}
      })
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // return res.status(400).json({ errors: { email: "Email already exists" } });
      return res.status(400).json({
        errors: {email:"Email already exists"  } 

    })
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create new user
    const user = new User({ email, password: hashedPassword });
    await user.save();

    // Success response
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    // res.status(500).json({ errors: { server: "Something went wrong" } });
    console.log("Register error:", err.message);
  }
  // Handle duplicate key error (just in case)
    if (err.code === 11000) {
      return res.status(400).json({
        errors: { email: "Email already exists" },
      });

       res.status(500).json({
      errors: { server: "Something went wrong, please try again later" },
    });
    }
});


app.listen(Port, () => {
    console.log(`Server is running on port http://localhost:${Port}`);
});

