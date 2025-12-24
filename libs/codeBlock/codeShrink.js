// 代码块收缩

$(function () {
  var $code_expand = $('<i class="fas fa-angle-up code-expand" aria-hidden="true" title="展开/收起代码"></i>');

  // 初始化函数
  function initCodeShrink() {
    // 查找所有代码块区域
    var $codeAreas = $('.code-area');

    // 如果没有找到.code-area，尝试为所有pre标签创建code-area包装
    if ($codeAreas.length === 0) {
      $('pre').wrap('<div class="code-area" style="position: relative"></div>');
      $codeAreas = $('.code-area');
    }

    if ($codeAreas.length > 0) {
      console.log('找到 ' + $codeAreas.length + ' 个代码块区域');

      $codeAreas.each(function() {
        var $this = $(this);
        // 如果还没有展开按钮，则添加
        if ($this.find('.code-expand').length === 0) {
          var $button = $code_expand.clone();
          $this.prepend($button);
          console.log('为代码块添加展开按钮');
        }
      });

      // 绑定点击事件
      $('.code-expand').off('click').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var $parent = $(this).parent();
        var isClosed = $parent.hasClass('code-closed');

        console.log('点击展开按钮，当前状态：' + (isClosed ? '收起' : '展开'));

        if (isClosed) {
          // 展开
          $parent.find('pre code, pre').show();
          $parent.removeClass('code-closed');
          console.log('展开代码块');
        } else {
          // 收缩
          $parent.find('pre code, pre').hide();
          $parent.addClass('code-closed');
          console.log('收起代码块');
        }
      });
    } else {
      console.log('未找到任何代码块区域');
    }
  }

  // 立即执行
  initCodeShrink();

  // 延迟重试，以防代码块尚未生成（特别是对于动态加载的内容）
  setTimeout(initCodeShrink, 100);
  setTimeout(initCodeShrink, 500);
  setTimeout(initCodeShrink, 1000);
  setTimeout(initCodeShrink, 2000);
  setTimeout(initCodeShrink, 3000);
});
