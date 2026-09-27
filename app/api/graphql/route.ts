import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { server } from '@/lib/graphql/server';
import { auth } from '@/lib/auth/server';

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => {
    const session = await auth.api.getSession({ headers: req.headers });
    return { userId: session?.user.id };
  },
});

export { handler as GET, handler as POST };