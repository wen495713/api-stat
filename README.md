# api-stat

Express的一个接口使用情况统计中间件

### Sample code
```javascript
var express = require('express');
var apistat = require('api-stat');
var app = express();
app.use(apistat(app));
app.listen(7654);
```

### 待完成功能

* 排序有问题 √
* record记录过多 √
* 记录没有参数 √
* 没有所有接口中返回数据最长/响应时间最长/总调用数/总流量 √

* 接口使用情况显示
* 统计数据持久化
* 接口使用次数(总数,每月,每周,每日,每小时,每分钟,每5秒)
* 总流量统计(总数,每月,每周,每日,每小时,每分钟,每5秒)