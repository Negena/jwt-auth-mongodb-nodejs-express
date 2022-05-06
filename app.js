require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();

const User = require("./schema")
const JWT_SECRET = process.env.JWT_SECRET
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(express.static(__dirname+ "/public"));

app.get("/", (req,res) => {
  res.sendFile("index.html", {root: __dirname});
});

app.post("/signup", async(req,res) => {
  const {username , email, password: plainPassword} = req.body;

  if(!username || typeof username != "string") {
    return res.json({status: "error", erorr: "Invalid username"})
  }
  if(!plainPassword || typeof plainPassword != "string") {
    return res.json({status: "error", erorr: "Invalid password"})
  }
  if(plainPassword.length < 6) {
    return res.json({status: "error", erorr: "password should be at least 6 characters long"})
  }

  // const newPass = await bcrypt.hash(password, 10)
  // res.send(`${newPass} : ${password}`)
  const password = await bcrypt.hash(plainPassword, 10);
  try{
    const newUser = await User.create({
      username,
      password,
      email
    })
    const response = `
    <h1>name: ${username}</h1>
    <h1>name: ${email}</h1>
    <h1>name: ${password}</h1>
    `
    res.send(`User created successfully: ${response}`)
  }catch(err) {
    res.json(err).status(403)
  }
});

app.get("/login", (req,res) => {
  res.sendFile("login.html", {root: __dirname});
});

app.post("/login", async(req,res) => {
  const {username, password} = req.body;
  const user = await User.findOne({username}).lean();

  if(!user) {
    return res.json({status: "error", error: "invalid username or password"});
  }
  if (bcrypt.compare(password, user.password)){
    const token = jwt.sign({
       id: user._id,
      //sensitiveinfo dont go here
      //dont leak your jwt secret
       username: user.username
     }, JWT_SECRET)
     res.send(`your user : ${user.username} && ${user.password} && ${password} `)
  }
});

app.get("/change", (req,res) => {
  res.sendFile("change.html",{root: __dirname});
})

app.post("/change", async(req,res) => {
  const {token, newpass} = req.body ;
  try{
    const user = jwt.verify(token, JWT_SECRET);
    const _id = user.id
    const hashedPass = await bcrypt.hash(newPass, 10)
    await User.update(
      {id},
      {
        $set: {password: hashedPass}
      }
    )
  }catch(err) {
    throw err;
  }
});

app.listen(3000, () => {
  console.log("works...")
});
