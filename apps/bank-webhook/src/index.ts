import { prisma } from "../../../packages/db/index";
import express from "express";
import type { Request, Response } from "express";
const app = express();
app.post('/hdfcwebhook', async (req: Request, res: Response) => {
    const info = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount,
    }
    try {
        await prisma.$transaction([
            prisma.balance.update({
                where: {
                    userId: Number(info.userId)
                },
                data: {
                    amount: {
                        increment: info.amount
                    }
                }
            }),
            prisma.onRampTransaction.updateMany({
                where: {
                    token: info.token
                },
                data: {
                    status: "Success",
                }
            })
        ]);
        res.status(200).json({
            message: "transaction successful"
        });
    } catch (error) {
        res.status(500).json({
            error: error,
            message: "transaction failed"
        });
    };
}

);

app.listen(5000, () => {
    console.log(`Server is running on ${'http://localhost:5000'}`);
});
