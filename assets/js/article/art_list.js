$(function () {
  let layer = layui.layer
  let form = layui.form
  let laypage = layui.laypage


  //定义美化时间的过滤器
  template.defaults.imports.dataFormat = function (date) {
    const dt = new Date(date)


    let y = String(dt.getFullYear())
    let m = String(dt.getMonth() + 1).padStart(2, '0')
    let d = String(dt.getDate()).padStart(2, '0')
    let hh = String(dt.getHours()).padStart(2, '0')
    let mm = String(dt.getMinutes()).padStart(2, '0')
    let ss = String(dt.getSeconds()).padStart(2, '0')

    return `${y}-${m}-${d}  ${hh}-${mm}-${ss}`
  }



  //定义一个查询参数对象，将来请求数据的时候
  //需要将请求参数对象提交到服务器
  let q = {
    pagenum: 1,     //页码值
    pagesize: 2,   // 每页显示几条数据，默认每页显示2条
    cate_id: '',  // 文章分类的 Id
    state: ''    // 文章的发布状态
  }


  initTable()


  function initTable() {
    $.ajax({
      method: 'GET',
      url: '/my/article/list',
      data: q,
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('获取文章列表失败')
        }


        //使用模板引擎渲染页面的数据
        let htmlStr = template('tpl-table', res)
        $('tbody').html(htmlStr)
        // 调用渲染分页的方法
        renderPage(res.total)
      }
    })
  }

  initCate()
  //初始化文章分类的方法
  function initCate() {
    $.ajax({
      method: 'GET',
      url: '/my/article/cates',
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('获取分类数据失败')
        }
        //调用模板引擎渲染分类的可选项
        let htmlStr = template('tpl-cate', res)
        $('[name=cate_id]').html(htmlStr)
        //通知 layui 重新渲染表单区域的UI结构
        form.render()
      }
    })
  }


  //为筛选表单绑定 submit 事件
  $('#form-search').on('submit', function (e) {
    e.preventDefault()
    //获取表单中选中项的值
    let cate_id = $('[name=cate_id]').val()
    let state = $('[name=state]').val()
    //为查询参数对象 q 中对象的属性赋值
    q.cate_id = cate_id
    q.state = state
    //根据最新的筛选条件，重新渲染表格
    initTable()
  })

  //定义渲染分页的方法
  function renderPage(total) {
    // console.log(total)
    laypage.render({
      elem: 'pageBox', //分页容器的id
      count: total, //总数据条数
      limit: q.pagesize, //每页显示几条数据
      curr: q.pagenum, //设置默认被选中的分页
      layout:['count', 'limit', 'prev', 'page', 'next', 'skip'],
      limits:[2, 3, 5, 10],
      //分页发生切换的时候触发 jump 回调
      //触发 jump 回调方式有两种
      //1.点击页码的时候，会触发jump回调
      //2.只要调用了 laypage.rander() 方法，就会触发 jump 回调
      jump: function (obj, first) {
        //可以通过 first 的值 来判断是通过哪种方式 触发的 jump回调
        //如果 first 的值为 ture 证明是方式2 触发的
        //否则就是方式1触发的
        // console.log(first);
        // console.log(obj.curr)
        //把最新的页码值，赋值到 q 这个查询参数对象中
        q.pagenum = obj.curr
        //把最新的条目数，赋值到 q 这个查询参数对象中
        q.pagesize = obj.limit
        //根据最新的 q 获取对应的数据列表，并渲染表格
        if (!first) {
          initTable()
        }
      }
    })
  }

  $('tbody').on('click','.btn-delete', function(){
    //获取的文章的id
    let id = $(this).attr('data-id')
    let len = $('.btn-delete').length
    //询问用户是否要删除
    layer.confirm('确认删除?', {icon: 3, title:'提示'}, function(index){
      $.ajax({
        method: 'GET',
        url: '/my/article/delete/' + id,
        success: function(res) {
          console.log(res)
          if(res.status !== 0){
            return layer.msg('删除失败')
          }
          layer.msg('删除成功')
        }
      })
      layer.close(index)
      //当数据删除完成后，需要判断当前这一页中，是否还有剩余的数据
      //如果没有剩余的数据了，则让页码值-1 之后
      //再重新调用 initTable方法
      //4
      if(len === 1){
        //如果 len 的值等于1，证明删除完毕之后，页面上就没有任何数据
        //页码值最小必须是1
        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
      }
      initTable()
    })

  })
})