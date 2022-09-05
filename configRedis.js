const redis = require("redis")
// const url = `redis://default:redispw@host.docker.internal:49154`
const url = `redis://default:redispw@localhost:49155`

module.exports = connectRedis = async () => {
    try {
        const client = redis.createClient({
            url
        })

        client.on("error", (err) => {
            console.error("Error: ", err)
        })

        await client.connect()
        console.log("Connecting to Redis successfully");
    } catch (e) {
        console.log("ERROR", e);
    }
};
