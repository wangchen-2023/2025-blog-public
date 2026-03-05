# MySQL 数据库及表格创建操作
## 操作前提：确保MySQL服务已开启，登录密码为root

```sql
-- 1. 创建数据库（将自定义名称替换为实际名称）
create database 自定义名称;
-- 执行结果：Query OK, 1 row affected

-- 2. 查看数据库（找到名为sql的database，修正原命令少写的s）
show databases;

-- 3. 使用创建的数据库
use 自定义名称;
-- 执行结果：Database changed（修正原拼写错误Datebase）

-- 4. 创建数据表（防范乱套表格，自定义名称替换为实际名称）
create table 自定义名称 (
	id 自定义名称 int,
	age 自定义名称 int
);
-- 执行结果：Query OK, 0 rows affected

-- 5. 检查已创建的表格
show tables;