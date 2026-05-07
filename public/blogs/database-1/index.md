-- 聚合查询
SELECT max(age) FROM user;
SELECT min(age) FROM user;
SELECT count(*) FROM user;
SELECT avg(age) FROM user;
SELECT DISTINCT age FROM user;

-- 精确条件查询（单条件）
SELECT * FROM user u WHERE u.id = 12;
SELECT * FROM user u WHERE u.name = 'aa';

-- 精确条件查询（多条件：AND / OR）
SELECT * FROM user u WHERE u.id = 12 AND u.name = 'bb';
SELECT * FROM user u WHERE u.id = 12 OR u.name = 'bb';

-- NULL / 空字符串查询
SELECT * FROM user u WHERE u.name IS NULL;
SELECT * FROM user u WHERE u.name = ' ';
SELECT * FROM user u WHERE u.name IS NOT NULL;

-- 模糊查询（LIKE）
SELECT * FROM user u WHERE u.name LIKE 'a%';      -- 以a开头
SELECT * FROM user u WHERE u.name LIKE '%6';      -- 以6结尾
SELECT * FROM user u WHERE u.name LIKE '%a%';     -- 包含a
SELECT * FROM user u WHERE u.name LIKE '%1';      -- 以1结尾
SELECT * FROM user u WHERE u.name LIKE '%2_';     -- 倒数第二个字符是2
SELECT * FROM user u WHERE u.name LIKE '%a__';    -- 包含a且a后至少两个字符
SELECT * FROM user u WHERE u.name LIKE '%_%';     -- 至少一个字符（不含空字符串）

-- 范围查询（比较运算符 / BETWEEN）
SELECT * FROM user u WHERE u.scroe >= 50;
SELECT * FROM user u WHERE u.scroe <= 70;
SELECT * FROM user u WHERE u.scroe >= 50 AND u.scroe <= 70;
SELECT * FROM user u WHERE u.scroe BETWEEN 50 AND 70;

-- 集合查询（IN）
SELECT * FROM user u WHERE u.scroe = 50 OR u.scroe = 70 OR u.scroe = 67 OR u.scroe = 100;
SELECT * FROM user u WHERE u.scroe IN (50, 70, 67, 100);

-- 分页查询（LIMIT）
SELECT * FROM user u;
SELECT * FROM user u LIMIT 3;       -- 前3条
SELECT * FROM user u LIMIT 0, 3;    -- 从第0条开始取3条（等同于LIMIT 3）
SELECT * FROM user u LIMIT 3, 3;    -- 第4~6条
SELECT * FROM user u LIMIT 6, 3;    -- 第7~9条
SELECT * FROM user u LIMIT 9, 3;    -- 第10~12条

-- 分组查询（GROUP BY）
SELECT u.address, count(*) FROM user u GROUP BY u.address;
SELECT u.address, max(u.scroe) FROM user u GROUP BY u.address;