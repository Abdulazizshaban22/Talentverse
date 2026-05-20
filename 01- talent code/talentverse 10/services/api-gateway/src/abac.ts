
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL || '' });

export async function checkInstitutionRegion(institutionId: string, userRegion: string){
  const { rows } = await pool.query('SELECT region FROM institution WHERE id = $1', [institutionId]);
  if(!rows.length) return false;
  const r = (rows[0].region||'').toString().trim().toLowerCase();
  return userRegion && r && r === userRegion.toLowerCase();
}
