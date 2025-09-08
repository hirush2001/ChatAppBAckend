import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt  from "jsonwebtoken";
import { configDotenv } from "dotenv";


export function createUser(req, res) {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10)

    const user = new User({
        mobilenumber: req.body.mobilenumber,
        firsName: req.body.firsName,
        lastName: req.body.lastName,
        password: hashedPassword
    })

    user.save().then(
        () => {
            res.json({
                message: "User Create Successfully"
            })
        }
    ).catch(
        () => {
            res.json({
                message: "Failed to create user"
            })
        }
    )
}
/*

export function loginUser(req, res) {
    const { mobilenumber, password } = req.body;

    // Find user by unique identifier (Mobilenumber)
    User.findOne({ mobilenumber: mobilenumber }).then(user => {
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare password with hashed password
        const isPasswordCorrect = bcrypt.compareSync(password, user.password);
        if (isPasswordCorrect) {
            const token = jwt.sign(
                {
                    mobilenumber: user.mobilenumber,
                    firsName: user.firsName,
                    lastName: user.lastName
                },
                process.env.JWT_KEY,
                { expiresIn: "1h" } // optional: token expiry
            );

            res.json({ message: "Login successful", token: token });
            
        } else {
            res.status(401).json({ message: "Invalid password" });
        }
    }).catch(err => {
        res.status(500).json({ message: "Server error", error: err.message });
    });
}
*/

export function loginUser(req, res) {
    const { mobilenumber, password } = req.body;

    User.findOne({ mobilenumber }).then(user => {
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let isPasswordCorrect = false;

        // If the stored password looks hashed, compare with bcrypt
        if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
            isPasswordCorrect = bcrypt.compareSync(password, user.password);
        } else {
            // Fallback for old accounts with plain text
            isPasswordCorrect = (password === user.password);
        }

        if (isPasswordCorrect) {
            const token = jwt.sign(
                {
                    mobilenumber: user.mobilenumber,
                    firsName: user.firsName,
                    lastName: user.lastName
                },
                process.env.JWT_KEY,
                { expiresIn: "1h" }
            );
            res.json({ message: "Login successful", token });
        } else {
            res.status(401).json({ message: "Invalid password" });
        }
    }).catch(err => {
        res.status(500).json({ message: "Server error", error: err.message });
    });
}
