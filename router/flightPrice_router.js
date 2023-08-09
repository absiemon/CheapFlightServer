import  express   from "express";
import { getPrices } from "../controllers/flightPrice_controller.js";

const router = express.Router();
router.post('/get_prices', getPrices);

export default router