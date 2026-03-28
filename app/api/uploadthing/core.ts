// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

const f = createUploadthing();

export const ourFileRouter = {
  productImages: f({ image: { maxFileSize: '16MB', maxFileCount: 5 } })
    .middleware(async () => {
      const { userId }: any = await auth();
      if (!userId) throw new Error('Unauthorized');

      const user = await prisma.user.findUnique({
        where: { clerkID: userId },
        select: { role: true },
      });

      if (!user || user.role !== 'ADMIN') throw new Error('Forbidden');

      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      // Only return the URL — saving to DB happens on form submit, not here
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
