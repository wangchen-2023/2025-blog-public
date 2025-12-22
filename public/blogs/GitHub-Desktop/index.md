> 适用于：  
> - 用 GitHub Desktop 管理代码  
> - fork 了 `YYsuni/2025-blog-public` 并自己改内容  
> - 上游更新后，想**保留自己改动**并**同步最新代码**

---

## 1. 给仓库加上“上游”遥控器（只做一次）

1. 打开 **GitHub Desktop**  官网下载：https://desktop.github.com
2. 顶部菜单 → 存储库 → **在命令行中打开**（或 Git Bash）  
3. 输入下面命令后回车：

```bash
git remote add upstream https://github.com/YYsuni/2025-blog-public.git
```

如果看到 `error: remote upstream already exists.` 说明早就加好了，**直接下一步**。

---

## 2. 把上游最新代码拉到本地

```bash
git fetch upstream
```

出现 `remote: Counting objects...` 字样就是正在下载，等他完成。

看看上游最新提交是啥：

```bash
git log upstream/main --oneline -5
```

---

## 3. 合并到本地 main 分支

```bash
git merge upstream/main
```

- **顺利**：提示 `Auto-merging ...` → 直接跳到第 5 步推送。  
- **冲突**：提示 `Automatic merge failed; fix conflicts` → 看第 4 步。

---

## 4. 解决冲突（仅限冲突时）

1. 打开 GitHub Desktop，左侧会显示冲突文件和**会弹出必选文件**，点 ** → Open in Editor**（安装 VS Code：https://code.visualstudio.com/download ）

```json
在 VS Code 中将界面切换为中文，只需安装官方“Chinese (Simplified) Language Pack”扩展即可，步骤如下：
1. 打开 VS Code
2. 左侧活动栏点击“扩展”图标（或按 Ctrl+Shift+X）
3. 搜索框输入：Chinese
4. 找到 “Chinese (Simplified) Language Pack for Visual Studio Code” → 点击“安装”
5. 安装完成后，右下角会弹出提示“重启以启用中文”，点击“重启”即可。
```

2. 找到类似下面的标记：

```json
采用当前更改|采用传入的更改|保留双方更改|比较变更
```

```json
<<<<<<< HEAD
...你原来的内容...
=======
...上游的新内容...
>>>>>>> upstream/main
```



3. 把标记删掉，保留你想要的内容，**保存文件**。  

---

## 5. 推回自己的 GitHub

1. 在 Desktop 右边点击 **Push origin**（或命令行 `git push origin main`）。  
2. 推送成功后，打开网页版你自己的仓库，刷新看到：

> This branch is even with `YYsuni:main`.

就说明**完全同步**啦！