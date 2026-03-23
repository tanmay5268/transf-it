import express from "express";
const app = express();
app.post('/webhook',(req, res) => {
    console.log(req.body);
    res.status(200).send("OK");
});

app.listen(5000, () => {
    console.log(`Server is running on ${'http://localhost:5000'}`);
});
