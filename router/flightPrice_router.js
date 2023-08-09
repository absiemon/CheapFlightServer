import  express   from "express";
import { getPrices, Mine } from "../controllers/flightPrice_controller.js";

const router = express.Router();
router.post('/get_prices', getPrices);
router.post('/mine', Mine);

export default router