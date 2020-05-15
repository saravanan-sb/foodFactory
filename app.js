const express = require("express"),
    { connectDB } = require('./dbconn'),
    app = express(),
    cors = require('cors'),
    swaggerJsDoc = require('swagger-jsdoc'),
    swaggerUi = require('swagger-ui-express')


let PORT = process.env.PORT || 3001;


// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Customer API",
            description: "Customer API Information",
            contact: {
                name: "Amazing Developer"
            },
            servers: ["http://localhost:3001"]
        }
    },
    apis: ['./routes/api/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// APP CONFIG
connectDB()
app.use(express.json({ extended: false }));

app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

//define routes
app.use('/api/users', require('./routes/api/user'));
app.use('/api/orders', require('./routes/api/orders'));
app.use('/api/vendor', require('./routes/api/vendor'));



app.listen(PORT, () => console.log('Server has started'));