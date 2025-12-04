-- /Users/hariprasad/Desktop/next js app/vb cart/supabase/migrations/[timestamp]_batch_update_addresses.sql

create or replace function batch_update_addresses(
  p_user_id int,
  p_addresses jsonb[],
  p_deleted_ids int[]
)
returns void
language plpgsql
security definer
as $$
begin
  -- Delete addresses
  if array_length(p_deleted_ids, 1) > 0 then
    delete from "Address"
    where id = any(p_deleted_ids)
    and "userId" = p_user_id;
  end if;

  -- Upsert addresses
  for i in 1..array_length(p_addresses, 1) loop
    if (p_addresses[i]->>'id') is not null then
      -- Update existing address
      update "Address"
      set
        name = p_addresses[i]->>'name',
        street = p_addresses[i]->>'street',
        city = p_addresses[i]->>'city',
        state = p_addresses[i]->>'state',
        postal_code = p_addresses[i]->>'postal_code',
        country = p_addresses[i]->>'country',
        phone = p_addresses[i]->>'phone',
        "isDefault" = (p_addresses[i]->>'isDefault')::boolean
      where id = (p_addresses[i]->>'id')::int
      and "userId" = p_user_id;
    else
      -- Insert new address
      insert into "Address" (
        "userId",
        name,
        street,
        city,
        state,
        postal_code,
        country,
        phone,
        "isDefault"
      ) values (
        p_user_id,
        p_addresses[i]->>'name',
        p_addresses[i]->>'street',
        p_addresses[i]->>'city',
        p_addresses[i]->>'state',
        p_addresses[i]->>'postal_code',
        p_addresses[i]->>'country',
        p_addresses[i]->>'phone',
        (p_addresses[i]->>'isDefault')::boolean
      );
    end if;
  end loop;
end;
$$;
