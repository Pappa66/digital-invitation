-- 0039) Simpan desain via share edit token (tanpa login).
-- Bug P0: autosave mode token memakai klien anon `.update()` ke project_designs;
-- RLS designs_update_own menolak (0 baris, tanpa error) sehingga UI menampilkan
-- "Tersimpan" padahal gagal. RPC security definer berikut memvalidasi token lalu
-- menulis canvas_data sebagai pemilik fungsi (bypass RLS), aman & aditif:
-- tidak menghapus data apa pun.
--
-- Validasi: token ada, is_active, belum kedaluwarsa, dan proyek published
-- (memakai public.is_project_published). Bila baris project_designs belum ada,
-- dibuat baru; bila sudah ada, hanya kolom canvas_data/updated_at yang diubah.

create or replace function public.save_design_by_share_token(
  p_token text,
  p_canvas jsonb
)
returns table (ok boolean, error text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_token public.share_edit_tokens%rowtype;
  v_project uuid;
begin
  select t.* into v_token
  from public.share_edit_tokens t
  where t.token = p_token;

  if not found then
    ok := false; error := 'Token edit tidak ditemukan';
    return next; return;
  end if;

  if not v_token.is_active then
    ok := false; error := 'Token edit sudah dinonaktifkan';
    return next; return;
  end if;

  if v_token.expires_at is not null and v_token.expires_at < now() then
    ok := false; error := 'Token edit sudah kedaluwarsa';
    return next; return;
  end if;

  v_project := v_token.project_id;

  if not public.is_project_published(v_project) then
    ok := false; error := 'Proyek belum dipublikasikan';
    return next; return;
  end if;

  update public.project_designs d
  set canvas_data = p_canvas,
      updated_at = now()
  where d.project_id = v_project;

  if not found then
    insert into public.project_designs (project_id, canvas_data)
    values (v_project, p_canvas);
  end if;

  ok := true; error := null;
  return next;
exception
  when others then
    ok := false; error := sqlerrm;
    return next;
end;
$$;

grant execute on function public.save_design_by_share_token(text, jsonb) to anon, authenticated;
