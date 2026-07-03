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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });
        console.log("USER FOUND:user")

        if (!user) return null;

        const isMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
console.log("PASSWORD MATCH",isMatch);
console.log("DB PASSWORD LENGTH:", user.password.length);
console.log("DB PASSWORD:", JSON.stringify(user.password));
console.log("ENTERED PASSWORD:", JSON.stringify(credentials.password));
        if (!isMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        };
      },
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

