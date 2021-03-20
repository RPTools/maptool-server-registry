select version, count(*) as servers, sum(players) as players
from (
         select mi.client_id, mi.name, mi.version, max(hl.number_players) as players
         from maptool_instance mi
                  left outer join heartbeat_log hl on mi.id = hl.instance_id
         where mi.last_heartbeat >= now() - interval ? hour
         group by mi.client_id, mi.name, mi.version
         union
         select mi.client_id, mi.name, mi.version, max(hl.number_players) as players
         from maptool_instance mi
                  left outer join heartbeat_log hl on mi.id = hl.instance_id
         where mi.first_seen >= now() - interval ? hour
         group by mi.client_id, mi.name, mi.version
     ) as versions
group by version;