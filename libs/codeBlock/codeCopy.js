// 代码块一键复制

// 提取包含换行符的文本内容
function extractTextWithLineBreaks(element) {
    // 克隆元素以避免影响原始 DOM
    var clone = element.cloneNode(true);

    // 将 <br> 标签替换为换行符文本
    var brs = clone.querySelectorAll('br');
    for (var i = brs.length - 1; i >= 0; i--) {
        var newlineText = document.createTextNode('\n');
        brs[i].parentNode.replaceChild(newlineText, brs[i]);
    }

    // 在每个 <span class="line"> 后面添加换行符（除了最后一个）
    var lines = clone.querySelectorAll('span.line');
    for (var i = 0; i < lines.length - 1; i++) {
        var newlineText = document.createTextNode('\n');
        lines[i].parentNode.insertBefore(newlineText, lines[i].nextSibling);
    }

    // 获取文本内容并清理
    var text = clone.textContent || clone.innerText || '';

    // 清理：移除开头和结尾的空白，将连续的多个换行符减少为单个
    text = text.replace(/^\s+|\s+$/g, '')
              .replace(/\n{3,}/g, '\n\n')
              .replace(/[ \t]+$/gm, '') // 移除行尾空格
              .replace(/^\n+/, ''); // 移除开头的换行符

    return text;
}

$(function () {
    var $copyIcon = $('<i class="fas fa-copy code_copy" title="复制代码" aria-hidden="true"></i>')
    var $notice = $('<div class="codecopy_notice"></div>')

    var $codeAreas = $('.code-area');

    if ($codeAreas.length > 0) {
        $codeAreas.prepend($copyIcon);
        $codeAreas.prepend($notice);
    } else {
        // 延迟重试，以防代码块尚未生成
        setTimeout(function() {
            $('.code-area').prepend($copyIcon).prepend($notice);
        }, 1000);
    }

    // "复制成功"字出现
    function copySuccess(ctx) {
        $(ctx).prev('.codecopy_notice')
            .text("复制成功")
            .animate({
                opacity: 1,
                top: 30
            }, 450, function () {
                setTimeout(function () {
                    $(ctx).prev('.codecopy_notice').animate({
                        opacity: 0,
                        top: 0
                    }, 650)
                }, 400)
            })
    }

    // "复制失败"字出现
    function copyFail(ctx) {
        $(ctx).prev('.codecopy_notice')
            .text("复制失败")
            .animate({
                opacity: 1,
                top: 30
            }, 650, function () {
                setTimeout(function () {
                    $(ctx).prev('.codecopy_notice').animate({
                        opacity: 0,
                        top: 0
                    }, 650)
                }, 400)
            })
    }

    // 复制
    $(document).on('click', '.code-area .fa-copy', function () {
        // 尝试多种方式查找代码元素
        var $codeElement1 = $(this).siblings('pre').find('code');
        var $codeElement2 = $(this).parent().find('pre code');
        var $codeElement3 = $(this).closest('.code-area').find('pre code');
        var $codeElement4 = $(this).closest('.code-area').find('code');
        var $preElement = $(this).siblings('pre');

        var text = '';

        // 优先使用 code 标签，如果没有则直接使用 pre 标签
        if ($codeElement1.length > 0) {
            text = extractTextWithLineBreaks($codeElement1[0]);
        } else if ($codeElement2.length > 0) {
            text = extractTextWithLineBreaks($codeElement2[0]);
        } else if ($codeElement3.length > 0) {
            text = extractTextWithLineBreaks($codeElement3[0]);
        } else if ($codeElement4.length > 0) {
            text = extractTextWithLineBreaks($codeElement4[0]);
        } else if ($preElement.length > 0) {
            text = extractTextWithLineBreaks($preElement[0]);
        } else {
            return; // 未找到任何代码元素
        }

        // 尝试使用现代剪贴板 API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            var $this = $(this);
            navigator.clipboard.writeText(text).then(function() {
                copySuccess($this);
            }).catch(function(err) {
                copyWithExecCommand(text, $this);
            });
        } else {
            copyWithExecCommand(text, this);
        }
    });

    // 传统复制方法
    function copyWithExecCommand(text, ctx) {
        // 创建临时文本区域来复制文本
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);

        try {
            textarea.select();
            var successful = document.execCommand('copy');
            document.body.removeChild(textarea);

            if (successful) {
                copySuccess(ctx);
            } else {
                copyFail(ctx);
            }
        } catch (err) {
            document.body.removeChild(textarea);
            copyFail(ctx);
        }
    }
});
