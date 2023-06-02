import winston from "winston"
const logger = winston.createLogger({
    level: "debug",
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.timestamp(), winston.format.prettyPrint({colorize: true}))
        }),
        new winston.transports.File({
            filename: "app.log",
            format: winston.format.json()
        })
    ]
})

export default logger;