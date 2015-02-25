create database classsteward DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

use classsteward;

-- 注册
create table regist
(
    question varchar(80) unique,
    answer varchar(120) not null
)
ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table class
(
    name varchar(10) primary key
)
ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 用户
create table user
(
    id int auto_increment primary key,
    account varchar(50) unique,
    passwd varchar(50) not null,
    class varchar(10),
    num int not null,
    name varchar(30) not null,
    regist_time datetime not null,
    last_time datetime not null,
    photo int not null,
    css int default 0 not null,
    light varchar(20) default 'gray-light' not null,
    constraint user_class_fk foreign key (class) references class(name) on delete cascade on update cascade
)
auto_increment = 500,
ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 消息
create table messages
(
    id int auto_increment primary key,
    user int not null,
    origin int not null,
    type varchar(20) not null,
    content tinytext,
    time timestamp default CURRENT_TIMESTAMP not null,
    flag int default 0 not null,
    constraint message_user_fk foreign key (user) references user(id) on delete cascade on update cascade
)
ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 课程
create table course
(
    id int auto_increment primary key,
    name varchar(30) unique,
    class varchar(50) not null,
    teacher varchar(30) not null,
    status int default 1 not null
)
ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table syllabus
(
    id int auto_increment primary key,
    name varchar(30),
    head varchar(50),
    detail text not null,
    constraint syllabus_name_fk foreign key (name) references course(name) on delete cascade on update cascade
)
ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table schedule
(
    course varchar(30) not null,
    week int not null,
    date_start datetime not null,
    date_end datetime not null,
    event text not null,
    homework varchar(80),
    homework_start datetime not null,
    homework_end datetime not null,
    coursework text,
    courseware text,
    constraint schedule_course_fk foreign key (course) references course(name) on delete cascade on update cascade,
    primary key (course,week),
    key(course),
    key(week)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table homework
(
    course varchar(30) not null,
    week int not null,
    author int not null,
    filename varchar(80),
    score int default null,
    time timestamp default CURRENT_TIMESTAMP not null,
    total int default 1 not null,
    constraint homework_course_fk foreign key (course) references course(name) on delete cascade on update cascade,
    constraint homework_week_fk foreign key (week) references schedule(week) on delete cascade on update cascade,
    constraint homework_author_fk foreign key (author) references user(id) on delete cascade on update cascade
)
ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 论坛
create table forum
(
    id int auto_increment primary key,
    name varchar(30) unique,
    nickname varchar(30) unique
)
ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table topic
(
    id int auto_increment primary key,
    subject int not null,
    title tinytext not null,
    time timestamp default CURRENT_TIMESTAMP not null,
    last_time timestamp not null,
    author int,
    last_author int,
    view int default 0 not null,
    total int default 0 not null,
    type int default 100 not null,
    constraint topic_subject_fk foreign key (subject) references forum(id) on delete cascade on update cascade,
    constraint topic_author_fk foreign key (author) references user(id) on delete set null on update cascade,
    constraint topic_author_fk foreign key (last_author) references user(id) on delete set null on update cascade
)
ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table comment
(
    topic int not null,
    id int auto_increment primary key,
    agree int default 0 not null,
    author int,
    content longtext,
    time timestamp default CURRENT_TIMESTAMP not null,
    last_time timestamp,
    constraint comment_topic_fk foreign key (topic) references topic(id) on delete cascade on update cascade,
    constraint comment_author_fk foreign key (author) references user(id) on delete set null on update cascade
)
ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table reply
(
    id int auto_increment primary key,
    comment int not null,
    author int,
    content text,
    time timestamp default CURRENT_TIMESTAMP not null,
    constraint reply_comment_fk foreign key (comment) references comment(id) on delete cascade on update cascade,
    constraint reply_author_fk foreign key (author) references user(id) on delete set null on update cascade
)
ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into user(id,name,passwd,account,regist_time,last_time,photo,class,num) value(1,'管理员','25d55ad283aa400af464c76d713c07ad','admin',now(),'2014-12-13',25,NULL,0);
insert into messages(user,origin,type,content) value(1,1,'alert','应用启动成功，快去管理界面完善数据吧！ <a href="/admin">管理中心</a>');
