import Credentials from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";


export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

   async authorize(credentials) {
  try {
    console.log("EMAIL:", credentials?.email);

    const user = await prisma.user.findUnique({
      where: {
        email: credentials!.email,
      },
    });

    console.log("USER:", user);

    if (!user) return null;

    const match = await bcrypt.compare(
      credentials!.password,
      user.password
    );

    console.log("MATCH:", match);

    if (!match) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };
  } catch (e) {
    console.error("AUTH ERROR:", e);
    throw e;
  }
}
    }),
  ],

  session: {
    strategy: "jwt",
  },
  callbacks:{
    async jwt({token,user}){
      if(user){
        token.role=user.role;
        token.organizationId=user.organizationId
      }
      return token
    },
    async session({session,token}){
      if(session.user){
        session.user.id=token.sub!;
        session.user.role=token.role;
        session.user.organizationId = token.organizationId;
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

