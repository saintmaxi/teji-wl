import { ethers } from "ethers";
import express from "express";
import cors from "cors";
import { config } from "dotenv";

import whitelist from "./whitelist.json";

config();

/* -------------------------------------------------------------------------- */
/*                                Signer Wallet                               */
/* -------------------------------------------------------------------------- */

const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string);

async function sign(addr: string, amount: number): Promise<string> {
	const message = ethers.utils.solidityKeccak256(
		["address", "address", "uint256"],
		[process.env.TEJIVERSE, addr, amount]
	);

	return await signer.signMessage(ethers.utils.arrayify(message));
}

/* -------------------------------------------------------------------------- */
/*                                 Express App                                */
/* -------------------------------------------------------------------------- */

const app = express();
app.use(cors());

app.use("/sign", async (req, res) => {
	let { addr, amount } = req.query as { [key: string]: any };
	try {
		addr = ethers.utils.getAddress(addr) as string;
	} catch {
		return res.json({ error: "invalid address" });
	}
	amount = parseInt(amount) as number;

	if (!whitelist.includes(addr)) {
		return res.json({ error: "not in the whitelist" });
	} else if (amount < 1 || amount > 3) {
		return res.json({ error: "invalid amount" });
	}

	return res.json({ signature: await sign(addr, amount) });
});

app.listen(8080, () => console.log("Listening on port 8080"));
