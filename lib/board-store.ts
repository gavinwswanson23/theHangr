import { supabase } from '@/lib/supabase';

export type DbBoardSprite = {
  id: string;
  image_url: string;
  x: number;
  y: number;
  scale: number;
  z_index: number;
};

const SPRITES_BUCKET = 'sprites';

export async function ensurePrimaryBoard(userId: string) {
  const { data: existing, error: fetchErr } = await supabase
    .from('boards')
    .select('id,name')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (fetchErr) throw fetchErr;
  if (existing?.id) return existing.id as string;

  const { data: created, error: createErr } = await supabase
    .from('boards')
    .insert({ user_id: userId, name: 'My Board' })
    .select('id')
    .single();
  if (createErr) throw createErr;
  return created.id as string;
}

export async function fetchBoardSprites(boardId: string, userId: string) {
  const { data, error } = await supabase
    .from('board_sprites')
    .select('id,image_url,x,y,scale,z_index')
    .eq('board_id', boardId)
    .eq('user_id', userId)
    .order('z_index', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as DbBoardSprite[];
}

export async function uploadSpriteImage(userId: string, sourceUri: string) {
  const response = await fetch(sourceUri);
  const blob = await response.blob();
  const path = `users/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
  const { error: uploadErr } = await supabase.storage.from(SPRITES_BUCKET).upload(path, blob, {
    contentType: 'image/png',
    upsert: false,
  });
  if (uploadErr) throw uploadErr;
  const { data } = supabase.storage.from(SPRITES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function createBoardSprite(params: {
  boardId: string;
  userId: string;
  imageUrl: string;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
}) {
  const { data, error } = await supabase
    .from('board_sprites')
    .insert({
      board_id: params.boardId,
      user_id: params.userId,
      image_url: params.imageUrl,
      x: params.x,
      y: params.y,
      scale: params.scale,
      z_index: params.zIndex,
    })
    .select('id,image_url,x,y,scale,z_index')
    .single();
  if (error) throw error;
  return data as DbBoardSprite;
}

export async function updateBoardSpriteTransform(params: {
  spriteId: string;
  userId: string;
  x: number;
  y: number;
  scale: number;
  zIndex?: number;
}) {
  const payload: Record<string, number> = { x: params.x, y: params.y, scale: params.scale };
  if (typeof params.zIndex === 'number') payload.z_index = params.zIndex;
  const { error } = await supabase
    .from('board_sprites')
    .update(payload)
    .eq('id', params.spriteId)
    .eq('user_id', params.userId);
  if (error) throw error;
}

export async function deleteBoardSprite(spriteId: string, userId: string) {
  const { error } = await supabase.from('board_sprites').delete().eq('id', spriteId).eq('user_id', userId);
  if (error) throw error;
}

export async function saveZOrder(params: { userId: string; items: Array<{ id: string; zIndex: number }> }) {
  await Promise.all(
    params.items.map((item) =>
      supabase.from('board_sprites').update({ z_index: item.zIndex }).eq('id', item.id).eq('user_id', params.userId)
    )
  );
}
