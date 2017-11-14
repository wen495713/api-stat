# api-stat

Express的一个接口使用情况统计中间件

### sample code

var express = require('express');
var app = express();
app.use(apistat(app));
app.listen(7654)

### 待完成需求
@.接口使用情况显示
@.统计数据持久化
@.接口使用次数(总数,每月,每周,每日,每小时,每分钟,每5秒)
@.总吐量统计(总数,每月,每周,每日,每小时,每分钟,每5秒)
