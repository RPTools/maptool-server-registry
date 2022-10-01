select weekday, version, count(*) as servers, sum(ifnull(players, 3)) as players
from (
         select weekday(convert_tz(mi.first_seen, 'UTC', 'UTC')) as weekday, mi.client_id, mi.name, mi.version, max(hl.number_players) as players
         from maptool_instance mi
                  left outer join heartbeat_log hl on mi.id = hl.instance_id
         where mi.last_heartbeat >= now() - interval 400 hour
         group by weekday, mi.client_id, mi.name, mi.version
         union
         select weekday(convert_tz(mi.first_seen, 'UTC', 'UTC')) as weekday, mi.client_id, mi.name, mi.version, max(hl.number_players) as players
         from maptool_instance mi
                  left outer join heartbeat_log hl on mi.id = hl.instance_id
         where mi.first_seen >= now() - interval 400 hour
         group by weekday, mi.client_id, mi.name, mi.version
     ) as versions
group by weekday, version