const {Schema, model} = require("mongoose");

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
    },    
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, "Please fill a valid email address"]
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "admin", "subadmin", "moderator"]
    },
    salt: {
        type:  String,
        required: true
    }
},
{
    timestamps: true
}
)

const User = model("User", userSchema);
module.exports = User;