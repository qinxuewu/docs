
###  HBase的管理Java API
 #### 中止服务器或客户端。

```
void abort(String why,Throwable e)
```
 #### 检查服务器或客户端是否已中止。

```
boolean isAborted()  
```
#### 返回此对象使用的连接。
```
Connection getConnection()
```
#### 判断表述否已存在，不存在则创建表

```
boolean tableExists 
```
#### 列出所有用户空间表
```
#已过时。 自2.0版本以来，将在3.0版本中删除,使用listTableDescriptors（）。
HTableDescriptor[] listTables() 
HTableDescriptor[] listTables(String regex)
HTableDescriptor[] listTables(Pattern pattern,boolean includeSysTables)
List<TableDescriptor> listTableDescriptors()
```

#### 正则匹配查询所有的表
```
#已过时。 自2.0版本以来，将在3.0版本中删除。 
HTableDescriptor[] listTables(Pattern pattern)throws IOException
#新版本使用
List<TableDescriptor> listTableDescriptors(Pattern pattern)throws IOException
```
#### 列出用户空间表的所有名称。

```
TableName[] listTableNames()
TableName[] listTableNames(Pattern pattern)
TableName[] listTableNames(String regex)
TableName[] listTableNames(Pattern pattern, boolean includeSysTables)
```

#### 获取表描述符

```
#已过时。 自2.0版本以来，将在3.0版本中删除
HTableDescriptor getTableDescriptor(TableName tableName)
#新版本
TableDescriptor getDescriptor(TableName tableName)
```

#### 创建表
```
void createTable(TableDescriptor desc)
void createTable(TableDescriptor desc, byte[] startKey, byte[] endKey,int numRegions)
void createTable(TableDescriptor desc, byte[][] splitKeys)
#异步创建表
Future<Void> createTableAsync(HTableDescriptor desc, byte[][] splitKeys) 
```


#### 删除表
```
void deleteTable(TableName tableName)
#### 异步删除
Future<Void> deleteTableAsync(TableName tableName)
#已过时。 自2.0版本以来，将在3.0版本中删除
HTableDescriptor[] deleteTables(String regex)
HTableDescriptor[] deleteTables(Pattern pattern)
```
#### 截断表。 同步操作。
```
void truncateTable(TableName tableName,boolean preserveSplits)
#### 异步截断
Future<Void> truncateTableAsync(TableName tableName,boolean preserveSplits)
```
#### 启用表
```
void enableTable(TableName tableName)
Future<Void> enableTableAsync(TableName tableName)
#已过时。 自2.0版本以来，将在3.0版本中删除
HTableDescriptor[] enableTables(String regex)
HTableDescriptor[] enableTables(Pattern pattern)
#是否启用
boolean isTableEnabled(TableName tableName)
```

#### 禁用表
```
#已过时。 自2.0版本以来，将在3.0版本中删除
HTableDescriptor[] disableTables(String regex)
void disableTable(TableName tableName)
Future<Void> disableTableAsync(TableName tableName)
#是否禁用
boolean isTableDisabled(TableName tableName)

#### 是否可用
boolean isTableAvailable(TableName tableName)
```
 **将列族添加到现有表** 

```
#已过时。 自2.0版本以来，将在3.0版本中删除
default void addColumn(TableName tableName, ColumnFamilyDescriptor columnFamily)
#新版本
void addColumnFamily(TableName tableName,ColumnFamilyDescriptor columnFamily)
#异步添加
Future<Void> addColumnFamilyAsync(TableName tableName,ColumnFamilyDescriptor columnFamily)
```
 **从表中删除列** 

```
#已过时。 自2.0版本以来，将在3.0版本中删除
void deleteColumn(TableName tableName,byte[] columnFamily)
void deleteColumnFamily(TableName tableName，byte[] columnFamily)
Future<Void> deleteColumnFamilyAsync(TableName tableName,byte[] columnFamily)
```
 **修改表上的现有列** 

```
default void modifyColumn(TableName tableName, ColumnFamilyDescriptor columnFamily)
void modifyColumnFamily(TableName tableName,ColumnFamilyDescriptor columnFamily)
Future<Void> modifyColumnFamilyAsync(TableName tableName,ColumnFamilyDescriptor columnFamily)
```

#### JAVA操作Habase


```java
/**
 * 
 * 
 * HBase的管理API。 从Connection.getAdmin（）获取实例并在完成后调用close（）。
 * Admin可用于创建，删除，列出，启用和禁用以及以其他方式修改表，以及执行其他管理操作。
 * @author qxw
 * @data 2018年8月10日上午11:08:07
 */
public class HbaseAdmin {
  private static Connection connection;
  private static Configuration configuration; 
  static { 
         // 取得一个数据库连接的配置参数对象
        configuration = HBaseConfiguration.create(); 
        // 设置连接参数：HBase数据库使用的端口
        configuration.set("hbase.zookeeper.property.clientPort", "2181"); 
        // 设置连接参数：HBase数据库所在的主机IP
        configuration.set("hbase.zookeeper.quorum", "192.168.10.124"); 
     } 
  
  
  /**
   * 双重锁检查单例模式 
   * @return
   * @throws IOException 
   */
  public static Connection getConnection() throws IOException{
      //先检查实例是否存在，如果不存在才进入下面的同步块
          if(connection==null){
               synchronized (HbaseAdmin.class){
                 //再次判断实例是否存在，不存在 则创建
                 if(connection==null){
                   // 取得一个数据库连接对象
                   connection = ConnectionFactory.createConnection(configuration);
                  }
              }
          }
      return connection;
    }
  
  /**
   * 创建表
   * @param tableName 
   * @param fields 列族
   * @return
   */
  public static JSONObject createTable(String tableName,List<String> fields){
    JSONObject json=new JSONObject();
    Admin db=null;
    try {
      db=getConnection().getAdmin();
      //通过HTableDescriptor创建一个HTableDescriptor将表的描述传到createTable参数中
          TableDescriptorBuilder tableDescriptor = TableDescriptorBuilder.newBuilder(TableName.valueOf(tableName));
          //为描述器添加表的详细参数
          fields.forEach(field->{
              // 列族描述对象
               tableDescriptor.setColumnFamily(ColumnFamilyDescriptorBuilder.newBuilder(Bytes.toBytes(field)).build());
          });        
          //调用createtable方法创建表
         db.createTable(tableDescriptor.build());
      json.put("code",0);
            return json;
    } catch (Exception e) {
      e.printStackTrace();
      json.put("code",-1);
      json.put("msg", "表" + tableName + "创建异常");
            return json;
    }finally{
      close(db, null, null);
    }
  }
  
  /**
     * 预分区创建表
     * @param tableName 表名
     * @param columnFamily 列族名的集合
     * @param splitKeys 预分期region
     * @return 是否创建成功
     */
    public boolean createTableBySplitKeys(String tableName, List<String> columnFamily, byte[][] splitKeys) {
        Admin admin = null;
        try {
            if (StringUtils.isBlank(tableName) || columnFamily == null|| columnFamily.size() == 0) {              
                return false;
            }
            admin=getConnection().getAdmin();
            if (admin.tableExists(TableName.valueOf(tableName))) {
                 return true;
            } else {
                List<ColumnFamilyDescriptor> familyDescriptors = new ArrayList<>(columnFamily.size());
                columnFamily.forEach(cf -> {
                    familyDescriptors.add(ColumnFamilyDescriptorBuilder.newBuilder(Bytes.toBytes(cf)).build());
                });
                //为描述器添加表的详细参数
                TableDescriptor tableDescriptor = TableDescriptorBuilder.newBuilder(TableName.valueOf(tableName)).setColumnFamilies(familyDescriptors).build();

                //指定splitkeys
                admin.createTable(tableDescriptor,splitKeys);
             
            }
        } catch (IOException e) {
          e.printStackTrace();
            return false;
        }finally{
      close(admin, null, null);
    }
        return true;
    }

  
  /**
   * 删除表
   * @param tableName
   * @param isAsync  true=异步:同步
   * @return
   */
  public static JSONObject deleteTable(String tableName,boolean isAsync){
    JSONObject json=new JSONObject();
    Admin db=null;
    try {
       db=getConnection().getAdmin();
      //先禁用
      db.disableTable(TableName.valueOf(tableName));
      if(isAsync){
        db.deleteTableAsync(TableName.valueOf(tableName));
      }else{
        db.deleteTable(TableName.valueOf(tableName));
      }
      json.put("code",0);
            return json;
    } catch (Exception e) {
      e.printStackTrace();
      json.put("code",-1);
      json.put("msg", "表" + tableName + "删除异常");
            return json;
    }finally{
      close(db, null, null);
    }
  }
  
  /**
   * 列出所有表名称
   * @param tableName
   * @param isAsync
   * @return
   */
  public static JSONObject listTableNames(Pattern pattern){
    JSONObject json=new JSONObject();
    List<String> list=new ArrayList<String>(10);
    Admin db=null;
    try {
        db=getConnection().getAdmin();
      TableName [] tableNames;
      if(pattern==null){
        tableNames=db.listTableNames();
      }else{
        tableNames=db.listTableNames(pattern);
      }
      for (int i = 0; i < tableNames.length; i++) {
        list.add(tableNames[i].toString());
      }
      json.put("code",0);
      json.put("data", list);
            return json;
    } catch (Exception e) {
      e.printStackTrace();
      json.put("code",-1);
      json.put("msg", "列出所有表名称异常");
            return json;
    }finally{
      close(db, null, null);
    }
  }
  
  /**
   * 往表中添加单条数据
   * @param tableName 表明
   * @param rowkey  指key
   * @param family 列族名
   * @param map    数据源
   * @return
   */
  public static JSONObject putOne(String tableName,String rowkey,String family,Map<String, String> map){
    JSONObject json=new JSONObject();
     Table table=null;
    try {
             table =getConnection().getTable(TableName.valueOf(tableName)) ;
            //实例化put对象，传入行键
            Put put =new Put(Bytes.toBytes(rowkey));
           //调用addcolum方法，向i簇中添加字段
            Iterator<Map.Entry<String, String>> it = map.entrySet().iterator();
            while (it.hasNext()){
                 Map.Entry<String, String> entry = it.next();
                 put.addColumn(Bytes.toBytes(family),Bytes.toBytes(entry.getKey()),Bytes.toBytes(entry.getValue()));
            }      
            table.put(put);
      json.put("code",0); 
            return json;
    } catch (Exception e) {
      e.printStackTrace();
      json.put("code",-1);
      json.put("msg", "往表中添加单条数据异常");
            return json;
    }finally{
      close(null, null, table);
    }
  }
  
  /**
   * 往表中添加多数据
   * @param table Table
     * @param rowKey rowKey
     * @param tableName 表名
     * @param familyName 列族名
     * @param columns 列名数组
     * @param values 列值得数组
   * @return
   */
  @SuppressWarnings("resource")
  public static JSONObject put(String tableName,String rowkey,String familyName, String[] columns, String[] values){
    JSONObject json=new JSONObject();
     Table table=null;
    try {
             table =getConnection().getTable(TableName.valueOf(tableName)) ;
            //实例化put对象，传入行键
            Put put =new Put(Bytes.toBytes(rowkey));
            if(columns != null && values != null && columns.length == values.length){
                for(int i=0;i<columns.length;i++){
                    if(columns[i] != null && values[i] != null){
                        put.addColumn(Bytes.toBytes(familyName), Bytes.toBytes(columns[i]), Bytes.toBytes(values[i]));
                    }else{
                        throw new NullPointerException(MessageFormat.format("列名和列数据都不能为空,column:{0},value:{1}" ,columns[i],values[i]));
                    }
                }
            }
            table.put(put);
      json.put("code",0); 
            return json;
    } catch (Exception e) {
      e.printStackTrace();
      json.put("code",-1);
      json.put("msg", "往表中添加单条数据异常");
            return json;
    }finally{
      close(null, null, table);
    }
  }

    /***
     * 遍历查询指定表中的所有数据
     * @param tableName
     * @return
     */
    public static Map<String,Map<String,String>> getResultScanner(String tableName){
        Scan scan = new Scan();
        return queryData(tableName,scan);
    }
    
    /**
     * 根据startRowKey和stopRowKey遍历查询指定表中的所有数据
     * @param tableName 表名
     * @param startRowKey 起始rowKey
     * @param stopRowKey 结束rowKey
     */
    public static Map<String,Map<String,String>> getResultScanner(String tableName, String startRowKey, String stopRowKey){
        Scan scan = new Scan();
        if(StringUtils.isNotBlank(startRowKey) && StringUtils.isNotBlank(stopRowKey)){
            scan.withStartRow(Bytes.toBytes(startRowKey));
            scan.withStopRow(Bytes.toBytes(stopRowKey));
        }
        return queryData(tableName,scan);
    }
    
    /**
     * 通过行前缀过滤器查询数据
     * @param tableName 表名
     * @param prefix 以prefix开始的行键
     */
    public static Map<String,Map<String,String>> getResultScannerPrefixFilter(String tableName, String prefix){
        Scan scan = new Scan();
        if(StringUtils.isNotBlank(prefix)){
            Filter filter = new PrefixFilter(Bytes.toBytes(prefix));
            scan.setFilter(filter);
        }
        return queryData(tableName,scan);
    }
    
    /**
     * 通过列前缀过滤器查询数据
     * @param tableName 表名
     * @param prefix 以prefix开始的列名
     */
    public static Map<String,Map<String,String>> getResultScannerColumnPrefixFilter(String tableName, String prefix){
        Scan scan = new Scan();
        if(StringUtils.isNotBlank(prefix)){
            Filter filter = new ColumnPrefixFilter(Bytes.toBytes(prefix));
            scan.setFilter(filter);
        }
        return queryData(tableName,scan);
    }
    /**
     * 查询行键中包含特定字符的数据
     * @param tableName 表名
     * @param keyword 包含指定关键词的行键
     */
    public static Map<String,Map<String,String>> getResultScannerRowFilter(String tableName, String keyword){
        Scan scan = new Scan();
        if(StringUtils.isNotBlank(keyword)){
            Filter filter = new RowFilter(CompareOperator.GREATER_OR_EQUAL,new SubstringComparator(keyword));
            scan.setFilter(filter);
        }
        return queryData(tableName,scan);
    }
    
    /**
     * 查询列名中包含特定字符的数据
     * @author zifangsky
     * @param tableName 表名
     * @param keyword 包含指定关键词的列名
     */
    public static Map<String,Map<String,String>> getResultScannerQualifierFilter(String tableName, String keyword){
        Scan scan = new Scan();
        if(StringUtils.isNotBlank(keyword)){
            Filter filter = new QualifierFilter(CompareOperator.GREATER_OR_EQUAL,new SubstringComparator(keyword));
            scan.setFilter(filter);
        }
        return queryData(tableName,scan);
    }

    
    /**
     * 根据tableName和rowKey精确查询一行的数据
     * @param tableName  表名
     * @param rowKey     行键
     * @return
     */
    public static Map<String,String> getRowData(String tableName, String rowKey){
        Map<String,String> result = new HashMap<>();
        Get get = new Get(Bytes.toBytes(rowKey));
        Table table= null;
        try {
           table =getConnection().getTable(TableName.valueOf(tableName)) ;
           Result hTableResult = table.get(get);
             if (hTableResult != null && !hTableResult.isEmpty()) {
                 for (Cell cell : hTableResult.listCells()) {
                    result.put(Bytes.toString(cell.getQualifierArray(), cell.getQualifierOffset(), cell.getQualifierLength()), Bytes.toString(cell.getValueArray(), cell.getValueOffset(), cell.getValueLength()));
                 }
             }
    } catch (Exception e) {
      e.printStackTrace();
    }finally{
      close(null, null, table);
    }
        return result;
    }
    
    
    
    /**
     * 根据tableName、rowKey、familyName、column查询指定单元格的数据
     * @param tableName 表名
     * @param rowKey rowKey
     * @param familyName 列族名
     * @param columnName 列名
     */
    public static String getColumnValue(String tableName, String rowKey, String familyName, String columnName){
        String str = null;
        Get get = new Get(Bytes.toBytes(rowKey));
        // 获取表
        Table table= null;
        try {
           table =getConnection().getTable(TableName.valueOf(tableName)) ;
            Result result = table.get(get);
            if (result != null && !result.isEmpty()) {
                Cell cell = result.getColumnLatestCell(Bytes.toBytes(familyName), Bytes.toBytes(columnName));
                if(cell != null){
                    str = Bytes.toString(cell.getValueArray(), cell.getValueOffset(), cell.getValueLength());
                }
            }
        } catch (IOException e) {
          e.printStackTrace();
        }finally{
      close(null, null, table);
    }
        return str;
    }
    
    /**
     * 根据tableName、rowKey、familyName、column查询指定单元格多个版本的数据
     * @param tableName 表名
     * @param rowKey rowKey
     * @param familyName 列族名
     * @param columnName 列名
     * @param versions 需要查询的版本数
     */
    public List<String> getColumnValuesByVersion(String tableName, String rowKey, String familyName, String columnName,int versions) {
        //返回数据
        List<String> result = new ArrayList<>(versions);
        // 获取表
        Table table= null;
        try {
          table =getConnection().getTable(TableName.valueOf(tableName)) ;
            Get get = new Get(Bytes.toBytes(rowKey));
            get.addColumn(Bytes.toBytes(familyName), Bytes.toBytes(columnName));
            //读取多少个版本
            get.readVersions(versions);
            Result hTableResult = table.get(get);
            if (hTableResult != null && !hTableResult.isEmpty()) {
                for (Cell cell : hTableResult.listCells()) {
                    result.add(Bytes.toString(cell.getValueArray(), cell.getValueOffset(), cell.getValueLength()));
                }
            }
        } catch (IOException e) {
          e.printStackTrace();
        }finally{
      close(null, null, table);
    }

        return result;
    }
    
  /**
     * 通过表名以及过滤条件查询数据
     * @param tableName 表名
     * @param scan 过滤条件
     */
    private static Map<String,Map<String,String>> queryData(String tableName,Scan scan){
        Map<String,Map<String,String>> result = new HashMap<>();
        ResultScanner rs = null;
        // 获取表
        Table table= null;
        try {
            table =getConnection().getTable(TableName.valueOf(tableName)) ;
            rs = table.getScanner(scan);
            for (Result r : rs) {
                //每一行数据
                Map<String,String> columnMap = new HashMap<>();
                String rowKey = null;
                for (Cell cell : r.listCells()) {
                    if(rowKey == null){
                        rowKey = Bytes.toString(cell.getRowArray(),cell.getRowOffset(),cell.getRowLength());
                    }
                    columnMap.put(Bytes.toString(cell.getQualifierArray(), cell.getQualifierOffset(), cell.getQualifierLength()), Bytes.toString(cell.getValueArray(), cell.getValueOffset(), cell.getValueLength()));
                }

                if(rowKey != null){
                    result.put(rowKey,columnMap);
                }
            }
        }catch (IOException e) {
          e.printStackTrace();
          System.out.println("遍历查询指定表中的所有数据失败");
        }finally{
      close(null, null, table);
    }

        return result;
    }
    
    /**
     * 更新数据  为表的某个单元格赋值
     * @param tableName  表名
     * @param rowKey    rowKey
     * @param family    列族名
     * @param columkey  列名
     * @param updatedata 列值
     */
    public void updateData(String tableName,String rowKey,String family,String columkey,String updatedata){
       Table table=null;
      try {
           //hbase中更新数据同样采用put方法，在相同的位置put数据，则在查询时只会返回时间戳较新的数据
            //且在文件合并时会将时间戳较旧的数据舍弃
            Put put = new Put(Bytes.toBytes(rowKey));
            //将新数据添加到put中
            put.addColumn(Bytes.toBytes(family), Bytes.toBytes(columkey),Bytes.toBytes(updatedata));
             table = connection.getTable(TableName.valueOf(tableName));
            //将put写入HBase
            table.put(put);
    } catch (Exception e) {
      e.printStackTrace();
    }finally{
      close(null, null, table);
    }
   
    }
 
    
    
    /**
     * 删除某条记录
     * @param tableName  表名
     * @param rowKey    rowKey
     * @param family    列族名
     * @param columkey  列名
     */
    public void deleteData(String tableName,String rowKey,String family,String columkey){
       Table table=null;
      try {
           table = connection.getTable(TableName.valueOf(tableName));
              //创建delete对象
              Delete deletData= new Delete(Bytes.toBytes(rowKey));
              //将要删除的数据的准确坐标添加到对象中
              deletData.addColumn(Bytes.toBytes(family), Bytes.toBytes(columkey));
              //删除表中数据
              table.delete(deletData);
    } catch (Exception e) {
      e.printStackTrace();
    }finally{
      close(null, null, table);
    }
      
    }

    /**
     * 删除一行数据
     * @param tableName
     * @param rowKey
     */
    public void deleteRow(String tableName,String rowKey) {
        Table table =null;
      try {
          table = connection.getTable(TableName.valueOf(tableName));
              //通过行键删除一整行的数据
              Delete deletRow= new Delete(Bytes.toBytes(rowKey));
              table.delete(deletRow);
    } catch (Exception e){
      e.printStackTrace();
    }finally{
      close(null, null, table);
    }
     
    }
    
    /**
     * 根据columnFamily删除指定的列族
     * @param tableName 表名
     * @param columnFamily 列族
     * @return boolean
     */
    public boolean deleteColumnFamily(String tableName, String columnFamily,boolean isAysnc){
       Admin admin=null;
       try {
          admin=getConnection().getAdmin();
          if(isAysnc){
            admin.deleteColumnFamilyAsync(TableName.valueOf(tableName), Bytes.toBytes(columnFamily));
          }else{
            admin.deleteColumnFamily(TableName.valueOf(tableName), Bytes.toBytes(columnFamily));
          }
         return true;
    } catch (Exception e) {
      e.printStackTrace();
        return false;
    }finally{
      close(admin, null, null);
    }
       
    }
    
    /**
     * 自定义获取分区splitKeys
     */
    public byte[][] getSplitKeys(String[] keys){
        if(keys==null){
            //默认为10个分区
            keys = new String[] {  "1|", "2|", "3|", "4|", "5|", "6|", "7|", "8|", "9|" };
        }
        byte[][] splitKeys = new byte[keys.length][];
        //升序排序
        TreeSet<byte[]> rows = new TreeSet<byte[]>(Bytes.BYTES_COMPARATOR);
        for(String key : keys){
            rows.add(Bytes.toBytes(key));
        }
        Iterator<byte[]> rowKeyIter = rows.iterator();
        int i=0;
        while (rowKeyIter.hasNext()) {
            byte[] tempRow = rowKeyIter.next();
            rowKeyIter.remove();
            splitKeys[i] = tempRow;
            i++;
        }
        return splitKeys;
    }
    /**
     * 按startKey和endKey，分区数获取分区
     */
    public static byte[][] getHexSplits(String startKey, String endKey, int numRegions) {
        byte[][] splits = new byte[numRegions-1][];
        BigInteger lowestKey = new BigInteger(startKey, 16);
        BigInteger highestKey = new BigInteger(endKey, 16);
        BigInteger range = highestKey.subtract(lowestKey);
        BigInteger regionIncrement = range.divide(BigInteger.valueOf(numRegions));
        lowestKey = lowestKey.add(regionIncrement);
        for(int i=0; i < numRegions-1;i++) {
            BigInteger key = lowestKey.add(regionIncrement.multiply(BigInteger.valueOf(i)));
            byte[] b = String.format("%016x", key).getBytes();
            splits[i] = b;
        }
        return splits;
    }
    
    /**
     * 关闭流
     */
  private static void close(Admin admin, ResultScanner rs, Table table){
        if(admin != null){
            try {
                admin.close();
            } catch (IOException e) {
              e.printStackTrace();
              System.out.println("关闭Admin失败");              
            }
        }
        if(rs != null){
            rs.close();
        }
        if(table != null){
            try {
                table.close();
            } catch (IOException e) {
              e.printStackTrace();
              System.out.println("关闭Table失败");
              
            }
    }
}
  public static void main(String[] args) throws IOException{
    String tableName="tes_userInfo";
    //删除表
    System.out.println("删除表："+deleteTable(tableName, true));
    
    
    //创建表
    List<String> fields=Arrays.asList("info","employee");
    System.out.println("创建表："+createTable(tableName, fields));  
    
    
    //查询所有表名称
    Pattern pattern = Pattern.compile("^t.*$", Pattern.CASE_INSENSITIVE);
    System.out.println("查询所有表名称:  "+listTableNames(null));
    System.out.println("正则查询表名称：  "+listTableNames(pattern));
    
    
    //单条数据添加
    Map<String, String> map=new HashMap<String, String>();
    map.put("name","秦学武");
    map.put("age", "24");
    map.put("sex", "男");
    //指定列族和
      System.out.println("单条数据添加： "+putOne(tableName,"row_1001","info",map));
      
      //多条数据添加
      put(tableName, "row_1002", "info", new String[]{"name","age","sex"},new String[]{"小明","18","男"});
      
      put(tableName, "row_1001", "employee", new String[]{"name","time",},new String[]{"秦学武员工",System.currentTimeMillis()+""});
      put(tableName, "row_1002", "employee", new String[]{"name","time",},new String[]{"小明员工",System.currentTimeMillis()+""});
      
      
      //查询指定表中的所有数据
    Map<String,Map<String,String>> maps=getResultScanner(tableName);
    Iterator<Entry<String, Map<String, String>>> it = maps.entrySet().iterator();
    System.out.println("查询指定表中的所有数据: "+maps.toString());
        while (it.hasNext()){
                Entry<String, Map<String, String>> entry =it.next();
                System.out.println(entry.getKey()+","+entry.getValue());              
        }       
        //根据表名和rowkey 查询指定的数据
        Map<String, String> m=getRowData(tableName, "row_1001");
        System.out.println("查询 rowkey=row_1001的数据：  "+ m.toString());
        
        //根据表名、rowKey、列族名、列字段 查询指定单元格的数据
        System.out.println("查询指定表名,rowKey,列族名,列字段的数据："+getColumnValue(tableName, "row_1001","employee", "name"));
  
        //根据startRowKey和stopRowKey遍历查询指定表中的所有数据  一般用于RowKey是连续递增，且只查询一部分数据的情况（比如分页）
        Map<String,Map<String,String>> maps2=getResultScanner(tableName,"row_1001","row_1002");
        System.out.println("根据startRowKey和stopRowKey遍历查询指定表中的所有数据:   "+maps2.toString());

        
        //根据rowKey行键过滤器查询数据
        Map<String,Map<String,String>> result=getResultScannerPrefixFilter(tableName, "r");
        System.out.println("根据行键过滤器查询数据:  "+result.toString());
        
        //根据列名过滤器查询数据
        System.out.println("根据列名过滤器查询数据: "+getResultScannerColumnPrefixFilter(tableName, "time"));
       
        
  }
  
  
}

```

