$(function () {
  let form = layui.form

  form.verify({
    pwd: [/^[\S]{6,12}$/, '密码必须6到12位，且不能出现空格'],
    samePwd: function (value) {
      if (value !== $('[name=newPwd]').val()) {
        return '新旧密码不能相同'
      }
    },
    rePwd: function (value) {
      if (value !== $('[name=newPwd]').val()) {
        return '两次密码不一致！'
      }
    }
  })


  //监听表单的提交事件
  $('.layui-form').on('submit', function (e) {
    e.preventDefault()
    //发起ajax 数据请求
    $.ajax({
      method: 'POST',
      url: '/my/updatepwd',
      data: $(this).serialize(),
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('更新密码失败！')
        }
        layer.msg('更新密码成功！')
        //调用父页面中的方法，从新渲染用户的头像和用户的信息
        $('.layui-form')[0].reset()
      }
    })


  })
})


