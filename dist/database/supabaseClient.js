"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Missing Supabase URL or Service Role Key in environment variables");
}
exports.supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY, {
    db: {
        schema: "inventory",
    },
});
console.log("ß Supabase client initialized for schema: inventory");
