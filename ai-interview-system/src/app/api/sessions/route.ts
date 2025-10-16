import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { randomBytes } from 'crypto';

export async function POST(req: Request) {
  const body = await req.json();
  const { partner_name, partner_email, topic, language = 'es', threshold = 0.85 } = body;
  const magic_token = randomBytes(16).toString('hex');

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .insert({ partner_name, partner_email, topic, language, threshold, magic_token })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const template = [
    { slot_key: 'meta', weight: 0.1, is_blocker: false },
    { slot_key: 'audience', weight: 0.15, is_blocker: false },
    { slot_key: 'offer', weight: 0.15, is_blocker: false },
    { slot_key: 'proof', weight: 0.1, is_blocker: false },
    { slot_key: 'seo', weight: 0.15, is_blocker: false },
    { slot_key: 'message', weight: 0.1, is_blocker: false },
    { slot_key: 'distribution', weight: 0.1, is_blocker: false },
    { slot_key: 'legals', weight: 0.05, is_blocker: true },
    { slot_key: 'creative', weight: 0.1, is_blocker: false }
  ];
  const { error: slotErr } = await supabaseAdmin.from('slots').insert(
    template.map((t) => ({ ...t, session_id: data!.id }))
  );
  if (slotErr) return NextResponse.json({ error: slotErr.message }, { status: 500 });

  return NextResponse.json({ id: data!.id, magic_token });
}
