### goquery常用方法
会用jquery的，goquery基本可以1分钟上手

```go
Eq(index int) *Selection 	//根据索引获取某个节点集
First() *Selection 			//获取第一个子节点集
Last() *Selection	 		//获取最后一个子节点集
Next() *Selection 			//获取下一个兄弟节点集
NextAll() *Selection 		//获取后面所有兄弟节点集
Prev() *Selection			//前一个兄弟节点集
Get(index int) *html.Node	//根据索引获取一个节点
Index() int 				//返回选择对象中第一个元素的位置
Slice(start, end int) *Selection //根据起始位置获取子节点集
Each(f func(int, *Selection)) *Selection //遍历
EachWithBreak(f func(int, *Selection) bool) *Selection //可中断遍历
Map(f func(int, *Selection) string) (result []string) //返回字符串数组
Attr(), RemoveAttr(), SetAttr() //获取，移除，设置属性的值
AddClass(), HasClass(), RemoveClass(), ToggleClass()
Html() //获取该节点的html
Length() //返回该Selection的元素个数
Text() //获取该节点的文本值
Children() //返回selection中各个节点下的孩子节点
Contents() //获取当前节点下的所有节点
Find() //查找获取当前匹配的元素
Next() //下一个元素
Prev() //上一个元素
```

## 代码

```go
package main

import (
	"fmt"
	"github.com/PuerkitoBio/goquery"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
)

// 电影列表地址
var url="http://zuikzy.cc/?m=vod-type-id-PAGE.html";
const YUMING  = "http://zuikzy.cc/"


//  爬虫电影网站资源 添加到数据库
func SaveVideo(page int){

	// 如果n为-1，则全部替换；如果 old 为空
	movieurl:=strings.Replace(url,"PAGE",strconv.Itoa(page),-1)
	log.Println(fmt.Sprintf("【开始爬取电影,页码:%d  请求地址为 %s 】",page,movieurl))
	res, err := http.Get(movieurl)
	checkErr(err,"【爬取网站地址请求异常 】")
	if res.StatusCode != 200 {
		log.Fatalf("status code error: %d %s", res.StatusCode, res.Status)
	}
	doc, err := goquery.NewDocumentFromReader(res.Body)
	checkErr(err,"爬取成功,解析html异常")

	doc.Find(".DianDian").Each(func(j int, tr *goquery.Selection) {
		title:=tr.Find("td").Eq(0).Text()  //标题
		detailsLink,_:=tr.Find("td").Eq(0).Find("a").Eq(0).Attr("href")  //详情页地址

		types:=tr.Find("td").Eq(1).Text()  // 电影类型

		// 爬取播放地址和详情链接
		res, err= http.Get(YUMING+detailsLink)
		checkErr(err,"【爬取电影: %s  异常】")
		if res.StatusCode != 200 {
			log.Fatalf("status code error: %d %s", res.StatusCode, res.Status)
		}
		doc,_= goquery.NewDocumentFromReader(res.Body)

		//imgpath,_:=doc.Find(".videoPic img").Eq(0).Attr("src")
		//reamrk:=doc.Find(".movievod").Eq(1).Text();
		palyLink:=doc.Find(".contentURL li").Eq(1).Text()

		palyLink=strings.Replace(palyLink,"$","-",-1)

		log.Println(fmt.Sprintf("标题:%s  类型 %s 播放地址  %s ",title,types,palyLink))

		tracefile(fmt.Sprintf("标题:%s  类型 %s 播放地址  %s ",title,types,palyLink))


	})
	defer res.Body.Close()
}

func main()  {
	for i := 1; i < 10; i++ {
		SaveVideo(i)
	}
}

func tracefile(str_content string)  {
	// // 读写模式打开文件 如果不存在将创建一个新文件 写操作时将数据附加到文件尾部
	fd,_:=os.OpenFile("爬取全网VIP电影在线观看.txt",os.O_RDWR|os.O_CREATE|os.O_APPEND,0644)
	fd_content:=strings.Join([]string{str_content,"\n"},"")
	buf:=[]byte(fd_content)
	fd.Write(buf)
	fd.Close()
}


// 错误检查
func checkErr(err error,msg string) {
	if err != nil {
		fmt.Println(msg,err)
	}
}
```
### 爬取结果，复制地址到浏览即可在线播放
```bash
标题:神医 [高清]
    类型 剧情片 播放地址  高清-https://zkgn.wb699.com/share/4bUkbVK2CRMgHeUo 
标题:匹诺曹 [高清]
    类型 爱情片 播放地址  高清-https://zkgn.wb699.com/share/v5339kxgH65mjfn8 
标题:等风来 [高清]
    类型 喜剧片 播放地址  高清-https://zkgn.wb699.com/share/7KE8MG7uiDVCbLvg 
标题:相见恨晚 [德语1080P]
    类型 喜剧片 播放地址  德语1080P-https://zkgn.wb699.com/share/dpfgCBaQzS7HPJh1 
标题:都市灰姑娘 [德语1080P]
    类型 剧情片 播放地址  德语1080P-https://zkgn.wb699.com/share/FPucBGxQy30QpzQ7 
标题:米娅和白狮 [BD中英双字]
    类型 剧情片 播放地址  BD中英双字-https://zkgn.wb699.com/share/uLiLFpOTGlfEBz71 
```
### 源码地址
- [demo源码](https://github.com/a870439570/Go-notes)
##  参考
- [goquery用法](https://blog.csdn.net/jeffrey11223/article/details/79318856)
- [采集地址](http://zuikzy.cc/?m=vod-type-id-1.html)
- [goquery官方文档地址](https://godoc.org/github.com/PuerkitoBio/goquery)

