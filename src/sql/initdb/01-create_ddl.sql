create table maptool_instance (
    id              varchar(255)       not null,
    client_id       varchar(255)        not null,
    name            varchar(255)        not null,
    ipv4            varchar(100)        not null,
    ipv6            varchar(255)        not null,
    port            int                 not null,
    public          boolean             not null,
    version         varchar(100)        not null,
    last_heartbeat  timestamp           not null,
    active          boolean             not null,
    first_seen      timestamp           not null,
    country_code    varchar(2)          not null,
    primary key (id),
    index(active)
);


create table event_log (
    instance_id     varchar(255)        not null,
    event_type      varchar(30)         not null,
    timestamp       timestamp           not null,
    details         varchar(100),
    index(instance_id, event_type),

    foreign key(instance_id)
        references maptool_instance(id)
);

create table heartbeat_log (
    instance_id     varchar(255)        not null,
    timestamp       timestamp           not null,
    number_players  smallint            not null,

    index(instance_id),

    foreign key(instance_id)
        references maptool_instance(id)
);