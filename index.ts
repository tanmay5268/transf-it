import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function create() {
    const user = await prisma.user.create({
        data: {
            name: "tanmay",
            email: "tanmnsy@example.com"
        }
    });
    console.log(user);
}
create();
export { prisma };
