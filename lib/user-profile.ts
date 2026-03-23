import { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

const pickDisplayName = (user: User) =>
  user.user_metadata?.full_name ??
  user.user_metadata?.name ??
  user.user_metadata?.preferred_username ??
  null;

const pickAvatar = (user: User) =>
  user.user_metadata?.avatar_url ??
  user.user_metadata?.picture ??
  null;

export async function upsertProfileFromUser(user: User) {
  const payload = {
    id: user.id,
    email: user.email ?? null,
    full_name: pickDisplayName(user),
    avatar_url: pickAvatar(user),
  };

  const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
  if (error) {
    console.warn('Profile upsert failed:', error.message);
  }
}
