import { Pool } from 'pg';

// Database connection configuration
const dbConfig = {
  host: "aws-0-eu-north-1.pooler.supabase.com",
  port: 5432,
  user: "postgres.mmcfzlliglvhfchiqliv",
  password: "NKNhlW1ZifLR2GyZ",
  database: "postgres",
  ssl: {
    rejectUnauthorized: false
  }
};

// Create a connection pool
const pool = new Pool(dbConfig);

// Test the connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return { success: true, timestamp: result.rows[0].now };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Generic query function
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const client = await pool.connect();
    const result = await client.query(query, params);
    client.release();
    return { success: true, data: result.rows, rowCount: result.rowCount };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Insert data into a table
export async function insertData(table: string, data: any[]) {
  if (data.length === 0) return { success: true, rowCount: 0 };
  
  // First, get the actual columns in the table
  const schemaResult = await executeQuery(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = $1 
    ORDER BY ordinal_position
  `, [table]);
  
  if (!schemaResult.success) {
    return { success: false, error: schemaResult.error };
  }
  
  const tableColumns = schemaResult.data.map((col: any) => col.column_name);
  
  // Filter data to only include columns that exist in the table
  const filteredData = data.map(row => {
    const filteredRow: any = {};
    for (const col of tableColumns) {
      if (row.hasOwnProperty(col)) {
        filteredRow[col] = row[col];
      }
    }
    return filteredRow;
  });
  
  if (filteredData.length === 0) return { success: true, rowCount: 0 };
  
  const columns = Object.keys(filteredData[0]);
  const placeholders = filteredData.map((_, rowIndex) => 
    `(${columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(', ')})`
  ).join(', ');
  
  const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders} ON CONFLICT DO NOTHING`;
  const values = filteredData.flatMap(row => columns.map(col => row[col]));
  
  return executeQuery(query, values);
}

// Update data in a table
export async function updateData(table: string, data: any[], idColumn: string = 'id') {
  if (data.length === 0) return { success: true, rowCount: 0 };
  
  const updates = data.map((row, index) => {
    const columns = Object.keys(row).filter(col => col !== idColumn);
    const setClause = columns.map((col, colIndex) => 
      `${col} = $${index * columns.length + colIndex + 1}`
    ).join(', ');
    return `UPDATE ${table} SET ${setClause} WHERE ${idColumn} = $${index * columns.length + columns.length}`;
  }).join('; ');
  
  const values = data.flatMap(row => {
    const columns = Object.keys(row).filter(col => col !== idColumn);
    return [...columns.map(col => row[col]), row[idColumn]];
  });
  
  return executeQuery(updates, values);
}

// Close the pool
export async function closePool() {
  await pool.end();
} 