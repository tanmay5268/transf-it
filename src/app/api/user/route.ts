import {prisma} from "../../../libs/prisma";
export async function GET(){
    async function getUsers() {
        const users = await prisma.user.findMany();
        return users;
    }
    const users = await getUsers();
    return new Response(JSON.stringify(users));
}
