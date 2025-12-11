**本篇是我遇到的问题整理，希望能帮到大家**


如果你在 fork 仓库时改了项目名等内容，就要把 `2025-blog-public/src/consts.ts` 中的 **所有者**、**项目名**、**分支**、**GitHub App ID**  等默认信息同步改成你的实际项目配置。

在页面正上面
![](/blogs/readme/7a9f9179f288a831.png)


# 内容存储层
内容存储层使用GitHub存储库文件结构来组织所有内容类型：
| 路径 | 目的 | 格式 |
|--------|------|------|   
| public/blogs/index.json | 所有博客文章的中央清单 | 带元数据的JSON数组 |
| public/blogs/{slug}/ | 个人博客文章目录 | 包含config.json、index.md、图像的目录 |
| public/blogs/{slug}/config.json | 博客帖子元数据 | 带有标题、日期、标签等的JSON |
| public/blogs/{slug}/index.md | 博客文章内容 | 标记语言 |
| src/config/site-content.json | 全局站点配置 | JSON，带元数据、主题、关于数据 |
| src/app/projects/list.json | 项目组合数据 | JSON数组 |
| src/app/bloggers/list.json | 精心策划的博客列表 | 带有评级的JSON数组 |
| src/app/share/list.json | 共享资源 | JSON数组 |


身份验证和GitHub集成<br>
该系统使用带有私钥的GitHub App身份验证直接从浏览器执行Git操作：

# 配置常数
文件位置位于: src/consts.ts 10-16
```ts
GITHUB_CONFIG = {
  OWNER: NEXT_PUBLIC_GITHUB_OWNER || 'yysuni'
  REPO: NEXT_PUBLIC_GITHUB_REPO || '2025-blog-public'
  BRANCH: NEXT_PUBLIC_GITHUB_BRANCH || 'main'
  APP_ID: NEXT_PUBLIC_GITHUB_APP_ID || '-'
}
```
身份验证流程：

1. 用户通过web界面上传.pem私钥文件
2. 密钥通过useAuthStore存储在内存中（不持久）
3. GitHub App API调用使用私钥进行身份验证
4. 直接提交到存储库的内容更改
5. 基于会话的身份验证（页面刷新时密钥丢失）

# 内容模型
## 博客文章结构
每篇博客文章都是一个自包含的目录，其结构如下：
```md
public/blogs/{slug}/
├── config.json       # Metadata (title, date, description, tags)
├── index.md          # Markdown content
└── *.png|jpg|webp    # Image assets
```

***

# 站点配置
全局配置存储在src/config/site-content.json中，结构如下：

关键配置部分：
|  |  |  |
|--------|------|------|   
meta：网站标题、描述、关键字（SEO）
theme：类型颜色，背景类型
about:关于页面内容
social：社交媒体链接
navigation：菜单项
配置在构建时加载，可以通过src/app/home/config-dialog.tsx进行编辑。