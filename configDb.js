const mongoose = require("mongoose");
const URI = `mongodb+srv://taptap-totp:mvWWPzdqNYJmjWfW@cluster0.owcqs.mongodb.net/myDatabase?retryWrites=true&w=majority`;

module.exports = connectDB = async () => {
  try {
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connecting to DB successfully");
  } catch (e) {
    console.log("ERROR", e);
  }
};
