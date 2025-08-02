import { supabaseServer } from './supabase';

export interface OperationLog {
  operation: string;
  success: boolean;
  apiCalls: number;
  duration: string;
  details?: any;
}

export async function logOperation(log: OperationLog) {
  try {
    const supabase = supabaseServer();
    if (!supabase) {
      console.error('Failed to connect to Supabase for operation logging');
      return;
    }

    await supabase
      .from('admin_operations')
      .insert({
        operation: log.operation,
        success: log.success,
        api_calls: log.apiCalls,
        duration: log.duration,
        details: log.details,
        timestamp: new Date().toISOString()
      });

  } catch (error) {
    console.error('Failed to log operation:', error);
  }
}

export function formatDuration(startTime: number): string {
  const duration = Date.now() - startTime;
  return `${(duration / 1000).toFixed(2)}s`;
}

export function validateDateRange(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) {
    return false;
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return start <= end;
}

export function getDefaultDateRange(): { startDate: string; endDate: string } {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 7); // 7 days ago
  
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 7); // 7 days from now
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
} 