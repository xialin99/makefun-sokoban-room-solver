# 分房间推箱子求解器 / Roomwise Sokoban Solver

[中文](#中文) · [English](#english)

## 中文

### 第一次使用

安装 [Node.js 的 LTS 长期支持版](https://nodejs.org/en/download)（22.18 或更新）。

1. 在仓库页面点 **Code → Download ZIP**，下载并解压。打开解压后含有 `main.ts` 的文件夹。
2. 在 Windows 文件资源管理器地址栏输入 `powershell` 后按回车。把下面的命令复制到打开的窗口并回车。

```powershell
$env:MAKEFUN_INPUT_DIR = 'examples'
$env:MAKEFUN_OUTPUT_DIR = 'out'
node main.ts
```

打开 `out/demo/solution.txt`。示例答案 `rruUdd` 中，小写字母表示走路，大写字母表示推箱子。

面向独立房间推箱子关卡的求解器，用箱子到目标的距离和推数搜索，输出逐步移动记录。

### 本地运行

使用 Node.js 22.18 或更新版本。在 `MAKEFUN_INPUT_DIR` 下按 `<关卡名>/level.txt` 放置 XSB 关卡，设置 `MAKEFUN_OUTPUT_DIR` 后运行 `node main.ts`。

PowerShell 示例

```powershell
$env:MAKEFUN_INPUT_DIR = "examples"
$env:MAKEFUN_OUTPUT_DIR = "out"
node main.ts
```

示例结果写入 `out/demo/solution.txt`。

结果中小写 `u/d/l/r` 为走路，大写 `U/D/L/R` 为推箱子，方向分别是上、下、左、右。

## English

### First use

Install the [Node.js LTS release](https://nodejs.org/en/download), version 22.18 or newer.

1. Choose **Code → Download ZIP**, extract it, then open the extracted project folder.
2. On Windows, type `powershell` in the File Explorer address bar and press Enter. Run the commands below.

```powershell
$env:MAKEFUN_INPUT_DIR = 'examples'
$env:MAKEFUN_OUTPUT_DIR = 'out'
node main.ts
```

打开 `out/demo/solution.txt`。示例答案 `rruUdd` 中，小写字母表示走路，大写字母表示推箱子。 macOS or Linux users can use the shell example further down.

A room-by-room Sokoban solver using push distance and state search to produce move sequences for single-door room layouts.

### Run locally

Use Node.js 22.18 or newer. Under `MAKEFUN_INPUT_DIR`, provide XSB levels as `<level-id>/level.txt`, set `MAKEFUN_OUTPUT_DIR`, and run `node main.ts`.

Try the included example on macOS or Linux with `MAKEFUN_INPUT_DIR=examples MAKEFUN_OUTPUT_DIR=out node main.ts`. The output is `out/demo/solution.txt`. For PowerShell, see the example above.

In the solution, lowercase `u/d/l/r` are walks and uppercase `U/D/L/R` are pushes. Directions are up, down, left and right.

[make.fun 赛事 / Original bounty](https://make.fun/bounty/sokoban-solver-01-run-20261121)

## 许可证 / License

MIT. See [LICENSE](LICENSE).

