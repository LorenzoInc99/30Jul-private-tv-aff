import { getAllBookmakers } from '@/lib/database-adapter';

export async function GET() {
  try {
    const bookmakers = await getAllBookmakers();
    return new Response(JSON.stringify({ bookmakers }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch bookmakers' }), { status: 500 });
  }
} 