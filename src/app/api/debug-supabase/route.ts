import { supabaseServer } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table') || 'countries';
  const limit = searchParams.get('limit') || '10';
  const query = searchParams.get('query') || '';
  const id = searchParams.get('id') || '';
  
  try {
    let queryBuilder = supabaseServer()
      .from(table)
      .select('*');
    
    // Add search if provided
    if (query) {
      if (table === 'fixtures' && !isNaN(Number(query))) {
        // If querying fixtures with a number, search by ID
        queryBuilder = queryBuilder.eq('id', parseInt(query));
      } else {
        queryBuilder = queryBuilder.ilike('name', `%${query}%`);
      }
    }
    
    // Add ID filter if provided
    if (id) {
      queryBuilder = queryBuilder.eq('id', parseInt(id));
    }
    
    const { data, error } = await queryBuilder.limit(parseInt(limit));
      
    return Response.json({ 
      success: true, 
      data, 
      error: error?.message,
      table,
      count: data?.length || 0,
      query: query || 'none',
      id: id || 'none'
    });
  } catch (err: any) {
    return Response.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
} 