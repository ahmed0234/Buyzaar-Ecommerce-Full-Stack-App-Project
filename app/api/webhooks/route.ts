import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export type ClerkUserWebhookData = {
  id: string;
  email_addresses: {
    id: string;
    email_address: string;
    linked_to: unknown[];
    object: string;
    verification: {
      status: string;
      strategy: string;
    };
  }[];
  first_name: string | null;
  last_name: string | null;
  image_url: string;
  created_at: number;
  updated_at: number;
  primary_email_address_id: string | null;
  object: string;
};

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    const eventType = evt.type;
    const data = evt.data as ClerkUserWebhookData;

    const clerkId = data.id;

    const email =
      data.email_addresses?.find(
        (e: any) => e.id === data.primary_email_address_id
      )?.email_address || data.email_addresses?.[0]?.email_address;

    const firstName = data.first_name || '';
    const lastName = data.last_name || '';
    const name = `${firstName} ${lastName}`.trim();

    if (!clerkId) {
      return new Response('Missing clerk id', { status: 400 });
    }

    if (eventType === 'user.created') {
      if (!email) {
        return new Response('Missing email', { status: 400 });
      }

      await prisma.user.create({
        data: {
          clerkID: clerkId,
          email: email,
          name: name || null,
        },
      });
    }

    if (eventType === 'user.updated') {
      if (!email) {
        return new Response('Missing email', { status: 400 });
      }

      await prisma.user.update({
        where: {
          clerkID: clerkId,
        },
        data: {
          email: email,
          name: name || null,
        },
      });
    }

    if (eventType === 'user.deleted') {
      await prisma.user.delete({
        where: {
          clerkID: clerkId,
        },
      });
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (err) {
    console.error('Webhook error', err);
    return new Response('Webhook failed', { status: 400 });
  }
}
