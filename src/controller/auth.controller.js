const { globalError, ClientError } = require("shokhijakhon-error-handler");
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  changePasswordValidator,
  activateValidator,
} = require("../utils/validator/auth.validator");
const UserModel = require("../models/User.model");
const { hash, compare } = require("bcrypt");
const otpGenerator = require("../utils/generators/otp.generator");
const emailService = require("../lib/mail.service");
const jwtService = require("../lib/jwt.service");
const { v4: uuid } = require("uuid");

module.exports = {
  async REGISTER(req, res) {
    try {
      let newUser = req.body;
      await registerValidator.validateAsync(newUser);

      let findUser = await UserModel.findOne({ email: newUser.email });
      if (findUser) throw new ClientError("User already exists !");

      newUser.password = await hash(newUser.password, 10);
      let activateToken = uuid();

      let activationLink = `http://localhost:${process.env.PORT || 3000}/api/auth/activate?token=${activateToken}`;

      await emailService(newUser.email, newUser.full_name, activationLink);

      await UserModel.create({
        ...newUser,
        activation_token: activateToken,
      });

      return res
        .status(201)
        .json({ message: "User successfully registered ! Please check your email for activation link.", status: 201 });
    } catch (err) {
      return globalError(err, res);
    }
  },
  async RESEND_ACTIVATION(req, res) {
    try {
      let { email } = req.body;
      if (!email) throw new ClientError("Email is required", 400);

      let findUser = await UserModel.findOne({ email });
      if (!findUser) throw new ClientError("User not found", 404);

      if (findUser.is_verified) {
        return res.json({
          message: "User already activated",
          status: 200,
        });
      }

      let activateToken = uuid();
      let activationLink = `http://localhost:${process.env.PORT || 3000}/api/auth/activate?token=${activateToken}`;


      await emailService(email, activationLink);

      await UserModel.findOneAndUpdate(
        { email },
        { activation_token: activateToken }
      );

      return res.json({
        message: "Activation link successfully sent to email",
        status: 200,
      });
    } catch (err) {
      return globalError(err, res);
    }
  },
  async FORGOT_PASSWORD(req, res) {
    try {
      let profileData = req.body;

      await forgotPasswordValidator.validateAsync(profileData);

      let findUser = await UserModel.findOne({ email: profileData.email });

      if (!findUser)
        throw new ClientError("User not found", 404);

      // Forgot password uchun user verified bo'lishi shart emas
      // Har qanday mavjud user parolni tiklashi mumkin

      let { otp, otpTime } = otpGenerator();

      await emailService(profileData.email, otp);

      await UserModel.findOneAndUpdate(
        { email: profileData.email },
        { otp, otpTime },
      );

      return res.json({ message: "OTP successfully sent to email" });
    } catch (err) {
      return globalError(err, res);
    }
  },

  async CHANGE_PASSWORD(req, res) {
    try {
      let profileData = req.body;

      await changePasswordValidator.validateAsync(profileData);

      let findUser = await UserModel.findOne({ email: profileData.email });

      if (!findUser)
        throw new ClientError("User not found", 404);

      if (!findUser.is_verified)
        throw new ClientError("User not verified", 400);

      let hash_password = await hash(profileData.new_password, 10);
      await UserModel.findOneAndUpdate(
        { email: profileData.email },
        { password: hash_password },
      );
      return res.json({
        message: "Password successfully changed",
        status: 200,
      });
    } catch (err) {
      return globalError(err, res);
    }
  },
  async LOGIN(req, res) {
    try {
      let data = req.body;
      await loginValidator.validateAsync(data);
      let findUser = await UserModel.findOne({ email: data.email });
      if (!findUser || !findUser.is_verified)
        throw new ClientError("User not found or user not verified", 404);
      let checkPassword = await compare(data.password, findUser.password);
      if (!checkPassword)
        throw new ClientError("Password or email invalid", 400);
      let accessToken = jwtService.createAccessToken({ sub: findUser.id });
      let refreshToken = jwtService.createRefreshToken({ sub: findUser.id });
      await findUser.updateOne({ refresh_token: refreshToken });
      res.cookie("refresh_token", refreshToken, {
        maxAge: 86400 * 90,
        httpOnly: true,
      });
      return res.json({
        message: "User successfully logged in",
        status: 200,
        accessToken,
      });
    } catch (err) {
      return globalError(err, res);
    }
  },
  async REFRESH(req, res) {
    try {
      let refreshToken = req.cookies.refresh_token;
      if (!refreshToken) throw new ClientError("Forbidden request", 403);
      let findUser = await UserModel.findOneAndUpdate({
        refresh_token: refreshToken,
      });
      if (!findUser) throw new ClientError("Invalid refresh token", 403);

      let accessToken = jwtService.createAccessToken({ sub: findUser._id });

      return res.json({
        message: "Access token successfully generated !",
        status: 200,
        accessToken,
      });
    } catch (err) {
      return globalError(err, res);
    }
  },
  async ACTIVATE(req, res) {
    try {
      let { token } = req.query;
      if (!token) throw new ClientError("Activation token is required", 400);

      let findUser = await UserModel.findOne({ activation_token: token });
      if (!findUser) throw new ClientError("Invalid activation token", 403);

      if (findUser.is_verified) {
        return res.json({
          message: "User already activated",
          status: 200,
        });
      }

      await UserModel.findOneAndUpdate(
        { activation_token: token },
        {
          is_verified: true,
          activation_token: null
        }
      );

      return res.json({
        message: "User successfully activated !",
        status: 200,
      });
    } catch (err) {
      return globalError(err, res);
    }
  },
};
