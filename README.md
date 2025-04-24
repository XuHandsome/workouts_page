## fork
本项目基于 [running_page](https://github.com/yihong0618/running_page/blob/master/README-CN.md) , 添加了支持多种运动类型。部署可参考原项目操作步骤

## 一些个性化选项

### summary页面添加站点更新状态
通过[site-metadata.ts](./src/static/site-metadata.ts) `githubWorkflow` 配置workflow信息，即可在summary页面显示站点更新状态。
> 需要说明的是， 点击Site Status按钮展示的Workflow 运行状况是配置了自动定时刷新的，停滞页面会自动刷新。由于Github Api的请求频率限制（每小时单ip不超过60次），刷新的频率取决于[site-metadata.ts](./src/static/site-metadata.ts)`githubWorkflow.workflowFile`列表的长度，自动计算刷新间隔，来控制不超过Github官方的限流。

### 自定义运动颜色

- 修改骑行颜色: `src/utils/const.js` 里的 `RIDE_COLOR`

### 新增运动类型

- 修改 `scripts/config.py`, `TYPE_DICT` 增加类型映射关系, `MAPPING_TYPE` 里增加运动类型
- 修改 `src/utils/const.js`, 增加类型标题，并加入到 `RUN_TITLES`
- 修改 `src/utils/util.js` 里的 `colorFromType`, 增加 case 指定颜色; `titleForRun`  增加 case 指定类型标题
- 参考这个 [commit](https://github.com/ben-29/workouts_page/commit/f3a35884d626009d33e05adc76bbc8372498f317)
- 或 [留言](https://github.com/ben-29/workouts_page/issues/20)
---

## 同步路径
欢太健康 --> keep --> strava --> sync to db
> 总体上思路就是所有数据整合到strava平台, 最终用strava数据生成sqllit

1. oppo的欢太健康, 绑定到keep, 开启自动同步(主要是跑步记录), keep要关闭`从苹果健康同步数据`以及`keep自动生成`,否则数据重复 不干净.
2. keep上传到strava [keep_to_strava_sync.py](./run_page/keep_to_strava_sync.py) [参考文档](https://github.com/yihong0618/running_page/blob/master/README-CN.md#keep_to_strava)
3. 两步路手动导出路径gpx,放到[GPX_OUT](./GPX_OUT/)目录下, 执行上传strava脚本 [参考文档](https://github.com/yihong0618/running_page/blob/master/README-CN.md#strava) , 或者去strava网页手动上传修改信息
4. 如果需要添加某一条keep中的记录,可以运行[keep_to_gpx.py](./run_page/keep_to_gpx.py) 用`--tracks-ids`指定keep记录列表, 导出gpx到本地[GPX_OUT](./GPX_OUT/)目录, 然后参考上面3步骤手动或用脚本上传到strava平台
5. 徒步路线同步到strava可能运动类型识别错误, 需要去strava手动调整路线类型
6. 从strava生成本地sqllit数据库 [strava_sync.py](./run_page/strava_sync.py) [参考文档](https://github.com/yihong0618/running_page/blob/master/README-CN.md#strava)
7. 用本地sqllit数据库生成svg图


```bash
# 上传本地GPX到strava
client_id=CHANGEME
client_secret=CHANGEME
refresh_token=CHANGEME
python run_page/gpx_to_strava_sync.py ${client_id} ${client_secret} ${refresh_token}

# keep上传到strava
keep_username=CHANGEME
keep_password=CHANGEME
client_id=CHANGEME
client_secret=CHANGEME
refresh_token=CHANGEME
python run_page/keep_to_strava_sync.py ${keep_username} ${keep_password} ${client_id} ${client_secret} ${refresh_token}

# 国家显示异常 需要开启全局梯子, 重新生成data.db
export HTTP_PROXY=http://192.168.2.5:8118
export HTTPS_PROXY=http://192.168.2.5:8118

# 用strava在线数据生成本地sqllit, 用以渲染页面
python run_page/strava_sync.py ${client_id} ${client_secret} ${refresh_token}

# 关闭梯子
unset HTTP_PROXY HTTPS_PROXY

# 生成本地Total
python run_page/gen_svg.py --from-db --title "自己动" --type github --athlete "精细鬼" --special-distance 10 --special-distance2 20 --special-color yellow --special-color2 red --output assets/github.svg --use-localtime --min-distance 0.5

python run_page/gen_svg.py --from-db --title "Over 10km Workouts" --type grid --athlete "精细鬼"  --output assets/grid.svg --min-distance 10.0 --special-color yellow --special-color2 red --special-distance 20 --special-distance2 40 --use-localtime

python run_page/gen_svg.py --from-db --type circular --use-localtime
```

## 自动化思路

通过[帽子云](https://dash.maoziyun.com/)部署`master`分支到[户外主页](https://r.ohops.org)

之前通过Action部署到[Page](https://up.ohops.org)备份到`gh-pages`分支, 后面不再部署, 有需要再启用

1. 运动后keep自动从欢太健康同步数据
2. 此时可以手动运行快捷指令触发workflow`Sync Keep Data to Strava`, 这个workflow仅同步keep数据到strava
3. 可以酌情登录手动修改[strava](https://www.strava.com/athlete/training)中活动信息
4. 手动运行快捷指令触发workflow`Run Data Sync`, 也可以不触发, 定时任务每天凌晨2点自动运行
5. `Run Data Sync` 会运行全步骤, 并且commit新的svg到master分支, 帽子云是监听`master`分支, 有commit会自动构建更新


> 所有数据通过strava维护, 理由是能改记录名称, 最终生成也会带上方便备注信息, 所以在定时任务 `run_data_sync` 中 `Run sync Strava script`步骤, `strava_sync.py`之前先运行`keep_to_strava_sync.py`

> 然后加上[ios快捷指令](https://github.com/yihong0618/running_page/blob/master/README-CN.md#%E5%BF%AB%E6%8D%B7%E6%8C%87%E4%BB%A4)触发action即可,目前也有定时任务每天凌晨3点自动运行, 主要是记得欢太健康更新数据后, 打开keep从欢太健康同步一下新增数据.

```bash
TOKEN="CHANGEME"
curl https://api.github.com/repos/XuHandsome/workouts_page/actions/workflows -H "Authorization: token ${TOKEN}"
# id: 155994232
```

## strava优势
1. 能自己命名活动名称, keep不支持
2. 官方提供sdk, 支持多样化路径上传, api或网页都可以上传

## 问题
1. strava上传路径可能识别类型错误, 需要手动调整
2. 两步路gpx上传过来没有心率(导出的gpx就没有心率信息), 目前用的这个方案, 要是两步路更open一些就好了, 目前还做了反爬, 也没有api可以调用
3. 其实两步路徒步数据欢太健康上也有数据, 但是keep同步过去hiking 类型为"mountaineering", 这个修改`keep_sync.py`已经处理
4. keep从欢太健康同步徒步记录更严重的问题是没有路线(GPX无法生成), 这个如果能解决就可以完美解决徒步记录缺陷
5. 发现keep不支持徒步, 删除keep上同步到的徒步记录,这里忽略, 可以修改[keep_to_strava_sync.py](./run_page/keep_to_strava_sync.py), 默认同步`running`和`cycling`, 另外如果是室内记录"indoorRunning"是没有gps信息的导致无法导出gpx,然而运行`keep_to_strava_sync`时又会带上这种跑步机的记录, 导致`No such file`, 所以在`keep_sync.py`的函数`get_to_download_runs_ids`中加一个条件`and k["dataType"].startswith("outdoor")`

[参考文档](https://github.com/yihong0618/running_page/blob/master/README-CN.md#%E5%AE%89%E8%A3%85%E5%8F%8A%E6%B5%8B%E8%AF%95-node--20-python--311)
```bash
# 本地调试
nvm use 20.10.0
npm install -g corepack && corepack enable
pnpm install
pnpm develop
```

# 致谢

- @[yihong0618](https://github.com/yihong0618) 特别棒的项目 [running_page](https://github.com/yihong0618/running_page) 非常感谢
- @[ben-29](https://github.com/ben-29) 基于[running_page](https://github.com/yihong0618/running_page)改造的户外主页[workouts_page](https://github.com/ben-29/workouts_page)
