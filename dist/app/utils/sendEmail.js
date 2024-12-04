"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        // host: config.smtp.smtp_host,
        host: "smtp.gmail.com",
        port: parseInt(config_1.default.smtp.smtp_port),
        auth: {
            user: config_1.default.smtp.smtp_mail,
            pass: config_1.default.smtp.smtp_pass,
        },
    });
    const { email, subject, html } = options;
    const mailOptions = {
        from: `${config_1.default.smtp.name} <${config_1.default.smtp.smtp_mail}>`,
        to: email,
        date: formattedDate,
        signed_by: "bdCalling.com",
        subject,
        html,
    };
    yield transporter.sendMail(mailOptions);
});
exports.default = sendEmail;
