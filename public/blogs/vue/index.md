# 创建vue项目
1. 输入指令创建项目 **npm create vue@latest .**
![](/blogs/vue/1f575ba33051535d.jpg)

2. 安装项目相关依赖 **npm install**（报错解决方式在最后）

3. 在依赖安装完成后，启动项目 **npm run dev**

# 解决报错

**错误原因：** 安装完node后，没有配置两个文件夹：node_global，node_cache
![](/blogs/vue/c3e527ea8bfefd07.jpg)

**解决方法：** 配置相应文件夹

**步骤：**

1. 在 C:\Program Files\nodejs 路径下，新建两个文件夹`node_global`, `node_cache`

2. 在上方地址栏，右键，复制当前地址，并输入cmd，按回车

3. 在cmd中输入两条指令（输入完一条后，回车，不出现任何内容即为成功）：

   npm config set prefix "C:\Program Files\nodejs\\node_global"

   npm config set cache "C:\Program Files\nodejs\node_cache"


   
